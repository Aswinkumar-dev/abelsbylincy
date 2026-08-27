import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingBag, Heart, Award, Eye, EyeOff, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AccountPage() {
  const { currentUser, loginWithEmail, registerUser, loginWithGoogle, logoutUser, orders, wishlist } = useStore();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Inline Validation Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  // Animation shake state
  const [isShaking, setIsShaking] = useState(false);

  const userOrders = orders.filter(o => o.email?.toLowerCase() === currentUser?.email?.toLowerCase() || currentUser);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setEmailError('');
    setPasswordError('');
    setNameError('');
  };

  // Validation Helpers
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  const validatePassword = (pass) => {
    if (
      !pass ||
      pass.length < 8 ||
      !/[A-Z]/.test(pass) ||
      !/[0-9]/.test(pass) ||
      !/[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]]/.test(pass)
    ) {
      return 'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.';
    }
    return null;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    let valid = true;
    if (!validateEmail(loginEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    const passErr = validatePassword(loginPassword);
    if (passErr) {
      setPasswordError(passErr);
      valid = false;
    }

    if (!valid) {
      triggerShake();
      return;
    }

    const success = loginWithEmail(loginEmail, loginPassword);
    if (!success) {
      setPasswordError('Invalid email or password credentials.');
      triggerShake();
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');

    let valid = true;
    if (!regName.trim()) {
      setNameError('Please enter your full name.');
      valid = false;
    }
    if (!validateEmail(regEmail)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    const passErr = validatePassword(regPassword);
    if (passErr) {
      setPasswordError(passErr);
      valid = false;
    }

    if (!valid) {
      triggerShake();
      return;
    }

    const success = registerUser(regName.trim(), regEmail.trim(), regPassword);
    if (!success) {
      setEmailError('An account with this email address already exists.');
      triggerShake();
    }
  };

  // ============================================================
  // GUEST VIEW: Floating Gold Login Card on Clean Off-White Page Background
  // ============================================================
  if (!currentUser) {
    return (
      <>
        <style>{`
          @keyframes floatCard {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes cardShake {
            0%, 100% { transform: translateX(0px); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .floating-auth-card {
            animation: floatCard 4.5s ease-in-out infinite;
          }
          .floating-auth-card.shake {
            animation: cardShake 0.35s ease-in-out !important;
          }
        `}</style>

        <div style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF9F6',
          padding: '32px 16px',
          boxSizing: 'border-box'
        }}>
          {/* Floating Card with Gold Theme & Shadow & Shake Animation */}
          <div className={`floating-auth-card${isShaking ? ' shake' : ''}`} style={{
            width: '100%',
            maxWidth: 440,
            background: 'linear-gradient(135deg, #FAF4E8 0%, #F5E6CC 100%)',
            borderRadius: 20,
            padding: '40px 32px',
            boxShadow: '0 24px 60px rgba(184, 134, 11, 0.25), 0 12px 28px rgba(0, 0, 0, 0.08)',
            border: '1.5px solid #D4AF37',
            position: 'relative'
          }}>
            {/* Brand Logo Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--onyx)', margin: '0 0 4px 0' }}>
                ABEL'S
              </h1>
              <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                BY LINCY
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: 'rgba(212, 175, 55, 0.12)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: 8,
                  background: authMode === 'login' ? '#D4AF37' : 'transparent',
                  color: authMode === 'login' ? '#FFFFFF' : 'var(--onyx)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: 8,
                  background: authMode === 'register' ? '#D4AF37' : 'transparent',
                  color: authMode === 'register' ? '#FFFFFF' : 'var(--onyx)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {authMode === 'login' ? (
              <form noValidate onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setEmailError(''); }}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: emailError ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: 'var(--onyx)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {emailError && (
                    <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0' }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setPasswordError(''); }}
                      style={{
                        width: '100%',
                        height: 48,
                        padding: '0 44px 0 16px',
                        borderRadius: 8,
                        border: passwordError ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
                        background: '#FFFFFF',
                        fontSize: 14,
                        color: 'var(--onyx)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
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
                        color: 'var(--slate)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0' }}>
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: 50,
                    background: 'var(--onyx)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  SUBMIT
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(212, 175, 55, 0.3)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.1em' }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(212, 175, 55, 0.3)' }} />
                </div>

                <button
                  type="button"
                  onClick={loginWithGoogle}
                  style={{
                    width: '100%',
                    height: 48,
                    background: '#FFFFFF',
                    color: 'var(--onyx)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  Continue with Google
                </button>
              </form>
            ) : (
              /* Register Form */
              <form noValidate onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => { setRegName(e.target.value); setNameError(''); }}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: nameError ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: 'var(--onyx)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {nameError && (
                    <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0' }}>
                      {nameError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => { setRegEmail(e.target.value); setEmailError(''); }}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: emailError ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: 'var(--onyx)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {emailError && (
                    <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0' }}>
                      {emailError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => { setRegPassword(e.target.value); setPasswordError(''); }}
                      style={{
                        width: '100%',
                        height: 48,
                        padding: '0 44px 0 16px',
                        borderRadius: 8,
                        border: passwordError ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
                        background: '#FFFFFF',
                        fontSize: 14,
                        color: 'var(--onyx)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
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
                        color: 'var(--slate)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0' }}>
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: 50,
                    background: 'var(--onyx)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  SUBMIT
                </button>
              </form>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/" style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                ← Return to Store
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // LOGGED IN VIEW (Standard Account Dashboard)
  // ============================================================
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
