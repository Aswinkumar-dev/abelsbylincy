import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Heart, Award, Eye, EyeOff, LogOut, Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AccountPage() {
  const { currentUser, loginWithEmail, registerUser, loginWithGoogle, logoutUser, orders, wishlist, formatMoney, showToast } = useStore();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const userOrders = orders.filter(o => o.email?.toLowerCase() === currentUser?.email?.toLowerCase() || currentUser);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginWithEmail(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    registerUser(regName, regEmail, regPassword);
  };

  // If GUEST (Not logged in) -> Full Auth Overlay / Form
  if (!currentUser) {
    return (
      <div className="account-guest-wrapper">
        <div className="account-auth-card">
          <div className="auth-brand">
            <span className="logo-name">ABEL'S</span>
            <span className="logo-tagline">BY LINCY · SYDNEY</span>
          </div>

          {/* Mode Switcher */}
          <div className="auth-tab-group">
            <button
              className={`auth-tab-btn${authMode === 'login' ? ' active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn${authMode === 'register' ? ' active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="client@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(s => !s)}
                  >
                    {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Sign In to Account <ArrowRight style={{ width: 14 }} />
              </button>

              <div className="auth-divider"><span>OR</span></div>

              <button
                type="button"
                className="btn-google-auth"
                onClick={loginWithGoogle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                Continue with Google
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Sarah Mitchell"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="client@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(s => !s)}
                  >
                    {showPassword ? <EyeOff style={{ width: 16 }} /> : <Eye style={{ width: 16 }} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Create Atelier Account <ArrowRight style={{ width: 14 }} />
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textCenter: 'center', fontSize: 12, color: 'var(--slate)', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>← Return to Storefront</Link>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Welcome Back</p>
          <h1>{currentUser.name}</h1>
        </div>
      </div>

      <div className="container account-dashboard-layout">
        {/* Sidebar Nav */}
        <aside className="account-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">{currentUser.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="user-profile-name">{currentUser.name}</p>
              <p className="user-profile-email">{currentUser.email}</p>
              <span className="user-tier-badge">{currentUser.status || 'Privilege Client'}</span>
            </div>
          </div>

          <nav className="account-nav">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <User style={{ width: 16 }} /> },
              { id: 'orders', label: 'Order History', icon: <ShoppingBag style={{ width: 16 }} /> },
              { id: 'wishlist', label: 'Wishlist', icon: <Heart style={{ width: 16 }} /> },
            ].map(tab => (
              <button
                key={tab.id}
                className={`account-nav-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <button className="account-nav-btn" style={{ color: 'var(--danger)' }} onClick={logoutUser}>
              <LogOut style={{ width: 16 }} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="account-main">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="account-section-title">Account Overview</h2>

              <div className="account-kpi-grid">
                <div className="account-kpi-card">
                  <ShoppingBag style={{ width: 22, height: 22, color: 'var(--gold)', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Total Orders</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--onyx)' }}>{userOrders.length}</p>
                </div>
                <div className="account-kpi-card">
                  <Heart style={{ width: 22, height: 22, color: 'var(--gold)', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Wishlist Items</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--onyx)' }}>{wishlist.length}</p>
                </div>
                <div className="account-kpi-card">
                  <Award style={{ width: 22, height: 22, color: 'var(--gold)', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Privilege Tier</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)' }}>{currentUser.status || 'Silver'}</p>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, margin: '28px 0 16px' }}>Recent Orders</h3>
              {userOrders.length === 0 ? (
                <p style={{ color: 'var(--slate)', fontSize: 14 }}>No recent orders. <Link to="/shop" style={{ color: 'var(--gold)' }}>Start shopping →</Link></p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order Ref</th><th>Piece</th><th>Date</th><th>Status</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {userOrders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.id}</td>
                          <td>{o.product || 'Fine Jewellery'}</td>
                          <td>{o.date}</td>
                          <td><span className={`status-badge status-${(o.status || 'delivered').toLowerCase()}`}>{o.status}</span></td>
                          <td style={{ fontWeight: 600 }}>{o.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="account-section-title">Order History ({userOrders.length})</h2>
              {userOrders.length === 0 ? (
                <p style={{ color: 'var(--slate)' }}>No orders placed yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order Ref</th><th>Piece</th><th>Date</th><th>Status</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {userOrders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.id}</td>
                          <td>{o.product || 'Fine Jewellery'}</td>
                          <td>{o.date}</td>
                          <td><span className={`status-badge status-${(o.status || 'delivered').toLowerCase()}`}>{o.status}</span></td>
                          <td style={{ fontWeight: 600 }}>{o.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="account-section-title">My Saved Pieces</h2>
              <Link to="/wishlist" className="btn-primary" style={{ display: 'inline-flex' }}>
                Go to Full Wishlist Page →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
