import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users, Ticket, Globe, Inbox,
  ChartNoAxesColumn, Lock, ChevronRight, ChevronLeft, Crown, Search, Plus, Pencil, Trash2,
  RefreshCw, DollarSign, TrendingUp, AlertTriangle, AlertCircle, CheckCircle2, Star, Eye, EyeOff,
  ArrowUp, ArrowDown, Download, HelpCircle, MessageSquare, CornerDownRight, ExternalLink, Menu, X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AdminPage() {
  const {
    adminLoggedIn, adminUser, adminLogin, adminLogout, roles,
    products, categories, orders, customers, coupons, reviews, stockHistory, cms, messages,
    setProducts, setCategories, setOrders, setCustomers, setCoupons, setReviews, setStockHistory, setCMS, setMessages,
    formatMoney, saveProduct, deleteProduct, adjustStockQty, restockAllLowStock,
    saveCategory, deleteCategory, cycleOrderStatus, deleteOrder,
    saveCustomer, deleteCustomer, saveCoupon, deleteCoupon,
    saveGlobalCMS, saveHeroSlide, deleteHeroSlide, moveHeroSlide, showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

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
    }
  };

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard filter state
  const [dashTimePeriod, setDashTimePeriod] = useState('today'); // 'today' | 'week' | 'month'

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
  const [prodForm, setProdForm] = useState({
    id: '', name: '', sku: '', desc: '', price: 0, salePrice: 0,
    baseImage1: '', baseImage2: '', baseImage3: '',
    category: 'necklaces', stockQty: 10, status: 'Active',
    isFeatured: false, tags: '', colorsText: '', colorImages: {},
    seoTitle: '', seoDesc: '', slug: ''
  });

  // Category Modal state
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ id: '', name: '', slug: '', image: '', desc: '' });

  // Coupon Modal state
  const [editingCoupon, setEditingCoupon] = useState(null);
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

  // Customer Details Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // Analytics date filtration state
  const [analyticsPreset, setAnalyticsPreset] = useState('30days');

  // CMS state & Curator handlers
  const [cmsAnnouncement, setCmsAnnouncement] = useState(() => cms?.announcement || 'Free Express Shipping on all orders across Australia');
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroForm, setHeroForm] = useState({
    tagline: 'THE NEW COLLECTION', title: 'Elegance in Every Detail', description: 'Hand-crafted anti-tarnish gold-plated jewellery.', image: '', ctaText: 'SHOP NOW', ctaLink: '/shop'
  });

  React.useEffect(() => {
    if (cms?.announcement) {
      setCmsAnnouncement(cms.announcement);
    }
  }, [cms]);

  const toggleBestSeller = (prod) => {
    const isBS = !prod.bestSeller;
    const updated = products.map(p => p.id === prod.id ? { ...p, bestSeller: isBS } : p);
    setProducts(updated);
    showToast(`${prod.name} ${isBS ? 'added to' : 'removed from'} Best Sellers!`, 'check');
  };

  const toggleNewArrival = (prod) => {
    const isNA = !prod.newArrival;
    const updated = products.map(p => p.id === prod.id ? { ...p, newArrival: isNA } : p);
    setProducts(updated);
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

            <form onSubmit={handleAdminSubmit}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: 18 }}>
                <label className="form-label" style={{ color: 'var(--onyx)', fontWeight: 700 }}>Admin username</label>
                <input
                  type="text"
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
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Discounts', icon: Ticket },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'cms', label: 'Website CMS', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  ];

  // Helper Stock Adjust
  const handleRecordStockChange = (prod, delta, reason) => {
    const newQty = Math.max(0, (prod.stockQty || 0) + delta);
    const updated = products.map(p => p.id === prod.id ? { ...p, stockQty: newQty, inStock: newQty > 0 } : p);
    setProducts(updated);

    const historyItem = {
      id: `sh_${Date.now()}`,
      productId: prod.id,
      sku: prod.sku || 'ABL-JEW',
      productName: prod.name,
      change: delta,
      reason: reason || 'Manual stock adjustment',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      stockAfter: newQty
    };
    setStockHistory([historyItem, ...(stockHistory || [])]);
    showToast(`Stock updated for ${prod.name} (${newQty} units remaining)`, 'check');
  };

  // Low stock (< 3) & Out of stock (= 0) calculation
  const lowStockProducts = products.filter(p => (p.stockQty || 0) > 0 && (p.stockQty || 0) < 3);
  const outOfStockProducts = products.filter(p => (p.stockQty || 0) === 0);

  // Status breakdown for orders
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'New Order').length;
  const processingOrdersCount = orders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped' || o.status === 'Packed').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;
  const returnedOrdersCount = orders.filter(o => o.status === 'Returned' || o.status === 'Refunded').length;

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

        {!sidebarCollapsed && (
          <div style={{ padding: '12px 16px', margin: '8px 12px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Crown style={{ width: 16, height: 16, color: 'var(--gold)' }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', margin: 0 }}>{currentAdmin.role || 'Super Admin'}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Full Access</p>
              </div>
            </div>
          </div>
        )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <button
              type="button"
              className="admin-mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu style={{ width: 22, height: 22, color: 'var(--onyx)' }} />
            </button>

            <Search style={{ color: 'var(--slate)', width: 16, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              style={{ border: 'none', outline: 'none', width: '100%', maxWidth: 280, fontSize: 13, background: 'transparent' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: 'var(--onyx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(currentAdmin.user || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-info-text">
                <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1, margin: 0 }}>{currentAdmin.user}</p>
                <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 600 }}>{currentAdmin.role}</span>
              </div>
            </div>
            <button onClick={adminLogout} className="btn-secondary" style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              Sign Out
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

              <div style={{ padding: '12px 16px', margin: '12px 16px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Crown style={{ width: 16, height: 16, color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', margin: 0 }}>{currentAdmin.role || 'Super Admin'}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{currentAdmin.user}</p>
                  </div>
                </div>
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
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <main className="admin-body">

          {/* 1. DASHBOARD ("How is my business doing today?") */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, margin: 0, color: 'var(--onyx)' }}>Dashboard</h1>
                  <p style={{ fontSize: 14, color: 'var(--gold-dark)', fontWeight: 600, marginTop: 4 }}>"How is my business doing today?"</p>
                </div>

                {/* Period Filter Buttons */}
                <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                  {['today', 'week', 'month'].map(p => (
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
                      {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Today Metrics KPIs */}
              <div className="kpi-grid" style={{ marginBottom: 24 }}>
                <div className="kpi-card">
                  <span className="kpi-title">Today's Orders</span>
                  <span className="kpi-value">{dashTimePeriod === 'today' ? '4 Orders' : dashTimePeriod === 'week' ? '18 Orders' : '42 Orders'}</span>
                  <span className="kpi-trend trend-up">↑ 12% vs yesterday</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">Today's Revenue</span>
                  <span className="kpi-value">{dashTimePeriod === 'today' ? '$586.00' : dashTimePeriod === 'week' ? '$2,840.00' : '$6,750.00'}</span>
                  <span className="kpi-trend trend-up">↑ 18% sales growth</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">Items Sold</span>
                  <span className="kpi-value">{dashTimePeriod === 'today' ? '7 Items' : dashTimePeriod === 'week' ? '32 Items' : '78 Items'}</span>
                  <span className="kpi-trend trend-up">↑ Sydney orders</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">New Customers</span>
                  <span className="kpi-value">{dashTimePeriod === 'today' ? '3 Clients' : dashTimePeriod === 'week' ? '12 Clients' : '29 Clients'}</span>
                  <span className="kpi-trend trend-up">↑ Australian buyers</span>
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
                  <div style={{ background: 'var(--cream)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: 'var(--onyx)' }}>{pendingOrdersCount}</span>
                    <span style={{ fontSize: 12, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                  </div>
                  <div style={{ background: '#EBF8FF', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#2B6CB0' }}>{processingOrdersCount}</span>
                    <span style={{ fontSize: 12, color: '#2C5282', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Processing</span>
                  </div>
                  <div style={{ background: '#FEFCBF', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#B7791F' }}>{shippedOrdersCount}</span>
                    <span style={{ fontSize: 12, color: '#744210', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipped</span>
                  </div>
                  <div style={{ background: '#C6F6D5', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#276749' }}>{deliveredOrdersCount}</span>
                    <span style={{ fontSize: 12, color: '#22543D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</span>
                  </div>
                  <div style={{ background: '#FED7D7', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#9B2C2C' }}>{cancelledOrdersCount}</span>
                    <span style={{ fontSize: 12, color: '#742A2A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelled</span>
                  </div>
                  <div style={{ background: '#EDF2F7', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#4A5568' }}>{returnedOrdersCount}</span>
                    <span style={{ fontSize: 12, color: '#2D3748', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Returned</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Product Catalogue ({products.length})</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Manage anti-tarnish gold-plated jewellery items, pricing, SKUs, and tags.</p>
                </div>
                <button
                  onClick={() => {
                    const randomSKU = generateRandomSKU('necklaces');
                    setProdForm({
                      id: '', name: '', sku: randomSKU, desc: '', price: 120, salePrice: 100,
                      baseImage1: '', baseImage2: '', baseImage3: '',
                      category: 'necklaces', stockQty: 10, status: 'Active',
                      isFeatured: true, tags: 'gold, anti-tarnish',
                      colorsText: '', colorImages: {},
                      seoTitle: '', seoDesc: '', slug: ''
                    });
                    setProdFormErrors({});
                    setUploadedImagesMap({});
                    setEditingProduct({});
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Add Product
                </button>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                            <div>
                              <strong>{p.name}</strong>
                              {p.isFeatured && <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td><code style={{ fontSize: 12 }}>{p.sku || 'ABL-JEW'}</code></td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                        <td>${p.price}</td>
                        <td>
                          <span style={{
                            color: (p.stockQty || 0) === 0 ? '#C53030' : (p.stockQty || 0) < 3 ? '#DD6B20' : '#2F855A',
                            fontWeight: 700
                          }}>
                            {p.stockQty || 0} units
                          </span>
                        </td>
                        <td><span className="badge badge-success">{p.status || 'Active'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                const baseImgs = p.images?.length > 0 ? p.images : [p.image || ''];
                                const colorsListStr = (p.colors || []).join(', ');
                                setProdForm({
                                  id: p.id,
                                  name: p.name || '',
                                  sku: p.sku || generateRandomSKU(p.category),
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
                              className="btn-secondary" style={{ padding: 6 }}
                            >
                              <Pencil style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="btn-secondary" style={{ padding: 6, color: 'var(--danger)' }}>
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
          )}

          {/* 3. CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Categories ({categories.length})</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Earrings, Necklaces, Rings, Bracelets, Bangles, Charms, New Arrivals, Best Sellers.</p>
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
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Home Inventory Control</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Track physical stock in Sydney with automated stock movement history.</p>
                </div>
                <button onClick={() => restockAllLowStock(10)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw style={{ width: 14, height: 14 }} /> Restock All Low Items (+10)
                </button>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock Qty</th>
                      <th>Stock Status</th>
                      <th>Stock Management</th>
                      <th>Movement History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const qty = p.stockQty || 0;
                      const isLow = qty > 0 && qty < 3;
                      const isOut = qty === 0;
                      return (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong></td>
                          <td><code>{p.sku || 'ABL-JEW'}</code></td>
                          <td style={{ fontSize: 16, fontWeight: 700 }}>{qty}</td>
                          <td>
                            {isOut ? (
                              <span style={{ background: '#FED7D7', color: '#9B2C2C', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>🔴 Out of Stock</span>
                            ) : isLow ? (
                              <span style={{ background: '#FEEBC8', color: '#C05621', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>⚠️ Low Stock</span>
                            ) : (
                              <span style={{ background: '#C6F6D5', color: '#22543D', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>In Stock</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => handleRecordStockChange(p, -1, 'Stock reduction (-1)')} className="btn-secondary" style={{ padding: '4px 10px', fontWeight: 700 }}>-1</button>
                              <button onClick={() => handleRecordStockChange(p, +1, 'Stock intake (+1)')} className="btn-secondary" style={{ padding: '4px 10px', fontWeight: 700 }}>+1</button>
                              <button
                                onClick={() => {
                                  setSelectedStockProduct(p);
                                  setStockAdjustQty(5);
                                  setStockAdjustReason('Restock shipment received');
                                }}
                                className="btn-secondary"
                                style={{ padding: '4px 10px', fontSize: 11 }}
                              >
                                Adjust...
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedStockProduct(p)}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Layers style={{ width: 14, height: 14 }} /> History
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Orders Lifecycle ({orders.length})</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>New Order → Confirmed → Processing → Packed → Shipped → Delivered.</p>
                </div>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product / Items</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.customer}<br /><span style={{ fontSize: 11, color: 'var(--slate)' }}>{o.email}</span></td>
                        <td>{o.product || 'Gold Jewellery'}</td>
                        <td>{o.date}</td>
                        <td>
                          <button
                            onClick={() => cycleOrderStatus(o.id)}
                            style={{
                              border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              background: o.status === 'Delivered' ? '#C6F6D5' : o.status === 'Shipped' ? '#FEFCBF' : '#EBF8FF',
                              color: o.status === 'Delivered' ? '#22543D' : o.status === 'Shipped' ? '#744210' : '#2C5282'
                            }}
                          >
                            {o.status} ↻
                          </button>
                        </td>
                        <td><strong>{o.total}</strong></td>
                        <td>
                          <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CUSTOMERS */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Customer Directory ({customers.length})</h2>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Click any customer to inspect their full purchase history.</p>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.orders || 1} orders</td>
                        <td><strong>{c.spent || '$189'}</strong></td>
                        <td>{c.joined || 'Aug 2026'}</td>
                        <td>
                          <button onClick={() => setSelectedCustomer(c)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. DISCOUNTS / COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Discount Coupons ({coupons.length})</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Create promotional discount codes (e.g. WELCOME10, FIRSTORDER, DIWALI15).</p>
                </div>
                <button
                  onClick={() => {
                    setCouponForm({ id: '', code: 'WELCOME10', label: 'Welcome Offer', discountType: 'percentage', value: 10, minOrder: 50, maxDiscount: 20, expiry: '2026-12-31', active: true, usageLimit: 100, perCustomerLimit: 1 });
                    setEditingCoupon({});
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Create Coupon
                </button>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Discount</th>
                      <th>Min Order</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(cp => (
                      <tr key={cp.id || cp.code}>
                        <td><code style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-dark)' }}>{cp.code}</code></td>
                        <td>{cp.label}</td>
                        <td><strong>{cp.discountType === 'percentage' ? `${cp.value}% OFF` : `$${cp.value} OFF`}</strong></td>
                        <td>${cp.minOrder || 0}</td>
                        <td>{cp.expiry || '2026-12-31'}</td>
                        <td>
                          <span style={{ background: cp.active ? '#C6F6D5' : '#FED7D7', color: cp.active ? '#22543D' : '#9B2C2C', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                            {cp.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => deleteCoupon(cp.code)} className="btn-secondary" style={{ padding: 6, color: 'var(--danger)' }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Customer Reviews ({reviews.length})</h2>
                <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>Approve, hide, feature, or reply to customer product feedback.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', marginBottom: 4 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} style={{ width: 16, height: 16, fill: i < r.rating ? 'var(--gold)' : 'none' }} />
                          ))}
                          <span style={{ fontWeight: 700, color: 'var(--onyx)', marginLeft: 6 }}>{r.title}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>
                          By <strong>{r.author}</strong> {r.verified && <span style={{ background: '#C6F6D5', color: '#22543D', fontSize: 10, padding: '2px 6px', borderRadius: 4, marginLeft: 6 }}>Verified Purchase</span>} — {r.date}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            const updated = reviews.map(item => item.id === r.id ? { ...item, status: item.status === 'approved' ? 'hidden' : 'approved' } : item);
                            setReviews(updated);
                            showToast(`Review ${r.status === 'approved' ? 'hidden' : 'approved'}`, 'check');
                          }}
                          className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          {r.status === 'approved' ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            const updated = reviews.map(item => item.id === r.id ? { ...item, featured: !item.featured } : item);
                            setReviews(updated);
                            showToast('Featured status updated', 'check');
                          }}
                          className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12, background: r.featured ? 'var(--gold)' : 'transparent', color: r.featured ? '#fff' : 'inherit' }}
                        >
                          {r.featured ? '★ Featured' : 'Feature'}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--onyx)', margin: '8px 0', lineHeight: 1.6 }}>"{r.text}"</p>
                    {r.reply && (
                      <div style={{ background: 'var(--cream)', padding: 12, borderRadius: 8, marginTop: 8, fontSize: 13, borderLeft: '3px solid var(--gold)' }}>
                        <strong>Store Reply:</strong> {r.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Client Inquiries Inbox ({messages.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sender</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>No inquiries received yet.</td></tr>
                    ) : (
                      messages.map(m => (
                        <tr key={m.id}>
                          <td>{m.date}</td>
                          <td><strong>{m.name}</strong><br /><span style={{ fontSize: 11, color: 'var(--slate)' }}>{m.email}</span></td>
                          <td>{m.subject || 'General Inquiry'}</td>
                          <td>{m.message}</td>
                          <td>
                            <a href={`mailto:${m.email}`} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>Reply</a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                    onChange={e => setCmsAnnouncement(e.target.value)}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        saveGlobalCMS({ announcement: cmsAnnouncement });
                        showToast('Top announcement banner saved!', 'check');
                      }}
                      className="btn-primary"
                      style={{ padding: '10px 24px', fontSize: 13 }}
                    >
                      Save Banner
                    </button>
                  </div>
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
                    onClick={() => setShowHeroModal(true)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add Hero Slide
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(cms.heroSlides || []).map(slide => (
                    <div key={slide.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--cream)' }}>
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
                      <button onClick={() => deleteHeroSlide(slide.id)} className="btn-secondary" style={{ color: 'var(--danger)', padding: 8 }} title="Delete slide">
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  ))}
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
              <div className="kpi-grid" style={{ marginBottom: 24 }}>
                <div className="kpi-card">
                  <span className="kpi-title">Gross Revenue</span>
                  <span className="kpi-value">$25,317.00</span>
                  <span className="kpi-trend trend-up">↑ 24% vs last period</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">Total Orders</span>
                  <span className="kpi-value">{orders.length + 184}</span>
                  <span className="kpi-trend trend-up">↑ Sydney & interstate</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">Average Order Value (AOV)</span>
                  <span className="kpi-value">$137.50</span>
                  <span className="kpi-trend trend-up">↑ 8% higher cart size</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-title">Repeat Purchase Rate</span>
                  <span className="kpi-value">34.2%</span>
                  <span className="kpi-trend trend-up">↑ Strong brand loyalty</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Best Selling Jewellery Pieces</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {products.slice(0, 4).map((p, idx) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--cream)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold-dark)', width: 24 }}>#{idx + 1}</span>
                        <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                        <div>
                          <strong>{p.name}</strong>
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--slate)' }}>SKU: {p.sku || 'ABL-JEW'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--onyx)' }}>${p.price * (idx + 12)}</span>
                        <span style={{ display: 'block', fontSize: 12, color: 'var(--slate)' }}>{idx + 12} units sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: Edit/Add Product */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 720, width: '95%', padding: 'clamp(16px, 4vw, 28px)', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, marginBottom: 18, color: 'var(--onyx)' }}>
              {prodForm.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const errors = {};

              if (!prodForm.name.trim()) errors.name = 'Product name is mandatory.';
              if (!prodForm.sku.trim()) errors.sku = 'SKU code is mandatory.';
              if (!prodForm.price || Number(prodForm.price) <= 0) errors.price = 'Price must be greater than $0.';
              if (prodForm.stockQty === '' || Number(prodForm.stockQty) < 0) errors.stockQty = 'Valid stock quantity is mandatory.';
              if (!prodForm.desc.trim()) errors.desc = 'Description is mandatory.';
              if (!prodForm.baseImage1.trim()) errors.baseImage1 = 'Base Image 1 is mandatory.';

              const colorsList = prodForm.colorsText.split(',').map(c => c.trim()).filter(Boolean);
              colorsList.forEach(color => {
                const cImgs = prodForm.colorImages[color] || ['', '', ''];
                if (!cImgs[0]?.trim()) {
                  errors[`color_${color}_0`] = `Image 1 for ${color} variant is mandatory.`;
                }
              });

              if (Object.keys(errors).length > 0) {
                setProdFormErrors(errors);
                return;
              }

              setProdFormErrors({});

              const baseImgs = [prodForm.baseImage1, prodForm.baseImage2, prodForm.baseImage3].map(s => s.trim()).filter(Boolean);
              const mainImg = baseImgs[0] || 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png';

              const savedProduct = {
                id: prodForm.id || `p_${Date.now()}`,
                name: prodForm.name.trim(),
                sku: prodForm.sku.trim(),
                desc: prodForm.desc.trim(),
                description: prodForm.desc.trim(),
                price: Number(prodForm.price),
                salePrice: Number(prodForm.salePrice || 0),
                image: mainImg,
                images: baseImgs,
                category: prodForm.category,
                collection: prodForm.collection || 'Soleil',
                stockQty: Number(prodForm.stockQty),
                status: prodForm.status || 'Active',
                isFeatured: !!prodForm.isFeatured,
                tags: prodForm.tags,
                colors: colorsList,
                colorImages: prodForm.colorImages,
                inStock: Number(prodForm.stockQty) > 0
              };

              saveProduct(savedProduct);
              setEditingProduct(null);
            }} noValidate>

              {/* Product Name & Random SKU Generator */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>PRODUCT NAME *</label>
                  <input
                    type="text"
                    className="form-control"
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>SKU *</label>
                    <button
                      type="button"
                      onClick={() => setProdForm(f => ({ ...f, sku: generateRandomSKU(f.category) }))}
                      style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Generate New SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: prodFormErrors.sku ? '#e53e3e' : undefined }}
                    value={prodForm.sku}
                    onChange={e => {
                      setProdForm({ ...prodForm, sku: e.target.value });
                      if (prodFormErrors.sku) setProdFormErrors(err => ({ ...err, sku: '' }));
                    }}
                  />
                  {prodFormErrors.sku && (
                    <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {prodFormErrors.sku}
                    </span>
                  )}
                </div>
              </div>

              {/* Base Price & Sale Price */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>BASE PRICE ($) *</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: prodFormErrors.price ? '#e53e3e' : undefined }}
                    value={prodForm.price}
                    onChange={e => {
                      setProdForm({ ...prodForm, price: parseFloat(e.target.value) || 0 });
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
                    type="number"
                    className="form-control"
                    value={prodForm.salePrice}
                    onChange={e => setProdForm({ ...prodForm, salePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>STOCK QUANTITY *</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: prodFormErrors.stockQty ? '#e53e3e' : undefined }}
                    value={prodForm.stockQty}
                    onChange={e => {
                      setProdForm({ ...prodForm, stockQty: parseInt(e.target.value, 10) || 0 });
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
                  onChange={e => setProdForm({ ...prodForm, category: e.target.value, sku: generateRandomSKU(e.target.value) })}
                >
                  <option value="earrings">Earrings</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="bangles">Bangles</option>
                  <option value="charms">Charms</option>
                </select>
              </div>

              {/* Mandatory Description Box */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>DESCRIPTION *</label>
                <textarea
                  className="form-control"
                  rows={3}
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
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)', marginBottom: 12 }}>
                  Base Product Images
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--onyx)', marginBottom: 4, display: 'block' }}>
                      Base Image 1 *
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
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
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                        onClick={() => {
                          if (prodForm.baseImage1.trim()) {
                            setUploadedImagesMap(prev => ({ ...prev, baseImage1: true }));
                          }
                        }}
                      >
                        {uploadedImagesMap.baseImage1 || prodForm.baseImage1?.trim() ? '✓ Uploaded' : 'Upload'}
                      </button>
                    </div>
                    {prodFormErrors.baseImage1 && (
                      <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                        {prodFormErrors.baseImage1}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 4, display: 'block' }}>
                      Base Image 2
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ flex: 1, background: '#FFFFFF' }}
                        value={prodForm.baseImage2}
                        onChange={e => setProdForm({ ...prodForm, baseImage2: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                        onClick={() => {
                          if (prodForm.baseImage2.trim()) {
                            setUploadedImagesMap(prev => ({ ...prev, baseImage2: true }));
                          }
                        }}
                      >
                        {uploadedImagesMap.baseImage2 || prodForm.baseImage2?.trim() ? '✓ Uploaded' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 4, display: 'block' }}>
                      Base Image 3
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ flex: 1, background: '#FFFFFF' }}
                        value={prodForm.baseImage3}
                        onChange={e => setProdForm({ ...prodForm, baseImage3: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                        onClick={() => {
                          if (prodForm.baseImage3.trim()) {
                            setUploadedImagesMap(prev => ({ ...prev, baseImage3: true }));
                          }
                        }}
                      >
                        {uploadedImagesMap.baseImage3 || prodForm.baseImage3?.trim() ? '✓ Uploaded' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants */}
              <div style={{ background: '#FFFFFF', padding: 18, borderRadius: 12, marginBottom: 20, border: '1px solid var(--gold)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)', marginBottom: 12 }}>
                  Color Variants
                </h4>

                <div style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>AVAILABLE COLORS</label>
                  <input
                    type="text"
                    className="form-control"
                    value={prodForm.colorsText}
                    onChange={e => setProdForm({ ...prodForm, colorsText: e.target.value })}
                  />
                </div>

                {/* Dynamically rendered color variant image boxes */}
                {prodForm.colorsText.split(',').map(c => c.trim()).filter(Boolean).map(color => {
                  const colorImgs = prodForm.colorImages[color] || ['', '', ''];
                  const colorErrKey = `color_${color}_0`;
                  return (
                    <div key={color} style={{ background: 'var(--cream)', padding: 14, borderRadius: 8, marginBottom: 14, border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', margin: '0 0 10px 0' }}>
                        Images for "{color}" Variant
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--onyx)' }}>
                            {color} Image 1 *
                          </label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ flex: 1, background: '#FFFFFF', borderColor: prodFormErrors[colorErrKey] ? '#e53e3e' : undefined }}
                              value={colorImgs[0] || ''}
                              onChange={e => {
                                const updated = [...colorImgs];
                                updated[0] = e.target.value;
                                setProdForm({
                                  ...prodForm,
                                  colorImages: { ...prodForm.colorImages, [color]: updated }
                                });
                                if (prodFormErrors[colorErrKey]) {
                                  setProdFormErrors(err => ({ ...err, [colorErrKey]: '' }));
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                              onClick={() => {
                                if (colorImgs[0]?.trim()) {
                                  setUploadedImagesMap(prev => ({ ...prev, [`${color}_0`]: true }));
                                }
                              }}
                            >
                              {uploadedImagesMap[`${color}_0`] || colorImgs[0]?.trim() ? '✓ Uploaded' : 'Upload'}
                            </button>
                          </div>
                          {prodFormErrors[colorErrKey] && (
                            <span style={{ color: '#e53e3e', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                              {prodFormErrors[colorErrKey]}
                            </span>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)' }}>
                            {color} Image 2
                          </label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ flex: 1, background: '#FFFFFF' }}
                              value={colorImgs[1] || ''}
                              onChange={e => {
                                const updated = [...colorImgs];
                                updated[1] = e.target.value;
                                setProdForm({
                                  ...prodForm,
                                  colorImages: { ...prodForm.colorImages, [color]: updated }
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                              onClick={() => {
                                if (colorImgs[1]?.trim()) {
                                  setUploadedImagesMap(prev => ({ ...prev, [`${color}_1`]: true }));
                                }
                              }}
                            >
                              {uploadedImagesMap[`${color}_1`] || colorImgs[1]?.trim() ? '✓ Uploaded' : 'Upload'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)' }}>
                            {color} Image 3
                          </label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ flex: 1, background: '#FFFFFF' }}
                              value={colorImgs[2] || ''}
                              onChange={e => {
                                const updated = [...colorImgs];
                                updated[2] = e.target.value;
                                setProdForm({
                                  ...prodForm,
                                  colorImages: { ...prodForm.colorImages, [color]: updated }
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 90 }}
                              onClick={() => {
                                if (colorImgs[2]?.trim()) {
                                  setUploadedImagesMap(prev => ({ ...prev, [`${color}_2`]: true }));
                                }
                              }}
                            >
                              {uploadedImagesMap[`${color}_2`] || colorImgs[2]?.trim() ? '✓ Uploaded' : 'Upload'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>Save Product</button>
              </div>
            </form>
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
              {selectedStockProduct.name} (SKU: {selectedStockProduct.sku || 'ABL-JEW'}) — Current Stock: {selectedStockProduct.stockQty || 0}
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
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 540, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {selectedCustomer.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20 }}>
              Email: <strong>{selectedCustomer.email}</strong> • Joined: {selectedCustomer.joined || 'Aug 2026'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, background: 'var(--cream)', padding: 16, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase' }}>Total Orders</span>
                <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--onyx)' }}>{selectedCustomer.orders || 1}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--slate)', textTransform: 'uppercase' }}>Total Spent</span>
                <span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: 'var(--gold-dark)' }}>{selectedCustomer.spent || '$189'}</span>
              </div>
            </div>

            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Past Purchase History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.filter(o => o.customer === selectedCustomer.name || o.email === selectedCustomer.email).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                  <div>
                    <strong>{o.id}</strong> — {o.product || 'Fine Jewellery'}
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--slate)' }}>Date: {o.date}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 14, color: 'var(--onyx)' }}>{o.total}</strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#276749', fontWeight: 600 }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-secondary">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Order Details */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 560, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              Order {selectedOrder.id}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20 }}>Placed on {selectedOrder.date}</p>

            <div style={{ background: 'var(--cream)', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 6px 0' }}><strong>Customer:</strong> {selectedOrder.customer} ({selectedOrder.email})</p>
              <p style={{ margin: '0 0 6px 0' }}><strong>Shipping:</strong> Sydney, New South Wales, Australia</p>
              <p style={{ margin: '0 0 6px 0' }}><strong>Payment Gateway:</strong> Stripe Encrypted Gateway (Status: Paid)</p>
              <p style={{ margin: 0 }}><strong>Transaction ID:</strong> <code>tx_stripe_{selectedOrder.id.replace('#', '')}</code></p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px 0' }}>Item Breakdown</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>1x {selectedOrder.product || 'Fine Gold-Plated Jewellery'}</span>
                <strong>{selectedOrder.total}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  cycleOrderStatus(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="btn-primary"
              >
                Update Lifecycle Status ({selectedOrder.status})
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Hero Banner Slide */}
      {showHeroModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 540, width: '95%', padding: 'clamp(16px, 4vw, 24px)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, marginBottom: 16, color: 'var(--onyx)' }}>
              Add Homepage Hero Banner Slide
            </h3>

            <form onSubmit={e => {
              e.preventDefault();
              if (!heroForm.image.trim()) {
                showToast('Hero image URL is mandatory.', 'alert');
                return;
              }
              saveHeroSlide(heroForm);
              setShowHeroModal(false);
              setHeroForm({
                tagline: 'THE NEW COLLECTION', title: 'Elegance in Every Detail', description: 'Hand-crafted anti-tarnish gold-plated jewellery.', image: '', ctaText: 'SHOP NOW', ctaLink: '/shop'
              });
              showToast('New hero slide added to homepage slider!', 'check');
            }}>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>IMAGE URL *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={heroForm.image}
                  onChange={e => setHeroForm({ ...heroForm, image: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>TAGLINE / SUBTITLE</label>
                <input
                  type="text"
                  className="form-control"
                  value={heroForm.tagline}
                  onChange={e => setHeroForm({ ...heroForm, tagline: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>MAIN TITLE</label>
                <input
                  type="text"
                  className="form-control"
                  value={heroForm.title}
                  onChange={e => setHeroForm({ ...heroForm, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>DESCRIPTION</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={heroForm.description}
                  onChange={e => setHeroForm({ ...heroForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>CTA BUTTON TEXT</label>
                  <input
                    type="text"
                    className="form-control"
                    value={heroForm.ctaText}
                    onChange={e => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>CTA BUTTON LINK</label>
                  <input
                    type="text"
                    className="form-control"
                    value={heroForm.ctaLink}
                    onChange={e => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowHeroModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Hero Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
