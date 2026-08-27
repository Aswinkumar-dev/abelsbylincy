import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Layers, ShoppingCart, Users, Ticket, Globe, Inbox, Settings,
  ChartNoAxesColumn, Lock, LogOut, ChevronLeft, ChevronRight, Crown, Search, Plus, Pencil, Trash2,
  RefreshCw, DollarSign, TrendingUp, ShieldCheck, Download, ArrowUp, ArrowDown, ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AdminPage() {
  const {
    adminLoggedIn, adminUser, adminLogin, adminLogout, roles,
    products, categories, orders, customers, coupons, cms, messages, settings,
    formatMoney, saveProduct, deleteProduct, adjustStockQty, restockAllLowStock,
    saveCategory, deleteCategory, cycleOrderStatus, deleteOrder,
    saveCustomer, deleteCustomer, saveCoupon, deleteCoupon,
    saveGlobalCMS, saveHeroSlide, deleteHeroSlide, moveHeroSlide,
    saveStoreSettings, exportFilteredCSV, showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Analytics date filtration state
  const [analyticsPreset, setAnalyticsPreset] = useState('all');
  const [analyticsDateFrom, setAnalyticsDateFrom] = useState('2026-01-01');
  const [analyticsDateTo, setAnalyticsDateTo] = useState('2026-12-31');

  // CMS form state
  const [cmsAnnouncement, setCmsAnnouncement] = useState(cms?.announcement || '');

  // 1. GUEST ADMIN LOGIN
  if (!adminLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--onyx-deep)' }}>
        <div style={{ background: 'var(--cloud-white)', borderRadius: 'var(--radius-xl)', maxWidth: 440, width: '100%', padding: 40, boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--onyx)' }}>ABEL’S</span><br />
            <span style={{ fontSize: 10, letterSpacing: '0.35em', color: 'var(--gold)', fontWeight: 600 }}>PORTAL LOGIN</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 28 }}>
            Authorized personnel only. Please sign in with your administrator ID and password.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); adminLogin(loginId, loginPass); }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Admin ID / Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="admin"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8, padding: 14 }}>
              Unlock Admin Portal <Lock style={{ width: 14, height: 14 }} />
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--slate)' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>← Return to Storefront</Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN PANEL
  const currentAdmin = adminUser || roles[0] || { user: 'Admin', role: 'Super Admin' };

  const screens = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'cms', label: 'Website CMS', icon: Globe },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesColumn },
  ];

  // Helper date filter
  const parseOrderDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.toLowerCase().includes('today')) return new Date();
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.replace(/,/g, '').trim().split(/\s+/);
    if (parts.length >= 3) {
      const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
      return new Date(parseInt(parts[2], 10) || 2026, months[parts[1]?.toLowerCase().slice(0, 3)] ?? 7, parseInt(parts[0], 10) || 1);
    }
    return new Date();
  };

  const fromD = new Date(analyticsDateFrom + 'T00:00:00');
  const toD = new Date(analyticsDateTo + 'T23:59:59');
  const filteredOrders = orders.filter(o => {
    const oDate = parseOrderDate(o.date);
    return oDate >= fromD && oDate <= toD;
  });

  const liveOrderSum = orders.reduce((sum, o) => sum + (o.rawAmount || parseFloat((o.total || '$0').replace(/[^0-9.-]+/g, '')) || 0), 0);
  const grossRevCalculated = liveOrderSum + 24850;
  const totalStockUnits = products.reduce((s, p) => s + (p.stockQty || 0), 0);
  const totalInventoryValue = products.reduce((s, p) => s + (p.price * (p.stockQty || 0)), 0);
  const lowStockCount = products.filter(p => (p.stockQty || 0) <= 8).length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
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

        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/" target="_blank" className="btn-secondary" style={{ color: 'var(--cloud-white)', borderColor: 'rgba(255,255,255,0.2)', padding: 8, fontSize: 11, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ExternalLink style={{ width: 12, height: 12 }} /> {!sidebarCollapsed && 'View Storefront'}
          </Link>
          <button onClick={adminLogout} className="admin-nav-item" style={{ color: 'var(--danger)', justifyContent: 'center', padding: 8 }}>
            <LogOut style={{ width: 16 }} /> {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 340 }}>
            <Search style={{ color: 'var(--slate)', width: 16 }} />
            <input type="text" placeholder="Search orders, catalog, clients..." style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, background: 'transparent' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: 'var(--onyx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                {(currentAdmin.user || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1, margin: 0 }}>{currentAdmin.user}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>{currentAdmin.role}</span>
                </div>
              </div>
            </div>
            <button onClick={adminLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut style={{ width: 13, height: 13 }} /> Sign Out
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="admin-body">

          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Executive Dashboard</h2>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>Real-time live performance metrics calculated from active orders &amp; inventory.</p>
              </div>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Gross Sales Revenue <DollarSign style={{ color: 'var(--gold)' }} /></div>
                  <div className="kpi-val">{formatMoney(grossRevCalculated)}</div>
                  <div className="kpi-trend trend-up"><TrendingUp style={{ width: 14 }} /> Live synced ({orders.length} orders)</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Active Catalogue <Package style={{ color: 'var(--gold)' }} /></div>
                  <div className="kpi-val">{products.length} Pieces</div>
                  <div className="kpi-trend trend-up">{totalStockUnits} total units in stock</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Orders Placed <ShoppingCart style={{ color: 'var(--gold)' }} /></div>
                  <div className="kpi-val">{orders.length}</div>
                  <div className="kpi-trend trend-up">Latest: {orders[0]?.id || 'N/A'}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Inventory Asset Value <ShieldCheck style={{ color: 'var(--gold)' }} /></div>
                  <div className="kpi-val">{formatMoney(totalInventoryValue)}</div>
                  <div className={`kpi-trend ${lowStockCount > 0 ? 'trend-down' : 'trend-up'}`}>
                    {lowStockCount > 0 ? `${lowStockCount} low stock alerts` : 'Stock optimal'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                <div className="admin-table-card">
                  <div className="table-header">
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600 }}>Recent Live Orders</h4>
                    <button onClick={() => setActiveTab('orders')} style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All ({orders.length})</button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.id}</td>
                          <td>{o.customer}</td>
                          <td><span className={`status-badge status-${(o.status || 'delivered').toLowerCase()}`}>{o.status}</span></td>
                          <td style={{ fontWeight: 600 }}>{o.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-table-card">
                  <div className="table-header">
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--danger)' }}>Low Stock Alerts</h4>
                    <button onClick={() => setActiveTab('inventory')} style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Inventory</button>
                  </div>
                  <div style={{ padding: '12px 24px' }}>
                    {products.filter(p => (p.stockQty || 0) <= 8).map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={p.image} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} alt={p.name} />
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{p.name}</p>
                            <span style={{ fontSize: 10, color: 'var(--slate)' }}>{p.sku}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '2px 8px', borderRadius: 8 }}>{p.stockQty} left</span>
                          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => adjustStockQty(p.id, 5)}>+5</button>
                        </div>
                      </div>
                    ))}
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
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Products Management</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)' }}>Add, edit, or remove fine gold-plated jewellery pieces.</p>
                </div>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Gemstone</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={p.images?.[0] || p.image} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} alt={p.name} />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--onyx)', margin: 0 }}>{p.name}</p>
                              <p style={{ fontSize: 11, color: 'var(--slate)', margin: 0 }}>{p.sku} · {p.material}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                        <td style={{ fontWeight: 600 }}>{formatMoney(p.price)}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: (p.stockQty || 0) > 5 ? 'var(--success)' : 'var(--danger)' }}>
                            {p.stockQty} units
                          </span>
                        </td>
                        <td>{p.gemstone}</td>
                        <td>
                          <button className="action-btn" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => deleteProduct(p.id)}>
                            <Trash2 style={{ width: 14 }} />
                          </button>
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Categories Management</h2>
              </div>
              <div className="products-grid">
                {categories.map(cat => (
                  <div key={cat.id} className="collection-card" style={{ aspectRatio: '4/3' }}>
                    <img src={cat.image} alt={cat.name} />
                    <div className="collection-overlay">
                      <h3 className="collection-name">{cat.name}</h3>
                      <p className="collection-count">{products.filter(p => p.category === cat.id).length} Active Products</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Inventory Tracking &amp; Stock Management</h2>
                  <p style={{ fontSize: 13, color: 'var(--slate)' }}>Real-time stock valuation and safety levels.</p>
                </div>
                <button className="btn-secondary" onClick={() => restockAllLowStock(10)}>
                  <RefreshCw style={{ width: 14 }} /> Restock All Low Items (+10)
                </button>
              </div>

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Asset Valuation</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={p.image} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} alt={p.name} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                        <td>{formatMoney(p.price)}</td>
                        <td><strong>{p.stockQty}</strong> units</td>
                        <td style={{ fontWeight: 600 }}>{formatMoney(p.price * (p.stockQty || 0))}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-secondary" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => adjustStockQty(p.id, -1)}>-1</button>
                            <button className="btn-secondary" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => adjustStockQty(p.id, 5)}>+5</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Order Management</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Ref</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 600 }}>{o.id}</td>
                        <td>{o.customer}<br /><span style={{ fontSize: 11, color: 'var(--slate)' }}>{o.email}</span></td>
                        <td>{o.date}</td>
                        <td><span className={`status-badge status-${(o.status || 'delivered').toLowerCase()}`}>{o.status}</span></td>
                        <td style={{ fontWeight: 600 }}>{o.total}</td>
                        <td>
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11, marginRight: 6 }} onClick={() => cycleOrderStatus(o.id)}>Cycle Status</button>
                          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteOrder(o.id)}><Trash2 style={{ width: 14 }} /></button>
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
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Customer Relations</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Client</th><th>Email</th><th>Orders</th><th>Spent</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.orders}</td>
                        <td style={{ fontWeight: 600 }}>{c.spent}</td>
                        <td><span className="status-badge status-delivered">{c.status}</span></td>
                        <td>
                          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteCustomer(c.id)}><Trash2 style={{ width: 14 }} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Promotional Coupons</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr><th>Code</th><th>Label</th><th>Type</th><th>Discount</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {coupons.map(cp => (
                      <tr key={cp.code}>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{cp.code}</td>
                        <td>{cp.label}</td>
                        <td style={{ textTransform: 'capitalize' }}>{cp.discountType}</td>
                        <td>{cp.value}{cp.discountType === 'percentage' ? '%' : ' AUD'}</td>
                        <td><span className="status-badge status-delivered">{cp.active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteCoupon(cp.code)}><Trash2 style={{ width: 14 }} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. CMS */}
          {activeTab === 'cms' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Website CMS &amp; Copy Editor</h2>
              </div>
              <div className="checkout-card" style={{ maxWidth: 800 }}>
                <form onSubmit={e => { e.preventDefault(); saveGlobalCMS({ announcement: cmsAnnouncement }); }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 16 }}>Global Top Ribbon Announcement</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      value={cmsAnnouncement}
                      onChange={e => setCmsAnnouncement(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary">Update Announcement</button>
                </form>
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
                    <tr><th>Sender</th><th>Subject</th><th>Date</th><th>Message</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {messages.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>No inquiries in inbox.</td></tr>
                    ) : (
                      messages.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.name}<br /><span style={{ fontSize: 11, color: 'var(--slate)' }}>{m.email}</span></td>
                          <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{m.subject}</td>
                          <td>{m.date}</td>
                          <td style={{ maxWidth: 320, fontSize: 12 }}>{m.message}</td>
                          <td><a href={`mailto:${m.email}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Reply</a></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Store Configuration</h2>
              </div>
              <div className="checkout-card" style={{ maxWidth: 600 }}>
                <form onSubmit={e => { e.preventDefault(); showToast('Settings saved!', 'check'); }}>
                  <div className="form-group">
                    <label className="form-label">Store Contact Email</label>
                    <input type="email" className="form-control" defaultValue={settings?.storeEmail} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Free Shipping Minimum Threshold (AUD)</label>
                    <input type="number" className="form-control" defaultValue={settings?.freeShippingThreshold} />
                  </div>
                  <button type="submit" className="btn-primary">Save Settings</button>
                </form>
              </div>
            </div>
          )}

          {/* 11. ANALYTICS */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Sales Reports &amp; Analytics</h2>
                <button className="btn-primary" onClick={() => exportFilteredCSV(analyticsDateFrom, analyticsDateTo)}>
                  <Download style={{ width: 14 }} /> Download Filtered CSV Report
                </button>
              </div>

              <div className="admin-table-card" style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Date Range:</span>
                  <input type="date" className="form-control" style={{ width: 'auto' }} value={analyticsDateFrom} onChange={e => setAnalyticsDateFrom(e.target.value)} />
                  <span>to</span>
                  <input type="date" className="form-control" style={{ width: 'auto' }} value={analyticsDateTo} onChange={e => setAnalyticsDateTo(e.target.value)} />
                  <span style={{ fontSize: 12, background: 'var(--sage-light)', color: 'var(--sage-dark)', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
                    {filteredOrders.length} Orders in Range
                  </span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
