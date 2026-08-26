import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
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
    <footer className="site-footer" id="footer-root">
      <div className="footer-inner container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-name">ABEL'S</span>
              <span className="logo-tagline">BY LINCY</span>
            </div>
            <p className="footer-about">
              Sydney's premier destination for hand-crafted fine gold-plated jewellery. Every piece tells a story of artisanal elegance and timeless beauty.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://wa.me/61435927824" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="WhatsApp">
                <img src="/assets/whatsapp.png" alt="WhatsApp" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/collections">Collections</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=rings">Rings</Link></li>
              <li><Link to="/shop?category=necklaces">Necklaces</Link></li>
              <li><Link to="/shop?category=earrings">Earrings</Link></li>
              <li><Link to="/shop?category=bracelets">Bracelets</Link></li>
              <li><Link to="/shop?category=bangles">Bangles</Link></li>
              <li><Link to="/shop?category=charms">Charms</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Policies</h4>
            <ul className="footer-links">
              <li><Link to="/policy?tab=privacy">Privacy Policy</Link></li>
              <li><Link to="/policy?tab=terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/policy?tab=shipping">Shipping Policy</Link></li>
              <li><Link to="/policy?tab=refunds">Returns &amp; Refunds</Link></li>
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">Get in Touch</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin style={{ width: 15, height: 15 }} />
                <span>Sydney, NSW, Australia</span>
              </li>
              <li>
                <Phone style={{ width: 15, height: 15 }} />
                <a href="tel:+61435927824">+61 435 927 824</a>
              </li>
              <li>
                <Mail style={{ width: 15, height: 15 }} />
                <a href="mailto:lincytitus8@gmail.com">lincytitus8@gmail.com</a>
              </li>
            </ul>

            <h4 className="footer-col-title" style={{ marginTop: 20 }}>Join the Circle</h4>
            <form onSubmit={handleSubmit} className="footer-newsletter">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <Send style={{ width: 15, height: 15 }} />
              </button>
            </form>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Abel's By Lincy. All rights reserved.</p>
          <p className="footer-bottom-right">
            Designed with ♥ in Sydney · <a href="https://wa.me/61435927824" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
