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
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', maxWidth: 500, margin: '0 auto' }}>Receive preview access to new bespoke collections, private atelier showings, and styling inspirations.</p>

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
                <a href="https://wa.me/61435927824" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
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
