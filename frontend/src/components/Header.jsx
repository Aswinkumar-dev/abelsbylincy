import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { cart, wishlist, currentUser, cms, logoutUser } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
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
    setLogoutModalOpen(false);
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
            {/* Action Icons: Search -> Account -> Wishlist -> Cart */}
            <div className="header-actions">
              {/* 1. Search */}
              <button className="action-btn" title="Search Jewellery" onClick={() => setSearchOpen(s => !s)}>
                <Search style={{ width: 23, height: 23 }} strokeWidth={1.8} />
              </button>

              {/* 2. Account (User) */}
              <div className="user-menu-wrapper" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                {currentUser ? (
                  <button
                    type="button"
                    className="action-btn"
                    title={`Hi ${currentUser.name}`}
                    onClick={() => setLogoutModalOpen(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <User style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                  </button>
                ) : (
                  <Link to="/account" className="action-btn" title="Login">
                    <User style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                  </Link>
                )}

                {/* Floating LOGIN Tooltip Badge when NOT logged in */}
                {!currentUser && (
                  <Link to="/account" className="login-floating-tooltip" style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#000000',
                    color: 'var(--gold)',
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    zIndex: 1001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: '5px solid #000000'
                    }} />
                    LOGIN
                  </Link>
                )}

                {/* Floating LOGOUT Popup Modal when LOGGED IN and clicking Account icon */}
                {currentUser && logoutModalOpen && (
                  <div
                    className="account-logout-popover"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: -10,
                      width: 250,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '18px 16px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      zIndex: 2000,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: -6,
                      right: 20,
                      width: 10,
                      height: 10,
                      backgroundColor: '#FFFFFF',
                      borderLeft: '1px solid var(--border)',
                      borderTop: '1px solid var(--border)',
                      transform: 'rotate(45deg)'
                    }} />

                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--onyx)', margin: '0 0 4px 0' }}>
                      Hi {currentUser.name},
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--slate)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                      Do you want to Logout?
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          logoutUser();
                          setLogoutModalOpen(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          background: '#C5221F',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        Logout
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoutModalOpen(false)}
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 6
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Wishlist */}
              <Link to="/wishlist" className="action-btn" title="Wishlist">
                <Heart style={{ width: 23, height: 23 }} strokeWidth={1.8} />
                {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
              </Link>

              {/* 4. Cart */}
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
              
              {/* Expandable Non-Navigating SHOP with Arrow right next to text */}
              <div className="mobile-nav-item">
                <div
                  className="mobile-nav-link"
                  onClick={() => setMobileShopOpen(s => !s)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: '100%', borderBottom: '1px solid var(--border-light)' }}
                >
                  <span>SHOP</span>
                  <ChevronDown style={{ width: 16, height: 16, strokeWidth: 2.5, transform: mobileShopOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {mobileShopOpen && (
                  <div className="mobile-sub-nav">
                    <Link to="/shop" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Shop All Products</Link>
                    <Link to="/shop?category=new-arrivals" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
                    <Link to="/shop?category=best-sellers" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Best Sellers</Link>
                    <Link to="/shop?category=necklaces" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Necklaces</Link>
                    <Link to="/shop?category=bangles" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Bangles</Link>
                    <Link to="/shop?category=rings" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Rings</Link>
                    <Link to="/shop?category=bracelets" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Bracelets</Link>
                    <Link to="/shop?category=earrings" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Earrings</Link>
                    <Link to="/shop?category=charms" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Charms</Link>
                    <Link to="/shop?category=silver-collections" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Silver Collections</Link>
                    <Link to="/shop?category=seasonal-collections" className="mobile-sub-link" onClick={() => setMobileOpen(false)}>Seasonal Collections</Link>
                  </div>
                )}
              </div>

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
