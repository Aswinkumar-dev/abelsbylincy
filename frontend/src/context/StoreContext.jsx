import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ============================================================
// Default seed data (mirrors app.js initial state)
// ============================================================
const DEFAULT_PRODUCTS = [
  // New Arrivals (All hosted on Cloudinary CDN)
  { id: 'p_na1', sku: 'ABL-NK-101', name: 'Red Heart Shaped Necklace', category: 'necklaces', price: 179, material: '18K Gold Plated', gemstone: 'Red Gem', inStock: true, stockQty: 15, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796749/abels_by_lincy/Red_heart_shaped_necklace_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796749/abels_by_lincy/Red_heart_shaped_necklace_-_new_arrival.webp'], description: 'A striking red heart-shaped pendant suspended on a fine 18K gold-plated chain.', featured: true, bestSeller: false, newArrival: true, tags: ['necklaces', 'heart', 'red'] },
  { id: 'p_na2', sku: 'ABL-BR-102', name: 'Butterfly Bracelet', category: 'bracelets', price: 149, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 20, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796731/abels_by_lincy/butterfly_bracelete_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796731/abels_by_lincy/butterfly_bracelete_-_new_arrival.webp'], description: 'Delicate butterfly motif bracelet featuring sparkling cubic zirconia accents.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'butterfly'] },
  { id: 'p_na3', sku: 'ABL-CH-103', name: 'Charm Collection', category: 'charms', price: 129, material: '18K Gold Plated', gemstone: 'None', inStock: true, stockQty: 18, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp'], description: 'Artisanal charm set designed to pair beautifully with gold bracelets and chains.', featured: true, bestSeller: false, newArrival: true, tags: ['charms', 'collection'] },
  { id: 'p_na4', sku: 'ABL-ER-104', name: 'Cherry Drop Earrings', category: 'earrings', price: 119, material: '18K Gold Plated', gemstone: 'Enamel & CZ', inStock: true, stockQty: 12, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796735/abels_by_lincy/cherry_earring_-_new_arrival.jpg', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796735/abels_by_lincy/cherry_earring_-_new_arrival.jpg'], description: 'Playful and elegant cherry drop earrings with vibrant enamel and 18K gold plating.', featured: true, bestSeller: false, newArrival: true, tags: ['earrings', 'cherry'] },
  { id: 'p_na5', sku: 'ABL-BR-105', name: 'Green Gem Bracelet', category: 'bracelets', price: 169, material: '18K Gold Plated', gemstone: 'Emerald CZ', inStock: true, stockQty: 10, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796741/abels_by_lincy/green_gem_bracelete_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796741/abels_by_lincy/green_gem_bracelete_-_new_arrival.webp'], description: 'Lush green emerald CZ gemstones bezel-set along an 18K gold-plated link bracelet.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'emerald'] },
  { id: 'p_na6', sku: 'ABL-BR-106', name: 'Heart Shaped Bracelet', category: 'bracelets', price: 139, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 25, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796742/abels_by_lincy/heart_shaped_bracelete_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796742/abels_by_lincy/heart_shaped_bracelete_-_new_arrival.webp'], description: 'Charming heart link bracelet crafted in high-lustre 18K gold plating.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'heart'] },

  // Best Sellers (All hosted on Cloudinary CDN)
  { id: 'p_bs1', sku: 'ABL-NK-201', name: 'Bug Shaped Multi Gems Necklace', category: 'necklaces', price: 219, material: '18K Gold Plated', gemstone: 'Multi Gems', inStock: true, stockQty: 14, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796729/abels_by_lincy/Bug_shaped_multi_gems_neckalace_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796729/abels_by_lincy/Bug_shaped_multi_gems_neckalace_-_best_seller.webp'], description: 'Statement beetle pendant encrusted with multi-colored gemstones in 18K gold setting.', featured: true, bestSeller: true, newArrival: false, tags: ['necklaces', 'gemstones'] },
  { id: 'p_bs2', sku: 'ABL-BR-202', name: 'Black Heart Gold Bracelet', category: 'bracelets', price: 159, material: '18K Gold Plated', gemstone: 'Black Onyx CZ', inStock: true, stockQty: 16, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796724/abels_by_lincy/black_hearted_gold_shape_bracelete_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796724/abels_by_lincy/black_hearted_gold_shape_bracelete_-_best_seller.webp'], description: 'Elegant black heart motif bracelet framed by radiant 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['bracelets', 'onyx'] },
  { id: 'p_bs3', sku: 'ABL-BR-203', name: 'Butterfly Gold Bracelet', category: 'bracelets', price: 149, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 15, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796730/abels_by_lincy/butterfly_bracelete_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796730/abels_by_lincy/butterfly_bracelete_-_best_seller.webp'], description: 'Artisanal butterfly charm bracelet in 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['bracelets', 'butterfly'] },
  { id: 'p_bs4', sku: 'ABL-RG-204', name: 'Emerald Gem Ring', category: 'rings', price: 179, material: '18K Gold Plated', gemstone: 'Emerald CZ', inStock: true, stockQty: 12, sizes: ['6', '7', '8', '9'], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796740/abels_by_lincy/gem_ring_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796740/abels_by_lincy/gem_ring_-_best_seller.webp'], description: 'Vibrant emerald CZ gemstone set on an 18K gold-plated band.', featured: true, bestSeller: true, newArrival: false, tags: ['rings', 'emerald'] },
  { id: 'p_bs5', sku: 'ABL-NK-205', name: 'Soleil Gold Necklace', category: 'necklaces', price: 189, material: '22K Gold Plated', gemstone: 'None', inStock: true, stockQty: 22, sizes: [], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796745/abels_by_lincy/necklace_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796745/abels_by_lincy/necklace_-_best_seller.webp'], description: 'Artisanal sun-inspired medallion necklace with a rich 22K gold-plated finish.', featured: true, bestSeller: true, newArrival: false, tags: ['necklaces', 'soleil'] },
  { id: 'p_bs6', sku: 'ABL-RG-206', name: 'Royal Solitaire Ring', category: 'rings', price: 169, material: '18K Gold Plated', gemstone: 'Diamond CZ', inStock: true, stockQty: 19, sizes: ['6', '7', '8', '9'], colors: ['Gold'], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796750/abels_by_lincy/ring_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796750/abels_by_lincy/ring_-_best_seller.webp'], description: 'Classic solitaire ring featuring a brilliant-cut CZ diamond set in 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['rings', 'diamond'] },
];

const DEFAULT_CATEGORIES = [
  { id: 'rings', name: 'Rings', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png' },
  { id: 'necklaces', name: 'Necklaces', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796747/abels_by_lincy/necklace_collection_category.webp' },
  { id: 'earrings', name: 'Earrings', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796736/abels_by_lincy/Earrings_Category.webp' },
  { id: 'bracelets', name: 'Bracelets', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796726/abels_by_lincy/Bracelet_-_category.webp' },
  { id: 'bangles', name: 'Bangles', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796721/abels_by_lincy/Bangle_Category.webp' },
  { id: 'charms', name: 'Charms', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp' },
  { id: 'silver-collections', name: 'Silver Collections', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp' },
  { id: 'seasonal-collections', name: 'Seasonal Collections', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png' },
];

const DEFAULT_SETTINGS = {
  storeEmail: 'lincytitus8@gmail.com',
  primaryCurrency: 'AUD',
  currencySymbol: '$',
  gstTaxRate: '10%',
  freeShippingThreshold: 150,
};

const DEFAULT_CMS = {
  announcement: 'Free Express Shipping on all orders · New Arrivals: Aurora Pearl Collection · Complimentary Gift Wrapping',
  newArrivalsEnabled: true,
  newArrivalsSubtitle: 'Just Dropped',
  newArrivalsTitle: 'New Arrivals',
  newArrivalsLimit: 10,
  heroSlides: [
    {
      id: 'slide-1',
      tagline: 'THE BRACELET COLLECTION',
      title: 'Stack. <b>Style</b>. Shine.',
      description: 'Your everyday essentials, elevated.',
      image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796728/abels_by_lincy/bracelets-hero.webp',
      ctaText: 'SHOP BRACELETS',
      ctaLink: '/shop?category=bracelets',
      theme: 'gold'
    },
    {
      id: 'slide-2',
      tagline: 'THE NECKLACE COLLECTION',
      title: 'A Touch of <b>Gold</b>, Made to Shine.',
      description: 'Discover necklaces designed for effortless elegance.',
      image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796748/abels_by_lincy/necklace-hero.webp',
      ctaText: 'SHOP NECKLACES',
      ctaLink: '/shop?category=necklaces',
      theme: 'gold'
    },
    {
      id: 'slide-3',
      tagline: 'THE EARRING COLLECTION',
      title: 'Frame Your <b>Style</b>.',
      description: 'Statement or subtle — make it yours.',
      image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796737/abels_by_lincy/earrings-hero.webp',
      ctaText: 'SHOP EARRINGS',
      ctaLink: '/shop?category=earrings',
      theme: 'gold'
    },
    {
      id: 'slide-4',
      tagline: 'THE BANGLE COLLECTION',
      title: 'Timeless Around Your <b>Wrist</b>.',
      description: 'A classic touch of gold for every occasion.',
      image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796723/abels_by_lincy/bangles-hero.webp',
      ctaText: 'SHOP BANGLES',
      ctaLink: '/shop?category=bangles',
      theme: 'gold'
    }
  ],
};

const DEFAULT_ORDERS = [];
const DEFAULT_CUSTOMERS = [];
const DEFAULT_COUPONS = [
  { id: 'cp1', code: 'WELCOME10', label: 'Welcome 10% Off', discountType: 'percentage', value: 10, minOrder: 50, maxDiscount: 20, expiry: '2026-12-31', active: true, usageLimit: 100, perCustomerLimit: 1 },
  { id: 'cp2', code: 'FIRSTORDER', label: 'First Order Special', discountType: 'percentage', value: 15, minOrder: 80, maxDiscount: 30, expiry: '2026-12-31', active: true, usageLimit: 50, perCustomerLimit: 1 },
];
const DEFAULT_REVIEWS = [];
const DEFAULT_STOCK_HISTORY = [];

const DEFAULT_ROLES = [
  { user: 'Lincy Titus', loginId: 'lincy', password: 'A@b@e@l@s@12345', role: 'Super Admin', permissions: ['all'] },
];

const DEFAULT_MESSAGES = [];
const DEFAULT_SUBSCRIBERS = [];

// ============================================================
// Helpers
// ============================================================
function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ============================================================
// Context
// ============================================================
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // State mirrors app.js `state` object
  const [products, setProductsRaw] = useState(() => readLS('abl_products_v5', DEFAULT_PRODUCTS));
  const [categories, setCategoriesRaw] = useState(() => readLS('abl_categories_v5', DEFAULT_CATEGORIES));
  const [orders, setOrdersRaw] = useState(() => readLS('abl_orders_v6', DEFAULT_ORDERS));
  const [customers, setCustomersRaw] = useState(() => readLS('abl_customers_v6', DEFAULT_CUSTOMERS));
  const [coupons, setCouponsRaw] = useState(() => readLS('abl_coupons_v6', DEFAULT_COUPONS));
  const [reviews, setReviewsRaw] = useState(() => readLS('abl_reviews_v6', DEFAULT_REVIEWS));
  const [stockHistory, setStockHistoryRaw] = useState(() => readLS('abl_stock_history_v6', DEFAULT_STOCK_HISTORY));
  const [roles, setRolesRaw] = useState(() => readLS('abl_roles', DEFAULT_ROLES));
  const [settings, setSettingsRaw] = useState(() => readLS('abl_settings', DEFAULT_SETTINGS));
  const [cms, setCMSRaw] = useState(() => readLS('abl_cms_v5', DEFAULT_CMS));
  const [cart, setCartRaw] = useState(() => readLS('abl_cart', []));
  const [wishlist, setWishlistRaw] = useState(() => readLS('abl_wishlist', []));
  const [currentUser, setCurrentUserRaw] = useState(() => readLS('abl_current_user', null));
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => readLS('abl_admin_auth', false));
  const [adminUser, setAdminUserRaw] = useState(() => readLS('abl_admin_user', null));
  const [messages, setMessagesRaw] = useState(() => readLS('abl_messages', DEFAULT_MESSAGES));
  const [subscribers, setSubscribersRaw] = useState(() => readLS('abl_subscribers_v1', DEFAULT_SUBSCRIBERS));

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Persisting helpers
  const setProducts = useCallback((v) => { setProductsRaw(v); writeLS('abl_products_v5', v); }, []);
  const setCategories = useCallback((v) => { setCategoriesRaw(v); writeLS('abl_categories_v5', v); }, []);
  const setOrders = useCallback((v) => { setOrdersRaw(v); writeLS('abl_orders_v6', v); }, []);
  const setCustomers = useCallback((v) => { setCustomersRaw(v); writeLS('abl_customers_v6', v); }, []);
  const setCoupons = useCallback((v) => { setCouponsRaw(v); writeLS('abl_coupons_v6', v); }, []);
  const setReviews = useCallback((v) => { setReviewsRaw(v); writeLS('abl_reviews_v6', v); }, []);
  const setStockHistory = useCallback((v) => { setStockHistoryRaw(v); writeLS('abl_stock_history_v6', v); }, []);
  const setRoles = useCallback((v) => { setRolesRaw(v); writeLS('abl_roles', v); }, []);
  const setSettings = useCallback((v) => { setSettingsRaw(v); writeLS('abl_settings', v); }, []);
  const setSubscribers = useCallback((v) => { setSubscribersRaw(v); writeLS('abl_subscribers_v1', v); }, []);
  const setCMS = useCallback((v) => { setCMSRaw(v); writeLS('abl_cms_v5', v); }, []);
  const setCart = useCallback((v) => { setCartRaw(v); writeLS('abl_cart', v); }, []);
  const setWishlist = useCallback((v) => { setWishlistRaw(v); writeLS('abl_wishlist', v); }, []);
  const setCurrentUser = useCallback((v) => { setCurrentUserRaw(v); writeLS('abl_current_user', v); }, []);
  const setAdminUser = useCallback((v) => { setAdminUserRaw(v); writeLS('abl_admin_user', v); }, []);
  const setMessages = useCallback((v) => { setMessagesRaw(v); writeLS('abl_messages', v); }, []);

  // ============================================================
  // showToast
  // ============================================================
  const showToast = useCallback((msg, type = 'check', action = null) => {
    const id = Date.now();
    const duration = type === 'cart' ? 4000 : 3500;
    setToasts(prev => [...prev, { id, msg, type, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ============================================================
  // formatMoney
  // ============================================================
  const formatMoney = useCallback((amount) => {
    const s = settings;
    const sym = s.primaryCurrency === 'EUR' ? '€' : s.primaryCurrency === 'GBP' ? '£' : s.primaryCurrency === 'INR' ? '₹' : s.primaryCurrency === 'JPY' ? '¥' : '$';
    return `${sym}${Number(amount).toFixed(2)}`;
  }, [settings]);

  // ============================================================
  // Cart actions
  // ============================================================
  const addToCart = useCallback((id, qty = 1, size = '') => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id && i.size === size);
      const product = products.find(p => p.id === id);
      if (!product) return prev;
      if (existing) {
        return prev.map(i => i.id === id && i.size === size ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { id, name: product.name, price: product.price, image: product.images?.[0] || product.image, quantity: qty, size }];
    });
    const product = products.find(p => p.id === id);
    if (typeof window !== 'undefined' && window.gtag && product) {
      window.gtag('event', 'add_to_cart', {
        currency: 'AUD',
        value: product.price * qty,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }]
      });
    }
    showToast('Product Added to Cart!', 'cart', { label: 'View Bag', link: '/cart' });
  }, [products, setCart, showToast]);

  const updateCartQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, [setCart]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showToast('Removed from bag', 'check');
  }, [setCart, showToast]);

  // ============================================================
  // Wishlist actions
  // ============================================================
  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => {
      if (prev.includes(id)) {
        showToast('Removed from wishlist', 'heart');
        return prev.filter(i => i !== id);
      } else {
        showToast('Added to wishlist!', 'heart');
        return [...prev, id];
      }
    });
  }, [setWishlist, showToast]);

  // ============================================================
  // Auth actions
  // ============================================================
  const loginWithEmail = useCallback((email, password) => {
    const found = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const stored = readLS('abl_user_token', null);
      if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
        setCurrentUser(stored);
        showToast(`Welcome back, ${stored.name}!`, 'check');
        return true;
      }
      showToast('No account found with that email', 'alert-circle');
      return false;
    }
    setCurrentUser({ ...found });
    showToast(`Welcome back, ${found.name}!`, 'check');
    return true;
  }, [customers, setCurrentUser, showToast]);

  const registerUser = useCallback((name, email, password) => {
    const exists = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      showToast('An account with this email already exists', 'alert-circle');
      return false;
    }
    const newUser = { id: `c${Date.now()}`, name, email, orders: 0, spent: '$0', joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), status: 'New' };
    setCustomers([...customers, newUser]);
    setCurrentUser(newUser);
    writeLS('abl_user_token', { ...newUser, password });
    showToast(`Welcome to Abel's By Lincy, ${name}!`, 'check');
    return true;
  }, [customers, setCustomers, setCurrentUser, showToast]);

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const loginWithGoogleProfile = useCallback((profile) => {
    if (!profile || !profile.email) {
      showToast('Google authentication failed. Please try again.', 'alert-circle');
      return false;
    }

    const { name, email, picture, sub } = profile;
    const existing = customers.find(c => c.email?.toLowerCase() === email.toLowerCase());

    const userObj = {
      id: existing ? existing.id : `c_google_${sub || Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      avatar: picture || '',
      provider: 'google',
      joined: existing ? existing.joined : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      spent: existing ? existing.spent : '$0',
      orders: existing ? existing.orders : 0
    };

    if (!existing) {
      setCustomers([userObj, ...customers]);
    }

    setCurrentUser(userObj);
    writeLS('abl_current_user', userObj);
    writeLS('abl_user_token', { email, name: userObj.name, provider: 'google' });
    showToast(`Welcome to Abel's By Lincy, ${userObj.name}!`, 'check');
    return true;
  }, [customers, setCustomers, setCurrentUser, showToast]);

  const loginWithGoogle = useCallback((credentialOrEvent) => {
    if (typeof credentialOrEvent === 'string') {
      return loginWithGoogleCredential(credentialOrEvent);
    }

    const clientId = import.meta.env.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || '546867018049-fafgf8onc7m37144516t5n6fodqkjg78.apps.googleusercontent.com';

    // 1. Trigger Real Google OAuth 2.0 Popup (accounts.google.com)
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (res.ok) {
                const profile = await res.json();
                loginWithGoogleProfile(profile);
                return;
              }
            } catch (e) {
              console.error('Failed to fetch Google profile', e);
            }
          }
          showToast('Google Sign-In was cancelled.', 'alert-circle');
        }
      });
      client.requestAccessToken();
      return;
    }

    // 2. Fallback to GIS One Tap prompt if initialized
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            const profile = parseJwt(response.credential);
            if (profile) loginWithGoogleProfile(profile);
          }
        }
      });
      window.google.accounts.id.prompt();
      return;
    }

    // 3. Fallback to Google OAuth 2.0 Auth URL redirect
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(window.location.origin + '/account')}&response_type=token&scope=${encodeURIComponent('email profile openid')}`;
    window.location.href = googleAuthUrl;
  }, [loginWithGoogleProfile, showToast]);

  // Handle Google OAuth Redirect Hash if returned via URL redirect
  React.useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(profile => {
            if (profile && profile.email) {
              loginWithGoogleProfile(profile);
              window.history.replaceState(null, '', window.location.pathname);
            }
          })
          .catch(console.error);
      }
    }
  }, [loginWithGoogleProfile]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    showToast('Signed out successfully', 'check');
  }, [setCurrentUser, showToast]);

  const saveUserAddress = useCallback((addressData) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      savedAddress: addressData
    };
    setCurrentUser(updatedUser);
    writeLS('abl_saved_address', addressData);
    setCustomers(prev => prev.map(c => (c.email?.toLowerCase() === currentUser.email?.toLowerCase() || c.id === currentUser.id) ? { ...c, savedAddress: addressData } : c));
  }, [currentUser, setCurrentUser, setCustomers]);

  // ============================================================
  // Admin Auth
  // ============================================================
  const adminLogin = useCallback((loginId, password) => {
    const isNewCreds = (loginId.trim() === 'lincy' || loginId.trim() === 'admin') && password.trim() === 'A@b@e@l@s@12345';
    const role = roles.find(r => (r.loginId === loginId || r.user === loginId) && r.password === password) || (isNewCreds ? { user: 'Lincy Titus', loginId: 'lincy', password: 'A@b@e@l@s@12345', role: 'Super Admin', permissions: ['all'] } : null);
    if (!role) {
      showToast('Invalid admin credentials', 'alert-circle');
      return false;
    }
    setAdminLoggedIn(true);
    writeLS('abl_admin_auth', true);
    setAdminUser(role);
    showToast(`Welcome, ${role.user}!`, 'check');
    return true;
  }, [roles, setAdminUser, showToast]);

  const adminLogout = useCallback(() => {
    setAdminLoggedIn(false);
    writeLS('abl_admin_auth', false);
    setAdminUser(null);
    showToast('Admin signed out', 'check');
  }, [setAdminUser, showToast]);

  // ============================================================
  // Contact form
  // ============================================================
  const handleContactForm = useCallback((name, email, subject, message) => {
    const newMsg = { id: `m${Date.now()}`, name, email, subject, message, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
    setMessages([...messages, newMsg]);
    showToast("Message sent! We'll be in touch soon.", 'check');
    return true;
  }, [messages, setMessages, showToast]);

  // ============================================================
  // Newsletter
  // ============================================================
  const handleNewsletter = useCallback((email) => {
    showToast('Thank you for joining the Circle!', 'check');
    return true;
  }, [showToast]);

  // ============================================================
  // Place order
  // ============================================================
  const placeOrder = useCallback((checkoutData, selectedPaymentTab) => {
    if (cart.length === 0) { showToast('Your bag is empty', 'alert-circle'); return null; }
    const orderSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    // Deduct stock
    const updatedProducts = products.map(prod => {
      const item = cart.find(i => i.id === prod.id);
      if (item) {
        const newQty = Math.max(0, (prod.stockQty || 0) - item.quantity);
        return { ...prod, stockQty: newQty, inStock: newQty > 0 };
      }
      return prod;
    });
    setProducts(updatedProducts);

    const newOrder = {
      id: `#ABL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: `${checkoutData.firstName} ${checkoutData.lastName}`.trim(),
      email: checkoutData.email,
      product: cart[0]?.name || 'Fine Jewellery',
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Processing',
      total: formatMoney(orderSubtotal),
      rawAmount: orderSubtotal,
      itemsCount: cart.length,
    };
    setOrders([newOrder, ...orders]);

    // Update customer spending
    const custIdx = customers.findIndex(c => c.email.toLowerCase() === checkoutData.email.toLowerCase());
    let updatedCustomers = [...customers];
    if (custIdx !== -1) {
      const cust = { ...customers[custIdx] };
      cust.orders = (cust.orders || 0) + 1;
      const currentSpent = parseFloat((cust.spent || '$0').replace(/[^0-9.]/g, '')) || 0;
      cust.spent = `$${(currentSpent + orderSubtotal).toLocaleString()}`;
      updatedCustomers[custIdx] = cust;
    } else if (checkoutData.email) {
      updatedCustomers.push({ id: `c${Date.now()}`, name: `${checkoutData.firstName} ${checkoutData.lastName}`, email: checkoutData.email, orders: 1, spent: `$${orderSubtotal.toLocaleString()}`, joined: 'Aug 2026', status: 'New' });
    }
    setCustomers(updatedCustomers);

    setCart([]);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: newOrder.id,
        value: orderSubtotal,
        currency: 'AUD',
        items: cart.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
      });
    }
    showToast('Payment successful! Order placed.', 'check');
    return newOrder;
  }, [cart, products, orders, customers, setProducts, setOrders, setCustomers, setCart, showToast, formatMoney]);

  // ============================================================
  // Admin CRUD helpers
  // ============================================================
  const saveProduct = useCallback((productData) => {
    const existing = products.find(p => p.id === productData.id);
    if (existing) {
      setProducts(products.map(p => p.id === productData.id ? { ...p, ...productData } : p));
    } else {
      setProducts([...products, { ...productData, id: `p${Date.now()}` }]);
    }
    showToast('Product saved!', 'check');
  }, [products, setProducts, showToast]);

  const deleteProduct = useCallback((id) => {
    setProducts(products.filter(p => p.id !== id));
    showToast('Product deleted', 'check');
  }, [products, setProducts, showToast]);

  const adjustStockQty = useCallback((id, delta) => {
    setProducts(products.map(p => p.id === id ? { ...p, stockQty: Math.max(0, (p.stockQty || 0) + delta) } : p));
  }, [products, setProducts]);

  const restockAllLowStock = useCallback((qty) => {
    setProducts(products.map(p => (p.stockQty || 0) <= 8 ? { ...p, stockQty: (p.stockQty || 0) + qty, inStock: true } : p));
    showToast('Low stock items restocked!', 'check');
  }, [products, setProducts, showToast]);

  const saveCategory = useCallback((catData) => {
    const existing = categories.find(c => c.id === catData.id);
    if (existing) {
      setCategories(categories.map(c => c.id === catData.id ? { ...c, ...catData } : c));
    } else {
      setCategories([...categories, catData]);
    }
    showToast('Category saved!', 'check');
  }, [categories, setCategories, showToast]);

  const deleteCategory = useCallback((id) => {
    setCategories(categories.filter(c => c.id !== id));
    showToast('Category deleted', 'check');
  }, [categories, setCategories, showToast]);

  const updateOrderStatus = useCallback((id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Order status updated to ${newStatus}`, 'check');
  }, [orders, setOrders, showToast]);

  const cycleOrderStatus = useCallback((id) => {
    const statuses = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    setOrders(orders.map(o => {
      if (o.id === id) {
        const idx = statuses.indexOf(o.status);
        return { ...o, status: statuses[(idx + 1) % statuses.length] };
      }
      return o;
    }));
  }, [orders, setOrders]);

  const deleteOrder = useCallback((id) => {
    setOrders(orders.filter(o => o.id !== id));
    showToast('Order deleted', 'check');
  }, [orders, setOrders, showToast]);

  const saveCustomer = useCallback((custData) => {
    const existing = customers.find(c => c.id === custData.id);
    if (existing) {
      setCustomers(customers.map(c => c.id === custData.id ? { ...c, ...custData } : c));
    } else {
      setCustomers([...customers, { ...custData, id: `c${Date.now()}` }]);
    }
    showToast('Customer saved!', 'check');
  }, [customers, setCustomers, showToast]);

  const deleteCustomer = useCallback((id) => {
    setCustomers(customers.filter(c => c.id !== id));
    showToast('Customer deleted', 'check');
  }, [customers, setCustomers, showToast]);

  const saveCoupon = useCallback((cpData) => {
    const existing = coupons.find(c => c.code === cpData.code);
    if (existing) {
      setCoupons(coupons.map(c => c.code === cpData.code ? { ...c, ...cpData } : c));
    } else {
      setCoupons([...coupons, cpData]);
    }
    showToast('Coupon saved!', 'check');
  }, [coupons, setCoupons, showToast]);

  const deleteCoupon = useCallback((code) => {
    setCoupons(coupons.filter(c => c.code !== code));
    showToast('Coupon deleted', 'check');
  }, [coupons, setCoupons, showToast]);

  const saveGlobalCMS = useCallback((updates) => {
    setCMS({ ...cms, ...updates });
    showToast('CMS settings updated!', 'check');
  }, [cms, setCMS, showToast]);

  const saveHeroSlide = useCallback((idx, slideData) => {
    const slides = [...(cms.heroSlides || [])];
    if (idx === -1) {
      slides.push({ ...slideData, id: `s${Date.now()}` });
    } else {
      slides[idx] = { ...slides[idx], ...slideData };
    }
    setCMS({ ...cms, heroSlides: slides });
    showToast('Slide saved!', 'check');
  }, [cms, setCMS, showToast]);

  const deleteHeroSlide = useCallback((idx) => {
    const slides = [...(cms.heroSlides || [])];
    slides.splice(idx, 1);
    setCMS({ ...cms, heroSlides: slides });
    showToast('Slide deleted', 'check');
  }, [cms, setCMS, showToast]);

  const moveHeroSlide = useCallback((idx, dir) => {
    const slides = [...(cms.heroSlides || [])];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
    setCMS({ ...cms, heroSlides: slides });
  }, [cms, setCMS]);

  const saveStoreSettings = useCallback((updates) => {
    setSettings({ ...settings, ...updates });
    showToast('Settings saved!', 'check');
  }, [settings, setSettings, showToast]);


  const deleteSubscriber = useCallback((id) => {
    setSubscribers(subscribers.filter(s => s.id !== id));
    showToast('Subscriber removed', 'check');
  }, [subscribers, setSubscribers, showToast]);


  const applyCoupon = useCallback((code, subtotal) => {
    const cp = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!cp) { showToast('Invalid or expired coupon', 'alert-circle'); return null; }
    showToast(`Coupon "${cp.code}" applied!`, 'check');
    return cp;
  }, [coupons, showToast]);

  const exportFilteredCSV = useCallback((fromDate, toDate) => {
    const fromD = new Date(fromDate + 'T00:00:00');
    const toD = new Date(toDate + 'T23:59:59');

    const parseOrderDate = (dateStr) => {
      if (!dateStr) return new Date();
      if (dateStr.toLowerCase().includes('today')) return new Date();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
      const parts = dateStr.replace(/,/g, '').trim().split(/\s+/);
      if (parts.length >= 3) {
        const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
        return new Date(parseInt(parts[2], 10) || 2026, months[parts[1]?.toLowerCase().slice(0, 3)] ?? 7, parseInt(parts[0], 10) || 1);
      }
      return new Date();
    };

    const filteredOrders = orders.filter(o => {
      const oDate = parseOrderDate(o.date);
      return oDate >= fromD && oDate <= toD;
    });

    const now = new Date().toISOString().slice(0, 10);
    let csv = `========================================\nABEL'S BY LINCY - FILTERED SALES REPORT\nPeriod: ${fromDate} to ${toDate} (Generated: ${now})\nTotal Orders in Range: ${filteredOrders.length}\n========================================\n\n`;
    csv += 'Order ID,Customer,Email,Piece,Date,Status,Total Amount\n';
    filteredOrders.forEach(o => { csv += `"${o.id}","${o.customer}","${o.email}","${o.product || 'Fine Jewellery'}","${o.date}","${o.status}","${o.total}"\n`; });
    csv += '\n--- INVENTORY ASSET VALUATION (LIVE) ---\n';
    csv += 'SKU,Product Name,Category,Unit Price,Stock Units,Asset Valuation,Vault Location\n';
    products.forEach(p => { csv += `"${p.sku}","${p.name}","${p.category}","$${p.price}",${p.stockQty},"$${p.price * (p.stockQty || 0)}","${p.storageLocation || 'Vault A-01'}"\n`; });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abels_filtered_sales_report_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📊 CSV Report Downloaded (${filteredOrders.length} records)`, 'download');
  }, [orders, products, showToast]);

  const value = {
    // State
    products, categories, orders, customers, coupons, reviews, stockHistory, roles, settings, cms,
    cart, wishlist, currentUser, adminLoggedIn, adminUser, messages, toasts, subscribers,
    // Setters (for admin direct mutations)
    setProducts, setCategories, setOrders, setCustomers, setCoupons, setReviews, setStockHistory, setRoles,
    setSettings, setCMS, setCart, setWishlist, setCurrentUser, setAdminLoggedIn, setAdminUser, setMessages, setSubscribers,
    // Actions
    showToast, removeToast, clearToasts, formatMoney,
    addToCart, updateCartQty, removeFromCart,
    toggleWishlist,
    loginWithEmail, registerUser, loginWithGoogle, logoutUser, saveUserAddress,
    adminLogin, adminLogout,
    handleContactForm, handleNewsletter, deleteSubscriber,
    placeOrder, applyCoupon,
    // Admin CRUD
    saveProduct, deleteProduct, adjustStockQty, restockAllLowStock,
    saveCategory, deleteCategory,
    updateOrderStatus, cycleOrderStatus, deleteOrder,
    saveCustomer, deleteCustomer,
    saveCoupon, deleteCoupon,
    saveGlobalCMS, saveHeroSlide, deleteHeroSlide, moveHeroSlide,
    saveStoreSettings,
    exportFilteredCSV,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
