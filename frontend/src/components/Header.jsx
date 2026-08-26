import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { cart, wishlist, currentUser, cms, showToast } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catAccOpen, setCatAccOpen] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;

  // Announcement ticker
  const announcements = (cms?.announcement || '').split('·').map(a => a.trim()).filter(Boolean);
  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setInterval(() => setAnnouncementIdx(i => (i + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, [announcements.length]);

  // Close mobile on route change
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/collections', label: 'Collections' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const categories = [
    { id: 'rings', label: 'Rings' },
    { id: 'necklaces', label: 'Necklaces' },
    { id: 'earrings', label: 'Earrings' },
    { id: 'bracelets', label: 'Bracelets' },
    { id: 'bangles', label: 'Bangles' },
    { id: 'charms', label: 'Charms' },
  ];

  const activePage = location.pathname;

  return (
    <>
      {/* Announcement Bar */}
      {announcements.length > 0 && (
        <div className="announcement-bar">
          <div className="announcement-ticker">
            <span className="ticker-text">{announcements[announcementIdx]}</span>
          </div>
        </div>
      )}

      <header className="site-header" id="header-root">
        <div className="header-inner container">

          {/* Logo */}
          <Link to="/" className="header-logo">
            <img src="/assets/logo.svg" alt="Abel's By Lincy" className="header-logo-img" onError={e => { e.target.style.display='none'; }} />
            <span className="header-logo-text">
              <span className="logo-name">ABEL'S</span>
              <span className="logo-tagline">BY LINCY</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`header-nav-link${activePage === link.to ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Shop Dropdown */}
            <div className="nav-dropdown-wrapper" onMouseEnter={() => setCatAccOpen(true)} onMouseLeave={() => setCatAccOpen(false)}>
              <button className="header-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Categories <ChevronDown style={{ width: 14, height: 14 }} />
              </button>
              {catAccOpen && (
                <div className="nav-dropdown">
                  {categories.map(cat => (
                    <Link key={cat.id} to={`/shop?category=${cat.id}`} className="nav-dropdown-item" onClick={() => setCatAccOpen(false)}>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button className="header-icon-btn" title="Search" onClick={() => setSearchOpen(s => !s)}>
              <Search style={{ width: 20, height: 20 }} />
            </button>

            <Link to="/wishlist" className="header-icon-btn" title="Wishlist">
              <Heart style={{ width: 20, height: 20 }} />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </Link>

            <Link to="/account" className="header-icon-btn" title="Account">
              <User style={{ width: 20, height: 20 }} />
            </Link>

            <Link to="/cart" className="header-icon-btn cart-btn" title="Cart">
              <ShoppingBag style={{ width: 20, height: 20 }} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            <button className="mobile-menu-btn" onClick={() => setMobileOpen(s => !s)} aria-label="Menu">
              {mobileOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
            </button>
          </div>
        </div>

        {/* Search Drawer */}
        {searchOpen && (
          <div className="search-drawer">
            <form onSubmit={handleSearch} className="search-form container">
              <Search style={{ width: 18, height: 18, color: 'var(--slate)' }} />
              <input
                ref={searchRef}
                autoFocus
                type="text"
                placeholder="Search for jewellery, collections..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="mobile-nav-drawer">
            <nav className="mobile-nav">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="mobile-nav-divider">Categories</div>
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category=${cat.id}`} className="mobile-nav-link mobile-cat-link" onClick={() => setMobileOpen(false)}>
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
