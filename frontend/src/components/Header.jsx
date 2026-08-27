import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { cart, wishlist, currentUser, cms, logoutUser } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;

  const announcements = (cms?.announcement || 'FREE AUSTRALIA-WIDE SHIPPING $60+ · ANTI-TARNISH GOLD-PLATED JEWELLERY · AFFORDABLE LUXURY · WATERPROOF EVERYDAY PIECES')
    .split('·').map(a => a.trim()).filter(Boolean);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setAnnouncementIdx(i => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, [announcements.length]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const activePage = location.pathname;

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar" aria-label="Store highlights">
        <div className="announcement-marquee">
          <div className="announcement-track">
            {[...announcements, ...announcements, ...announcements, ...announcements].map((text, i) => (
              <span key={i} className="announcement-item">{text}</span>
            ))}
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <div className="header-inner">

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-btn action-btn" onClick={() => setMobileOpen(s => !s)} aria-label="Toggle menu">
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="brand-logo-btn">
              <img src="/assets/logo.svg" alt="Abel's By Lincy Logo" className="brand-logo-img" />
            </Link>

            {/* Navigation Links */}
            <nav className="nav-links">
              <div className={`nav-item${activePage === '/' ? ' active' : ''}`}>
                <Link to="/">Home</Link>
              </div>

              <div className={`nav-item${activePage === '/shop' ? ' active' : ''}`}>
                <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Shop <ChevronDown style={{ width: 14, height: 14 }} />
                </Link>
                <div className="nav-dropdown">
                  <Link to="/shop?category=new-arrivals" className="dropdown-link">New Arrivals</Link>
                  <Link to="/shop?category=best-sellers" className="dropdown-link">Best Sellers</Link>
                  <Link to="/shop?category=necklaces" className="dropdown-link">Necklaces</Link>
                  <Link to="/shop?category=bangles" className="dropdown-link">Bangles</Link>
                  <Link to="/shop?category=rings" className="dropdown-link">Rings</Link>
                  <Link to="/shop?category=bracelets" className="dropdown-link">Bracelets</Link>
                  <Link to="/shop?category=earrings" className="dropdown-link">Earrings</Link>
                  <Link to="/shop?category=charms" className="dropdown-link">Charms</Link>
                  <Link to="/shop?category=silver-collections" className="dropdown-link">Silver Collections</Link>
                  <Link to="/shop?category=seasonal-collections" className="dropdown-link">Seasonal Collections</Link>
                </div>
              </div>

              <div className={`nav-item${activePage === '/collections' ? ' active' : ''}`}>
                <Link to="/collections">Collections</Link>
              </div>

              <div className={`nav-item${activePage === '/about' ? ' active' : ''}`}>
                <Link to="/about">About Us</Link>
              </div>

              <div className={`nav-item${activePage === '/contact' ? ' active' : ''}`}>
                <Link to="/contact">Contact</Link>
              </div>
            </nav>

            {/* Action Icons */}
            <div className="header-actions">
              <button className="action-btn" title="Search Jewellery" onClick={() => setSearchOpen(s => !s)}>
                <Search style={{ width: 23, height: 23 }} strokeWidth={1.8} />
              </button>

              <Link to="/wishlist" className="action-btn" title="Wishlist">
                <Heart style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
              </Link>

              <div className="user-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <Link to="/account" className="action-btn" title="My Account / Sign In">
                  <User style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                </Link>
              </div>

              <Link to="/cart" className="action-btn" title="Shopping Bag">
                <ShoppingBag style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="search-drawer" style={{ display: 'block' }}>
            <form onSubmit={handleSearch} className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search earrings, bangles, rings, necklaces, bracelets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} style={{ position: 'absolute', right: 16, color: 'var(--slate)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="mobile-nav-drawer" style={{ display: 'block' }}>
            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Shop All</Link>
              <Link to="/collections" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Collections</Link>
              <Link to="/about" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>About Us</Link>
              <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Contact</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
