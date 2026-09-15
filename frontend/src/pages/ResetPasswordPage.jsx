import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const { resetUserPassword } = useStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]]/.test(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      setErrorMsg('Please meet all the password security requirements below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetUserPassword(token, newPassword, email);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAF9F6',
      padding: '40px 16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'linear-gradient(135deg, #FAF4E8 0%, #F5E6CC 100%)',
        borderRadius: 20,
        padding: '40px 32px',
        boxShadow: '0 24px 60px rgba(184, 134, 11, 0.22), 0 12px 28px rgba(0, 0, 0, 0.08)',
        border: '1.5px solid #D4AF37',
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--onyx)', margin: '0 0 4px 0' }}>
            ABEL'S
          </h1>
          <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600, margin: 0 }}>
            BY LINCY
          </p>
        </div>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#ECFDF5',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle style={{ width: 32, height: 32, color: '#059669' }} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--onyx)', margin: '0 0 10px 0' }}>
              Password Reset Complete!
            </h2>
            <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Your password has been successfully updated. Your saved items and shopping bag have been preserved.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/account?email=${encodeURIComponent(email)}&resetSuccess=true`)}
              style={{
                width: '100%',
                height: 50,
                background: 'var(--onyx)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              Sign In to Your Account <ArrowRight style={{ width: 16, height: 16 }} />
            </button>

            <div style={{ marginTop: 20 }}>
              <Link to="/" style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                ← Return to Store
              </Link>
            </div>
          </div>
        ) : (
          /* RESET FORM */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto'
              }}>
                <Lock style={{ width: 20, height: 20, color: 'var(--gold-dark)' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--onyx)', margin: '0 0 6px 0' }}>
                Create New Password
              </h2>
              {email && (
                <p style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600, margin: 0 }}>
                  Account: {email}
                </p>
              )}
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle style={{ width: 16, height: 16, color: '#DC2626', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 600 }}>{errorMsg}</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                  NEW PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    placeholder="Enter new password"
                    onChange={e => { setNewPassword(e.target.value); setErrorMsg(''); }}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 44px 0 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(212, 175, 55, 0.4)',
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
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--onyx)', marginBottom: 6 }}>
                  CONFIRM NEW PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    placeholder="Re-enter new password"
                    onChange={e => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 44px 0 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: 'var(--onyx)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(s => !s)}
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
                    {showConfirmPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </div>

              {/* Security Checklist */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 22,
                border: '1px solid rgba(212, 175, 55, 0.25)'
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--onyx)', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password Requirements:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', fontSize: 11 }}>
                  <span style={{ color: hasMinLength ? '#059669' : 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasMinLength ? '✓' : '•'} 8+ Characters
                  </span>
                  <span style={{ color: hasUppercase ? '#059669' : 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasUppercase ? '✓' : '•'} 1 Uppercase (A-Z)
                  </span>
                  <span style={{ color: hasNumber ? '#059669' : 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasNumber ? '✓' : '•'} 1 Number (0-9)
                  </span>
                  <span style={{ color: hasSpecial ? '#059669' : 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hasSpecial ? '✓' : '•'} 1 Special Char (!@#)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: 50,
                  background: isLoading ? '#999' : 'var(--onyx)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    Updating Password...
                  </>
                ) : (
                  'UPDATE PASSWORD'
                )}
              </button>
            </form>

            <div style={{ marginTop: 22, textAlign: 'center' }}>
              <Link to="/account" style={{ fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                ← Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
