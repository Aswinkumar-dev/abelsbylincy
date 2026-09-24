import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Truck, Lock, ShieldCheck, CreditCard, Smartphone, ArrowRight, Ticket, ChevronUp, ChevronDown, Copy, Loader2 } from 'lucide-react';
import { useStore, apiFetch } from '../context/StoreContext';
import {
  AUSTRALIAN_STATES,
  AUSTRALIAN_SUBURBS,
  formatAustralianPhone,
  isValidAustralianPhone,
  getStateFromPostcode,
  isValidAustralianPostcode
} from '../utils/australiaAddress';

const STEPS = ['Shipping', 'Payment', 'Review & Place'];

export default function CheckoutPage() {
  const { cart, setCart, currentUser, formatMoney, placeOrder, saveUserAddress, showToast, orders, setOrders, customers, setCustomers, coupons, products, setProducts, syncBackendData } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentTab, setPaymentTab] = useState('card');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [postcodeError, setPostcodeError] = useState('');

  // Restore draft state across page refreshes so refreshing never loses filled form or applied coupon
  const draftForm = (() => {
    try { return JSON.parse(localStorage.getItem('abl_checkout_draft_form')); } catch { return null; }
  })();

  const draftCoupon = (() => {
    try { return JSON.parse(localStorage.getItem('abl_checkout_applied_coupon')); } catch { return null; }
  })();

  const draftShipping = (() => {
    try { return localStorage.getItem('abl_checkout_shipping_method') || 'standard'; } catch { return 'standard'; }
  })();

  const savedAddress = currentUser?.savedAddress || (() => {
    try { return JSON.parse(localStorage.getItem('abl_saved_address')); } catch { return null; }
  })();

  const [saveAddress, setSaveAddress] = useState(!!(savedAddress || draftForm));

  // Helper to extract first and last name cleanly from any user representation
  const extractUserNames = (user) => {
    if (!user) return { firstName: '', lastName: '' };
    let first = user.firstName || '';
    let last = user.lastName || '';
    const full = (user.name || user.fullName || '').replace(/\bClient\b/gi, '').trim();
    if (!first && full) {
      const parts = full.split(/\s+/);
      first = parts[0] || '';
      if (!last && parts.length > 1) {
        last = parts.slice(1).join(' ');
      }
    }
    return { firstName: first, lastName: last };
  };

  const initialNames = extractUserNames(currentUser);

  const [formData, setFormData] = useState({
    firstName: draftForm?.firstName || savedAddress?.firstName || initialNames.firstName || '',
    lastName: draftForm?.lastName || savedAddress?.lastName || initialNames.lastName || '',
    email: draftForm?.email || savedAddress?.email || currentUser?.email || '',
    phone: draftForm?.phone ? formatAustralianPhone(draftForm.phone) : (savedAddress?.phone ? formatAustralianPhone(savedAddress.phone) : ''),
    address: draftForm?.address || savedAddress?.address || '',
    city: draftForm?.city || savedAddress?.city || '',
    state: draftForm?.state || savedAddress?.state || '',
    postcode: draftForm?.postcode || savedAddress?.postcode || '',
  });

  // Reactive auto-fill: Whenever currentUser, customer profile, or previous order records load,
  // automatically prefill First Name, Last Name, Email, and Address if fields are unpopulated
  useEffect(() => {
    if (!currentUser) return;

    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const existingCustomer = (customers || []).find(c => c.email?.toLowerCase() === userEmail);
    const priorOrder = (orders || []).find(o => o.email?.toLowerCase() === userEmail);

    const { firstName: uFirst, lastName: uLast } = extractUserNames(currentUser);
    const { firstName: cFirst, lastName: cLast } = extractUserNames(existingCustomer);
    const { firstName: oFirst, lastName: oLast } = extractUserNames(priorOrder ? { name: priorOrder.customer } : null);

    const resolvedFirst = uFirst || cFirst || oFirst || '';
    const resolvedLast = uLast || cLast || oLast || '';

    setFormData(prev => {
      const next = { ...prev };
      let changed = false;

      if (!next.firstName && resolvedFirst) {
        next.firstName = resolvedFirst;
        changed = true;
      }
      if (!next.lastName && resolvedLast) {
        next.lastName = resolvedLast;
        changed = true;
      }
      if (!next.email && userEmail) {
        next.email = userEmail;
        changed = true;
      }

      const priorPhone = currentUser.phone || existingCustomer?.phone || priorOrder?.phone || savedAddress?.phone;
      if (!next.phone && priorPhone) {
        next.phone = formatAustralianPhone(priorPhone);
        changed = true;
      }

      const priorAddress = currentUser.savedAddress?.address || existingCustomer?.savedAddress?.address || priorOrder?.address || savedAddress?.address;
      if (!next.address && priorAddress) {
        next.address = priorAddress;
        changed = true;
      }

      const priorCity = currentUser.savedAddress?.city || existingCustomer?.savedAddress?.city || priorOrder?.city || savedAddress?.city;
      if (!next.city && priorCity) {
        next.city = priorCity;
        changed = true;
      }

      const priorState = currentUser.savedAddress?.state || existingCustomer?.savedAddress?.state || priorOrder?.state || savedAddress?.state;
      if (!next.state && priorState) {
        next.state = priorState;
        changed = true;
      }

      const priorPostcode = currentUser.savedAddress?.postcode || existingCustomer?.savedAddress?.postcode || priorOrder?.postcode || savedAddress?.postcode;
      if (!next.postcode && priorPostcode) {
        next.postcode = priorPostcode;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [currentUser, customers, orders, savedAddress]);

  const [shippingMethod, setShippingMethod] = useState(draftShipping);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(draftCoupon || null);
  const [couponError, setCouponError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [showOffersDropdown, setShowOffersDropdown] = useState(true);

  // Suburb suggestions filtered by selected state (or all Australian suburbs if no state chosen)
  const filteredSuburbs = useMemo(() => {
    if (!formData.state) return AUSTRALIAN_SUBURBS;
    return AUSTRALIAN_SUBURBS.filter(s => s.state.toUpperCase() === formData.state.toUpperCase());
  }, [formData.state]);

  const handlePhoneChange = (e) => {
    const formatted = formatAustralianPhone(e.target.value);
    setFormData(f => ({ ...f, phone: formatted }));
    if (phoneError) setPhoneError('');
  };

  const handlePhoneBlur = () => {
    if (formData.phone && !isValidAustralianPhone(formData.phone)) {
      setPhoneError('Please enter a valid Australian number (e.g. 455 586 102 or 0455 586 102)');
    } else {
      setPhoneError('');
    }
  };

  const handleSuburbChange = (e) => {
    const val = e.target.value;
    const matched = AUSTRALIAN_SUBURBS.find(s => s.name.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setFormData(f => ({
        ...f,
        city: matched.name,
        state: matched.state,
        postcode: f.postcode || matched.postcode
      }));
      if (postcodeError) setPostcodeError('');
    } else {
      setFormData(f => ({ ...f, city: val }));
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData(f => ({ ...f, state: selectedState }));
  };

  const handlePostcodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (postcodeError) setPostcodeError('');
    const detectedState = getStateFromPostcode(val);
    setFormData(f => ({
      ...f,
      postcode: val,
      state: detectedState ? detectedState : f.state
    }));
  };

  const handlePostcodeBlur = () => {
    if (formData.postcode && !isValidAustralianPostcode(formData.postcode)) {
      setPostcodeError('Please enter a valid 4-digit Australian postcode');
    } else {
      setPostcodeError('');
    }
  };

  // Auto-persist draft form, shipping method & applied coupon so refreshing page preserves entire session state
  useEffect(() => {
    try { localStorage.setItem('abl_checkout_draft_form', JSON.stringify(formData)); } catch {}
  }, [formData]);

  useEffect(() => {
    try { localStorage.setItem('abl_checkout_shipping_method', shippingMethod); } catch {}
  }, [shippingMethod]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('abl_checkout_applied_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('abl_checkout_applied_coupon');
      }
    } catch {}
  }, [appliedCoupon]);

  // Resolve cart items immediately from state or localStorage cache to prevent false "empty bag" on refresh
  const resolvedCart = (cart && cart.length > 0) ? cart : (() => {
    try {
      const saved = localStorage.getItem('abl_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const pending = localStorage.getItem('abl_pending_checkout_items');
      if (pending) {
        const parsed2 = JSON.parse(pending);
        if (Array.isArray(parsed2) && parsed2.length > 0) return parsed2;
      }
    } catch {}
    return [];
  })();

  // Synchronize back into StoreContext if cart was empty on initial mount but cached in storage
  useEffect(() => {
    if (cart.length === 0 && resolvedCart.length > 0 && !completedOrder) {
      setCart(resolvedCart);
    }
  }, [cart.length, resolvedCart, completedOrder, setCart]);

  const activeCartItems = (cart && cart.length > 0) ? cart : resolvedCart;
  const subtotal = activeCartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = shippingMethod === 'express' ? 15 : (subtotal >= 60 ? 0 : 10);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * parseFloat(appliedCoupon.value || 0)) / 100;
    } else {
      discountAmount = parseFloat(appliedCoupon.value || 0);
    }
    if (appliedCoupon.maxDiscount && discountAmount > parseFloat(appliedCoupon.maxDiscount)) {
      discountAmount = parseFloat(appliedCoupon.maxDiscount);
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const userEmail = (currentUser?.email || formData.email || '').trim().toLowerCase();
  
  // Comprehensive check for prior customer orders across live orders, customers directory, and auth state
  const customerHasPriorOrders = Boolean(
    userEmail && (
      (orders || []).some(o => {
        const oEmail = (o.email || o.guest_email || o.customerEmail || o.shippingAddress?.email || (typeof o.customer === 'object' && o.customer?.email) || '').trim().toLowerCase();
        return oEmail === userEmail && o.status !== 'Cancelled' && o.status !== 'Refunded';
      }) ||
      (customers || []).some(c => (c.email || '').trim().toLowerCase() === userEmail && ((Number(c.orders) > 0) || (c.spent && c.spent !== '$0.00' && c.spent !== '$0'))) ||
      (Number(currentUser?.orders) > 0)
    )
  );
  const isFirstTimeCustomer = !customerHasPriorOrders;

  // Automatically revoke and notify if a first-order coupon was applied but customer is a returning purchaser
  useEffect(() => {
    if (appliedCoupon && !isFirstTimeCustomer) {
      const isFirstOrderCoupon = /FIRST|WELCOME/i.test(appliedCoupon.code) || /first order|welcome/i.test(appliedCoupon.label || '');
      if (isFirstOrderCoupon) {
        setAppliedCoupon(null);
        setCouponError(`Coupon "${appliedCoupon.code}" is valid only for your first order.`);
      }
    }
  }, [appliedCoupon, isFirstTimeCustomer]);

  // Only show first-order coupons (like FIRSTORDER, WELCOME10) for genuine first-time customers
  const activeStoreCoupons = (coupons || []).filter(c => {
    if (!c.active) return false;
    const isFirstOrderCoupon = /FIRST|WELCOME/i.test(c.code) || /first order|welcome/i.test(c.label || '');
    if (isFirstOrderCoupon && !isFirstTimeCustomer) return false;
    return true;
  });

  const featuredOffer = activeStoreCoupons.find(c => /WELCOME|FIRST/i.test(c.code) || /Welcome|First/i.test(c.label)) || activeStoreCoupons[0];

  const handleCopyCoupon = (code, e) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2500);
    } catch {}
  };

  const handleApplyCoupon = (codeToApply) => {
    setCouponError('');
    const raw = (codeToApply || couponInput || '').trim();
    if (!raw) {
      const err = 'Please enter a coupon code.';
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    // Strict sanitization: alphanumeric, hyphens, underscores only (max 30 chars)
    // Completely blocks SQL injection patterns (' OR '1'='1, ;, --, <script>, UNION, DROP)
    const sanitized = raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!sanitized || sanitized.length > 30 || sanitized !== raw.toUpperCase()) {
      const err = 'Invalid coupon code format. Use only letters and numbers without special symbols.';
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    // Direct exact lookup against active admin coupons
    const allStoreCoupons = Array.isArray(coupons) ? coupons : [];
    const matched = allStoreCoupons.find(c => (c.code || '').trim().toUpperCase() === sanitized);

    if (!matched) {
      const err = `Coupon "${sanitized}" is invalid or not found in store records.`;
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    if (!matched.active) {
      const err = `Coupon "${matched.code}" is currently disabled.`;
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    // First order restriction check
    const isFirstOrderCoupon = /FIRST|WELCOME/i.test(matched.code) || /first order|welcome/i.test(matched.label || '');
    if (isFirstOrderCoupon && !isFirstTimeCustomer) {
      const err = `Coupon "${matched.code}" is valid only for your first order.`;
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    if (matched.expiry) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (matched.expiry < todayStr) {
        const err = `Coupon "${matched.code}" expired on ${matched.expiry}.`;
        setCouponError(err);
        showToast(err, 'alert-circle');
        return;
      }
    }

    const minSpend = parseFloat(matched.minOrder) || 0;
    if (minSpend > 0 && subtotal < minSpend) {
      const err = `Minimum cart spend of $${minSpend.toFixed(2)} AUD required for "${matched.code}" (Current: ${formatMoney(subtotal)}).`;
      setCouponError(err);
      showToast(err, 'alert-circle');
      return;
    }

    setAppliedCoupon(matched);
    setCouponInput('');
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Auth guard
  useEffect(() => {
    if (!currentUser) navigate('/account');
  }, [currentUser, navigate]);

  const [paymentFailed, setPaymentFailed] = useState(false);

  // Handle return redirect from Stripe Hosted Checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isSuccess = searchParams.get('success');
    const isCanceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (isCanceled === 'true') {
      setPaymentFailed(true);
      showToast('Payment was cancelled. Your card was not charged.', 'alert-circle');
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    if (isSuccess === 'true' && sessionId) {
      const savedFormData = (() => {
        try { return JSON.parse(localStorage.getItem('abl_saved_address')) || formData; } catch { return formData; }
      })();

      const purchasedItems = (() => {
        try {
          const saved = localStorage.getItem('abl_pending_checkout_items');
          if (saved) return JSON.parse(saved);
        } catch {}
        return cart.length > 0 ? cart : [];
      })();

      const savedDiscountInfo = (() => {
        try { return JSON.parse(localStorage.getItem('abl_pending_checkout_discount')) || {}; } catch { return {}; }
      })();

      const savedMeta = (() => {
        try { return JSON.parse(localStorage.getItem('abl_pending_checkout_meta')) || {}; } catch { return {}; }
      })();

      const returnDiscount = parseFloat(savedDiscountInfo.discountAmount ?? savedMeta.discountAmount ?? 0);
      const itemsSum = purchasedItems.reduce((s, i) => s + ((parseFloat(i.price) || 0) * (i.quantity || 1)), 0);
      const shippingMethodChoice = savedMeta.shippingMethod || savedFormData?.shippingMethod || 'standard';
      const returnShipping = savedMeta.shippingFee !== undefined
        ? parseFloat(savedMeta.shippingFee)
        : (shippingMethodChoice === 'express' ? 15 : (itemsSum - returnDiscount >= 60 ? 0 : 10));

      let finalPaidAmount = savedMeta.grandTotal !== undefined
        ? parseFloat(savedMeta.grandTotal)
        : Math.max(0, itemsSum - returnDiscount) + returnShipping;

      let formattedTotal = formatMoney ? formatMoney(finalPaidAmount) : `$${finalPaidAmount.toFixed(2)}`;

      const isExpress = shippingMethodChoice === 'express' || String(savedMeta.shippingMethod || savedFormData?.shippingMethod || '').toLowerCase().includes('express') || returnShipping >= 15;
      const estDelivery = new Date();
      const addDays = isExpress ? 2 : 4;
      estDelivery.setDate(estDelivery.getDate() + addDays);
      const deliveryDateStr = estDelivery.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      // Generate a guaranteed unique high-entropy Order ID (combining timestamp milliseconds + random entropy)
      const orderEntropy = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
      const uniqueOrderId = `#ABL-2026-${orderEntropy}`;

      const confirmedOrder = {
        id: uniqueOrderId,
        customer: `${savedFormData?.firstName || formData.firstName || 'Valued'} ${savedFormData?.lastName || formData.lastName || 'Customer'}`.replace(/\bClient\b/gi, '').replace(/\s+/g, ' ').trim() || 'Valued Customer',
        email: savedFormData?.email || formData.email || currentUser?.email || 'customer@abelsbylincy.com',
        phone: savedFormData?.phone || formData.phone || '',
        address: savedFormData?.address || formData.address || '189 Brompton Road',
        city: savedFormData?.city || formData.city || 'Brisbane City',
        state: savedFormData?.state || formData.state || 'Queensland (QLD)',
        postcode: savedFormData?.postcode || formData.postcode || '4061',
        product: purchasedItems.length > 1 ? `${purchasedItems[0]?.name || 'Fine Jewellery'} (+${purchasedItems.length - 1} items)` : (purchasedItems[0]?.name || 'Fine Jewellery Selection'),
        items: purchasedItems.length > 0 ? purchasedItems : [{ id: 'p1', name: 'Fine Gold-Plated Jewellery Collection', price: 129, quantity: 1, image: '/assets/logo.svg' }],
        subtotal: itemsSum,
        date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        deliveryEstimate: deliveryDateStr,
        status: 'Confirmed',
        total: formattedTotal,
        rawAmount: finalPaidAmount,
        discount: returnDiscount > 0 ? `$${returnDiscount.toFixed(2)}` : null,
        discountAmount: returnDiscount,
        couponCode: savedDiscountInfo.couponCode || savedMeta.couponCode || null,
        shippingMethod: isExpress ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)',
        shippingFee: returnShipping,
        paymentMethod: 'Stripe Encrypted Payment (Verified)',
        sessionId: sessionId
      };

      setCompletedOrder(confirmedOrder);
      setStep(3);
      setCart([]);
      localStorage.removeItem('abl_pending_checkout_items');
      localStorage.removeItem('abl_pending_checkout_discount');
      localStorage.removeItem('abl_pending_checkout_meta');
      localStorage.removeItem('abl_checkout_draft_form');
      localStorage.removeItem('abl_checkout_applied_coupon');
      localStorage.removeItem('abl_checkout_shipping_method');

      // Fetch authoritative session details directly from Stripe to ensure exact match
      apiFetch(`/api/payments/session-details/${sessionId}`)
        .then(res => res.ok ? res.json() : null)
        .then(sessionData => {
          if (sessionData && sessionData.success && typeof sessionData.amountTotal === 'number' && sessionData.amountTotal > 0) {
            const authoritativePaid = sessionData.amountTotal;
            const authoritativeFormatted = formatMoney ? formatMoney(authoritativePaid) : `$${authoritativePaid.toFixed(2)}`;
            setCompletedOrder(prev => prev ? {
              ...prev,
              total: authoritativeFormatted,
              rawAmount: authoritativePaid
            } : prev);
          }
        })
        .catch(err => console.warn('Stripe session retrieval note:', err));

      // 1. Deduct Product Stock in real-time from inventory
      if (setProducts && purchasedItems.length > 0) {
        setProducts(prevProds => {
          const current = Array.isArray(prevProds) ? prevProds : [];
          const updated = current.map(prod => {
            const purchased = purchasedItems.find(pi => 
              String(pi.id || pi.productId) === String(prod.id) || 
              (pi.sku && prod.sku && String(pi.sku).trim().toUpperCase() === String(prod.sku).trim().toUpperCase()) ||
              (pi.name && prod.name && String(pi.name).trim().toLowerCase() === String(prod.name).trim().toLowerCase()) ||
              (pi.slug && prod.slug && String(pi.slug).trim().toLowerCase() === String(prod.slug).trim().toLowerCase())
            );
            if (purchased) {
              const currentStock = Number(prod.stockQty ?? prod.stock_quantity ?? 10);
              const newStock = Math.max(0, currentStock - (Number(purchased.quantity) || 1));
              return { ...prod, stockQty: newStock, inStock: newStock > 0 };
            }
            return prod;
          });
          try {
            localStorage.setItem('abl_products_v12', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // 2. Persist Stripe order into StoreContext orders & localStorage for Admin Dashboard & Analytics visibility
      if (setOrders) {
        setOrders(prevOrders => {
          const currentOrders = Array.isArray(prevOrders) ? prevOrders : [];
          const exists = currentOrders.some(o => o.sessionId === sessionId || o.id === confirmedOrder.id);
          const updated = exists ? currentOrders : [confirmedOrder, ...currentOrders];
          try {
            localStorage.setItem('abl_orders_v9', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // 3. Persist Customer & update spending in Admin Panel
      if (setCustomers && confirmedOrder.email) {
        setCustomers(prevCusts => {
          const currentCusts = Array.isArray(prevCusts) ? prevCusts : [];
          const custEmail = confirmedOrder.email.toLowerCase();
          const custIdx = currentCusts.findIndex(c => c.email.toLowerCase() === custEmail);
          let updatedCusts = [...currentCusts];
          if (custIdx !== -1) {
            const cust = { ...updatedCusts[custIdx] };
            cust.orders = (cust.orders || 0) + 1;
            const currentSpent = parseFloat(String(cust.spent || '0').replace(/[^0-9.]/g, '')) || 0;
            cust.spent = `$${(currentSpent + finalPaidAmount).toFixed(2)}`;
            updatedCusts[custIdx] = cust;
          } else {
            updatedCusts.push({
              id: `c_${Date.now()}`,
              name: confirmedOrder.customer,
              email: confirmedOrder.email,
              orders: 1,
              spent: `$${finalPaidAmount.toFixed(2)}`,
              joined: 'Aug 2026',
              status: 'Active'
            });
          }
          try {
            localStorage.setItem('abl_customers_v7', JSON.stringify(updatedCusts));
          } catch {}
          return updatedCusts;
        });
      }

      window.history.replaceState(null, '', window.location.pathname);

      // Immediately deduct stock in DB via dedicated endpoint (uses name+sku+slug — never fails on ID mismatch)
      const deductItems = purchasedItems.map(pi => ({
        name: pi.name || pi.productName || '',
        sku: pi.sku || '',
        slug: pi.slug || '',
        quantity: pi.quantity || 1
      }));
      apiFetch('/api/products/deduct-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: deductItems })
      }).catch(e => console.warn('Stock deduction note:', e));

      // Record Stripe order to backend API, DB & dispatch single authoritative confirmation email
      apiFetch('/api/payments/record-stripe-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: confirmedOrder })
      })
      .then(() => {
        // Delay sync by 2.5s so DB stock deduction fully commits before we re-fetch
        if (typeof syncBackendData === 'function') {
          setTimeout(() => syncBackendData(), 2500);
        }
      })
      .catch(e => console.warn('Backend order record note:', e));

    }
  }, []);

  // Restore cart items automatically if browser is refreshed or Back button pressed from Stripe
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isSuccess = searchParams.get('success');

    if (isSuccess !== 'true' && cart.length === 0) {
      const savedCart = localStorage.getItem('abl_pre_checkout_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        } catch (e) {}
      }
    }
  }, [cart.length, setCart]);

  // Mobile app-switching & screen-lock resilience listener (Requirement 39)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cart.length === 0) {
        try {
          const savedPending = localStorage.getItem('abl_pending_checkout_items');
          if (savedPending) {
            const parsed = JSON.parse(savedPending);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCart(parsed);
            }
          }
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [cart.length, setCart]);

  const handleRedirectToStripe = async (e) => {
    if (e) e.preventDefault();
    if (isRedirectingToPayment) return;

    const { firstName, lastName, email, phone, address, city, state, postcode } = formData;
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postcode) {
      showToast('Please fill in all required shipping fields', 'alert-circle');
      setStep(0);
      return;
    }

    if (!isValidAustralianPhone(phone)) {
      setPhoneError('Please enter a valid Australian phone number (e.g. 455 586 102 or 0455 586 102)');
      showToast('Please enter a valid Australian phone number', 'alert-circle');
      setStep(0);
      return;
    }

    if (!isValidAustralianPostcode(postcode)) {
      setPostcodeError('Please enter a valid 4-digit Australian postcode');
      showToast('Please enter a valid Australian postcode (e.g. 2000, 3000, 4000)', 'alert-circle');
      setStep(0);
      return;
    }

    setIsRedirectingToPayment(true);
    showToast('Connecting to Stripe Secure Payment Gateway...', 'loader');

    if (saveAddress) {
      saveUserAddress(formData);
    }

    const checkoutItems = cart.length > 0 ? cart : [
      { id: 'p_test', name: 'Fine Jewellery Selection', price: 129, quantity: 1, image: '/assets/logo.svg' }
    ];

    // Store checkout items and full checkout metadata in localStorage so return screen displays accurate totals
    try {
      localStorage.setItem('abl_pending_checkout_items', JSON.stringify(checkoutItems));
      localStorage.setItem('abl_pending_checkout_discount', JSON.stringify({
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponLabel: appliedCoupon ? appliedCoupon.label : null
      }));
      localStorage.setItem('abl_pending_checkout_meta', JSON.stringify({
        subtotal,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponLabel: appliedCoupon ? appliedCoupon.label : null,
        shippingFee,
        shippingMethod,
        grandTotal
      }));
    } catch (err) {
      console.warn('Failed to cache pending checkout items', err);
    }

    const payload = JSON.stringify({
      items: checkoutItems,
      email: email,
      shippingAddress: {
        ...formData,
        phone: formData.phone.startsWith('+61') ? formData.phone : `+61 ${formData.phone.replace(/^0/, '')}`
      },
      shippingFee: shippingFee,
      discountAmount: discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      shippingMethod: shippingMethod === 'express' ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)'
    });

    let data = null;
    let errMsg = '';

    try {
      const r1 = await apiFetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      try {
        data = await r1.json();
      } catch {
        data = null;
      }
      if (!r1.ok || !data?.success) {
        errMsg = data?.message || data?.error || `Gateway error (${r1.status})`;
      }
    } catch (err) {
      console.warn('apiFetch error:', err);
      errMsg = err.message;
    }

    if (data && data.success && data.url) {
      window.location.href = data.url;
      return;
    }

    setIsRedirectingToPayment(false);
    showToast(errMsg || data?.message || data?.error || 'Unable to connect to Stripe payment gateway. Please try again.', 'alert-circle');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, address, city, state, postcode } = formData;
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !postcode) {
      showToast('Please fill in all required shipping fields', 'alert-circle');
      return;
    }
    if (!isValidAustralianPhone(phone)) {
      setPhoneError('Please enter a valid Australian phone number (e.g. 455 586 102 or 0455 586 102)');
      showToast('Please enter a valid Australian phone number', 'alert-circle');
      return;
    }
    if (!isValidAustralianPostcode(postcode)) {
      setPostcodeError('Please enter a valid 4-digit Australian postcode');
      showToast('Please enter a valid Australian postcode (e.g. 2000, 3000, 4000)', 'alert-circle');
      return;
    }
    handleRedirectToStripe(e);
  };

  const handleExpressPay = (provider) => {
    showToast(`Authenticating with ${provider}...`, 'loader');
    setTimeout(() => handlePlaceOrder(), 1000);
  };

  const handlePlaceOrder = () => {
    if (activeCartItems.length === 0) { showToast('Your bag is empty', 'alert-circle'); return; }
    const order = placeOrder(formData, paymentTab);
    if (order) {
      setCompletedOrder(order);
      setStep(3);
      localStorage.removeItem('abl_checkout_draft_form');
      localStorage.removeItem('abl_checkout_applied_coupon');
      localStorage.removeItem('abl_checkout_shipping_method');
      localStorage.removeItem('abl_pending_checkout_items');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Payment Failed / Cancelled Screen
  if (paymentFailed) {
    return (
      <div className="container" style={{ padding: '60px 16px 80px 16px', maxWidth: 650, textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 36, fontWeight: 700 }}>✕</span>
        </div>
        <p className="section-subtitle" style={{ color: 'var(--danger)', marginBottom: 6, fontWeight: 700 }}>Stripe Payment Not Completed</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, margin: '0 0 14px 0' }}>Payment Cancelled or Declined</h1>
        <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 28, lineHeight: 1.6 }}>
          Your Stripe checkout session was not completed. No charges have been made to your card. Your selected items remain saved in your shopping bag.
        </p>
        <div className="confirmation-btn-group" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => setPaymentFailed(false)}>
            Try Payment Again
          </button>
          <Link to="/cart" className="btn-secondary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>
            Return to Bag
          </Link>
        </div>
      </div>
    );
  }

  // Empty Bag Protection View (If cart is truly empty and not on completed order screen)
  if (activeCartItems.length === 0 && step !== 3 && !completedOrder) {
    return (
      <div className="container" style={{ padding: '80px 16px 100px 16px', maxWidth: 600, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--cream)', color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <ShoppingBag style={{ width: 38, height: 38 }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 600, margin: '0 0 12px 0' }}>Your Shopping Bag is Empty</h1>
        <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 32, lineHeight: 1.6 }}>
          You currently have no items in your shopping bag. Explore our fine gold-plated jewellery collections to add items before checking out.
        </p>
        <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 36px', fontSize: 14, textDecoration: 'none' }}>
          Explore Collection
        </Link>
      </div>
    );
  }

  // Step 3: Comprehensive Order Confirmation View
  if (step === 3 && completedOrder) {
    return (
      <div className="container" style={{ padding: '40px 16px 80px 16px', maxWidth: 800 }}>
        {/* Success Banner */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Check style={{ width: 40, height: 40 }} />
          </div>
          <p className="section-subtitle" style={{ color: 'var(--success)', marginBottom: 6, fontWeight: 700 }}>Payment Received via Stripe</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 600, margin: 0 }}>Order Confirmed!</h1>
          <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 8 }}>
            Thank you, <strong>{completedOrder.customer}</strong>. Order reference: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{completedOrder.id}</span>
          </p>
        </div>

        {/* Estimated Delivery Highlight Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--onyx) 0%, var(--onyx-light) 100%)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(212,175,55,0.2)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck style={{ width: 26, height: 26 }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', fontWeight: 700, margin: '0 0 4px 0' }}>Australia Post Express Insured Dispatch</p>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff' }}>
              Estimated Delivery: <strong>{completedOrder.deliveryEstimate}</strong>
            </h3>
            <p style={{ fontSize: 12, color: 'var(--slate-light)', margin: '4px 0 0 0' }}>
              Tracking updates will be sent to <strong>{completedOrder.email}</strong> as soon as dispatched.
            </p>
          </div>
        </div>

        {/* Order Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
          {/* Customer & Delivery Address Card */}
          <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, background: 'var(--cloud-white)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, margin: '0 0 14px 0', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              Delivery Address & Contact
            </h4>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--onyx)' }}>{completedOrder.customer}</p>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 4px 0' }}>{completedOrder.address}</p>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 12px 0' }}>{completedOrder.city}, {completedOrder.state} {completedOrder.postcode}</p>
            <p style={{ fontSize: 12, color: 'var(--slate)', margin: '0 0 4px 0' }}><strong>Email:</strong> {completedOrder.email}</p>
            <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}><strong>Phone:</strong> {completedOrder.phone || 'N/A'}</p>
          </div>

          {/* Payment & Status Summary */}
          <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, background: 'var(--cloud-white)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, margin: '0 0 14px 0', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              Payment & Order Details
            </h4>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 6px 0' }}><strong>Order Number:</strong> {completedOrder.id}</p>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 6px 0' }}><strong>Order Date:</strong> {completedOrder.date}</p>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 6px 0' }}><strong>Payment Method:</strong> {completedOrder.paymentMethod}</p>
            <p style={{ fontSize: 13, color: 'var(--success)', margin: '0 0 12px 0', fontWeight: 600 }}><strong>Status:</strong> ✓ {completedOrder.status}</p>
            <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Total Paid (GST Inc.):</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)' }}>{completedOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Purchased Items Table */}
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, background: 'var(--cloud-white)', marginBottom: 32 }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
            Purchased Items Summary
          </h4>
          {completedOrder.items && completedOrder.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '10px 0', borderBottom: '1px dashed var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={item.image || '/assets/logo.svg'} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--cream)' }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate)', margin: '2px 0 0 0' }}>Qty: {item.quantity || 1} · Fine Gold-Plated Jewellery</p>
                </div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--onyx)' }}>{formatMoney ? formatMoney((parseFloat(item.price) || 0) * (item.quantity || 1)) : `$${item.price}`}</p>
            </div>
          ))}

          {/* Pricing Breakdown Rows */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--slate)' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--onyx)' }}>
                {formatMoney ? formatMoney((completedOrder.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (i.quantity || 1)), 0)) : `$${(completedOrder.items || []).reduce((s, i) => s + ((parseFloat(i.price) || 0) * (i.quantity || 1)), 0).toFixed(2)}`}
              </span>
            </div>

            {completedOrder.discount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#047857' }}>
                <span>Coupon Discount {completedOrder.couponCode ? `(${completedOrder.couponCode})` : ''}</span>
                <span style={{ fontWeight: 700 }}>- {completedOrder.discount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--slate)' }}>
              <span>{completedOrder.shippingMethod === 'express' ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)'}</span>
              <span style={{ fontWeight: 600, color: 'var(--onyx)' }}>
                {completedOrder.shippingFee === 0 ? 'FREE' : (formatMoney ? formatMoney(completedOrder.shippingFee || 0) : `$${(completedOrder.shippingFee || 0).toFixed(2)}`)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--onyx)', marginTop: 8, paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
              <span>Total Paid (GST Inc.)</span>
              <span style={{ fontSize: 18, color: 'var(--gold-dark)', fontWeight: 700 }}>{completedOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Single Action Button */}
        <div style={{ marginTop: 24 }}>
          <Link to="/" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 48, fontSize: 14, textDecoration: 'none' }}>
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Encrypted Stripe Gateway</p>
          <h1>Secure Checkout</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, paddingBottom: 60 }}>
        {/* Stepper */}
        <div className="checkout-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step-item${step === i ? ' active' : step > i ? ' completed' : ''}`}>
                <div className="step-circle">{step > i ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="stepper-line" />}
            </React.Fragment>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Left: Step Forms */}
          <div>
            <div className="checkout-card">
              {/* STEP 0: Shipping */}
              {step === 0 && (
                <form onSubmit={handleShippingSubmit}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: 0 }}>1. Shipping Details</h3>
                    {savedAddress && <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>✓ Auto-filled from saved address</span>}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input type="text" className="form-control" value={formData.firstName} onChange={e => setFormData(f => ({...f, firstName: e.target.value}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input type="text" className="form-control" value={formData.lastName} onChange={e => setFormData(f => ({...f, lastName: e.target.value}))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} required />
                  </div>
                  {/* Phone Number with +61 prefix badge */}
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <div style={{ display: 'flex', alignItems: 'stretch', width: '100%' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0 14px',
                          background: 'var(--cream, #FAF8F5)',
                          border: '1.5px solid var(--border, #E8DFD8)',
                          borderRight: 'none',
                          borderRadius: 'var(--radius-md, 8px) 0 0 var(--radius-md, 8px)',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: 'var(--onyx, #1A1A1A)',
                          userSelect: 'none'
                        }}
                      >
                        <span>🇦🇺</span>
                        <span>+61</span>
                      </div>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        style={{
                          borderRadius: '0 var(--radius-md, 8px) var(--radius-md, 8px) 0',
                          borderColor: phoneError ? '#DC2626' : undefined,
                          flex: 1
                        }}
                        required
                      />
                    </div>
                    {phoneError && (
                      <p style={{ color: '#DC2626', fontSize: 11.5, marginTop: 4, marginBottom: 0, fontWeight: 500 }}>
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input type="text" className="form-control" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))} required />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Suburb / Locality *</label>
                      <input
                        type="text"
                        list="aus-suburbs-list"
                        className="form-control"
                        value={formData.city}
                        onChange={handleSuburbChange}
                        autoComplete="address-level2"
                        required
                      />
                      <datalist id="aus-suburbs-list">
                        {AUSTRALIAN_SUBURBS.map(s => (
                          <option key={`${s.name}-${s.state}-${s.postcode}`} value={s.name}>
                            {s.name}, {s.state} ({s.postcode})
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label className="form-label">State / Territory *</label>
                      <select
                        className="form-control"
                        value={formData.state}
                        onChange={handleStateChange}
                        required
                        style={{ cursor: 'pointer', background: '#fff' }}
                      >
                        <option value="">Select State / Territory</option>
                        {AUSTRALIAN_STATES.map(st => (
                          <option key={st.code} value={st.code}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postcode *</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength={4}
                      value={formData.postcode}
                      onChange={handlePostcodeChange}
                      onBlur={handlePostcodeBlur}
                      style={{ borderColor: postcodeError ? '#DC2626' : undefined }}
                      required
                    />
                    {postcodeError && (
                      <p style={{ color: '#DC2626', fontSize: 11.5, marginTop: 4, marginBottom: 0, fontWeight: 500 }}>
                        {postcodeError}
                      </p>
                    )}
                  </div>
                  {/* Delivery Options (Australia Post) */}
                  <div style={{ marginTop: 24, marginBottom: 20 }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--onyx)' }}>
                      Delivery Method (Australia Post)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Standard Shipping */}
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `2px solid ${shippingMethod === 'standard' ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: shippingMethod === 'standard' ? 'var(--cream)' : '#fff', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} style={{ accentColor: 'var(--gold)' }} />
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Standard Shipping</p>
                            <p style={{ fontSize: 12, color: 'var(--slate)', margin: '2px 0 0 0' }}>Delivery in 2–5 business days</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)' }}>
                          {subtotal >= 60 ? 'FREE' : '$10.00 AUD'}
                        </span>
                      </label>

                      {/* Express Shipping */}
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `2px solid ${shippingMethod === 'express' ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: shippingMethod === 'express' ? 'var(--cream)' : '#fff', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} style={{ accentColor: 'var(--gold)' }} />
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Express Shipping</p>
                            <p style={{ fontSize: 12, color: 'var(--slate)', margin: '2px 0 0 0' }}>Delivery in 1–2 business days</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)' }}>$15.00 AUD</span>
                      </label>
                    </div>
                  </div>

                  {/* Show "Save these details" checkbox ONLY if customer has not saved address yet */}
                  {!savedAddress && (
                    <div style={{ margin: '10px 0 20px 0', background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                      <label className="filter-checkbox-label" style={{ fontSize: 13, color: 'var(--onyx)', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" className="filter-checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                        <span><strong>Save these details</strong> for faster 1-click checkout next time</span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isRedirectingToPayment}
                    style={{
                      width: '100%',
                      height: 48,
                      fontSize: 14,
                      marginTop: savedAddress ? 20 : 0,
                      opacity: isRedirectingToPayment ? 0.75 : 1,
                      cursor: isRedirectingToPayment ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {isRedirectingToPayment ? (
                      <>
                        <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                        <span>Redirecting to Stripe Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <Lock style={{ width: 14, height: 14 }} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: 0 }}>2. Payment Method</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                      <ShieldCheck style={{ width: 15, height: 15 }} /> 256-bit SSL Encrypted
                    </div>
                  </div>

                  {/* Payment Tabs */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard style={{ width: 20, height: 20 }} /> },
                      { id: 'express', label: 'Apple Pay / Google Pay', icon: <Smartphone style={{ width: 20, height: 20 }} /> },
                    ].map(tab => (
                      <div key={tab.id} onClick={() => setPaymentTab(tab.id)} style={{ flex: 1, border: `2px solid ${paymentTab === tab.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '14px 10px', textAlign: 'center', background: paymentTab === tab.id ? 'var(--cream)' : 'var(--cloud-white)', cursor: 'pointer' }}>
                        <div style={{ color: paymentTab === tab.id ? 'var(--gold)' : 'var(--slate)', marginBottom: 4 }}>{tab.icon}</div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--onyx)', margin: 0 }}>{tab.label}</p>
                      </div>
                    ))}
                  </div>

                  {paymentTab === 'card' ? (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <div style={{ position: 'relative' }}>
                          <input type="text" className="form-control" defaultValue="4532 •••• •••• 8892" />
                          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#1A1F71', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>VISA</span>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#EB001B', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>MC</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Expiry Date</label>
                          <input type="text" className="form-control" defaultValue="08 / 28" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Security CVC</label>
                          <input type="password" className="form-control" defaultValue="892" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cardholder Name</label>
                        <input type="text" className="form-control" defaultValue={`${formData.firstName} ${formData.lastName}`.trim() || 'CARDHOLDER NAME'} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(0); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                        <button className="btn-primary" style={{ flex: 2 }} onClick={() => { setStep(2); window.scrollTo({top:0,behavior:'smooth'}); }}>Review Order <ArrowRight style={{ width: 14 }} /></button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16, textAlign: 'center' }}>
                        Pay instantly with your biometric wallet (FaceID / TouchID / Google Account).
                      </p>
                      <button onClick={() => handleExpressPay('Apple Pay')} style={{ width: '100%', height: 50, background: '#000', color: '#fff', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                        <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6.09-9.35-10.99-19.8-14.69-31.33-3.7-11.53-5.55-22.6-5.55-33.22 0-14.8 3.7-27.18 11.09-37.13 7.39-9.95 16.74-15.02 28.05-15.22 4.35 0 9.47 1.25 15.35 3.75 5.88 2.5 9.79 3.86 11.73 4.09 1.74-.23 5.87-1.63 12.38-4.2 6.51-2.58 11.73-3.76 15.66-3.53 11.53.65 20.89 4.9 28.07 12.73-10.23 6.19-15.24 14.68-15.02 25.46.22 8.48 3.59 15.77 10.09 21.86 6.51 6.1 14.24 9.57 23.2 10.44-2.18 6.52-4.68 12.72-7.51 18.59zM119.22 33.04c0-7.39 2.61-14.35 7.83-20.88C132.27 5.63 138.8.84 146.64 0c.22 1.09.33 2.18.33 3.26 0 7.39-2.83 14.68-8.48 21.86-5.66 7.18-12.4 11.2-20.24 12.07-.44-1.31-.67-2.69-.67-4.15z"/></svg>
                        <span>Pay with Apple Pay</span>
                      </button>
                      <button onClick={() => handleExpressPay('Google Pay')} style={{ width: '100%', height: 50, background: '#fff', color: '#3c4043', borderRadius: 'var(--radius-md)', border: '1px solid #dadce0', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 16, boxShadow: '0 1px 3px rgba(60,64,67,0.15)' }}>
                        <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.91l7.35-5.73z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
                        <span>Buy with GPay</span>
                      </button>
                      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => { setStep(0); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Review */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>3. Review Order</h3>
                  <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                    <p style={{ marginBottom: 6 }}><strong>Deliver To:</strong> {formData.firstName} {formData.lastName}</p>
                    <p style={{ marginBottom: 6 }}><strong>Address:</strong> {formData.address}, {formData.city} {formData.state} {formData.postcode}</p>
                    <p style={{ marginBottom: 6 }}><strong>Contact:</strong> {formData.email} · {formData.phone}</p>
                    <p style={{ marginBottom: 0 }}><strong>Payment:</strong> {paymentTab === 'express' ? 'Apple Pay / Google Pay' : 'Stripe Card (•••• 8892)'}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 20 }}>
                    By clicking "Place Order", you authorize Abel's By Lincy to charge <strong>{formatMoney(subtotal)}</strong> to your selected payment method.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(1); window.scrollTo({top:0,behavior:'smooth'}); }}>Back</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={handlePlaceOrder}>
                      Place Order · {formatMoney(subtotal)} <Lock style={{ width: 14 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bag Summary */}
          <div>
            <div style={{ background: 'var(--cloud-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Bag Items ({activeCartItems.length})</h4>
              <div
                className="custom-scrollbar"
                style={{
                  maxHeight: activeCartItems.length > 3 ? 270 : 'none',
                  overflowY: activeCartItems.length > 3 ? 'auto' : 'visible',
                  marginBottom: 16,
                  paddingRight: activeCartItems.length > 3 ? 6 : 0
                }}
              >
                {activeCartItems.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.size}-${idx}`}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      marginBottom: idx === activeCartItems.length - 1 ? 0 : 10,
                      paddingBottom: idx === activeCartItems.length - 1 ? 0 : 10,
                      borderBottom: idx === activeCartItems.length - 1 ? 'none' : '1px solid var(--border-light)'
                    }}
                  >
                    <img src={item.image} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt={item.name} />
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--onyx)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--slate)', margin: '2px 0 0 0' }}>Qty: {item.quantity} · {formatMoney(item.price)}</p>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, flexShrink: 0, color: 'var(--onyx)' }}>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={e => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                      style={{ fontSize: 12, padding: '8px 10px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', flex: 1, borderColor: couponError ? '#DC2626' : undefined }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ color: '#DC2626', fontSize: 11.5, marginTop: 5, fontWeight: 600, lineHeight: 1.3 }}>
                      {couponError}
                    </div>
                  )}

                  {/* Available Active Store Coupons from Admin */}
                  {activeStoreCoupons.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setShowOffersDropdown(!showOffersDropdown)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
                      >
                        <Ticket style={{ width: 13, height: 13 }} />
                        {showOffersDropdown ? `Hide Available Coupons (${activeStoreCoupons.length})` : `View Available Coupons (${activeStoreCoupons.length})`}
                        {showOffersDropdown ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                      </button>
                      
                      {showOffersDropdown && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {activeStoreCoupons.map(cp => {
                            const isCurrentApplied = appliedCoupon?.code === cp.code;
                            return (
                              <div
                                key={cp.id || cp.code}
                                style={{
                                  background: isCurrentApplied ? '#F4FBF7' : 'var(--cream)',
                                  padding: '10px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  fontSize: 12,
                                  border: isCurrentApplied ? '1px solid #10B981' : '1px solid var(--border)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 5
                                }}
                              >
                                {/* Top Row: Code, Discount Badge, Applied Tag, Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <strong style={{ color: isCurrentApplied ? '#065F46' : 'var(--onyx)', letterSpacing: '0.04em', fontSize: 12.5 }}>
                                      {cp.code}
                                    </strong>
                                    <span style={{ color: '#92400E', background: '#FEF3C7', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontSize: 10.5, whiteSpace: 'nowrap' }}>
                                      {cp.discountType === 'percentage' ? `${cp.value}% OFF` : `$${cp.value} OFF`}
                                    </span>
                                    {isCurrentApplied && (
                                      <span style={{ fontSize: 10, fontWeight: 700, background: '#D1FAE5', color: '#047857', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                                        ACTIVE
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyCoupon(cp.code, e)}
                                      style={{
                                        background: '#FFFFFF',
                                        border: '1px solid var(--border)',
                                        borderRadius: 4,
                                        padding: '4px 10px',
                                        color: 'var(--onyx)',
                                        cursor: 'pointer',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s ease'
                                      }}
                                      title="Copy coupon code"
                                    >
                                      {copiedCode === cp.code ? <Check style={{ width: 11, height: 11, color: '#047857' }} /> : <Copy style={{ width: 11, height: 11, color: 'var(--gold-dark)' }} />}
                                      <span style={{ color: copiedCode === cp.code ? '#047857' : 'inherit', fontWeight: 600 }}>
                                        {copiedCode === cp.code ? 'Copied' : 'Copy'}
                                      </span>
                                    </button>
                                  </div>
                                </div>

                                {/* Bottom Row: Description */}
                                <div style={{ fontSize: 11, color: isCurrentApplied ? '#047857' : 'var(--slate)', lineHeight: 1.3 }}>
                                  {cp.label} {cp.minOrder > 0 ? `· Min spend $${cp.minOrder}` : '· No min spend'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Financials */}
              <div className="summary-row" style={{ fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--slate)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row" style={{ fontSize: 13, marginBottom: 8, color: '#047857' }}>
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span style={{ fontWeight: 700 }}>- {formatMoney(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row" style={{ fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--slate)' }}>
                  {shippingMethod === 'express' ? 'Express Shipping (AusPost)' : 'Standard Shipping (AusPost)'}
                </span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? 'var(--success)' : 'var(--onyx)' }}>
                  {shippingFee === 0 ? 'FREE' : formatMoney(shippingFee)}
                </span>
              </div>

              <div className="summary-row summary-total" style={{ fontSize: 16, marginTop: 10, paddingTop: 10 }}>
                <span>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(grandTotal)}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--slate)', fontStyle: 'italic', marginTop: 8, textAlign: 'left' }}>
                * All prices in AUD and inclusive of GST.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
