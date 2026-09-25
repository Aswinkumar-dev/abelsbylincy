import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, Heart, Award, Eye, EyeOff, LogOut, KeyRound, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function AccountPage() {
  const { currentUser, loginWithEmail, registerUser, loginWithGoogle, logoutUser, requestPasswordReset, orders, wishlist } = useStore();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState(() => searchParams.get('mode') === 'register' ? 'register' : 'login'); // 'login', 'register', or 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Redirect only if an explicit external target was requested via ?redirect= (e.g. /checkout)
  useEffect(() => {
    if (currentUser) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath && redirectPath !== '/account') {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [currentUser, navigate, searchParams]);

  // Form states
  const [loginEmail, setLoginEmail] = useState(() => searchParams.get('email') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState(() => searchParams.get('email') || '');

  // Forgot password state
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');
  const [resetSuccessBanner, setResetSuccessBanner] = useState(() => searchParams.get('resetSuccess') === 'true');

  // Inline Validation Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  // Animation shake state
  const [isShaking, setIsShaking] = useState(false);

  const userOrders = orders.filter(o => {
    const userEmail = (currentUser?.email || '').trim().toLowerCase();
    const oEmail = (o.email || o.customerEmail || o.guest_email || o.shippingAddress?.email || (typeof o.customer === 'object' && o.customer?.email) || '').trim().toLowerCase();
    return userEmail && oEmail === userEmail;
  });

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setForgotErrorMsg('');
    setForgotSuccess(false);
    if (mode === 'forgot' && loginEmail) {
      setForgotEmail(loginEmail);
    }
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

  const handleLoginSubmit = async (e) => {
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

    const success = await loginWithEmail(loginEmail, loginPassword);
    if (!success) {
      setPasswordError('Invalid email or password credentials.');
      triggerShake();
    } else {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath && redirectPath !== '/account') {
        navigate(redirectPath, { replace: true });
      }
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath && redirectPath !== '/account') {
        navigate(redirectPath, { replace: true });
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setForgotErrorMsg('');
    setForgotSuccess(false);

    if (!validateEmail(forgotEmail)) {
      setEmailError('Please enter a valid email address.');
      triggerShake();
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await requestPasswordReset(forgotEmail.trim());
      if (res.success) {
        setForgotSuccess(true);
        setForgotSuccessMsg(res.message || 'Please check your inbox and spam folder.');
      } else {
        setForgotErrorMsg(res.message || 'Failed to send password reset email.');
        triggerShake();
      }
    } catch (err) {
      setForgotErrorMsg('An unexpected error occurred. Please try again.');
      triggerShake();
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
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

    const success = await registerUser(regName.trim(), regEmail.trim(), regPassword);
    if (!success) {
      setEmailError('An account with this email address already exists.');
      triggerShake();
    } else {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath && redirectPath !== '/account') {
        navigate(redirectPath, { replace: true });
      }
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
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--onyx)', margin: '0 0 4px 0' }}>
                ABEL'S
              </h1>
              <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                BY LINCY
              </p>
            </div>

            {/* Post-Password Reset Success Banner */}
            {resetSuccessBanner && authMode === 'login' && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <CheckCircle style={{ width: 18, height: 18, color: '#059669', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.4 }}>
                  <strong>Password Updated Successfully!</strong><br />
                  Please sign in with your email and new password.
                </div>
              </div>
            )}

            {/* Mode Switcher Tabs (Only shown when not in forgot password mode) */}
            {authMode !== 'forgot' ? (
              <div style={{ display: 'flex', background: 'rgba(212, 175, 55, 0.12)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
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
                  Login
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
            ) : null}

            {/* View 1: Sign In Form */}
            {authMode === 'login' && (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', margin: 0 }}>
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--gold-dark)',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
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
                  onClick={handleGoogleLogin}
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
            )}

            {/* View 2: Forgot Password Form */}
            {authMode === 'forgot' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }}>
                    <KeyRound style={{ width: 22, height: 22, color: 'var(--gold-dark)' }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)', margin: '0 0 6px 0' }}>
                    Reset Password
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0, lineHeight: 1.5 }}>
                    Enter your email to receive a secure link to reset your password. (Max 3 reset requests per day).
                  </p>
                </div>

                {forgotSuccess ? (
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 10,
                    padding: '16px',
                    textAlign: 'center',
                    marginBottom: 20
                  }}>
                    <CheckCircle style={{ width: 28, height: 28, color: '#059669', margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#065F46', margin: '0 0 4px 0' }}>
                      Reset Email Sent!
                    </p>
                    <p style={{ fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.4 }}>
                      {forgotSuccessMsg}
                    </p>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleForgotSubmit}>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        placeholder="Enter your registered email"
                        onChange={e => { setForgotEmail(e.target.value); setEmailError(''); setForgotErrorMsg(''); }}
                        style={{
                          width: '100%',
                          height: 48,
                          padding: '0 16px',
                          borderRadius: 8,
                          border: (emailError || forgotErrorMsg) ? '1.5px solid #D9534F' : '1px solid rgba(212, 175, 55, 0.4)',
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
                      {forgotErrorMsg && (
                        <p style={{ color: '#D9534F', fontSize: 12, marginTop: 6, fontWeight: 600, margin: '6px 0 0 0', lineHeight: 1.4 }}>
                          {forgotErrorMsg}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      style={{
                        width: '100%',
                        height: 50,
                        background: isForgotLoading ? '#999' : 'var(--onyx)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        cursor: isForgotLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {isForgotLoading ? (
                        <>
                          <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                          Sending...
                        </>
                      ) : (
                        'SEND RESET LINK'
                      )}
                    </button>
                  </form>
                )}

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--onyx)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* View 3: Register Form */}
            {authMode === 'register' && (
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

            {authMode !== 'forgot' && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link to="/" style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                  ← Return to Store
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // LOGGED IN VIEW (Luxury Account Dashboard)
  // ============================================================
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Client Portal</p>
          <h1>Welcome, {currentUser.name || currentUser.firstName || 'Valued Client'}</h1>
        </div>
      </div>

      <div className="container account-dashboard-layout" style={{ marginTop: 40, marginBottom: 80 }}>
        {/* Sidebar Nav */}
        <aside className="account-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="user-profile-name">{currentUser.name || 'Member'}</p>
              <p className="user-profile-email">{currentUser.email}</p>
              <span className="user-tier-badge">
                {currentUser.provider === 'google' ? 'Google Verified' : (currentUser.status || 'Active Client')}
              </span>
            </div>
          </div>

          <nav className="account-nav" style={{ marginTop: 24 }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: <User style={{ width: 16 }} /> },
              { id: 'orders', label: `My Orders (${userOrders.length})`, icon: <ShoppingBag style={{ width: 16 }} /> },
              { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: <Heart style={{ width: 16 }} /> },
            ].map(tab => (
              <button
                key={tab.id}
                className={`account-nav-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <button className="account-nav-btn" style={{ color: 'var(--danger)', marginTop: 8 }} onClick={logoutUser}>
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
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Wishlist Pieces</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--onyx)' }}>{wishlist.length}</p>
                </div>
                <div className="account-kpi-card">
                  <Award style={{ width: 22, height: 22, color: 'var(--gold)', marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: 'var(--slate)' }}>Client Status</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--onyx)' }}>
                    {currentUser.provider === 'google' ? 'Google Client' : 'VIP Member'}
                  </p>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, margin: '32px 0 16px', color: 'var(--onyx)' }}>Recent Orders</h3>
              {userOrders.length === 0 ? (
                <div style={{ background: '#FAF9F6', border: '1px dashed var(--border)', borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
                  <ShoppingBag style={{ width: 36, height: 36, color: 'var(--slate)', margin: '0 auto 12px auto' }} />
                  <p style={{ color: 'var(--onyx)', fontWeight: 600, marginBottom: 6 }}>No orders placed yet</p>
                  <p style={{ color: 'var(--slate)', fontSize: 13, marginBottom: 16 }}>Explore our handcrafted gold-plated jewellery collection.</p>
                  <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex' }}>
                    Shop Collection →
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.slice(0, 5).map(o => (
                        <tr key={o.id || o.order_number}>
                          <td style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>#{o.order_number || o.id}</td>
                          <td>{o.date || 'Recent'}</td>
                          <td>
                            <span className={`status-badge status-${(o.status || 'confirmed').toLowerCase()}`}>
                              {o.status || 'Confirmed'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{o.total || (o.rawAmount ? `$${o.rawAmount.toFixed(2)}` : '$0.00')}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setActiveTab('orders')}
                              style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
                            >
                              View Details →
                            </button>
                          </td>
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
                <div style={{ background: '#FAF9F6', border: '1px dashed var(--border)', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
                  <ShoppingBag style={{ width: 40, height: 40, color: 'var(--slate)', margin: '0 auto 12px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--onyx)' }}>You have no orders yet</h4>
                  <p style={{ color: 'var(--slate)', fontSize: 13, marginBottom: 18 }}>When you place an order, its details and delivery tracking will appear here.</p>
                  <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex' }}>
                    Discover Jewellery
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {userOrders.map(o => (
                    <div key={o.id || o.order_number} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 20, background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingBottom: 14, borderBottom: '1px solid #F3EFEA' }}>
                        <div>
                          <span style={{ fontSize: 12, color: 'var(--slate)' }}>Order Reference</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'var(--onyx)' }}>#{o.order_number || o.id}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: 12, color: 'var(--slate)' }}>Date Placed</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: 600, color: 'var(--onyx)' }}>{o.date || 'Recent'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: 12, color: 'var(--slate)' }}>Total Amount</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'var(--gold-dark)' }}>{o.total || (o.rawAmount ? `$${o.rawAmount.toFixed(2)}` : '$0.00')}</p>
                        </div>
                        <div>
                          <span className={`status-badge status-${(o.status || 'confirmed').toLowerCase()}`}>
                            {o.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {Array.isArray(o.items) && o.items.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            Purchased Items ({o.items.length})
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {o.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--onyx)', fontWeight: 500 }}>
                                  {item.quantity || 1}x {item.name || item.title || 'Fine Jewellery'}
                                  {item.size ? ` (Size: ${item.size})` : ''}
                                  {item.color ? ` (Color: ${item.color})` : ''}
                                </span>
                                <span style={{ fontWeight: 600, color: 'var(--onyx)' }}>
                                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {o.trackingNumber && (
                        <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, fontSize: 12.5, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🚚 <strong>Australia Post Tracking:</strong> {o.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="account-section-title">My Saved Pieces ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <div style={{ background: '#FAF9F6', border: '1px dashed var(--border)', borderRadius: 10, padding: '40px 20px', textAlign: 'center' }}>
                  <Heart style={{ width: 40, height: 40, color: 'var(--slate)', margin: '0 auto 12px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--onyx)' }}>Your wishlist is empty</h4>
                  <p style={{ color: 'var(--slate)', fontSize: 13, marginBottom: 18 }}>Save items you love and find them stored here in your account across all devices.</p>
                  <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex' }}>
                    Discover Jewellery
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 20 }}>
                    You have <strong>{wishlist.length}</strong> piece{wishlist.length > 1 ? 's' : ''} saved to your account.
                  </p>
                  <Link to="/wishlist" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Heart style={{ width: 16 }} /> Open Full Wishlist Page
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
