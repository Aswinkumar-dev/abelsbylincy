import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { handleNewsletter } = useStore();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    handleNewsletter(email);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      {/* Newsletter Signup Section */}
      <div className="footer-newsletter">
        <div className="container">
          <p style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Exclusive Privileges</p>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 500, marginBottom: 12 }}>Join the Abel’s By Lincy Circle</h3>
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', maxWidth: 500, margin: '0 auto' }}>Receive preview access to new anti-tarnish gold-plated collections, special offers, and styling inspirations.</p>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
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
                <p><strong>Hours:</strong> Mon–Fri 9am–5pm AEST</p>
              </div>
            </div>

          </div>

          {/* Footer Bottom Note */}
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Abel's By Lincy. All rights reserved by <a href="https://webgrat.com" target="_blank" rel="noopener noreferrer" className="webgrat-link">webgrat</a></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Encrypted 256-bit SSL Checkout</span>
              <ShieldCheck style={{ width: 16, height: 16, color: 'var(--gold)' }} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
