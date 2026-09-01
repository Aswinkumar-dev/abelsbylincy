import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { handleNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const res = handleNewsletter(trimmed);
    if (res && res.success) {
      setSuccessMsg(res.message);
      setEmail('');
    } else if (res && !res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <footer className="site-footer">
      {/* Newsletter Signup Section */}
      <div className="footer-newsletter">
        <div className="container">
          <p style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Exclusive Privileges</p>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 500, marginBottom: 12 }}>Join the Abel’s By Lincy Circle</h3>
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', maxWidth: 500, margin: '0 auto' }}>Receive preview access to new collections, special offers, and styling inspirations.</p>

          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              className="newsletter-input"
              style={{ borderColor: errorMsg ? '#fc8181' : undefined }}
              placeholder="Enter your email address"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
                if (successMsg) setSuccessMsg('');
              }}
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>

          {/* Validation Error Message */}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: '#fc8181', fontSize: 13, fontWeight: 500 }}>
              <AlertCircle style={{ width: 16, height: 16 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Acknowledgment Notification & Simulated Email Confirmation */}
          {successMsg && (
            <div style={{ background: 'rgba(212, 175, 55, 0.12)', border: '1px solid var(--gold)', borderRadius: 8, padding: '14px 18px', maxWidth: 560, margin: '16px auto 0 auto', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4, color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>
                <CheckCircle2 style={{ width: 18, height: 18 }} />
                <span>Subscription Confirmed!</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: 1.5 }}>
                {successMsg}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Main Navigation */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Brand Bio */}
            <div className="footer-col">
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--cloud-white)' }}>ABEL’S</span><br />
                <span style={{ fontSize: 10, letterSpacing: '0.35em', color: 'var(--gold)', fontWeight: 600 }}>BY LINCY</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.65)', marginBottom: 20 }}>
                Anti-tarnish gold-plated jewellery crafted for everyday wear. Beautiful, affordable, and built to last — born in Sydney, treasured across Australia.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://www.instagram.com/abels_by_lincy/" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.facebook.com/lincy.titus.9" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div className="footer-col">
              <h5>Shop Jewellery</h5>
              <ul className="footer-links">
                <li><Link to="/shop?category=earrings">Earrings</Link></li>
                <li><Link to="/shop?category=bangles">Bangles</Link></li>
                <li><Link to="/shop?category=rings">Rings</Link></li>
                <li><Link to="/shop?category=bracelets">Bracelets</Link></li>
                <li><Link to="/shop?category=necklaces">Necklaces</Link></li>
                <li><Link to="/shop?category=charms">Charms</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="footer-col">
              <h5>Customer Care</h5>
              <ul className="footer-links">
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/policy?tab=shipping">Shipping &amp; Delivery Policy</Link></li>
                <li><Link to="/policy?tab=refunds">Returns &amp; Refund Policy</Link></li>
                <li><Link to="/policy?tab=privacy">Privacy Policy</Link></li>
                <li><Link to="/policy?tab=terms">Terms &amp; Conditions</Link></li>
              </ul>
            </div>

            {/* Atelier Contact Details */}
            <div className="footer-col">
              <h5>Get In Touch</h5>
              <div className="footer-contact-info">
                <p><strong>Email:</strong> <a href="mailto:lincytitus8@gmail.com" style={{ color: 'var(--cloud-white)' }}>lincytitus8@gmail.com</a></p>
                <p><strong>Phone:</strong> +61 435 927 824</p>
              </div>
            </div>

          </div>

          {/* Footer Bottom Note */}
          <div className="footer-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ margin: 0 }}>© {new Date().getFullYear()} Abel's By Lincy. All rights reserved.</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                Website by{' '}
                <a href="https://webgrat.com" target="_blank" rel="noopener noreferrer" className="webgrat-link">
                  Webgrat
                </a>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure SSL/TLS Checkout</span>
              <ShieldCheck style={{ width: 16, height: 16, color: 'var(--gold)' }} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
