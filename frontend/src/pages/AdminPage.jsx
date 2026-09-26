import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Layers, ShoppingCart, ShoppingBag, Users, Ticket, Globe, Inbox,
  ChartNoAxesColumn, Lock, ChevronRight, ChevronLeft, Crown, Search, Plus, Pencil, Trash2,
  RefreshCw, DollarSign, TrendingUp, AlertTriangle, AlertCircle, CheckCircle2, Star, Eye, EyeOff,
  ArrowUp, ArrowDown, Download, Upload, HelpCircle, Info, MessageSquare, CornerDownRight, ExternalLink, Menu, X, GripVertical,
  User, Mail, Phone, MapPin, Printer, Truck, LogOut
} from 'lucide-react';
import { useStore, CAT_FALLBACK_IMAGES, apiFetch, matchesOrderId } from '../context/StoreContext';

export default function AdminPage() {
  const {
    adminLoggedIn, adminUser, adminLogin, adminLogout, roles,
    products, categories, orders, customers, coupons, reviews, stockHistory, cms, messages, subscribers,
    setProducts, setCategories, setOrders, setCustomers, setCoupons, setReviews, setStockHistory, setCMS, setMessages,
    formatMoney, saveProduct, deleteProduct, adjustStockQty, restockAllLowStock,
    saveCategory, deleteCategory, updateOrderStatus, cycleOrderStatus, deleteOrder,
    saveCustomer, deleteCustomer, deleteSubscriber, deleteMessage, setSubscribers, saveCoupon, deleteCoupon,
    saveGlobalCMS, saveHeroSlide, deleteHeroSlide, moveHeroSlide, reorderHeroSlides,
    updateReviewStatus, replyToReview, deleteReview, showToast
  } = useStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const normalizeStatus = (status) => {
    if (!status) return 'Confirmed';
    const s = String(status).trim().toLowerCase();
    if (s === 'packed') return 'Packed';
    if (s === 'shipped') return 'Shipped';
    if (s === 'delivered') return 'Delivered';
    if (s === 'cancelled' || s === 'refunded') return 'Cancelled';
    return 'Confirmed';
  };

  const getStatusStyles = (status) => {
    const s = String(status || '').trim().toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'new order':
      case 'pending':
        return { bg: '#EBF8FF', color: '#2B6CB0', border: '#BEE3F8' };
      case 'packed':
        return { bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' };
      case 'shipped':
        return { bg: '#FEF7E0', color: '#B06000', border: '#FDE293' };
      case 'delivered':
        return { bg: '#E6F4EA', color: '#137333', border: '#CEEAD6' };
      case 'cancelled':
      case 'refunded':
        return { bg: '#FCE8E6', color: '#C5221F', border: '#FAD2CF' };
      default:
        return { bg: '#EBF8FF', color: '#2B6CB0', border: '#BEE3F8' };
    }
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerSubTab, setCustomerSubTab] = useState('registered');

  // Login form state - always initialized empty
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Clear credentials whenever logged out or when loading login screen
  useEffect(() => {
    if (!adminLoggedIn) {
      setLoginId('');
      setLoginPass('');
      setLoginError('');
      setShowPassword(false);
    }
  }, [adminLoggedIn]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const success = adminLogin(loginId, loginPass);
    if (!success) {
      setLoginError('Invalid admin credentials. Please check your username and password.');
      triggerShake();
    } else {
      setLoginId('');
      setLoginPass('');
      setShowPassword(false);
    }
  };

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard filter state
  const [dashTimePeriod, setDashTimePeriod] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // Random SKU generator
  const generateRandomSKU = (cat = 'JW') => {
    const prefix = (cat.slice(0, 2) || 'JW').toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ABL-${prefix}-${randomNum}`;
  };

  // Product Modal state & Errors
  const [editingProduct, setEditingProduct] = useState(null); // null = closed, {} = open
  const [prodFormErrors, setProdFormErrors] = useState({});
  const [uploadedImagesMap, setUploadedImagesMap] = useState({});
  const [uploadingFieldKey, setUploadingFieldKey] = useState(null);
  const [prodForm, setProdForm] = useState({
    id: '', name: '', sku: '', desc: '', price: 0, salePrice: 0,
    baseImage1: '', baseImage2: '', baseImage3: '',
    category: 'necklaces', stockQty: 10, status: 'Active',
    isFeatured: false, bestSeller: false, newArrival: false, tags: '', colorsText: '', colorImages: {},
    seoTitle: '', seoDesc: '', slug: ''
  });

  const compressImage = (file, maxDimension = 1200, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          canvas.toBlob((blob) => {
            resolve({ dataUrl, blob: blob || file });
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve({ dataUrl: e.target?.result || '', blob: file });
        img.src = e.target?.result;
      };
      reader.onerror = () => resolve({ dataUrl: '', blob: file });
      reader.readAsDataURL(file);
    });
  };

  const triggerImageUpload = (fieldKey, onComplete) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingFieldKey(fieldKey);
      showToast('Processing & uploading image...', 'info');

      try {
        const { dataUrl, blob } = await compressImage(file, 1200, 0.85);
        const uploadFile = new File([blob], file.name ? file.name.replace(/\.[^.]+$/, '.jpg') : 'product.jpg', { type: 'image/jpeg' });

        let cdnUrl = '';

        // 1. Upload via backend server Cloudinary API endpoint
        try {
          const formData = new FormData();
          formData.append('image', uploadFile);
          const res = await apiFetch('/api/products/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              cdnUrl = data.url;
            }
          }
        } catch {}

        // 2. Direct Cloudinary upload fallback
        if (!cdnUrl) {
          try {
            const directForm = new FormData();
            directForm.append('file', uploadFile);
            directForm.append('upload_preset', 'abels_preset');
            directForm.append('cloud_name', 'gylnyxru');

            const res = await fetch('https://api.cloudinary.com/v1_1/gylnyxru/image/upload', {
              method: 'POST',
              body: directForm
            });
            if (res.ok) {
              const data = await res.json();
              if (data.secure_url) {
                cdnUrl = data.secure_url;
              }
            }
          } catch {}
        }

        if (cdnUrl) {
          onComplete(cdnUrl);
          showToast('Image uploaded to Cloudinary CDN!', 'check');
        } else if (dataUrl) {
          // If CDN server upload is unreachable, use user's compressed (~20KB) image directly!
          // Guarantees each product has its own UNIQUE photo and is never overwritten with duplicate category image.
          onComplete(dataUrl);
          showToast('Image processed and saved successfully!', 'check');
        } else {
          showToast('Failed to process image file.', 'x');
        }
      } catch (err) {
        showToast('Image upload error: ' + err.message, 'x');
      } finally {
        setUploadingFieldKey(null);
      }
    };
    input.click();
  };

  const handleRemoveImage = (imageUrl, onCleared) => {
    if (onCleared) onCleared();
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('cloudinary.com')) {
      setTimeout(() => {
        apiFetch('/api/products/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imageUrl })
        }).catch(() => {});
      }, 1500);
    }
  };

  // Category Modal state

  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ id: '', name: '', slug: '', image: '', desc: '' });

  // Coupon Modal state
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormErrors, setCouponFormErrors] = useState({});
  const [couponForm, setCouponForm] = useState({
    id: '', code: '', label: '', discountType: 'percentage', value: 10, minOrder: 0, maxDiscount: 0,
    expiry: '2026-12-31', active: true, usageLimit: 100, perCustomerLimit: 1
  });

  // Stock Adjustment & History Modal state
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [stockAdjustQty, setStockAdjustQty] = useState(1);
  const [stockAdjustReason, setStockAdjustReason] = useState('Manual stock intake');

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Ship Order & Australia Post Tracking Modal state
  const [shippingOrderModal, setShippingOrderModal] = useState(null);
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState('');
  const [shippingTrackingError, setShippingTrackingError] = useState('');
  const [isSendingDispatchEmail, setIsSendingDispatchEmail] = useState(false);

  // Cancel Order & Stripe Refund Double-Check Modal state
  const [cancelOrderModal, setCancelOrderModal] = useState(null);
  const [isCheckingStripeRefund, setIsCheckingStripeRefund] = useState(false);
  const [stripeRefundCheckResult, setStripeRefundCheckResult] = useState(null);
  const [cancelRefundAmount, setCancelRefundAmount] = useState('');
  const [cancelRefundError, setCancelRefundError] = useState('');
  const [cancelRefundTimeline, setCancelRefundTimeline] = useState('5 to 10 business days');
  const [sendCustomerRefundEmail, setSendCustomerRefundEmail] = useState(true);
  const [isProcessingCancellation, setIsProcessingCancellation] = useState(false);

  const openCancelOrderModal = async (order) => {
    setCancelOrderModal(order);
    const rawAmt = order.rawAmount || parseFloat(String(order.total || '0').replace(/[^0-9.]/g, '')) || 0;
    setCancelRefundAmount(String(rawAmt));
    setCancelRefundError('');
    setCancelRefundTimeline('5 to 10 business days');
    setSendCustomerRefundEmail(true);
    setIsCheckingStripeRefund(true);
    setStripeRefundCheckResult(null);

    try {
      const res = await apiFetch('/api/payments/check-stripe-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          sessionId: order.sessionId,
          email: order.email
        })
      });
      const data = await res.json();
      if (data && data.success) {
        setStripeRefundCheckResult(data);
        if (data.isRefundedInStripe && data.amountRefunded > 0) {
          setCancelRefundAmount(String(data.amountRefunded));
        }
      } else {
        setStripeRefundCheckResult({ isRefundedInStripe: false, message: data?.message || 'No live Stripe refund recorded yet' });
      }
    } catch {
      setStripeRefundCheckResult({ isRefundedInStripe: false, message: 'Could not connect to Stripe live' });
    } finally {
      setIsCheckingStripeRefund(false);
    }
  };

  const handleConfirmOrderCancellation = async (e) => {
    if (e) e.preventDefault();
    if (!cancelOrderModal) return;

    const parsedRefundAmt = parseFloat(cancelRefundAmount);
    const orderTotalAmt = cancelOrderModal.rawAmount || parseFloat(String(cancelOrderModal.total || '0').replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(parsedRefundAmt) || parsedRefundAmt < 0) {
      setCancelRefundError('Please enter a valid refund amount (e.g. 0 for no refund, or partial/full amount).');
      return;
    }

    if (parsedRefundAmt > orderTotalAmt + 0.01) {
      setCancelRefundError(`Refund amount cannot exceed original order total of $${orderTotalAmt.toFixed(2)} AUD.`);
      return;
    }

    setIsProcessingCancellation(true);
    setCancelRefundError('');

    const targetOrder = cancelOrderModal;
    const isFullRefund = parsedRefundAmt >= (orderTotalAmt - 0.05);
    const refundStatusText = parsedRefundAmt > 0 ? (isFullRefund ? 'Full Refund Processed' : 'Partial Refund Processed') : 'Order Cancelled (No Refund)';

    const targetKey = targetOrder.id || targetOrder.order_number || targetOrder.uuid;

    // 1. Process Stripe live refund & MySQL record via backend API
    let stripeRefundId = null;
    try {
      const refundRes = await apiFetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetKey,
          amount: parsedRefundAmt,
          reason: cancelRefundReason || 'Customer requested cancellation'
        })
      });
      if (refundRes.ok) {
        const refundData = await refundRes.json();
        stripeRefundId = refundData.refundId || null;
      }
    } catch (refErr) {
      console.warn('Backend refund endpoint note:', refErr);
    }

    // 2. Update order status and exact refund amount in StoreContext & MySQL
    if (updateOrderStatus) {
      updateOrderStatus(targetKey, 'Cancelled', {
        refundAmount: parsedRefundAmt,
        isFullRefund,
        refundStatus: refundStatusText,
        refundTimeline: cancelRefundTimeline,
        stripeRefundId
      });
    }

    if (selectedOrder && matchesOrderId(selectedOrder, targetKey)) {
      setSelectedOrder(prev => ({
        ...prev,
        status: 'Cancelled',
        refundAmount: parsedRefundAmt,
        isFullRefund,
        refundStatus: refundStatusText,
        refundTimeline: cancelRefundTimeline,
        stripeRefundId
      }));
    }

    // 3. Dispatch Customer Refund Email via backend API if enabled and refund amount > 0
    if (sendCustomerRefundEmail && parsedRefundAmt > 0 && targetOrder.email) {
      try {
        await apiFetch('/api/payments/send-order-refund-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: targetOrder.email,
            customerName: targetOrder.customer,
            orderId: targetOrder.id || targetOrder.order_number,
            refundAmount: `$${parsedRefundAmt.toFixed(2)} AUD`,
            isFullRefund,
            originalTotal: targetOrder.total,
            daysTimeline: cancelRefundTimeline
          })
        });
        showToast(`✓ Order marked as Cancelled & Refund email sent to ${targetOrder.email}`, 'check');
      } catch {
        showToast(`✓ Order marked as Cancelled ($${parsedRefundAmt.toFixed(2)} AUD refund recorded).`, 'check');
      }
    } else {
      showToast(`✓ Order marked as Cancelled ($${parsedRefundAmt.toFixed(2)} AUD refund recorded).`, 'check');
    }

    setIsProcessingCancellation(false);
    setCancelOrderModal(null);
  };

  const handleInitiateStatusChange = (order, newStatus) => {
    const targetKey = order.id || order.order_number || order.uuid;
    if (newStatus === 'Shipped') {
      setShippingOrderModal(order);
      setShippingTrackingNumber(order.trackingNumber || '');
      setShippingTrackingError('');
    } else if (newStatus === 'Cancelled') {
      openCancelOrderModal(order);
    } else {
      if (updateOrderStatus) updateOrderStatus(targetKey, newStatus);
      if (selectedOrder && matchesOrderId(selectedOrder, targetKey)) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleConfirmShipmentWithTracking = async (e) => {
    if (e) e.preventDefault();
    const cleanTracking = (shippingTrackingNumber || '').trim().toUpperCase();
    if (!cleanTracking) {
      setShippingTrackingError('Please enter an Australia Post tracking number (e.g. AP398201948AU).');
      return;
    }

    if (!shippingOrderModal) return;

    setIsSendingDispatchEmail(true);
    setShippingTrackingError('');

    const targetOrder = shippingOrderModal;
    const targetKey = targetOrder.id || targetOrder.order_number || targetOrder.uuid;
    const formattedAddress = [
      targetOrder.address || '189 Brompton Road',
      targetOrder.city || 'Brisbane City',
      targetOrder.state || 'Queensland (QLD)',
      targetOrder.postcode || '4061',
      'Australia'
    ].filter(Boolean).join(', ');

    // 1. Update order status in StoreContext with tracking number
    if (updateOrderStatus) {
      updateOrderStatus(targetKey, 'Shipped', { trackingNumber: cleanTracking });
    }
    if (selectedOrder && matchesOrderId(selectedOrder, targetKey)) {
      setSelectedOrder(prev => ({ ...prev, status: 'Shipped', trackingNumber: cleanTracking }));
    }

    // 2. Dispatch Australia Post Shipped Email via backend API
    try {
      const res = await apiFetch('/api/payments/send-order-dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: targetOrder.email,
          customerName: targetOrder.customer,
          orderId: targetOrder.id,
          trackingNumber: cleanTracking,
          shippingMethod: targetOrder.shippingMethod === 'express' ? 'Express Shipping (Australia Post)' : (targetOrder.shippingMethod || 'Australia Post Shipping'),
          shippingAddress: formattedAddress
        })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`✓ Order marked as Shipped! Australia Post tracking email sent to ${targetOrder.email}`, 'check');
      } else {
        showToast(`Order marked as Shipped. Tracking code ${cleanTracking} recorded.`, 'check');
      }
    } catch {
      showToast(`Order marked as Shipped! (Tracking code recorded: ${cleanTracking})`, 'check');
    } finally {
      setIsSendingDispatchEmail(false);
      setShippingOrderModal(null);
      setShippingTrackingNumber('');
    }
  };

  // Customer Details Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // Analytics date filtration state
  const [analyticsPreset, setAnalyticsPreset] = useState('30days');

  // CMS state & Curator handlers
  const [cmsAnnouncement, setCmsAnnouncement] = useState(() => cms?.announcement || 'Free Express Shipping on all orders across Australia');
  const [bannerSavedNotice, setBannerSavedNotice] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [editingHeroIdx, setEditingHeroIdx] = useState(null);
  const [heroUploadSuccess, setHeroUploadSuccess] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileInputRef = React.useRef(null);
  const [heroForm, setHeroForm] = useState({
    tagline: '', title: '', description: '', image: '', ctaText: '', ctaLink: ''
  });
  const [heroFormErrors, setHeroFormErrors] = useState({});
  const [heroSubmittedNotice, setHeroSubmittedNotice] = useState(false);
  const [draggedHeroIdx, setDraggedHeroIdx] = useState(null);
  const [dragOverHeroIdx, setDragOverHeroIdx] = useState(null);

  const handleEditHeroSlide = (slide, idx) => {
    setEditingHeroIdx(idx);
    setHeroForm({
      tagline: slide.tagline || '',
      title: slide.title || '',
      description: slide.description || '',
      image: slide.image || '',
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      id: slide.id || undefined,
      theme: slide.theme || 'gold'
    });
    setHeroFormErrors({});
    setHeroUploadSuccess(Boolean(slide.image));
    setHeroSubmittedNotice(false);
    setShowHeroModal(true);
  };
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageSubTab, setMessageSubTab] = useState('contact');
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodPage, setProdPage] = useState(1);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);

  const handleHeroFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    setHeroUploadSuccess(false);

    try {
      const { dataUrl, blob } = await compressImage(file, 1200, 0.80);
      const uploadFile = new File([blob], 'hero.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', uploadFile);

      let cdnUrl = '';
      try {
        const res = await apiFetch('/api/products/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) cdnUrl = data.url;
        }
      } catch {}

      if (!cdnUrl) {
        try {
          const directForm = new FormData();
          directForm.append('file', uploadFile);
          directForm.append('upload_preset', 'abels_preset');
          directForm.append('cloud_name', 'gylnyxru');
          const res = await fetch('https://api.cloudinary.com/v1_1/gylnyxru/image/upload', {
            method: 'POST',
            body: directForm
          });
          if (res.ok) {
            const data = await res.json();
            if (data.secure_url) cdnUrl = data.secure_url;
          }
        } catch {}
      }

      if (cdnUrl) {
        setHeroForm(prev => ({ ...prev, image: cdnUrl }));
        setHeroUploadSuccess(true);
        showToast('Hero image uploaded to Cloudinary CDN!', 'check');
      } else if (dataUrl) {
        setHeroForm(prev => ({ ...prev, image: dataUrl }));
        setHeroUploadSuccess(true);
        showToast('Hero image updated successfully!', 'check');
      } else {
        showToast('Hero image upload failed. Please try again.', 'x');
      }
    } catch (err) {
      showToast('Hero image upload error: ' + err.message, 'x');
    } finally {
      setHeroUploading(false);
    }
  };

  React.useEffect(() => {
    if (cms?.announcement) {
      setCmsAnnouncement(cms.announcement);
    }
  }, [cms]);

  const toggleBestSeller = async (prod) => {
    const isBS = !prod.bestSeller;
    const updated = {
      ...prod,
      bestSeller: isBS,
      is_best_seller: isBS ? 1 : 0
    };
    await saveProduct(updated);
    showToast(`${prod.name} ${isBS ? 'added to' : 'removed from'} Best Sellers!`, 'check');
  };

  const toggleNewArrival = async (prod) => {
    const isNA = !prod.newArrival;
    const updated = {
      ...prod,
      newArrival: isNA,
      is_new_arrival: isNA ? 1 : 0
    };
    await saveProduct(updated);
    showToast(`${prod.name} ${isNA ? 'added to' : 'removed from'} New Arrivals!`, 'check');
  };

  // 1. GUEST ADMIN LOGIN
  if (!adminLoggedIn) {
    return (
      <>
        <style>{`
          @keyframes floatAdminCard {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes adminCardShake {
            0%, 100% { transform: translateX(0px); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .admin-login-card {
            animation: floatAdminCard 4.5s ease-in-out infinite;
          }
          .admin-login-card.shake {
            animation: adminCardShake 0.35s ease-in-out !important;
          }
        `}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FFFFFF' }}>
          <div
            className={`admin-login-card${isShaking ? ' shake' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #FAF4E8 0%, #F5E6CC 100%)',
              border: '1px solid var(--gold)',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: 40,
              boxShadow: '0 20px 40px rgba(212, 175, 55, 0.25)',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--onyx)' }}>ABEL’S</span><br />
              <span style={{ fontSize: 10, letterSpacing: '0.35em', color: 'var(--gold-dark)', fontWeight: 700 }}>PORTAL LOGIN</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--onyx)', marginBottom: 28, opacity: 0.85, textAlign: 'center', lineHeight: 1.5, background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
              Please sign in with your admin username and password.
            </p>

            <form onSubmit={handleAdminSubmit} autoComplete="off">
              <div className="form-group" style={{ textAlign: 'left', marginBottom: 18 }}>
                <label className="form-label" style={{ color: 'var(--onyx)', fontWeight: 700 }}>Admin username</label>
                <input
                  type="text"
                  name="admin_login_username"
                  autoComplete="off"
                  className="form-control"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FFFFFF', borderColor: loginError ? '#e53e3e' : 'var(--gold)' }}
                  value={loginId}
                  onChange={e => {
                    setLoginId(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                <label className="form-label" style={{ color: 'var(--onyx)', fontWeight: 700 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="admin_login_password"
                    autoComplete="new-password"
                    className="form-control"
                    style={{
                      width: '100%',
                      paddingRight: 40,
                      boxSizing: 'border-box',
                      background: '#FFFFFF',
                      borderColor: loginError ? '#e53e3e' : 'var(--gold)'
                    }}
                    value={loginPass}
                    onChange={e => {
                      setLoginPass(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--slate)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {loginError && (
                  <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 6, display: 'block', fontWeight: 600 }}>
                    {loginError}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8, padding: 14 }}>
                Submit
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(212, 175, 55, 0.3)', textAlign: 'center' }}>
              <Link
                to="/"
                style={{
                  color: 'var(--gold-dark)',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '0.04em',
                  textDecoration: 'underline',
                  display: 'inline-block'
                }}
              >
                ← Return to Store
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2. AUTHENTICATED ADMIN PANEL SETUP
  const currentAdmin = adminUser || roles[0] || { user: 'Admin', role: 'Super Admin' };

  const screens = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Discounts', icon: Ticket },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'cms', label: 'Website CMS', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  ];

  // Helper Stock Adjust
  const handleRecordStockChange = (prod, delta, reason) => {
    if (!prod) return;
    adjustStockQty(prod, delta, reason);
    const newQty = Math.max(0, (prod.stockQty || 0) + delta);
    showToast(`Stock updated for ${prod.name} (${newQty} units remaining)`, 'check');
  };

  // Low stock (< 3) & Out of stock (= 0) calculation
  const lowStockProducts = products.filter(p => (p.stockQty || 0) > 0 && (p.stockQty || 0) < 3);
  const outOfStockProducts = products.filter(p => (p.stockQty || 0) === 0);

  // Status breakdown for orders
  const confirmedOrdersCount = orders.filter(o => {
    const s = String(o.status || '').trim().toLowerCase();
    return s === 'confirmed' || s === 'new order' || s === 'pending' || !s;
  }).length;
  const packedOrdersCount = orders.filter(o => String(o.status || '').trim().toLowerCase() === 'packed').length;
  const shippedOrdersCount = orders.filter(o => String(o.status || '').trim().toLowerCase() === 'shipped').length;
  const deliveredOrdersCount = orders.filter(o => String(o.status || '').trim().toLowerCase() === 'delivered').length;
  const cancelledOrdersCount = orders.filter(o => {
    const s = String(o.status || '').trim().toLowerCase();
    return s === 'cancelled' || s === 'refunded';
  }).length;

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          {!sidebarCollapsed && (
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em' }}>ABEL’S</span><br />
              <span style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--gold)', fontWeight: 600 }}>ADMIN SUITE</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(s => !s)} style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            {sidebarCollapsed ? <ChevronRight style={{ width: 18 }} /> : <ChevronLeft style={{ width: 18 }} />}
          </button>
        </div>



        <nav className="admin-nav">
          {screens.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                className={`admin-nav-item${activeTab === s.id ? ' active' : ''}`}
                onClick={() => setActiveTab(s.id)}
                title={s.label}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {!sidebarCollapsed && s.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Body */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <button
              type="button"
              className="admin-mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              style={{ flexShrink: 0 }}
            >
              <Menu style={{ width: 22, height: 22, color: 'var(--onyx)' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: 'var(--onyx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(currentAdmin.user || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info-text">
                <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1, margin: 0 }}>{currentAdmin.user}</p>
                <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 600 }}>{currentAdmin.role}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <LogOut style={{ width: 12, height: 12 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Left Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="admin-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="admin-mobile-drawer" onClick={e => e.stopPropagation()}>
              <div className="admin-mobile-drawer-header">
                <div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', color: '#FFFFFF' }}>ABEL’S</span><br />
                  <span style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--gold)', fontWeight: 600 }}>ADMIN SUITE</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', padding: 4, cursor: 'pointer' }}
                >
                  <X style={{ width: 22, height: 22 }} />
                </button>
              </div>

              <nav className="admin-mobile-drawer-nav">
                {screens.map(s => {
                  const Icon = s.icon;
                  const isActive = activeTab === s.id;
                  return (
                    <button
                      key={s.id}
                      className={`admin-mobile-nav-item${isActive ? ' active' : ''}`}
                      onClick={() => {
                        setActiveTab(s.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <LogOut style={{ width: 15, height: 15 }} />
                  <span>Sign Out ({currentAdmin.user})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <main className="admin-body">

          {/* 1. DASHBOARD ("How is my business performing?") */}
          {activeTab === 'overview' && (() => {
            const parseDate = (dStr) => {
              if (!dStr) return new Date();
              if (typeof dStr !== 'string') return new Date(dStr);
              if (dStr.toLowerCase().includes('today')) return new Date();
              const direct = new Date(dStr);
              if (!isNaN(direct.getTime()) && direct.getFullYear() > 2000) return direct;
              const clean = dStr.replace(/today/gi, '').replace(/,/g, '').trim();
              const parts = clean.split(/\s+/);
              if (parts.length >= 3) {
                const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
                const day = parseInt(parts[0], 10) || 1;
                const month = months[parts[1]?.toLowerCase().slice(0, 3)] ?? 8;
                const year = parseInt(parts[2], 10) || 2026;
                return new Date(year, month, day);
              }
              return new Date();
            };

            const now = new Date();
            const filteredDashOrders = (orders || []).filter(o => {
              if (dashTimePeriod === 'all') return true;
              if (dashTimePeriod === 'today') {
                if (String(o.date || '').toLowerCase().includes('today')) return true;
                const od = parseDate(o.date || o.created_at || o.placed_at);
                return od.getFullYear() === now.getFullYear() &&
                       od.getMonth() === now.getMonth() &&
                       od.getDate() === now.getDate();
              }
              if (dashTimePeriod === 'week') {
                if (String(o.date || '').toLowerCase().includes('today')) return true;
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return parseDate(o.date || o.created_at || o.placed_at) >= oneWeekAgo;
              }
              if (dashTimePeriod === 'month') {
                if (String(o.date || '').toLowerCase().includes('today')) return true;
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return parseDate(o.date || o.created_at || o.placed_at) >= oneMonthAgo;
              }
              return true;
            });

            const dashGrossRevenue = filteredDashOrders.reduce((sum, o) => sum + (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0), 0);
            const dashRefunds = filteredDashOrders.reduce((sum, o) => {
              const s = String(o.status || '').trim().toLowerCase();
              if (s === 'cancelled' || s === 'refunded') {
                return sum + (o.refundAmount !== undefined ? Number(o.refundAmount) : (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0));
              }
              return sum + Number(o.refundAmount || 0);
            }, 0);
            const dashNetRevenue = Math.max(0, dashGrossRevenue - dashRefunds);

            const activeDashOrders = filteredDashOrders.filter(o => {
              const s = String(o.status || '').trim().toLowerCase();
              return s !== 'cancelled' && s !== 'refunded';
            });
            const dashItemsCount = activeDashOrders.reduce((sum, o) => sum + (o.itemsCount || o.items?.length || 1), 0);

            const uniqueClientEmails = new Set();
            (customers || []).forEach(c => { if (c.email) uniqueClientEmails.add(String(c.email).trim().toLowerCase()); });
            (orders || []).forEach(o => {
              const email = (o.email || o.customerEmail || o.guest_email || o.shippingAddress?.email || (typeof o.customer === 'object' && o.customer?.email) || '');
              if (email && typeof email === 'string') uniqueClientEmails.add(email.trim().toLowerCase());
            });
            const totalClientsCount = Math.max((customers || []).length, uniqueClientEmails.size);

            const dashConfirmed = filteredDashOrders.filter(o => {
              const s = String(o.status || '').trim().toLowerCase();
              return s === 'confirmed' || s === 'new order' || s === 'pending' || !s;
            }).length;
            const dashPacked = filteredDashOrders.filter(o => String(o.status || '').trim().toLowerCase() === 'packed').length;
            const dashShipped = filteredDashOrders.filter(o => String(o.status || '').trim().toLowerCase() === 'shipped').length;
            const dashDelivered = filteredDashOrders.filter(o => String(o.status || '').trim().toLowerCase() === 'delivered').length;
            const dashCancelled = filteredDashOrders.filter(o => {
              const s = String(o.status || '').trim().toLowerCase();
              return s === 'cancelled' || s === 'refunded';
            }).length;

            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Dashboard</h1>
                    <p style={{ fontSize: 14, color: 'var(--gold-dark)', fontWeight: 600, marginTop: 4 }}>"How is my business performing?"</p>
                  </div>

                  {/* Period Filter Buttons */}
                  <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                    {['all', 'today', 'week', 'month'].map(p => (
                      <button
                        key={p}
                        onClick={() => setDashTimePeriod(p)}
                        style={{
                          padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: dashTimePeriod === p ? 'var(--onyx)' : 'transparent',
                          color: dashTimePeriod === p ? '#FFFFFF' : 'var(--slate)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Today Metrics KPIs */}
                <div className="kpi-grid" style={{ marginBottom: 24 }}>
                  <div className="kpi-card">
                    <span className="kpi-title">Total Orders</span>
                    <span className="kpi-value">{filteredDashOrders.length} Orders</span>
                    <span className="kpi-trend trend-up">
                      {activeDashOrders.length} Active · {dashCancelled} Refunded
                    </span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-title">Net Revenue</span>
                    <span className="kpi-value" style={{ color: 'var(--onyx)' }}>
                      {formatMoney(dashNetRevenue)}
                    </span>
                    <span className="kpi-trend" style={{ color: dashRefunds > 0 ? '#C5221F' : '#2F855A', fontSize: 11.5, fontWeight: 600 }}>
                      {dashRefunds > 0 ? `Gross: ${formatMoney(dashGrossRevenue)} · Stripe Refunds: -${formatMoney(dashRefunds)}` : 'Live Net Sales (0 Refunds)'}
                    </span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-title">Items Sold</span>
                    <span className="kpi-value">{dashItemsCount} Items</span>
                    <span className="kpi-trend trend-up">Live Fulfilled Stock</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-title">Registered Clients</span>
                    <span className="kpi-value">{totalClientsCount} Clients</span>
                    <span className="kpi-trend trend-up">Live Customer Directory</span>
                  </div>
                </div>

                {/* Inventory Alerts Box */}
                {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                  <div style={{ background: '#FFF8F6', border: '1px solid #FFCDC5', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#C53030', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle style={{ width: 18, height: 18 }} /> Inventory Alerts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {lowStockProducts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#9B2C2C' }}>
                          <span style={{ fontSize: 16 }}>⚠️</span>
                          <span><strong>{lowStockProducts.length} products</strong> are low in stock (below 3 items): {lowStockProducts.map(p => `${p.name} (${p.stockQty})`).join(', ')}</span>
                        </div>
                      )}
                      {outOfStockProducts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#C53030' }}>
                          <span style={{ fontSize: 16 }}>🔴</span>
                          <span><strong>{outOfStockProducts.length} products</strong> are out of stock: {outOfStockProducts.map(p => p.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Status Breakdown */}
                <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)', marginBottom: 16 }}>Order Status Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                    <div style={{ background: '#EBF8FF', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#2B6CB0' }}>{dashConfirmed}</span>
                      <span style={{ fontSize: 12, color: '#2C5282', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed</span>
                    </div>
                    <div style={{ background: '#F3E8FF', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#6B21A8' }}>{dashPacked}</span>
                      <span style={{ fontSize: 12, color: '#581C87', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Packed</span>
                    </div>
                    <div style={{ background: '#FEFCBF', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#B7791F' }}>{dashShipped}</span>
                      <span style={{ fontSize: 12, color: '#744210', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipped</span>
                    </div>
                    <div style={{ background: '#C6F6D5', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#276749' }}>{dashDelivered}</span>
                      <span style={{ fontSize: 12, color: '#22543D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</span>
                    </div>
                    <div style={{ background: '#FED7D7', padding: 16, borderRadius: 8, textAlign: 'center', border: dashCancelled > 0 ? '1px solid #FEB2B2' : 'none' }}>
                      <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#9B2C2C' }}>{dashCancelled}</span>
                      <span style={{ fontSize: 12, color: '#742A2A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Cancelled</span>
                      {dashRefunds > 0 && (
                        <span style={{ fontSize: 10.5, color: '#C5221F', fontWeight: 700, display: 'block', marginTop: 2 }}>
                          -{formatMoney(dashRefunds)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. PRODUCTS */}
          {activeTab === 'products' && (() => {
            const filteredProducts = (products || []).filter(p => {
              if (!prodSearchQuery.trim()) return true;
              const q = prodSearchQuery.toLowerCase().trim();
              return (
                p.name?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.collection?.toLowerCase().includes(q)
              );
            });

            const itemsPerPage = 10;
            const totalProdPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
            const currentProdPage = Math.min(Math.max(1, prodPage), totalProdPages);
            const startIndex = (currentProdPage - 1) * itemsPerPage;
            const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                      Product Catalogue ({filteredProducts.length})
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>
                      Manage anti-tarnish gold-plated jewellery items, pricing, product codes, and tags.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: '100%', maxWidth: 520, justifyContent: 'flex-end' }}>
                    {/* Search Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', flex: 1, minWidth: 200 }}>
                      <Search style={{ width: 16, height: 16, color: 'var(--slate)', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Search product name, product code, category..."
                        value={prodSearchQuery}
                        onChange={e => { setProdSearchQuery(e.target.value); setProdPage(1); }}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, background: 'transparent' }}
                      />
                      {prodSearchQuery && (
                        <button type="button" onClick={() => { setProdSearchQuery(''); setProdPage(1); }} style={{ padding: 2, color: 'var(--slate)' }}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setProdForm({
                          id: '', name: '', sku: '', desc: '', price: '', salePrice: '',
                          baseImage1: '', baseImage2: '', baseImage3: '',
                          category: 'necklaces', stockQty: 10, status: 'Active',
                          isFeatured: false, bestSeller: false, newArrival: false, tags: '',
                          colorsText: '', colorImages: {},
                          seoTitle: '', seoDesc: '', slug: ''
                        });
                        setProdFormErrors({});
                        setEditingProduct({});
                      }}
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
                    >
                      <Plus style={{ width: 16, height: 16 }} /> Add Product
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                  <div className="admin-table-scroll-wrapper">
                    <table className="admin-table" style={{ width: '100%', minWidth: '720px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '32%' }}>Product</th>
                          <th style={{ width: '15%' }}>Product Code</th>
                          <th style={{ width: '15%' }}>Category</th>
                          <th style={{ width: '12%' }}>Price</th>
                          <th style={{ width: '14%' }}>Stock</th>
                          <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--slate)' }}>
                              {prodSearchQuery && prodSearchQuery.trim() ? `No products found matching "${prodSearchQuery}".` : 'No products found.'}
                            </td>
                          </tr>
                        ) : (
                          paginatedProducts.map(p => (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }} />
                                  <div style={{ minWidth: 0 }}>
                                    <strong style={{ fontSize: 13, color: 'var(--onyx)', display: 'block', wordBreak: 'break-word' }}>{p.name}</strong>
                                    {p.isFeatured && <span style={{ background: 'var(--gold)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, display: 'inline-block', marginTop: 2 }}>Featured</span>}
                                  </div>
                                </div>
                              </td>
                              <td><code style={{ fontSize: 12, background: 'var(--cream)', padding: '3px 6px', borderRadius: 4, color: 'var(--gold-dark)', fontWeight: 600 }}>{p.sku || 'ABL-JEW'}</code></td>
                              <td style={{ textTransform: 'capitalize', fontSize: 13, fontWeight: 500 }}>{p.category}</td>
                              <td style={{ fontSize: 13, fontWeight: 700, color: 'var(--onyx)' }}>${(p.salePrice && Number(p.salePrice) > 0) ? p.salePrice : p.price}</td>
                              <td>
                                <span style={{
                                  color: (p.stockQty || 0) === 0 ? '#C53030' : (p.stockQty || 0) < 3 ? '#DD6B20' : '#2F855A',
                                  fontWeight: 700,
                                  fontSize: 12
                                }}>
                                  {p.stockQty || 0} units
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                  <button
                                    onClick={() => {
                                      const baseImgs = p.images?.length > 0 ? p.images : [p.image || ''];
                                      const validColors = (p.colors || []).filter(c => {
                                        if (!c || !c.trim()) return false;
                                        if (c.trim().toLowerCase() === 'gold' && (!p.colorImages || !p.colorImages['Gold'] || !p.colorImages['Gold'][0])) return false;
                                        return true;
                                      });
                                      const colorsListStr = validColors.join(', ');
                                      setProdForm({
                                        id: p.id,
                                        name: p.name || '',
                                        sku: p.sku || '',
                                        desc: p.desc || p.description || '',
                                        price: p.price || 0,
                                        salePrice: p.salePrice || 0,
                                        baseImage1: baseImgs[0] || '',
                                        baseImage2: baseImgs[1] || '',
                                        baseImage3: baseImgs[2] || '',
                                        category: p.category || 'necklaces',
                                        collection: p.collection || 'Soleil',
                                        stockQty: p.stockQty ?? 10,
                                        status: p.status || 'Active',
                                        isFeatured: !!p.isFeatured,
                                        bestSeller: !!p.bestSeller,
                                        newArrival: !!p.newArrival,
                                        tags: p.tags || '',
                                        colorsText: colorsListStr,
                                        colorImages: p.colorImages || {},
                                        seoTitle: p.seoTitle || '',
                                        seoDesc: p.seoDesc || '',
                                        slug: p.slug || ''
                                      });
                                      setProdFormErrors({});
                                      setEditingProduct(p);
                                    }}
                                    className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                    title="Edit Product"
                                  >
                                    <Pencil style={{ width: 14, height: 14 }} /> Edit
                                  </button>
                                  <button onClick={() => deleteProduct(p.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }} title="Delete Product">
                                    <Trash2 style={{ width: 14, height: 14 }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FFFFFF', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>
                      Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Prev Arrow */}
                      <button
                        type="button"
                        onClick={() => setProdPage(prev => Math.max(1, prev - 1))}
                        disabled={currentProdPage === 1}
                        className="btn-secondary"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          opacity: currentProdPage === 1 ? 0.4 : 1,
                          cursor: currentProdPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                        title="Previous Page"
                      >
                        <ChevronLeft style={{ width: 16, height: 16 }} />
                      </button>

                      {/* Numbered Page Buttons: 1, 2, 3, 4 ... */}
                      {Array.from({ length: totalProdPages }, (_, idx) => idx + 1).map(pageNum => {
                        const isActive = pageNum === currentProdPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setProdPage(pageNum)}
                            style={{
                              minWidth: 34,
                              height: 34,
                              padding: '0 8px',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              background: isActive ? 'var(--onyx)' : '#FFFFFF',
                              color: isActive ? '#FFFFFF' : 'var(--onyx)',
                              border: isActive ? '1px solid var(--onyx)' : '1px solid var(--border)',
                              boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Arrow */}
                      <button
                        type="button"
                        onClick={() => setProdPage(prev => Math.min(totalProdPages, prev + 1))}
                        disabled={currentProdPage === totalProdPages}
                        className="btn-secondary"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          opacity: currentProdPage === totalProdPages ? 0.4 : 1,
                          cursor: currentProdPage === totalProdPages ? 'not-allowed' : 'pointer'
                        }}
                        title="Next Page"
                      >
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 3. CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                    Categories <span style={{ color: 'var(--onyx)', fontWeight: 600 }}>({categories.length})</span>
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>Earrings, Necklaces, Rings, Bracelets, Bangles, Charms, New Arrivals, Best Sellers.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {categories.map(c => (
                  <div key={c.id} style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', padding: 16 }}>
                    <img src={c.image} alt={c.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{c.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. INVENTORY & STOCK MOVEMENT HISTORY */}
          {activeTab === 'inventory' && (() => {
            const filteredInventory = (products || []).filter(p => {
              if (!inventorySearchQuery.trim()) return true;
              const q = inventorySearchQuery.toLowerCase().trim();
              return (
                p.name?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
              );
            });

            const itemsPerPage = 10;
            const totalInventoryPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
            const currentInventoryPage = Math.min(Math.max(1, inventoryPage), totalInventoryPages);
            const startIndex = (currentInventoryPage - 1) * itemsPerPage;
            const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                      Inventory Control ({filteredInventory.length})
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>
                      Track physical stock with automated stock movement history.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: '100%', maxWidth: 520, justifyContent: 'flex-end' }}>
                    {/* Search Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', flex: 1, minWidth: 200 }}>
                      <Search style={{ width: 16, height: 16, color: 'var(--slate)', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Search stock by product, SKU, category..."
                        value={inventorySearchQuery}
                        onChange={e => { setInventorySearchQuery(e.target.value); setInventoryPage(1); }}
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, background: 'transparent' }}
                      />
                      {inventorySearchQuery && (
                        <button type="button" onClick={() => { setInventorySearchQuery(''); setInventoryPage(1); }} style={{ padding: 2, color: 'var(--slate)' }}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>

                    <button onClick={() => restockAllLowStock(10)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <RefreshCw style={{ width: 14, height: 14 }} /> Restock All Low Items (+10)
                    </button>
                  </div>
                </div>

                <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                  <div className="admin-table-scroll-wrapper">
                    <table className="admin-table" style={{ width: '100%', minWidth: '760px' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '28%' }}>Product</th>
                          <th style={{ width: '14%' }}>Product Code</th>
                          <th style={{ width: '10%' }}>Stock Qty</th>
                          <th style={{ width: '16%' }}>Stock Status</th>
                          <th style={{ width: '18%' }}>Stock Management</th>
                          <th style={{ width: '14%' }}>Movement History</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInventory.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--slate)' }}>
                              No inventory items found matching "{inventorySearchQuery}".
                            </td>
                          </tr>
                        ) : (
                          paginatedInventory.map(p => {
                            const qty = p.stockQty || 0;
                            const isLow = qty > 0 && qty < 3;
                            const isOut = qty === 0;
                            return (
                              <tr key={p.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid var(--border)' }} />
                                    <strong style={{ fontSize: 13, color: 'var(--onyx)' }}>{p.name}</strong>
                                  </div>
                                </td>
                                <td><code style={{ fontSize: 12, background: 'var(--cream)', padding: '3px 6px', borderRadius: 4, color: 'var(--gold-dark)', fontWeight: 600 }}>{p.sku || 'ABL-JEW'}</code></td>
                                <td style={{ fontSize: 15, fontWeight: 700 }}>{qty}</td>
                                <td>
                                  {isOut ? (
                                    <span style={{ background: '#FED7D7', color: '#9B2C2C', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block' }}>🔴 Out of Stock</span>
                                  ) : isLow ? (
                                    <span style={{ background: '#FEEBC8', color: '#C05621', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block' }}>⚠️ Low Stock</span>
                                  ) : (
                                    <span style={{ background: '#C6F6D5', color: '#22543D', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block' }}>In Stock</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => handleRecordStockChange(p, -1, 'Stock reduction (-1)')} className="btn-secondary" style={{ padding: '4px 8px', fontWeight: 700, fontSize: 12 }}>-1</button>
                                    <button onClick={() => handleRecordStockChange(p, +1, 'Stock intake (+1)')} className="btn-secondary" style={{ padding: '4px 8px', fontWeight: 700, fontSize: 12 }}>+1</button>
                                    <button
                                      onClick={() => {
                                        setSelectedStockProduct(p);
                                        setStockAdjustQty(5);
                                        setStockAdjustReason('Restock shipment received');
                                      }}
                                      className="btn-secondary"
                                      style={{ padding: '4px 8px', fontSize: 11 }}
                                    >
                                      Adjust...
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => setSelectedStockProduct(p)}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <Layers style={{ width: 14, height: 14 }} /> History
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FFFFFF', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>
                      Showing {filteredInventory.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length} products
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Prev Arrow */}
                      <button
                        type="button"
                        onClick={() => setInventoryPage(prev => Math.max(1, prev - 1))}
                        disabled={currentInventoryPage === 1}
                        className="btn-secondary"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          opacity: currentInventoryPage === 1 ? 0.4 : 1,
                          cursor: currentInventoryPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                        title="Previous Page"
                      >
                        <ChevronLeft style={{ width: 16, height: 16 }} />
                      </button>

                      {/* Numbered Page Buttons: 1, 2, 3, 4 ... */}
                      {Array.from({ length: totalInventoryPages }, (_, idx) => idx + 1).map(pageNum => {
                        const isActive = pageNum === currentInventoryPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setInventoryPage(pageNum)}
                            style={{
                              minWidth: 34,
                              height: 34,
                              padding: '0 8px',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              background: isActive ? 'var(--onyx)' : '#FFFFFF',
                              color: isActive ? '#FFFFFF' : 'var(--onyx)',
                              border: isActive ? '1px solid var(--onyx)' : '1px solid var(--border)',
                              boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Arrow */}
                      <button
                        type="button"
                        onClick={() => setInventoryPage(prev => Math.min(totalInventoryPages, prev + 1))}
                        disabled={currentInventoryPage === totalInventoryPages}
                        className="btn-secondary"
                        style={{
                          width: 34,
                          height: 34,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          opacity: currentInventoryPage === totalInventoryPages ? 0.4 : 1,
                          cursor: currentInventoryPage === totalInventoryPages ? 'not-allowed' : 'pointer'
                        }}
                        title="Next Page"
                      >
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 5. ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                    Orders Lifecycle <span style={{ color: 'var(--onyx)', fontWeight: 600 }}>({orders.length})</span>
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>Confirmed → Packed → Shipped → Delivered.</p>
                </div>
              </div>

              <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <div className="admin-table-scroll-wrapper">
                  <table className="admin-table" style={{ width: '100%', minWidth: '950px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>Order ID</th>
                        <th style={{ width: '22%' }}>Customer & Contact</th>
                        <th style={{ width: '24%' }}>Delivery Address</th>
                        <th style={{ width: '16%' }}>Product / Items</th>
                        <th style={{ width: '10%' }}>Date</th>
                        <th style={{ width: '10%' }}>Status</th>
                        <th style={{ width: '6%', textAlign: 'center' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate)' }}>
                            <ShoppingBag style={{ width: 32, height: 32, margin: '0 auto 10px auto', opacity: 0.4, display: 'block' }} />
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>No orders recorded yet.</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>Real customer purchases made via Stripe payment gateway will appear here live with full order & payment details.</p>
                          </td>
                        </tr>
                      ) : (
                        orders.map(o => (
                          <tr key={o.id}>
                            <td>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 7px', color: 'var(--onyx)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}
                                title="Click to view full order dossier"
                              >
                                {o.id}
                              </button>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--onyx)', fontSize: 13, display: 'block' }}>{o.customer}</strong>
                              <a href={`mailto:${o.email}`} style={{ fontSize: 11, color: 'var(--slate)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Mail style={{ width: 11, height: 11, color: 'var(--gold-dark)' }} /> {o.email}
                              </a>
                              {o.phone && (
                                <a href={`tel:${o.phone}`} style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <Phone style={{ width: 11, height: 11 }} /> {o.phone}
                                </a>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <MapPin style={{ width: 14, height: 14, color: 'var(--gold-dark)', flexShrink: 0, marginTop: 2 }} />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)' }}>{o.address || '189 Brompton Road'}</div>
                                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>
                                    {[o.city || 'Brisbane City', o.state || 'Queensland (QLD)', o.postcode || '4061'].filter(Boolean).join(', ')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--onyx)' }}>{o.product || 'Gold Jewellery Selection'}</div>
                              {o.status === 'Cancelled' || o.status === 'Refunded' ? (
                                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 12, color: 'var(--slate)', textDecoration: 'line-through' }}>{o.total}</span>
                                  <span style={{ background: '#FCE8E6', color: '#C5221F', border: '1px solid #FAD2CF', padding: '1px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                                    Refunded (-{formatMoney(o.refundAmount !== undefined ? Number(o.refundAmount) : (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0))})
                                  </span>
                                </div>
                              ) : (
                                <strong style={{ fontSize: 13, color: 'var(--gold-dark)', display: 'block', marginTop: 2 }}>{o.total}</strong>
                              )}
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--slate)' }}>{o.date}</td>
                            <td>
                              {(() => {
                                const normSt = normalizeStatus(o.status);
                                const st = getStatusStyles(normSt);
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <select
                                      value={normSt}
                                      onChange={(e) => handleInitiateStatusChange(o, e.target.value)}
                                      style={{
                                        background: st.bg,
                                        color: st.color,
                                        border: `1px solid ${st.border}`,
                                        borderRadius: 6,
                                        padding: '5px 8px',
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-sans)',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      <option value="Confirmed" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>Confirmed</option>
                                      <option value="Packed" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>Packed</option>
                                      <option value="Shipped" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>Shipped</option>
                                      <option value="Delivered" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>Delivered</option>
                                      <option value="Cancelled" style={{ background: '#FFFFFF', color: '#1A1A1A' }}>Cancelled</option>
                                    </select>

                                    {o.trackingNumber && (
                                      <a
                                        href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(o.trackingNumber)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          fontSize: 10.5,
                                          color: 'var(--gold-dark)',
                                          fontWeight: 700,
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 3,
                                          letterSpacing: '0.02em'
                                        }}
                                        title={`Track on Australia Post: ${o.trackingNumber}`}
                                      >
                                        <span>AP: {o.trackingNumber}</span>
                                        <ExternalLink style={{ width: 10, height: 10 }} />
                                      </a>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--slate)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                title="View Complete Order"
                              >
                                <Eye style={{ width: 14, height: 14 }} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* 7. DISCOUNTS / COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                    Discount Coupons <span style={{ color: 'var(--onyx)', fontWeight: 600, whiteSpace: 'nowrap' }}>({coupons.length})</span>
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>Create promotional discount codes (e.g. WELCOME10, FIRSTORDER, DIWALI15).</p>
                </div>
                <button
                  onClick={() => {
                    setCouponForm({ id: '', code: '', label: '', discountType: 'percentage', value: 10, minOrder: 0, maxDiscount: 0, expiry: '2026-12-31', active: true, usageLimit: 100, perCustomerLimit: 1 });
                    setCouponFormErrors({});
                    setEditingCoupon({});
                  }}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Create Coupon
                </button>
              </div>

              <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <div className="admin-table-scroll-wrapper">
                  <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '18%' }}>Code</th>
                        <th style={{ width: '24%' }}>Description</th>
                        <th style={{ width: '15%' }}>Discount</th>
                        <th style={{ width: '13%' }}>Min Order</th>
                        <th style={{ width: '14%' }}>Expiry</th>
                        <th style={{ width: '16%' }}>Status</th>
                        <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(cp => (
                        <tr key={cp.id || cp.code}>
                          <td><code style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', background: 'var(--cream)', padding: '3px 8px', borderRadius: 4 }}>{cp.code}</code></td>
                          <td style={{ fontSize: 13, fontWeight: 500 }}>{cp.label}</td>
                          <td><strong style={{ color: 'var(--onyx)' }}>{cp.discountType === 'percentage' ? `${cp.value}% OFF` : `$${cp.value} OFF`}</strong></td>
                          <td style={{ fontSize: 13 }}>${cp.minOrder || 0}</td>
                          <td style={{ fontSize: 12, color: 'var(--slate)' }}>{cp.expiry || '2026-12-31'}</td>
                          <td>
                            <span style={{ background: cp.active ? '#C6F6D5' : '#FED7D7', color: cp.active ? '#22543D' : '#9B2C2C', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'inline-block' }}>
                              {cp.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                              <button
                                onClick={() => {
                                  setCouponForm({ ...cp });
                                  setCouponFormErrors({});
                                  setEditingCoupon(cp);
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 8px' }}
                                title="Edit Coupon"
                              >
                                <Pencil style={{ width: 14, height: 14 }} />
                              </button>
                              <button onClick={() => deleteCoupon(cp.code)} className="btn-secondary" style={{ padding: '6px 8px', color: 'var(--danger)' }} title="Delete Coupon">
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 8. REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>
                  Customer Reviews <span style={{ color: 'var(--onyx)', fontWeight: 600, whiteSpace: 'nowrap' }}>({reviews.length})</span>
                </h2>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>Approve, hide, reply to, or delete customer product reviews across the store.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.length === 0 ? (
                  <div className="admin-table-card" style={{ padding: 40, textAlign: 'center', color: 'var(--slate)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No customer reviews submitted yet.
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                            {r.productName && (
                              <span style={{ background: '#FAF4E8', color: 'var(--gold-dark)', border: '1px solid var(--gold)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
                                Product: {r.productName}
                              </span>
                            )}
                            <span style={{
                              fontSize: 10,
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: r.status === 'approved' ? '#E6F4EA' : '#FEF2F2',
                              color: r.status === 'approved' ? '#137333' : '#B91C1C',
                              border: `1px solid ${r.status === 'approved' ? '#CEEAD6' : '#FCA5A5'}`
                            }}>
                              {r.status === 'approved' ? 'Approved (Visible)' : 'Hidden'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', marginBottom: 4 }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} style={{ width: 16, height: 16, fill: i < r.rating ? 'var(--gold)' : 'none' }} />
                            ))}
                            <span style={{ fontWeight: 700, color: 'var(--onyx)', marginLeft: 6 }}>{r.title}</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
                            By <strong>{r.author}</strong> {r.userEmail && <span style={{ color: 'var(--slate)', fontSize: 12 }}>({r.userEmail})</span>} — {r.date}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus = r.status === 'approved' ? 'hidden' : 'approved';
                              updateReviewStatus(r.id, newStatus);
                            }}
                            className={r.status === 'approved' ? 'btn-secondary' : 'btn-primary'}
                            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }}
                          >
                            {r.status === 'approved' ? 'Hide' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (replyingReviewId === r.id) {
                                setReplyingReviewId(null);
                                setReviewReplyText('');
                              } else {
                                setReplyingReviewId(r.id);
                                setReviewReplyText(r.reply || '');
                              }
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }}
                          >
                            {r.reply ? 'Edit Reply' : 'Reply'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete this review by ${r.author}?`)) {
                                deleteReview(r.id);
                              }
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12, color: '#C5221F', borderColor: '#FAD2CF' }}
                            title="Delete Review"
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--onyx)', margin: '8px 0', lineHeight: 1.6 }}>"{r.text}"</p>
                      {r.reply && replyingReviewId !== r.id && (
                        <div style={{ background: 'var(--cream)', padding: 12, borderRadius: 8, marginTop: 8, fontSize: 13, borderLeft: '3px solid var(--gold)' }}>
                          <strong>Lincy:</strong> {r.reply}
                        </div>
                      )}

                      {replyingReviewId === r.id && (
                        <div style={{ marginTop: 12, padding: 14, background: 'var(--cream)', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--onyx)' }}>Lincy Reply:</p>
                          <textarea
                            value={reviewReplyText}
                            onChange={(e) => setReviewReplyText(e.target.value)}
                            placeholder="Write an official response to this client..."
                            rows={3}
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button
                              type="button"
                              onClick={() => {
                                replyToReview(r.id, reviewReplyText);
                                setReplyingReviewId(null);
                                setReviewReplyText('');
                              }}
                              className="btn-primary"
                              style={{ padding: '6px 16px', fontSize: 12 }}
                            >
                              Save Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(null);
                                setReviewReplyText('');
                              }}
                              className="btn-secondary"
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 9. MESSAGES */}
          {activeTab === 'messages' && (() => {
            const contactInquiries = (messages || []).filter(m => m.type !== 'newsletter' && !m.subject?.toLowerCase().includes('newsletter'));
            
            // Build newsletter list cleanly from subscribers and newsletter messages
            const subscriberEmails = new Set((subscribers || []).map(s => s.email?.toLowerCase()));
            const newsletterList = [...(subscribers || [])];
            (messages || []).forEach(m => {
              if ((m.type === 'newsletter' || m.subject?.toLowerCase().includes('newsletter')) && m.email && !subscriberEmails.has(m.email.toLowerCase())) {
                subscriberEmails.add(m.email.toLowerCase());
                newsletterList.push({ id: m.id, email: m.email, date: m.date || 'Recent', status: 'Active' });
              }
            });

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Client Communications & Inquiries</h2>
                    <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>Manage client contact form messages and newsletter subscriptions synchronized with database.</p>
                  </div>
                </div>

                {/* Sub-tab pills */}
                <div className="admin-messages-subtabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => setMessageSubTab('contact')}
                    className={`admin-messages-subtab-btn ${messageSubTab === 'contact' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700 }}
                  >
                    Contact Form Inquiries ({contactInquiries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageSubTab('newsletter')}
                    className={`admin-messages-subtab-btn ${messageSubTab === 'newsletter' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700 }}
                  >
                    Newsletter Subscriptions ({newsletterList.length})
                  </button>
                </div>

                {/* SUB-TAB 1: Contact Form Inquiries */}
                {messageSubTab === 'contact' && (
                  <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                    <div className="admin-table-scroll-wrapper">
                      <table className="admin-table" style={{ width: '100%', minWidth: '600px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '15%' }}>Date</th>
                            <th style={{ width: '30%' }}>Sender</th>
                            <th style={{ width: '25%' }}>Subject</th>
                            <th style={{ width: '18%' }}>Message</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactInquiries.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>No contact inquiries received yet.</td></tr>
                          ) : (
                            contactInquiries.map(m => (
                              <tr key={m.id}>
                                <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{m.date}</td>
                                <td>
                                  <strong style={{ fontSize: 13, display: 'block' }}>{m.name || 'Website Visitor'}</strong>
                                  <span style={{ fontSize: 11, color: 'var(--slate)' }}>{m.email}</span>
                                </td>
                                <td>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)' }}>{m.subject || 'Contact Inquiry'}</span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedMessage(m)}
                                    className="btn-secondary"
                                    style={{
                                      padding: '6px 14px',
                                      fontSize: 12,
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      background: '#FAF4E8',
                                      borderColor: 'var(--gold)',
                                      color: 'var(--gold-dark)',
                                      borderRadius: 6
                                    }}
                                  >
                                    <Eye style={{ width: 14, height: 14 }} /> View Message
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <a href={`mailto:${m.email}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Reply</a>
                                    <button
                                      type="button"
                                      onClick={() => deleteMessage(m.id)}
                                      className="btn-secondary"
                                      style={{ color: 'var(--danger)', padding: '4px 8px' }}
                                      title="Delete message"
                                    >
                                      <Trash2 style={{ width: 14, height: 14 }} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: Newsletter Subscriptions */}
                {messageSubTab === 'newsletter' && (
                  <div>
                    <div className="admin-table-card" style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                      <div className="admin-table-scroll-wrapper">
                        <table className="admin-table" style={{ width: '100%', minWidth: '550px' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '22%' }}>Subscribed Date</th>
                              <th style={{ width: '48%' }}>Subscriber Email</th>
                              <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
                              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newsletterList.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>No newsletter subscribers yet.</td></tr>
                            ) : (
                              newsletterList.map((sub, idx) => (
                                <tr key={sub.id || idx}>
                                  <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{sub.date || 'Recent'}</td>
                                  <td>
                                    <strong style={{ fontSize: 13, color: 'var(--onyx)' }}>{sub.email}</strong>
                                  </td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                      <span style={{ background: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', padding: '4px 12px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', display: 'inline-block' }}>
                                        {sub.status || 'Active'}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(sub.email);
                                          showToast('Subscriber email copied to clipboard!', 'check');
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
                                      >
                                        Copy Email
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteSubscriber(sub.id || sub.email)}
                                        className="btn-secondary"
                                        style={{ color: 'var(--danger)', padding: '6px 8px', display: 'inline-flex', alignItems: 'center' }}
                                        title="Delete subscriber"
                                      >
                                        <Trash2 style={{ width: 14, height: 14 }} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 10. WEBSITE CMS */}
          {activeTab === 'cms' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Controlled Website CMS</h2>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Manage top announcement banner, hero sliders, Best Sellers collection, and New Arrivals collection.</p>
              </div>

              {/* 1. Top Announcement Banner Card */}
              <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--onyx)' }}>Top Announcement Banner</h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 12 }}>Enter message to display across the top notification bar of your store.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={cmsAnnouncement}
                    onChange={e => {
                      setCmsAnnouncement(e.target.value);
                      if (bannerSavedNotice) setBannerSavedNotice(false);
                    }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        saveGlobalCMS({ announcement: cmsAnnouncement });
                        setBannerSavedNotice(true);
                        showToast('Top announcement banner saved!', 'check');
                      }}
                      className="btn-primary"
                      style={{ padding: '10px 24px', fontSize: 13 }}
                    >
                      Save Banner
                    </button>
                  </div>
                  {bannerSavedNotice && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '10px 14px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <span>Top announcement banner saved successfully!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Homepage Hero Banners Slider Manager */}
              <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                      Homepage Hero Banners ({cms.heroSlides?.length || 0})
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--slate)', margin: '2px 0 0 0' }}>Manage high-impact hero banner slides displayed on your homepage slider.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHeroIdx(null);
                      setHeroForm({ tagline: '', title: '', description: '', image: '', ctaText: '', ctaLink: '' });
                      setHeroFormErrors({});
                      setHeroUploadSuccess(false);
                      setHeroSubmittedNotice(false);
                      setShowHeroModal(true);
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add Hero Slide
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(cms.heroSlides || []).map((slide, idx) => {
                    const isDragging = draggedHeroIdx === idx;
                    const isDragOver = dragOverHeroIdx === idx;
                    return (
                      <div
                        key={slide.id || idx}
                        draggable
                        onDragStart={(e) => {
                          setDraggedHeroIdx(idx);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverHeroIdx !== idx) {
                            setDragOverHeroIdx(idx);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverHeroIdx === idx) {
                            setDragOverHeroIdx(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedHeroIdx !== null && draggedHeroIdx !== idx) {
                            reorderHeroSlides(draggedHeroIdx, idx);
                          }
                          setDraggedHeroIdx(null);
                          setDragOverHeroIdx(null);
                        }}
                        onDragEnd={() => {
                          setDraggedHeroIdx(null);
                          setDragOverHeroIdx(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: 14,
                          border: isDragOver ? '2px dashed var(--gold)' : '1px solid var(--border)',
                          borderRadius: 8,
                          background: isDragging ? 'rgba(212, 175, 55, 0.12)' : isDragOver ? 'var(--off-white)' : 'var(--cream)',
                          opacity: isDragging ? 0.6 : 1,
                          transition: 'all 0.15s ease',
                          cursor: 'grab'
                        }}
                      >
                        {/* Hamburger / Drag handle */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            padding: '6px 4px',
                            color: 'var(--slate)',
                            cursor: 'grab'
                          }}
                          title="Drag to reorder slide to any position"
                        >
                          <GripVertical style={{ width: 20, height: 20 }} />
                        </div>

                        {slide.image ? (
                          <img src={slide.image} alt={slide.title} style={{ width: 70, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: 70, height: 48, background: 'var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--slate)' }}>No Image</div>
                        )}
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--gold-dark)', fontWeight: 700, textTransform: 'uppercase' }}>{slide.tagline || 'HERO SLIDE'}</span>
                          <h5 style={{ fontSize: 15, fontWeight: 700, margin: '2px 0', color: 'var(--onyx)' }}>{slide.title?.replace(/<\/?[^>]+(>|$)/g, "")}</h5>
                          <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}>{slide.description}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleEditHeroSlide(slide, idx)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--onyx)' }}
                            title="Edit slide"
                          >
                            <Pencil style={{ width: 14, height: 14 }} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHeroSlide(idx)}
                            className="btn-secondary"
                            style={{ color: 'var(--danger)', padding: '6px 8px' }}
                            title="Delete slide"
                          >
                            <Trash2 style={{ width: 15, height: 15 }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. ⭐ Best Sellers Collection Curator */}
              <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--onyx)' }}>
                  ⭐ Best Sellers Collection Curator
                </h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 16 }}>
                  Select products from your catalogue to feature in the Best Sellers section on your homepage.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {products.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: p.bestSeller ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                        background: p.bestSeller ? '#FAF4E8' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</strong>
                          <span style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 700 }}>${p.price}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBestSeller(p)}
                        className={p.bestSeller ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 700 }}
                      >
                        {p.bestSeller ? '⭐ Best Seller' : '+ Best Seller'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. ✨ New Arrivals Collection Curator */}
              <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--onyx)' }}>
                  ✨ New Arrivals Collection Curator
                </h4>
                <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 16 }}>
                  Select products from your catalogue to feature in the New Arrivals collection on your homepage.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {products.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: p.newArrival ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                        background: p.newArrival ? '#FAF4E8' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</strong>
                          <span style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 700 }}>${p.price}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNewArrival(p)}
                        className={p.newArrival ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 700 }}
                      >
                        {p.newArrival ? '✨ New Arrival' : '+ New Arrival'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. ANALYTICS */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Analytics & Insights</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Track sales revenue, average order value, top-selling pieces, and customer repeat purchase rate.</p>
                </div>

                <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                  {['today', '7days', '30days', '3months', '6months', '1year'].map(period => (
                    <button
                      key={period}
                      onClick={() => setAnalyticsPreset(period)}
                      style={{
                        padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: analyticsPreset === period ? 'var(--onyx)' : 'transparent',
                        color: analyticsPreset === period ? '#FFFFFF' : 'var(--slate)',
                      }}
                    >
                      {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : period === '3months' ? '3 Months' : period === '6months' ? '6 Months' : period === '1year' ? '1 Year' : 'Today'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Metrics Cards */}
              {(() => {
                const totalGrossRev = orders.reduce((sum, o) => sum + (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0), 0);
                const totalRefunds = orders.reduce((sum, o) => {
                  if (o.status === 'Cancelled' || o.status === 'Refunded') {
                    return sum + (o.refundAmount !== undefined ? Number(o.refundAmount) : (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0));
                  }
                  return sum + Number(o.refundAmount || 0);
                }, 0);
                const netRev = Math.max(0, totalGrossRev - totalRefunds);
                const orderCnt = orders.length;
                const activeOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Refunded');
                const aovVal = activeOrders.length > 0 ? (netRev / activeOrders.length) : 0;
                const custCounts = activeOrders.reduce((acc, o) => { if (o.email) acc[o.email] = (acc[o.email] || 0) + 1; return acc; }, {});
                const repeatCusts = Object.values(custCounts).filter(c => c > 1).length;
                const uniqueCusts = Object.keys(custCounts).length;
                const repeatPct = uniqueCusts > 0 ? ((repeatCusts / uniqueCusts) * 100).toFixed(1) : '0.0';

                return (
                  <>
                    <div className="kpi-grid" style={{ marginBottom: 24 }}>
                      <div className="kpi-card">
                        <span className="kpi-title">Net Sales Revenue</span>
                        <span className="kpi-value" style={{ color: 'var(--onyx)' }}>{formatMoney(netRev)}</span>
                        <span className="kpi-trend trend-up">Net After Stripe Refunds</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-title">Total Stripe Refunds</span>
                        <span className="kpi-value" style={{ color: totalRefunds > 0 ? '#C5221F' : 'var(--slate)' }}>
                          {totalRefunds > 0 ? `-${formatMoney(totalRefunds)}` : '$0.00'}
                        </span>
                        <span className="kpi-trend" style={{ color: '#C5221F' }}>
                          {orders.filter(o => o.status === 'Cancelled' || o.status === 'Refunded').length} Cancelled / Refunded
                        </span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-title">Gross Revenue</span>
                        <span className="kpi-value">{formatMoney(totalGrossRev)}</span>
                        <span className="kpi-trend trend-up">{orderCnt} Total Orders Placed</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-title">Net AOV</span>
                        <span className="kpi-value">{formatMoney(aovVal)}</span>
                        <span className="kpi-trend trend-up">Average Settled Basket</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-title">Repeat Purchase Rate</span>
                        <span className="kpi-value">{repeatPct}%</span>
                        <span className="kpi-trend trend-up">Live Client Loyalty</span>
                      </div>
                    </div>

                    {/* Financial Reconciliation Breakdown Summary */}
                    <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px 0', color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Stripe Financial Settlement Summary</span>
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Gross Volume</span>
                          <strong style={{ fontSize: 18, color: 'var(--onyx)', display: 'block', marginTop: 4 }}>{formatMoney(totalGrossRev)} AUD</strong>
                          <span style={{ fontSize: 11, color: 'var(--slate)' }}>All processed checkout sessions</span>
                        </div>
                        <div style={{ background: '#FFF5F5', padding: 14, borderRadius: 8, border: '1px solid #FEB2B2' }}>
                          <span style={{ fontSize: 11, color: '#9B2C2C', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Stripe Refunds Deducted</span>
                          <strong style={{ fontSize: 18, color: '#C5221F', display: 'block', marginTop: 4 }}>-{formatMoney(totalRefunds)} AUD</strong>
                          <span style={{ fontSize: 11, color: '#9B2C2C' }}>Fully refunded to client cards</span>
                        </div>
                        <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                          <span style={{ fontSize: 11, color: '#166534', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Net Store Revenue</span>
                          <strong style={{ fontSize: 18, color: '#15803D', display: 'block', marginTop: 4 }}>{formatMoney(netRev)} AUD</strong>
                          <span style={{ fontSize: 11, color: '#166534' }}>100% accurate net earnings</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* MODAL: Edit/Add Product */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 720, width: '95%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 'clamp(16px, 4vw, 28px)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, marginBottom: 18, color: 'var(--onyx)' }}>
                {prodForm.id ? 'Edit Product' : 'Add New Product'}
              </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const errors = {};

              const catSlug = (prodForm.category || 'necklaces').trim().toLowerCase();
              const catFallbacks = {
                necklaces: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796748/abels_by_lincy/necklace-hero.webp',
                bangles: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796721/abels_by_lincy/Bangle_Category.webp',
                bracelets: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796728/abels_by_lincy/Bracelet_-_category.webp',
                earrings: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796735/abels_by_lincy/Earrings_Category.webp',
                rings: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png',
                charms: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp',
                'silver-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp',
                'seasonal-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png',
                'pair-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png'
              };
              const defaultCatImg = catFallbacks[catSlug] || catFallbacks.necklaces;

              if (!prodForm.name.trim()) errors.name = 'Product name is mandatory.';
              if (!prodForm.price || Number(prodForm.price) <= 0) errors.price = 'Base price must be greater than $0.';
              if (!prodForm.salePrice || Number(prodForm.salePrice) <= 0) errors.salePrice = 'Sale price is mandatory and must be greater than $0.';
              if (prodForm.stockQty === '' || Number(prodForm.stockQty) < 0) errors.stockQty = 'Valid stock quantity is mandatory.';

              const colorsList = prodForm.colorsText.split(',').map(c => c.trim()).filter(Boolean);

              if (Object.keys(errors).length > 0) {
                setProdFormErrors(errors);
                showToast(Object.values(errors)[0], 'alert-circle');
                return;
              }

              setProdFormErrors({});

              const baseImgs = [prodForm.baseImage1, prodForm.baseImage2, prodForm.baseImage3].map(s => s.trim()).filter(Boolean);
              const mainImg = baseImgs[0] || defaultCatImg;
              const finalImgs = baseImgs.length > 0 ? baseImgs : [mainImg];
              const skuCode = prodForm.sku.trim() || `ABL-${catSlug.slice(0,2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
              const finalDesc = prodForm.desc.trim() || `${prodForm.name.trim()} - Premium anti-tarnish jewellery handcrafted in 18K gold plating.`;

              const savedProduct = {
                id: prodForm.id || '',
                name: prodForm.name.trim(),
                sku: skuCode,
                slug: prodForm.slug || prodForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                desc: finalDesc,
                description: finalDesc,
                price: Number(prodForm.price) || 0,
                salePrice: Number(prodForm.salePrice || 0),
                image: mainImg,
                images: finalImgs,
                category: catSlug,
                collection: prodForm.collection || 'Soleil',
                material: editingProduct?.material || '18K Gold Plated',
                gemstone: editingProduct?.gemstone || 'None',
                stockQty: Number(prodForm.stockQty) || 10,
                status: prodForm.status || 'Active',
                isFeatured: !!prodForm.isFeatured,
                bestSeller: !!prodForm.bestSeller,
                newArrival: !!prodForm.newArrival,
                tags: Array.isArray(prodForm.tags) ? prodForm.tags : typeof prodForm.tags === 'string' ? prodForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [catSlug],
                colors: colorsList,
                colorImages: prodForm.colorImages,
                inStock: Number(prodForm.stockQty) > 0
              };

              await saveProduct(savedProduct);
              setEditingProduct(null);
            }} noValidate>

              {/* Product Name & Product Code */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>PRODUCT NAME *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Elegant Gold Bangle"
                    style={{ borderColor: prodFormErrors.name ? '#e53e3e' : undefined }}
                    value={prodForm.name}
                    onChange={e => {
                      setProdForm({ ...prodForm, name: e.target.value });
                      if (prodFormErrors.name) setProdFormErrors(err => ({ ...err, name: '' }));
                    }}
                  />
                  {prodFormErrors.name && (
                    <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {prodFormErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>PRODUCT CODE (SKU)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional (auto-generated if blank)"
                    style={{ borderColor: prodFormErrors.sku ? '#e53e3e' : undefined }}
                    value={prodForm.sku}
                    onChange={e => {
                      setProdForm({ ...prodForm, sku: e.target.value });
                      if (prodFormErrors.sku) setProdFormErrors(err => ({ ...err, sku: '' }));
                    }}
                  />
                </div>
              </div>

              {/* Base Price & Sale Price */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>BASE PRICE ($) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    placeholder=""
                    style={{ borderColor: prodFormErrors.price ? '#e53e3e' : undefined }}
                    value={prodForm.price === '' ? '' : prodForm.price}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                      setProdForm({ ...prodForm, price: cleanVal });
                      if (prodFormErrors.price) setProdFormErrors(err => ({ ...err, price: '' }));
                    }}
                  />
                  {prodFormErrors.price && (
                    <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {prodFormErrors.price}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>SALE PRICE ($) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    placeholder=""
                    style={{ borderColor: prodFormErrors.salePrice ? '#e53e3e' : undefined }}
                    value={prodForm.salePrice === '' || prodForm.salePrice === 0 ? '' : prodForm.salePrice}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                      setProdForm({ ...prodForm, salePrice: cleanVal });
                      if (prodFormErrors.salePrice) setProdFormErrors(err => ({ ...err, salePrice: '' }));
                    }}
                  />
                  {prodFormErrors.salePrice && (
                    <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {prodFormErrors.salePrice}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>STOCK QUANTITY *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="e.g. 10"
                    style={{ borderColor: prodFormErrors.stockQty ? '#e53e3e' : undefined }}
                    value={prodForm.stockQty === '' ? '' : prodForm.stockQty}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setProdForm({ ...prodForm, stockQty: cleanVal });
                      if (prodFormErrors.stockQty) setProdFormErrors(err => ({ ...err, stockQty: '' }));
                    }}
                  />
                  {prodFormErrors.stockQty && (
                    <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {prodFormErrors.stockQty}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>CATEGORY *</label>
                <select
                  className="form-control"
                  value={prodForm.category}
                  onChange={e => setProdForm({ ...prodForm, category: e.target.value })}
                >
                  <option value="necklaces">Necklaces</option>
                  <option value="bangles">Bangles</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="charms">Charms</option>
                  <option value="silver-collections">Silver Collections</option>
                  <option value="seasonal-collections">Seasonal Collections</option>
                  <option value="pair-collections">Pair Collections</option>
                  {categories.map(c => (
                    !['necklaces', 'bangles', 'bracelets', 'earrings', 'rings', 'charms', 'silver-collections', 'seasonal-collections', 'pair-collections'].includes(c.id) && (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    )
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>DESCRIPTION *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Detailed product overview, craftsmanship, materials..."
                  style={{ borderColor: prodFormErrors.desc ? '#e53e3e' : undefined }}
                  value={prodForm.desc}
                  onChange={e => {
                    setProdForm({ ...prodForm, desc: e.target.value });
                    if (prodFormErrors.desc) setProdFormErrors(err => ({ ...err, desc: '' }));
                  }}
                />
                {prodFormErrors.desc && (
                  <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                    {prodFormErrors.desc}
                  </span>
                )}
              </div>

              {/* Base Product Images Section */}
              <div style={{ background: 'var(--cream)', padding: 18, borderRadius: 12, marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)', margin: 0 }}>
                    Base Product Images
                  </h4>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    Upload images in 1200 × 1200 ratio
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Recommended: Upload square images in <strong>1200 × 1200 ratio</strong> (1:1 aspect ratio) for best display quality across desktop and mobile.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Base Image 1 */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--onyx)', marginBottom: 6, display: 'block' }}>
                      Base Image 1 <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {prodForm.baseImage1 && (
                        <img
                          src={prodForm.baseImage1}
                          alt="Base 1 Preview"
                          style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0, background: '#FFFFFF' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Image URL or click Upload from device"
                        style={{ flex: 1, background: '#FFFFFF', borderColor: prodFormErrors.baseImage1 ? '#e53e3e' : undefined }}
                        value={prodForm.baseImage1}
                        onChange={e => {
                          setProdForm({ ...prodForm, baseImage1: e.target.value });
                          if (prodFormErrors.baseImage1) setProdFormErrors(err => ({ ...err, baseImage1: '' }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={uploadingFieldKey === 'baseImage1'}
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 95, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => {
                          triggerImageUpload('baseImage1', (url) => {
                            setProdForm(prev => ({ ...prev, baseImage1: url }));
                            if (prodFormErrors.baseImage1) setProdFormErrors(err => ({ ...err, baseImage1: '' }));
                            showToast('Base Image 1 uploaded successfully!', 'check');
                          });
                        }}
                      >
                        {uploadingFieldKey === 'baseImage1' ? (
                          <>
                            <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            <span>Uploading...</span>
                          </>
                        ) : prodForm.baseImage1?.trim() ? (
                          'Change Image'
                        ) : (
                          'Upload'
                        )}
                      </button>
                      {prodForm.baseImage1?.trim() && (
                        <button
                          type="button"
                          style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            background: '#FFF5F5',
                            color: '#E53E3E',
                            border: '1px solid #FEB2B2',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            handleRemoveImage(prodForm.baseImage1, () => {
                              setProdForm(prev => ({ ...prev, baseImage1: '' }));
                              showToast('Base Image 1 removed.', 'info');
                            });
                          }}
                          title="Remove image"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    {prodFormErrors.baseImage1 && (
                      <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                        {prodFormErrors.baseImage1}
                      </span>
                    )}
                  </div>

                  {/* Base Image 2 */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, display: 'block' }}>
                      Base Image 2
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {prodForm.baseImage2 && (
                        <img
                          src={prodForm.baseImage2}
                          alt="Base 2 Preview"
                          style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0, background: '#FFFFFF' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Image URL or click Upload from device"
                        style={{ flex: 1, background: '#FFFFFF' }}
                        value={prodForm.baseImage2}
                        onChange={e => setProdForm({ ...prodForm, baseImage2: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={uploadingFieldKey === 'baseImage2'}
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 95, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => {
                          triggerImageUpload('baseImage2', (url) => {
                            setProdForm(prev => ({ ...prev, baseImage2: url }));
                            showToast('Base Image 2 uploaded successfully!', 'check');
                          });
                        }}
                      >
                        {uploadingFieldKey === 'baseImage2' ? (
                          <>
                            <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            <span>Uploading...</span>
                          </>
                        ) : prodForm.baseImage2?.trim() ? (
                          'Change Image'
                        ) : (
                          'Upload'
                        )}
                      </button>
                      {prodForm.baseImage2?.trim() && (
                        <button
                          type="button"
                          style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            background: '#FFF5F5',
                            color: '#E53E3E',
                            border: '1px solid #FEB2B2',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            handleRemoveImage(prodForm.baseImage2, () => {
                              setProdForm(prev => ({ ...prev, baseImage2: '' }));
                              showToast('Base Image 2 removed.', 'info');
                            });
                          }}
                          title="Remove image"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Base Image 3 */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, display: 'block' }}>
                      Base Image 3
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {prodForm.baseImage3 && (
                        <img
                          src={prodForm.baseImage3}
                          alt="Base 3 Preview"
                          style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0, background: '#FFFFFF' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Image URL or click Upload from device"
                        style={{ flex: 1, background: '#FFFFFF' }}
                        value={prodForm.baseImage3}
                        onChange={e => setProdForm({ ...prodForm, baseImage3: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={uploadingFieldKey === 'baseImage3'}
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 95, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => {
                          triggerImageUpload('baseImage3', (url) => {
                            setProdForm(prev => ({ ...prev, baseImage3: url }));
                            showToast('Base Image 3 uploaded successfully!', 'check');
                          });
                        }}
                      >
                        {uploadingFieldKey === 'baseImage3' ? (
                          <>
                            <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            <span>Uploading...</span>
                          </>
                        ) : prodForm.baseImage3?.trim() ? (
                          'Change Image'
                        ) : (
                          'Upload'
                        )}
                      </button>
                      {prodForm.baseImage3?.trim() && (
                        <button
                          type="button"
                          style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            background: '#FFF5F5',
                            color: '#E53E3E',
                            border: '1px solid #FEB2B2',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            handleRemoveImage(prodForm.baseImage3, () => {
                              setProdForm(prev => ({ ...prev, baseImage3: '' }));
                              showToast('Base Image 3 removed.', 'info');
                            });
                          }}
                          title="Remove image"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants */}
              <div style={{ background: '#FFFFFF', padding: 18, borderRadius: 12, marginBottom: 20, border: '1px solid var(--gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)', margin: 0 }}>
                    Color Variants
                  </h4>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: 6 }}>
                    1200 × 1200 ratio
                  </span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>AVAILABLE COLORS</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Blue, Green, Black"
                    value={prodForm.colorsText}
                    onChange={e => setProdForm({ ...prodForm, colorsText: e.target.value })}
                  />
                </div>

                {/* Dynamically rendered color variant image boxes */}
                {prodForm.colorsText.split(',').map(c => c.trim()).filter(Boolean).map(color => {
                  const colorImgs = prodForm.colorImages[color] || ['', '', ''];
                  return (
                    <div key={color} style={{ background: 'var(--cream)', padding: 14, borderRadius: 8, marginBottom: 14, border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', margin: '0 0 10px 0' }}>
                        Images for "{color}" Variant
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[0, 1, 2].map(imgIdx => {
                          const fieldKey = `color_${color}_${imgIdx}`;
                          const isMandatory = imgIdx === 0;
                          const imgVal = colorImgs[imgIdx] || '';
                          const hasError = isMandatory && prodFormErrors[fieldKey];

                          return (
                            <div key={imgIdx}>
                              <label style={{ fontSize: 11, fontWeight: isMandatory ? 700 : 600, color: isMandatory ? 'var(--onyx)' : 'var(--slate)', marginBottom: 4, display: 'block' }}>
                                {color} Image {imgIdx + 1} {isMandatory && <span style={{ color: '#e53e3e' }}>*</span>}
                              </label>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {imgVal && (
                                  <img
                                    src={imgVal}
                                    alt={`${color} ${imgIdx + 1} Preview`}
                                    style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0, background: '#FFFFFF' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Image URL or click Upload from device"
                                  style={{ flex: 1, background: '#FFFFFF', borderColor: hasError ? '#e53e3e' : undefined }}
                                  value={imgVal}
                                  onChange={e => {
                                    const updated = [...colorImgs];
                                    updated[imgIdx] = e.target.value;
                                    setProdForm({
                                      ...prodForm,
                                      colorImages: { ...prodForm.colorImages, [color]: updated }
                                    });
                                    if (hasError) {
                                      setProdFormErrors(err => ({ ...err, [fieldKey]: '' }));
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  disabled={uploadingFieldKey === fieldKey}
                                  style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 95, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                  onClick={() => {
                                    triggerImageUpload(fieldKey, (url) => {
                                      setProdForm(prev => {
                                        const curImgs = prev.colorImages[color] || ['', '', ''];
                                        const updated = [...curImgs];
                                        updated[imgIdx] = url;
                                        return {
                                          ...prev,
                                          colorImages: { ...prev.colorImages, [color]: updated }
                                        };
                                      });
                                      if (hasError) {
                                        setProdFormErrors(err => ({ ...err, [fieldKey]: '' }));
                                      }
                                      showToast(`${color} Image ${imgIdx + 1} uploaded successfully!`, 'check');
                                    });
                                  }}
                                >
                                  {uploadingFieldKey === fieldKey ? (
                                    <>
                                      <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                                      <span>Uploading...</span>
                                    </>
                                  ) : imgVal?.trim() ? (
                                    'Change Image'
                                  ) : (
                                    'Upload'
                                  )}
                                </button>
                                {imgVal?.trim() && (
                                  <button
                                    type="button"
                                    style={{
                                      padding: '8px 12px',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                      background: '#FFF5F5',
                                      color: '#E53E3E',
                                      border: '1px solid #FEB2B2',
                                      borderRadius: 6,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      handleRemoveImage(imgVal, () => {
                                        setProdForm(prev => {
                                          const curImgs = prev.colorImages[color] || ['', '', ''];
                                          const updated = [...curImgs];
                                          updated[imgIdx] = '';
                                          return {
                                            ...prev,
                                            colorImages: { ...prev.colorImages, [color]: updated }
                                          };
                                        });
                                        showToast(`${color} Image ${imgIdx + 1} removed.`, 'info');
                                      });
                                    }}
                                    title="Remove image"
                                  >
                                    <Trash2 style={{ width: 13, height: 13 }} />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>
                              {hasError && (
                                <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                                  {prodFormErrors[fieldKey]}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Badges & Storefront Placement */}
              <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--onyx)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>
                  Storefront Badges & Visibility
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--onyx)' }}>
                    <input
                      type="checkbox"
                      checked={!!prodForm.newArrival}
                      onChange={e => setProdForm({ ...prodForm, newArrival: e.target.checked })}
                      style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                    />
                    <span>New Arrival (Home Page)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--onyx)' }}>
                    <input
                      type="checkbox"
                      checked={!!prodForm.bestSeller}
                      onChange={e => setProdForm({ ...prodForm, bestSeller: e.target.checked })}
                      style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                    />
                    <span>Best Seller (Home Page)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* MODAL: Stock Movement History */}
      {selectedStockProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 560, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Stock Movement History
            </h3>
            <p style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, marginBottom: 20 }}>
              {selectedStockProduct.name} (Product Code: {selectedStockProduct.sku || 'ABL-JEW'}) — Current Stock: {selectedStockProduct.stockQty || 0}
            </p>

            <div style={{ background: 'var(--cream)', padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Quick Stock Adjustment</h4>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: 90 }}
                  value={stockAdjustQty}
                  onChange={e => setStockAdjustQty(parseInt(e.target.value, 10) || 0)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Reason (e.g. Stock adjustment +5)"
                  style={{ flex: 1 }}
                  value={stockAdjustReason}
                  onChange={e => setStockAdjustReason(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleRecordStockChange(selectedStockProduct, stockAdjustQty, stockAdjustReason);
                    setSelectedStockProduct(null);
                  }}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Movement Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(stockHistory || []).filter(h => h.productId === selectedStockProduct.id || h.productName === selectedStockProduct.name).map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div>
                    <strong>{h.reason}</strong>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--slate)' }}>{h.date}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: h.change > 0 ? '#276749' : '#9B2C2C' }}>{h.change > 0 ? `+${h.change}` : h.change}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--slate)' }}>Stock: {h.stockAfter}</span>
                  </div>
                </div>
              ))}
              {(stockHistory || []).filter(h => h.productId === selectedStockProduct.id || h.productName === selectedStockProduct.name).length === 0 && (
                <div style={{ padding: 12, fontSize: 13, color: 'var(--slate)', fontStyle: 'italic' }}>
                  Initial stock: {selectedStockProduct.stockQty || 0} pieces. No manual movement logs recorded yet.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <button type="button" onClick={() => setSelectedStockProduct(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Customer Order History Profile */}
      {selectedCustomer && (() => {
        const custOrders = orders.filter(o => (selectedCustomer.name && o.customer?.toLowerCase() === selectedCustomer.name.toLowerCase()) || (selectedCustomer.email && o.email?.toLowerCase() === selectedCustomer.email.toLowerCase()));
        const custGrossSpent = custOrders.reduce((sum, o) => sum + (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0), 0);
        const custRefunds = custOrders.reduce((sum, o) => {
          if (o.status === 'Cancelled' || o.status === 'Refunded') {
            return sum + (o.refundAmount !== undefined ? Number(o.refundAmount) : (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0));
          }
          return sum + Number(o.refundAmount || 0);
        }, 0);
        const custNetSpent = Math.max(0, custGrossSpent - custRefunds);
        const activeCustOrders = custOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Refunded');

        return (
          <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 560, width: '95%', padding: '24px 28px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                    {selectedCustomer.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 0 0' }}>
                    Email: <strong>{selectedCustomer.email}</strong> • Joined: {selectedCustomer.joined || 'Aug 2026'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, background: 'var(--cream)', padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--onyx)', marginTop: 2 }}>{custOrders.length || selectedCustomer.orders || 1}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate)' }}>{activeCustOrders.length} active order{activeCustOrders.length === 1 ? '' : 's'}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 600 }}>Net Lifetime Spent</span>
                  <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--gold-dark)', marginTop: 2 }}>{formatMoney(custNetSpent)}</span>
                  {custRefunds > 0 ? (
                    <span style={{ fontSize: 11, color: '#C5221F', fontWeight: 600 }}>
                      Gross: {formatMoney(custGrossSpent)} · Refunds: -{formatMoney(custRefunds)}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>Net Settled</span>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--onyx)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Purchase Dossier ({custOrders.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {custOrders.length === 0 ? (
                  <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 8, textAlign: 'center', color: 'var(--slate)', fontSize: 13 }}>
                    No order history recorded for this customer yet.
                  </div>
                ) : (
                  custOrders.map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: (o.status === 'Cancelled' || o.status === 'Refunded') ? '#FFF5F5' : '#FFFFFF' }}>
                      <div>
                        <strong>{o.id}</strong> — {o.product || 'Fine Jewellery'}
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--slate)' }}>Date: {o.date}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {o.status === 'Cancelled' || o.status === 'Refunded' ? (
                          <>
                            <strong style={{ fontSize: 13, color: 'var(--slate)', textDecoration: 'line-through', display: 'block' }}>{o.total}</strong>
                            <span style={{ fontSize: 11, color: '#C5221F', fontWeight: 700 }}>Refunded (-{formatMoney(o.refundAmount !== undefined ? Number(o.refundAmount) : (o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0))})</span>
                          </>
                        ) : (
                          <>
                            <strong style={{ fontSize: 14, color: 'var(--onyx)', display: 'block' }}>{o.total}</strong>
                            <span style={{ fontSize: 11, color: '#276749', fontWeight: 600 }}>{o.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Add Hero Banner Slide */}
      {showHeroModal && (
        <div className="admin-modal-overlay">
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 540, width: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 'clamp(16px, 4vw, 24px)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, marginBottom: 16, color: 'var(--onyx)' }}>
                {editingHeroIdx !== null ? 'Edit Homepage Hero Banner Slide' : 'Add Homepage Hero Banner Slide'}
              </h3>

            <form onSubmit={e => {
              e.preventDefault();
              const errors = {};
              if (!heroForm.image || !heroForm.image.trim()) {
                errors.image = 'Hero banner image is required.';
              }
              if (!heroForm.tagline || !heroForm.tagline.trim()) {
                errors.tagline = 'Tagline / Subtitle is required.';
              }
              if (!heroForm.title || !heroForm.title.trim()) {
                errors.title = 'Main title is required.';
              }
              if (!heroForm.description || !heroForm.description.trim()) {
                errors.description = 'Description is required.';
              }
              if (!heroForm.ctaText || !heroForm.ctaText.trim()) {
                errors.ctaText = 'CTA button text is required.';
              }
              if (!heroForm.ctaLink || !heroForm.ctaLink.trim()) {
                errors.ctaLink = 'CTA button link is required.';
              }

              if (Object.keys(errors).length > 0) {
                setHeroFormErrors(errors);
                return;
              }

              setHeroFormErrors({});
              if (editingHeroIdx !== null && editingHeroIdx >= 0) {
                saveHeroSlide(editingHeroIdx, heroForm);
                setHeroSubmittedNotice(true);
                showToast('Hero slide updated & saved to database!', 'check');
              } else {
                saveHeroSlide(heroForm);
                setHeroSubmittedNotice(true);
                showToast('Hero slide added & saved to database!', 'check');
              }
              setTimeout(() => {
                setShowHeroModal(false);
                setHeroUploadSuccess(false);
                setHeroSubmittedNotice(false);
                setEditingHeroIdx(null);
                setHeroForm({
                  tagline: '', title: '', description: '', image: '', ctaText: '', ctaLink: ''
                });
              }, 800);
            }}>
              {heroSubmittedNotice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{editingHeroIdx !== null ? '✓ Hero slide updated and saved!' : '✓ Hero slide created and added to homepage slider!'}</span>
                </div>
              )}

              {/* Hidden Native File Input for Direct Local Device Selection */}
              <input
                type="file"
                ref={heroFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  handleHeroFileUpload(e);
                  if (heroFormErrors.image) setHeroFormErrors(prev => ({ ...prev, image: '' }));
                }}
                style={{ display: 'none' }}
              />

              {/* Square Upload Box */}
              <div style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  HERO BANNER IMAGE <span style={{ color: '#DC2626' }}>*</span>
                </label>

                <div
                  onClick={() => heroFileInputRef.current && heroFileInputRef.current.click()}
                  style={{
                    border: heroFormErrors.image ? '2px dashed #DC2626' : '2px dashed var(--gold)',
                    borderRadius: 12,
                    background: 'var(--cream)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 140
                  }}
                >
                  {heroUploading ? (
                    <>
                      <RefreshCw style={{ width: 24, height: 24, color: 'var(--gold-dark)', animation: 'spin 1s linear infinite' }} />
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--onyx)' }}>Uploading to Cloudinary...</p>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-dark)' }}>
                        <Plus style={{ width: 22, height: 22 }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--onyx)' }}>
                        Click to Upload Hero Image
                      </p>
                      <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600 }}>
                        Recommended Size: 1920 × 800 px (2.4:1 Aspect Ratio)
                      </span>
                    </>
                  )}
                </div>

                {heroFormErrors.image && (
                  <div style={{ color: '#DC2626', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                    {heroFormErrors.image}
                  </div>
                )}

                {/* Inline Success Notification */}
                {heroUploadSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 14px', background: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span>Image uploaded successfully!</span>
                  </div>
                )}

                {/* Image Preview & URL badge */}
                {heroForm.image && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--off-white)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <img src={heroForm.image} alt="Hero Preview" style={{ width: 70, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <span style={{ fontSize: 11, color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{heroForm.image}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setHeroForm(prev => ({ ...prev, image: '' })); setHeroUploadSuccess(false); }} style={{ background: 'none', border: 'none', color: '#C5221F', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  TAGLINE / SUBTITLE <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: heroFormErrors.tagline ? '#DC2626' : undefined }}
                  placeholder="e.g. THE NEW COLLECTION"
                  value={heroForm.tagline}
                  onChange={e => {
                    setHeroForm({ ...heroForm, tagline: e.target.value });
                    if (heroFormErrors.tagline) setHeroFormErrors(prev => ({ ...prev, tagline: '' }));
                  }}
                />
                {heroFormErrors.tagline && (
                  <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                    {heroFormErrors.tagline}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  MAIN TITLE <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span style={{ fontSize: 11, color: 'var(--slate)', margin: '2px 0 6px 0', display: 'block' }}>
                  Tip: Wrap key words with &lt;b&gt;word&lt;/b&gt; to highlight them in gold (e.g. Elegance in Every &lt;b&gt;Detail&lt;/b&gt;)
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: heroFormErrors.title ? '#DC2626' : undefined }}
                  placeholder="e.g. Elegance in Every <b>Detail</b>"
                  value={heroForm.title}
                  onChange={e => {
                    setHeroForm({ ...heroForm, title: e.target.value });
                    if (heroFormErrors.title) setHeroFormErrors(prev => ({ ...prev, title: '' }));
                  }}
                />
                {heroFormErrors.title && (
                  <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                    {heroFormErrors.title}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  DESCRIPTION <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  style={{ borderColor: heroFormErrors.description ? '#DC2626' : undefined }}
                  placeholder="e.g. Hand-crafted anti-tarnish gold-plated jewellery."
                  value={heroForm.description}
                  onChange={e => {
                    setHeroForm({ ...heroForm, description: e.target.value });
                    if (heroFormErrors.description) setHeroFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                />
                {heroFormErrors.description && (
                  <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                    {heroFormErrors.description}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    CTA BUTTON TEXT <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: heroFormErrors.ctaText ? '#DC2626' : undefined }}
                    placeholder="e.g. SHOP NOW"
                    value={heroForm.ctaText}
                    onChange={e => {
                      setHeroForm({ ...heroForm, ctaText: e.target.value });
                      if (heroFormErrors.ctaText) setHeroFormErrors(prev => ({ ...prev, ctaText: '' }));
                    }}
                  />
                  {heroFormErrors.ctaText && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {heroFormErrors.ctaText}
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    CTA BUTTON LINK <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: heroFormErrors.ctaLink ? '#DC2626' : undefined }}
                    placeholder="e.g. /shop"
                    value={heroForm.ctaLink}
                    onChange={e => {
                      setHeroForm({ ...heroForm, ctaLink: e.target.value });
                      if (heroFormErrors.ctaLink) setHeroFormErrors(prev => ({ ...prev, ctaLink: '' }));
                    }}
                  />
                  {heroFormErrors.ctaLink && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {heroFormErrors.ctaLink}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowHeroModal(false); setHeroUploadSuccess(false); setHeroFormErrors({}); setEditingHeroIdx(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingHeroIdx !== null ? 'Save Changes' : 'Add Hero Slide'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* MODAL: View Message Details Popup */}
      {selectedMessage && (
        <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 540, width: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 'clamp(20px, 4vw, 28px)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-dark)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  {selectedMessage.type === 'newsletter' || selectedMessage.subject?.toLowerCase().includes('newsletter') ? 'NEWSLETTER SUBSCRIPTION' : 'CLIENT CONTACT INQUIRY'}
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                  {selectedMessage.subject || 'Message Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ background: 'var(--off-white)', padding: 16, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 600, display: 'block' }}>SENDER NAME</span>
                  <strong style={{ fontSize: 14, color: 'var(--onyx)' }}>{selectedMessage.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 600, display: 'block' }}>DATE RECEIVED</span>
                  <span style={{ fontSize: 13, color: 'var(--onyx)', fontWeight: 600 }}>{selectedMessage.date}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
                <a href={`mailto:${selectedMessage.email}`} style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, display: 'block', color: 'var(--onyx)' }}>
                MESSAGE CONTENT
              </label>
              <div style={{ background: 'var(--cream)', padding: 18, borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6, color: 'var(--onyx)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 80 }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="btn-secondary"
                style={{ padding: '8px 20px', fontSize: 13 }}
              >
                Close
              </button>
              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Re: ' + (selectedMessage.subject || 'Inquiry'))}`}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* MODAL: Create / Edit Coupon */}
      {editingCoupon && (
        <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 580, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: 'clamp(20px, 4vw, 28px)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-dark)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                    PROMOTIONAL CAMPAIGN
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                    {couponForm.id ? 'Edit Discount Coupon' : 'Create New Coupon'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingCoupon(null); setCouponFormErrors({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                const errors = {};
                const cleanCode = (couponForm.code || '').trim().toUpperCase();
                if (!cleanCode) {
                  errors.code = 'Coupon code is required (e.g. WELCOME10, DIWALI15).';
                }
                if (!couponForm.label || !couponForm.label.trim()) {
                  errors.label = 'Coupon description / campaign title is required.';
                }
                const numVal = parseFloat(couponForm.value);
                if (isNaN(numVal) || numVal <= 0) {
                  errors.value = 'Discount value must be a positive number greater than 0.';
                }
                if (couponForm.discountType === 'percentage' && numVal > 100) {
                  errors.value = 'Percentage discount cannot exceed 100%.';
                }
                if (couponForm.minOrder === undefined || couponForm.minOrder === '' || isNaN(parseFloat(couponForm.minOrder)) || parseFloat(couponForm.minOrder) < 0) {
                  errors.minOrder = 'Minimum order amount is required (enter 0 for no minimum).';
                }
                if (!couponForm.expiry) {
                  errors.expiry = 'Expiry date is required.';
                } else if (couponForm.expiry < '2026-09-01') {
                  errors.expiry = 'Expiry date cannot be before September 2026.';
                }

                if (Object.keys(errors).length > 0) {
                  setCouponFormErrors(errors);
                  return;
                }

                setCouponFormErrors({});
                saveCoupon({
                  ...couponForm,
                  id: couponForm.id || `cp_${Date.now()}`,
                  code: cleanCode,
                  value: parseFloat(couponForm.value),
                  minOrder: parseFloat(couponForm.minOrder) || 0,
                  maxDiscount: parseFloat(couponForm.maxDiscount) || 0,
                  usageLimit: parseInt(couponForm.usageLimit, 10) || 100,
                  perCustomerLimit: parseInt(couponForm.perCustomerLimit, 10) || 1
                });
                setEditingCoupon(null);
              }}>
                <style>{`
                  .coupon-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                  }
                  @media (max-width: 520px) {
                    .coupon-form-grid {
                      grid-template-columns: 1fr !important;
                      gap: 14px;
                    }
                  }
                  .coupon-code-input {
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                  }
                  .coupon-code-input::placeholder {
                    text-transform: none !important;
                    font-weight: 400 !important;
                    letter-spacing: normal !important;
                  }
                  .info-tooltip-container {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                  }
                  .info-tooltip-trigger {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gold-dark, #937328);
                    cursor: pointer;
                    line-height: 1;
                    padding: 2px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                  }
                  .info-tooltip-trigger:hover, .info-tooltip-container:hover .info-tooltip-trigger {
                    color: var(--onyx, #111111);
                    transform: scale(1.18);
                  }
                  .info-tooltip-bubble {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    right: 0;
                    left: auto;
                    transform: translateY(4px);
                    width: 250px;
                    background: #141414;
                    color: #F8F7F4;
                    padding: 11px 13px;
                    border-radius: 8px;
                    border: 1px solid rgba(212, 175, 55, 0.45);
                    font-size: 11px;
                    line-height: 1.45;
                    font-weight: 400;
                    box-shadow: 0 14px 30px -4px rgba(0,0,0,0.6), 0 0 15px rgba(212, 175, 55, 0.15);
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
                    z-index: 99999;
                    pointer-events: none;
                    text-transform: none;
                    letter-spacing: normal;
                    text-align: left;
                  }
                  .info-tooltip-bubble::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    right: 4px;
                    left: auto;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #141414 transparent transparent transparent;
                  }
                  .info-tooltip-container:hover .info-tooltip-bubble,
                  .info-tooltip-container:focus-within .info-tooltip-bubble {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                  }
                  @media (max-width: 520px) {
                    .info-tooltip-bubble {
                      right: -10px;
                      width: 220px;
                    }
                    .info-tooltip-bubble::after {
                      right: 14px;
                    }
                  }
                `}</style>

                {/* Coupon Code & Discount Type */}
                <div className="coupon-form-grid">
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                      COUPON CODE <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control coupon-code-input"
                      style={{ borderColor: couponFormErrors.code ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box' }}
                      placeholder="e.g. WELCOME10"
                      value={couponForm.code}
                      onChange={e => {
                        setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() });
                        if (couponFormErrors.code) setCouponFormErrors(prev => ({ ...prev, code: '' }));
                      }}
                    />
                    {couponFormErrors.code && (
                      <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {couponFormErrors.code}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                      DISCOUNT TYPE <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      className="form-control"
                      value={couponForm.discountType}
                      onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      style={{ fontWeight: 600, width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="fixed">Fixed Amount ($ AUD)</option>
                    </select>
                  </div>
                </div>

                {/* Offer Label / Description */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                    OFFER DESCRIPTION / CAMPAIGN TITLE <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: couponFormErrors.label ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box' }}
                    placeholder="e.g. Welcome 10% Off on First Order"
                    value={couponForm.label}
                    onChange={e => {
                      setCouponForm({ ...couponForm, label: e.target.value });
                      if (couponFormErrors.label) setCouponFormErrors(prev => ({ ...prev, label: '' }));
                    }}
                  />
                  {couponFormErrors.label && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {couponFormErrors.label}
                    </div>
                  )}
                </div>

                {/* Discount Value & Min Order Amount */}
                <div className="coupon-form-grid">
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                      DISCOUNT VALUE {couponForm.discountType === 'percentage' ? '(%)' : '($ AUD)'} <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      className="form-control"
                      style={{ borderColor: couponFormErrors.value ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box' }}
                      placeholder={couponForm.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 20'}
                      value={couponForm.value}
                      onChange={e => {
                        setCouponForm({ ...couponForm, value: e.target.value });
                        if (couponFormErrors.value) setCouponFormErrors(prev => ({ ...prev, value: '' }));
                      }}
                    />
                    {couponFormErrors.value && (
                      <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {couponFormErrors.value}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                      MINIMUM ORDER ($ AUD) <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ borderColor: couponFormErrors.minOrder ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box' }}
                      placeholder="0 for no minimum"
                      value={couponForm.minOrder}
                      onChange={e => {
                        setCouponForm({ ...couponForm, minOrder: e.target.value });
                        if (couponFormErrors.minOrder) setCouponFormErrors(prev => ({ ...prev, minOrder: '' }));
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, display: 'block' }}>Enter 0 for no minimum spend requirement</span>
                    {couponFormErrors.minOrder && (
                      <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {couponFormErrors.minOrder}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiry Date & Max Discount Cap */}
                <div className="coupon-form-grid">
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block' }}>
                      EXPIRY DATE <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      min="2026-09-01"
                      className="form-control"
                      style={{ borderColor: couponFormErrors.expiry ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box' }}
                      value={couponForm.expiry}
                      onChange={e => {
                        setCouponForm({ ...couponForm, expiry: e.target.value });
                        if (couponFormErrors.expiry) setCouponFormErrors(prev => ({ ...prev, expiry: '' }));
                      }}
                    />
                    {couponFormErrors.expiry && (
                      <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {couponFormErrors.expiry}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>MAX DISCOUNT CAP ($ AUD)</span>
                      <span className="info-tooltip-container">
                        <span className="info-tooltip-trigger">
                          <Info size={15} strokeWidth={2.2} />
                        </span>
                        <span className="info-tooltip-bubble">
                          <strong style={{ display: 'block', marginBottom: 4, color: 'var(--gold, #D4AF37)', fontSize: 11.5, letterSpacing: '0.02em' }}>Max Savings Limit:</strong>
                          <span style={{ color: '#F8F7F4' }}>Caps percentage discounts to a maximum dollar savings.</span>
                          <div style={{ marginTop: 7, padding: '6px 8px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 5, fontSize: 10.5, lineHeight: 1.4, color: '#F5F5F5' }}>
                            <strong style={{ color: 'var(--gold-light, #E8D390)' }}>Example:</strong> 20% off with $50 cap &rarr; a $500 cart gets <strong style={{ color: '#FFFFFF', textDecoration: 'underline' }}>$50 off</strong> (not $100).
                          </div>
                          <span style={{ display: 'block', marginTop: 6, color: 'var(--gold-light, #C5A059)', fontSize: 10 }}>Leave blank for unlimited discount.</span>
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="e.g. 50 (optional)"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={couponForm.maxDiscount || ''}
                      onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    />
                    <span style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, display: 'block' }}>Optional dollar limit cap for large orders. Leave empty for uncapped.</span>
                  </div>
                </div>

                {/* Status Toggle Checkbox */}
                <div style={{ marginBottom: 20, padding: 12, background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--onyx)' }}>Active Status</strong>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--slate)' }}>Customers can immediately redeem this coupon at checkout</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!couponForm.active}
                    onChange={e => setCouponForm({ ...couponForm, active: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--onyx)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => { setEditingCoupon(null); setCouponFormErrors({}); }}
                    className="btn-secondary"
                    style={{ padding: '8px 20px', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '8px 22px', fontSize: 13 }}
                  >
                    {couponForm.id ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Order Details / Full Dossier */}
      {selectedOrder && (
        <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--onyx)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--onyx)', fontWeight: 700 }}>
                    Order {selectedOrder.id}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--slate)' }}>Placed on {selectedOrder.date}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => {
                  const st = getStatusStyles(selectedOrder.status);
                  return (
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {selectedOrder.status}
                    </span>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
              
              {/* Stripe Refund Banner (if order is cancelled or refunded) */}
              {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Refunded' || selectedOrder.refundAmount) && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>💳</span>
                      <div>
                        <strong style={{ fontSize: 14, color: '#991B1B', display: 'block' }}>
                          Full Refund Processed via Stripe Gateway
                        </strong>
                        <span style={{ fontSize: 12, color: '#B91C1C' }}>
                          Refund of <strong>-{formatMoney(selectedOrder.refundAmount !== undefined ? Number(selectedOrder.refundAmount) : (selectedOrder.rawAmount || parseFloat(String(selectedOrder.total || '0').replace(/[^0-9.]/g, '')) || 0))} AUD</strong> returned to customer's card.
                        </span>
                      </div>
                    </div>
                    <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}>
                      Stripe Succeeded
                    </span>
                  </div>
                </div>
              )}

              {/* Customer & Delivery Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
                
                {/* Customer & Contact Box */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--gold-dark)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <User style={{ width: 14, height: 14 }} /> Customer Contact
                  </div>
                  <strong style={{ fontSize: 14, color: 'var(--onyx)', display: 'block', marginBottom: 4 }}>
                    {selectedOrder.customer}
                  </strong>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail style={{ width: 13, height: 13, color: 'var(--slate)' }} />
                    <a href={`mailto:${selectedOrder.email}`} style={{ color: 'var(--onyx)', textDecoration: 'none' }}>{selectedOrder.email}</a>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone style={{ width: 13, height: 13, color: 'var(--slate)' }} />
                    <a href={`tel:${selectedOrder.phone || '+61435927824'}`} style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                      {selectedOrder.phone || '+61 435 927 824'}
                    </a>
                  </div>
                </div>

                {/* Delivery Address Box */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--gold-dark)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <MapPin style={{ width: 14, height: 14 }} /> Delivery Address
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)', marginBottom: 2 }}>
                    {selectedOrder.address || '189 Brompton Road'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.4 }}>
                    {[selectedOrder.city || 'Brisbane City', selectedOrder.state || 'Queensland (QLD)', selectedOrder.postcode || '4061'].filter(Boolean).join(', ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                    Country: Australia (Australia Post Delivery)
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--onyx)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Purchased Items
                </h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={it.image || '/assets/logo.svg'} alt={it.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)' }}>{it.name || selectedOrder.product}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)' }}>Qty: {it.quantity || 1} · ${parseFloat(it.price || 129).toFixed(2)} AUD each</div>
                          </div>
                        </div>
                        <strong style={{ fontSize: 13, color: 'var(--onyx)' }}>
                          ${((it.quantity || 1) * parseFloat(it.price || 129)).toFixed(2)} AUD
                        </strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)' }}>{selectedOrder.product || 'Fine Jewellery Selection'}</span>
                      <strong style={{ fontSize: 13, color: 'var(--onyx)' }}>{selectedOrder.total}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown & Verification */}
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate)' }}>
                  <span>Payment Gateway:</span>
                  <strong style={{ color: 'var(--onyx)' }}>
                    {selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Refunded' ? 'Stripe Gateway (Refund Processed)' : (selectedOrder.paymentMethod || 'Stripe Encrypted Payment (Verified)')}
                  </strong>
                </div>
                {selectedOrder.sessionId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate)' }}>
                    <span>Stripe Session ID:</span>
                    <code style={{ fontSize: 10.5, color: 'var(--gold-dark)', background: '#FFFFFF', padding: '2px 6px', borderRadius: 4 }}>{selectedOrder.sessionId.slice(0, 22)}...</code>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--onyx)', paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <span>Original Total Charged:</span>
                  <span style={{ fontWeight: 600 }}>{selectedOrder.total}</span>
                </div>
                {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Refunded' || selectedOrder.refundAmount) && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#C5221F', fontWeight: 600 }}>
                      <span>Stripe Refund Issued:</span>
                      <span>-{formatMoney(selectedOrder.refundAmount !== undefined ? Number(selectedOrder.refundAmount) : (selectedOrder.rawAmount || parseFloat(String(selectedOrder.total || '0').replace(/[^0-9.]/g, '')) || 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#166534', paddingTop: 4, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
                      <span>Net Balance Settled:</span>
                      <span>$0.00 AUD (Fully Refunded)</span>
                    </div>
                  </>
                )}
              </div>

              {/* Australia Post Tracking Badge & Direct Track Link if Tracking Number Recorded */}
              {selectedOrder.trackingNumber && (
                <div style={{ background: '#FEF7E0', border: '1px solid #FDE293', borderRadius: 10, padding: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#B06000', display: 'block', marginBottom: 2 }}>
                      Australia Post Tracked Shipment
                    </span>
                    <strong style={{ fontSize: 14.5, color: '#1A1A1A', letterSpacing: '0.04em' }}>
                      {selectedOrder.trackingNumber}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <a
                      href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(selectedOrder.trackingNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                      title="Open Live Australia Post Tracking"
                    >
                      <Truck style={{ width: 13, height: 13 }} />
                      <span>Track on AusPost</span>
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setShippingOrderModal(selectedOrder);
                        setShippingTrackingNumber(selectedOrder.trackingNumber || '');
                        setShippingTrackingError('');
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 11 }}
                    >
                      Edit Tracking
                    </button>
                  </div>
                </div>
              )}

              {/* Status Update Control */}
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--onyx)', display: 'block' }}>Update Order Lifecycle Status</strong>
                  <span style={{ fontSize: 11, color: 'var(--slate)' }}>Advance fulfillment state (Confirmed → Packed → Shipped → Delivered → Cancelled)</span>
                </div>
                <select
                  value={normalizeStatus(selectedOrder.status)}
                  onChange={(e) => handleInitiateStatusChange(selectedOrder, e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontWeight: 700,
                    fontSize: 13,
                    background: '#FFFFFF',
                    color: 'var(--onyx)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Refunded)</option>
                </select>
              </div>

              {/* Quick Issue / Record Stripe Refund Action */}
              {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Refunded' && (
                <div style={{ marginTop: 14, padding: 14, background: '#FFF5F5', border: '1px dashed #FEB2B2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#9B2C2C', display: 'block' }}>Process / Record Stripe Refund</strong>
                    <span style={{ fontSize: 11.5, color: '#742A2A' }}>Double check Stripe status, record full/partial refund, and notify the customer.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCancelOrderModal(selectedOrder)}
                    className="btn-secondary"
                    style={{ padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#C5221F', borderColor: '#FEB2B2', background: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    💳 Cancel & Refund
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#FFFFFF' }}>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-primary"
                style={{ padding: '8px 22px', fontSize: 13 }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Enter Australia Post Tracking Code & Dispatch Order */}
      {shippingOrderModal && (
        <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-dark)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    AUSTRALIA POST FULFILLMENT
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                    Mark Order as Shipped
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isSendingDispatchEmail}
                  onClick={() => { setShippingOrderModal(null); setShippingTrackingNumber(''); setShippingTrackingError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* Order & Customer Summary Box */}
              <div style={{ background: 'var(--off-white)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Order Reference:</span>
                  <strong style={{ color: 'var(--onyx)' }}>{shippingOrderModal.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Customer:</span>
                  <strong style={{ color: 'var(--onyx)' }}>{shippingOrderModal.customer}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Customer Email:</span>
                  <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>{shippingOrderModal.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Delivery Destination:</span>
                  <span style={{ color: 'var(--onyx)', fontWeight: 500 }}>
                    {[shippingOrderModal.city || 'Brisbane City', shippingOrderModal.state || 'QLD', shippingOrderModal.postcode || '4061'].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmShipmentWithTracking}>
                <div style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6, display: 'block', color: 'var(--onyx)' }}>
                    AUSTRALIA POST TRACKING NUMBER <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <style>{`
                    .shipping-tracking-input::placeholder {
                      text-transform: none !important;
                      font-weight: 400 !important;
                      letter-spacing: normal !important;
                    }
                  `}</style>
                  <input
                    type="text"
                    className="form-control shipping-tracking-input"
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      borderColor: shippingTrackingError ? '#DC2626' : undefined,
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: 14,
                      padding: '10px 12px'
                    }}
                    placeholder="eg. AP398201948AU"
                    value={shippingTrackingNumber}
                    onChange={e => {
                      setShippingTrackingNumber(e.target.value.toUpperCase());
                      if (shippingTrackingError) setShippingTrackingError('');
                    }}
                    autoFocus
                  />
                  {shippingTrackingError && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 5, fontWeight: 600 }}>
                      {shippingTrackingError}
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--slate)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Once saved, the order status will advance to <strong>Shipped</strong> and a notification email will be sent to <strong>{shippingOrderModal.email}</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    disabled={isSendingDispatchEmail}
                    onClick={() => { setShippingOrderModal(null); setShippingTrackingNumber(''); setShippingTrackingError(''); }}
                    className="btn-secondary"
                    style={{ padding: '9px 18px', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingDispatchEmail}
                    className="btn-primary"
                    style={{ padding: '9px 24px', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {isSendingDispatchEmail ? (
                      <>
                        <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Order & Stripe Refund Live Double-Check Verification */}
      {cancelOrderModal && (
        <div className="admin-modal-overlay" style={{ paddingLeft: sidebarCollapsed ? '96px' : undefined }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 700, color: '#C5221F', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    ORDER CANCELLATION & REFUND
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>
                    Cancel Order {cancelOrderModal.id}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isProcessingCancellation}
                  onClick={() => setCancelOrderModal(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: 4 }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* Order Info & Total Box */}
              <div style={{ background: 'var(--off-white)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 18, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Customer:</span>
                  <strong style={{ color: 'var(--onyx)' }}>{cancelOrderModal.customer} ({cancelOrderModal.email})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Purchased Piece:</span>
                  <span style={{ color: 'var(--onyx)', fontWeight: 500 }}>{cancelOrderModal.product}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate)' }}>Original Amount Paid:</span>
                  <strong style={{ color: 'var(--gold-dark)', fontSize: 13.5 }}>{cancelOrderModal.total}</strong>
                </div>
              </div>

              {/* Live Stripe Double-Check Result Box */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--onyx)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Stripe Gateway Live Verification
                </label>
                {isCheckingStripeRefund ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12.5, color: 'var(--slate)' }}>
                    <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', color: 'var(--gold-dark)' }} />
                    <span>Double-checking live Stripe charge and refund records...</span>
                  </div>
                ) : stripeRefundCheckResult?.isRefundedInStripe ? (
                  <div style={{ padding: '12px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: 12.5, color: '#065F46' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                      <CheckCircle2 style={{ width: 15, height: 15, color: '#059669' }} />
                      <span>Stripe Double-Check Verified: ${stripeRefundCheckResult.amountRefunded?.toFixed(2)} AUD Refunded</span>
                    </div>
                    <span>{stripeRefundCheckResult.isFullRefund ? 'Full refund' : 'Partial refund'} was processed on Stripe. This exact amount has been populated below.</span>
                  </div>
                ) : (
                  <div style={{ padding: '12px 14px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, fontSize: 12.5, color: '#0369A1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                      <Info style={{ width: 15, height: 15, color: '#0284C7' }} />
                      <span>Stripe Check: No existing refund record on Stripe</span>
                    </div>
                    <span>Specify the amount below to record and update your store financials.</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmOrderCancellation}>
                {/* Refund Amount Input */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--onyx)' }}>
                    ACTUAL REFUND AMOUNT ($ AUD) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={cancelOrderModal.rawAmount || parseFloat(String(cancelOrderModal.total || '0').replace(/[^0-9.]/g, '')) || 9999}
                    className="form-control"
                    style={{ borderColor: cancelRefundError ? '#DC2626' : undefined, width: '100%', boxSizing: 'border-box', fontWeight: 700, fontSize: 14 }}
                    value={cancelRefundAmount}
                    onChange={e => {
                      setCancelRefundAmount(e.target.value);
                      if (cancelRefundError) setCancelRefundError('');
                    }}
                    placeholder="e.g. 50.00"
                    required
                  />
                  {cancelRefundError && (
                    <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                      {cancelRefundError}
                    </div>
                  )}
                  <span style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 4, display: 'block' }}>
                    {parseFloat(cancelRefundAmount) >= ((cancelOrderModal.rawAmount || parseFloat(String(cancelOrderModal.total || '0').replace(/[^0-9.]/g, '')) || 0) - 0.05) 
                      ? '✓ This is recorded as a Full Refund.' 
                      : `ℹ️ This is recorded as a Partial Refund. The remaining balance ($${Math.max(0, (cancelOrderModal.rawAmount || parseFloat(String(cancelOrderModal.total || '0').replace(/[^0-9.]/g, '')) || 0) - (parseFloat(cancelRefundAmount) || 0)).toFixed(2)} AUD) remains in your Net Revenue.`}
                  </span>
                </div>

                {/* Refund Processing Timeline */}
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--onyx)' }}>
                    EXPECTED REFUND TIMELINE (FOR EMAIL)
                  </label>
                  <select
                    className="form-control"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 13 }}
                    value={cancelRefundTimeline}
                    onChange={e => setCancelRefundTimeline(e.target.value)}
                  >
                    <option value="5 to 10 business days">5 to 10 business days (Standard Card Processing)</option>
                    <option value="3 to 5 business days">3 to 5 business days (Fast Bank Processing)</option>
                    <option value="1 to 2 business days">1 to 2 business days (Immediate)</option>
                    <option value="5 to 7 business days">5 to 7 business days</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    disabled={isProcessingCancellation}
                    onClick={() => setCancelOrderModal(null)}
                    className="btn-secondary"
                    style={{ padding: '9px 18px', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingCancellation}
                    className="btn-primary"
                    style={{
                      padding: '9px 24px',
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: 'var(--gold, #D4AF37)',
                      borderColor: 'var(--gold, #D4AF37)',
                      color: '#000000',
                      fontWeight: 700
                    }}
                  >
                    {isProcessingCancellation ? (
                      <>
                        <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', color: '#000000' }} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="admin-modal"
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Luxury Gold Accent Top Bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, #B38728 0%, #FBF5B7 50%, #DAA520 100%)' }} />

            <div style={{ padding: '28px 24px 24px', textAlign: 'center' }}>
              {/* Icon Circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--cream, #FBF9F5)',
                border: '2px solid var(--gold, #D4AF37)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)'
              }}>
                <LogOut style={{ width: 24, height: 24, color: 'var(--gold-dark, #AA7C11)' }} />
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--font-serif, "Playfair Display", serif)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--onyx, #1A1A1A)',
                margin: '0 0 8px 0',
                letterSpacing: '0.02em'
              }}>
                Sign Out
              </h3>

              {/* Message */}
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--onyx, #1A1A1A)',
                textAlign: 'center',
                lineHeight: 1.5,
                margin: '0 0 24px 0'
              }}>
                Are you sure you want to sign out ?
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '11px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    background: '#FFFFFF',
                    color: 'var(--onyx, #1A1A1A)',
                    border: '1px solid var(--border, #E2E8F0)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginId('');
                    setLoginPass('');
                    setLoginError('');
                    setShowLogoutConfirm(false);
                    setMobileMenuOpen(false);
                    adminLogout();
                    showToast('You have been signed out successfully.', 'info');
                  }}
                  style={{
                    padding: '11px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 8,
                    background: 'var(--onyx, #1A1A1A)',
                    color: 'var(--gold, #D4AF37)',
                    border: '1px solid var(--onyx, #1A1A1A)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.color = '#F5D77F';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--onyx, #1A1A1A)';
                    e.currentTarget.style.color = 'var(--gold, #D4AF37)';
                  }}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  <span>Yes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

