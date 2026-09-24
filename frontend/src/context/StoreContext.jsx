import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// API Base URL (connects Hostinger frontend to Vercel backend API & MySQL database)
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://abelsbylincy.vercel.app')
).replace(/\/+$/, '');

export const apiFetch = (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
export const REMOVED_MOCK_SKUS = [
  'ABL-RG-206', 'ABL-NK-205', 'ABL-RG-204', 'ABL-BR-203', 'ABL-BR-102',
  'ABL-ER-104', 'ABL-NK-201', 'ABL-BR-202', 'ABL-BR-106', 'ABL-BR-105', 'ABL-NK-101',
  'p_na1', 'p_na2', 'p_na4', 'p_na5', 'p_na6', 'p_bs1', 'p_bs2', 'p_bs3', 'p_bs4', 'p_bs5', 'p_bs6'
];

export function isAllowedProduct(p) {
  if (!p || typeof p !== 'object') return false;
  const sku = String(p.sku || '').trim().toUpperCase();
  const id = String(p.id || '').trim();
  return !REMOVED_MOCK_SKUS.includes(sku) && !REMOVED_MOCK_SKUS.includes(id);
}

const DEFAULT_PRODUCTS = [];

const DEFAULT_CATEGORIES = [
  { id: 'rings', name: 'Rings', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png' },
  { id: 'necklaces', name: 'Necklaces', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796747/abels_by_lincy/necklace_collection_category.webp' },
  { id: 'earrings', name: 'Earrings', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796736/abels_by_lincy/Earrings_Category.webp' },
  { id: 'bracelets', name: 'Bracelets', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796726/abels_by_lincy/Bracelet_-_category.webp' },
  { id: 'bangles', name: 'Bangles', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796721/abels_by_lincy/Bangle_Category.webp' },
  { id: 'charms', name: 'Charms', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp' },
  { id: 'silver-collections', name: 'Silver Collections', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp' },
  { id: 'seasonal-collections', name: 'Seasonal Collections', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png' },
  { id: 'pair-collections', name: 'Pair Collections', image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png' },
];

const DEFAULT_SETTINGS = {
  storeEmail: 'lincytitus8@gmail.com',
  primaryCurrency: 'AUD',
  currencySymbol: '$',
  gstTaxRate: '10%',
  freeShippingThreshold: 60,
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

const DEFAULT_MESSAGES = [
  {
    id: 'm1',
    name: 'Lincy Titus',
    email: 'lincy@gmail.com',
    subject: 'Contact Inquiry',
    message: 'Hello, I have a question regarding custom gold-plated necklace sizing and care instructions.',
    date: '03 Sept 2026',
    type: 'contact'
  },
  {
    id: 'm2',
    name: 'Lincy Titus',
    email: 'abelsbylincy@gmail.com',
    subject: 'Contact Inquiry',
    message: 'Sellers display products on websites, mobile apps, or online marketplaces. Customers pay securely online using credit cards, digital wallets, or buy now pay later services.',
    date: '03 Sept 2026',
    type: 'contact'
  },
  {
    id: 'm3',
    name: 'Newsletter Subscriber',
    email: 'lincytitus8@gmail.com',
    subject: 'Newsletter Subscription',
    message: 'New client subscribed to newsletter updates & VIP offers (lincytitus8@gmail.com).',
    date: '03 Sept 2026',
    type: 'newsletter'
  }
];

const DEFAULT_SUBSCRIBERS = [
  { id: 'sub1', email: 'lincytitus8@gmail.com', date: '03 Sept 2026', status: 'Active' }
];

// ============================================================
// Category Fallback CDN Images (Lightweight Cloudinary URLs)
// ============================================================
export const CAT_FALLBACK_IMAGES = {
  rings: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png',
  necklaces: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796747/abels_by_lincy/necklace_collection_category.webp',
  earrings: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796736/abels_by_lincy/Earrings_Category.webp',
  bracelets: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796726/abels_by_lincy/Bracelet_-_category.webp',
  bangles: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796721/abels_by_lincy/Bangle_Category.webp',
  charms: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp',
  'silver-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp',
  'seasonal-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png',
  'pair-collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png',
  'pair collections': 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png',
};

export function sanitizeProduct(p) {
  if (!p || typeof p !== 'object') return p;
  const cat = (p.category || 'necklaces').trim().toLowerCase();
  const fallback = CAT_FALLBACK_IMAGES[cat] || CAT_FALLBACK_IMAGES.necklaces;

  let img = p.image || '';
  if (!img || img.trim() === '') {
    img = (Array.isArray(p.images) && p.images[0]) || fallback;
  }
  let images = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : [img];
  if (images.length === 0) {
    images = [img];
  }

  const isBS = Boolean(p.bestSeller || p.best_seller || p.is_best_seller || p.isBestSeller);
  const isNA = Boolean(p.newArrival || p.new_arrival || p.is_new_arrival || p.isNewArrival);
  const isFeat = Boolean(p.featured || p.is_featured || p.isFeatured);

  return {
    ...p,
    bestSeller: isBS,
    is_best_seller: isBS ? 1 : 0,
    newArrival: isNA,
    is_new_arrival: isNA ? 1 : 0,
    featured: isFeat,
    is_featured: isFeat ? 1 : 0,
    image: img,
    images: Array.from(new Set(images))
  };
}

export function sanitizeProducts(list) {
  if (!Array.isArray(list)) return list;
  return list.map(sanitizeProduct);
}

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
  try {
    const toStore = (key === 'abl_products_v12' && Array.isArray(val)) ? sanitizeProducts(val) : val;
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (err) {
    try {
      ['abl_products_v11', 'abl_products_v10', 'abl_products_v9', 'abl_products_v8', 'abl_products_v7', 'abl_products', 'abl_orders_v8', 'abl_orders'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      const toStore = (key === 'abl_products_v12' && Array.isArray(val)) ? sanitizeProducts(val) : val;
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch {}
  }
}

export function mergeCartLists(dbItems = [], localItems = []) {
  const dbArr = Array.isArray(dbItems) ? dbItems : [];
  const localArr = Array.isArray(localItems) ? localItems : [];
  const merged = [...dbArr.map(item => ({ ...item }))];

  for (const loc of localArr) {
    if (!loc || !loc.id) continue;
    const locId = String(loc.id);
    const locSize = String(loc.size || '');
    const locColor = String(loc.color || '');

    const existingIndex = merged.findIndex(
      m => String(m.id) === locId && String(m.size || '') === locSize && String(m.color || '') === locColor
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...loc,
        quantity: (Number(merged[existingIndex].quantity) || 1) + (Number(loc.quantity) || 1)
      };
    } else {
      merged.push({ ...loc });
    }
  }

  return merged;
}

export function matchesOrderId(o, targetKey) {
  if (!o || targetKey === undefined || targetKey === null || targetKey === '') return false;
  const target = String(targetKey).trim();
  if (o.id && String(o.id).trim() === target) return true;
  if (o.order_number && String(o.order_number).trim() === target) return true;
  if (o.uuid && String(o.uuid).trim() === target) return true;
  if (o.dbId !== undefined && o.dbId !== null && String(o.dbId).trim() === target) return true;
  if (o.sessionId && String(o.sessionId).trim() === target) return true;
  return false;
}

export function areSameOrder(a, b) {
  if (!a || !b) return false;
  const aId = a.id ? String(a.id).trim() : '';
  const bId = b.id ? String(b.id).trim() : '';
  const aNum = a.order_number ? String(a.order_number).trim() : '';
  const bNum = b.order_number ? String(b.order_number).trim() : '';
  const aUuid = a.uuid ? String(a.uuid).trim() : '';
  const bUuid = b.uuid ? String(b.uuid).trim() : '';
  const aDbId = (a.dbId !== undefined && a.dbId !== null) ? String(a.dbId).trim() : '';
  const bDbId = (b.dbId !== undefined && b.dbId !== null) ? String(b.dbId).trim() : '';
  const aSession = a.sessionId ? String(a.sessionId).trim() : '';
  const bSession = b.sessionId ? String(b.sessionId).trim() : '';

  if (aId && bId && aId === bId) return true;
  if (aNum && bNum && aNum === bNum) return true;
  if (aId && bNum && aId === bNum) return true;
  if (aNum && bId && aNum === bId) return true;
  if (aUuid && bUuid && aUuid === bUuid) return true;
  if (aDbId && bDbId && aDbId === bDbId) return true;
  if (aSession && bSession && aSession === bSession) return true;
  return false;
}

export function mergeOrdersAuthoritatively(serverOrders = [], localOrders = []) {
  const sList = Array.isArray(serverOrders) ? serverOrders : [];
  const lList = Array.isArray(localOrders) ? localOrders : [];
  const merged = [];

  // Start with server orders
  sList.forEach(so => {
    merged.push({ ...so });
  });

  // Merge local orders (local keeps freshest status/tracking/custom fields)
  lList.forEach(lo => {
    const idx = merged.findIndex(m => areSameOrder(m, lo));
    if (idx !== -1) {
      merged[idx] = {
        ...merged[idx],
        ...lo,
        status: lo.status || merged[idx].status,
        trackingNumber: lo.trackingNumber || merged[idx].trackingNumber,
        refundAmount: lo.refundAmount !== undefined ? lo.refundAmount : merged[idx].refundAmount,
        refundStatus: lo.refundStatus || merged[idx].refundStatus
      };
    } else {
      merged.push({ ...lo });
    }
  });

  return merged;
}

// ============================================================
// Context
// ============================================================
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Purge any stale legacy localStorage keys
  useEffect(() => {
    try {
      localStorage.removeItem('abl_reviews_v6');
      localStorage.removeItem('abl_reviews_v5');
      localStorage.removeItem('abl_reviews');
      localStorage.removeItem('abl_coupons_v6');
      localStorage.removeItem('abl_coupons_v5');
      localStorage.removeItem('abl_coupons_v4');
      localStorage.removeItem('abl_coupons_v3');
      localStorage.removeItem('abl_coupons_v2');
      localStorage.removeItem('abl_coupons');
      localStorage.removeItem('abl_deleted_coupon_codes');
      localStorage.removeItem('abl_products_v10');
      localStorage.removeItem('abl_products_v9');
      localStorage.removeItem('abl_products_v8');
      localStorage.removeItem('abl_products_v7');
      localStorage.removeItem('abl_products');
      localStorage.removeItem('abl_orders_v8');
      localStorage.removeItem('abl_orders_v7');
      localStorage.removeItem('abl_orders');
    } catch {}
  }, []);

  // Persistent blacklist for deleted products (ensures deleted items NEVER reappear on refresh)
  const [deletedProductIds, setDeletedProductIds] = useState(() => {
    return readLS('abl_deleted_product_ids', []).filter(Boolean);
  });

  // Persistent blacklist for deleted reviews (ensures deleted reviews NEVER reappear on refresh)
  const [deletedReviewIds, setDeletedReviewIds] = useState(() => {
    return readLS('abl_deleted_review_ids', []).filter(Boolean);
  });

  // Products initialized from clean storage or empty array
  const [products, setProductsRaw] = useState(() => {
    // Clear out any old legacy mock local storage caches
    if (typeof window !== 'undefined') {
      ['abl_products_v11', 'abl_products_v10', 'abl_products_v9', 'abl_products_v8', 'abl_products_v7', 'abl_products_v6', 'abl_products_v5', 'abl_products_v4', 'abl_products_v3', 'abl_products_v2', 'abl_products'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
    }
    const saved = readLS('abl_products_v12', null);
    if (saved !== null && Array.isArray(saved)) {
      return sanitizeProducts(saved.filter(isAllowedProduct));
    }
    return [];
  });

  const [orders, setOrdersRaw] = useState(() => {
    return readLS('abl_orders_v9', DEFAULT_ORDERS);
  });

  const [categories, setCategoriesRaw] = useState(() => {
    const saved = readLS('abl_categories_v6', null) || readLS('abl_categories_v5', null);
    if (Array.isArray(saved) && saved.length > 0) {
      const catMap = new Map();
      DEFAULT_CATEGORIES.forEach(c => catMap.set(c.id, c));
      saved.forEach(c => catMap.set(c.id, { ...(catMap.get(c.id) || {}), ...c }));
      const list = Array.from(catMap.values());
      writeLS('abl_categories_v6', list);
      return list;
    }
    return DEFAULT_CATEGORIES;
  });
  const [customers, setCustomersRaw] = useState(() => readLS('abl_customers_v7', DEFAULT_CUSTOMERS));
  const [coupons, setCouponsRaw] = useState([]);
  const [reviews, setReviewsRaw] = useState(() => {
    const saved = readLS('abl_reviews_v7', null);
    const deletedIds = (readLS('abl_deleted_review_ids', []) || []).map(String);
    if (Array.isArray(saved)) return saved.filter(r => !deletedIds.includes(String(r.id)));
    return DEFAULT_REVIEWS;
  });
  const [stockHistory, setStockHistoryRaw] = useState(() => readLS('abl_stock_history_v6', DEFAULT_STOCK_HISTORY));
  const [roles, setRolesRaw] = useState(() => readLS('abl_roles', DEFAULT_ROLES));
  const [settings, setSettingsRaw] = useState(() => readLS('abl_settings', DEFAULT_SETTINGS));
  const [cms, setCMSRaw] = useState(() => readLS('abl_cms_v5', DEFAULT_CMS));
  const [cart, setCartRaw] = useState(() => {
    const guestCart = readLS('abl_cart', []);
    const savedUser = readLS('abl_current_user', null);
    if (savedUser?.email) {
      const userKey = `abl_cart_${savedUser.email.trim().toLowerCase()}`;
      const userCart = readLS(userKey, []);
      if (Array.isArray(userCart) && userCart.length > 0) {
        return mergeCartLists(userCart, guestCart);
      }
    }
    return guestCart;
  });
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlist, setWishlistRaw] = useState(() => readLS('abl_wishlist', []));
  const [currentUser, setCurrentUserRaw] = useState(() => readLS('abl_current_user', null));
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => readLS('abl_admin_auth', false));
  const [adminUser, setAdminUserRaw] = useState(() => readLS('abl_admin_user', null));
  const [messages, setMessagesRaw] = useState(() => readLS('abl_messages_v2', DEFAULT_MESSAGES));
  const [subscribers, setSubscribersRaw] = useState(() => readLS('abl_subscribers_v2', DEFAULT_SUBSCRIBERS));

  // Authoritative sync with backend API (Orders, Products, Reviews, Coupons directly from Server/DB)
  const syncBackendData = useCallback(async () => {
    try {
      // 1. Fetch Orders from Server / Database
      const ordersRes = await apiFetch('/api/orders/all');
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && Array.isArray(data.orders)) {
          const existingOrders = readLS('abl_orders_v9', []) || [];
          const mergedOrders = mergeOrdersAuthoritatively(data.orders, existingOrders);
          setOrdersRaw(mergedOrders);
          writeLS('abl_orders_v9', mergedOrders);

          // Re-sync any locally completed orders to server if missing on backend (e.g. serverless cold start)
          const missingOnServer = existingOrders.filter(lo => !data.orders.some(so => areSameOrder(so, lo)));
          if (missingOnServer.length > 0) {
            missingOnServer.forEach(missingOrder => {
              apiFetch('/api/orders/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: missingOrder })
              }).catch(() => {});
            });
          }

          // Authoritative synchronization of unique client directory from orders
          const customerMap = new Map();
          const existingCusts = readLS('abl_customers_v7', DEFAULT_CUSTOMERS) || [];
          existingCusts.forEach(c => {
            if (c.email) customerMap.set(c.email.trim().toLowerCase(), c);
          });
          mergedOrders.forEach(o => {
            const email = (o.email || o.customerEmail || o.guest_email || o.shippingAddress?.email || (typeof o.customer === 'object' && o.customer?.email) || '').trim().toLowerCase();
            if (email) {
              const name = (o.customer && typeof o.customer === 'string' && o.customer !== 'Valued Customer')
                ? o.customer
                : (o.shippingAddress ? `${o.shippingAddress.first_name || ''} ${o.shippingAddress.last_name || ''}`.trim() : 'Valued Customer');
              const spentNum = o.rawAmount || parseFloat(String(o.total || '0').replace(/[^0-9.]/g, '')) || 0;
              const dateStr = o.date || 'Recent';

              if (customerMap.has(email)) {
                const existing = customerMap.get(email);
                const currentSpent = parseFloat(String(existing.spent || '0').replace(/[^0-9.]/g, '')) || 0;
                customerMap.set(email, {
                  ...existing,
                  name: (existing.name && existing.name !== 'Valued Customer') ? existing.name : name,
                  orders: Math.max(existing.orders || 1, (existing.orders || 1) + 1),
                  spent: `$${(currentSpent + spentNum).toFixed(2)}`,
                  status: 'Active'
                });
              } else {
                customerMap.set(email, {
                  id: `cust_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                  name: name || 'Valued Customer',
                  email: email,
                  phone: o.phone || '',
                  orders: 1,
                  spent: `$${spentNum.toFixed(2)}`,
                  joined: dateStr,
                  status: 'Active'
                });
              }
            }
          });
          const mergedCustomers = Array.from(customerMap.values());
          if (mergedCustomers.length > 0) {
            setCustomersRaw(mergedCustomers);
            writeLS('abl_customers_v7', mergedCustomers);
          }
        }
      }
    } catch (err) {
      // Server offline fallback
    }

    try {
      // 2. Fetch Products from Server / Database (Authoritative single source of truth)
      const prodRes = await apiFetch(`/api/products?t=${Date.now()}`);
      if (prodRes.ok) {
        const data = await prodRes.json();
        if (data.success && Array.isArray(data.products)) {
          const existingProducts = readLS('abl_products_v12', []) || [];
          const cleanDBProducts = sanitizeProducts(data.products.filter(isAllowedProduct));

          // Retain stock deductions from local storage if local has confirmed purchase reduction
          const mergedProducts = cleanDBProducts.map(dbProd => {
            const localMatch = existingProducts.find(lp => 
              String(lp.id) === String(dbProd.id) ||
              (lp.sku && dbProd.sku && String(lp.sku).trim().toUpperCase() === String(dbProd.sku).trim().toUpperCase())
            );
            if (localMatch && localMatch.stockQty !== undefined && localMatch.stockQty < dbProd.stockQty) {
              return { ...dbProd, stockQty: localMatch.stockQty, inStock: localMatch.stockQty > 0 };
            }
            return dbProd;
          });

          setProductsRaw(mergedProducts);
          writeLS('abl_products_v12', mergedProducts);
        }
      }
    } catch (err) {
      // Server offline fallback
    }

    try {
      // 3. Fetch Reviews from Server / Database (Authoritative sync across all browsers)
      const revRes = await apiFetch(`/api/reviews?t=${Date.now()}`);
      if (revRes.ok) {
        const data = await revRes.json();
        if (data.success && Array.isArray(data.reviews)) {
          const deletedIds = (readLS('abl_deleted_review_ids', []) || []).map(String);
          const formatted = data.reviews
            .filter(r => !deletedIds.includes(String(r.id)))
            .map(r => ({
              id: r.id,
              productId: String(r.productId || r.product_id),
              productName: r.productName || r.product_name || '',
              userId: r.userId || r.user_id || null,
              userEmail: r.userEmail || r.user_email || '',
              author: r.author || r.author_name || [r.first_name, r.last_name].filter(Boolean).join(' ') || (r.userEmail || r.user_email || '').split('@')[0] || 'Customer',
              rating: Number(r.rating) || 5,
              title: r.title || `${r.rating || 5} Star Rating`,
              text: r.text || r.review_text || '',
              date: (r.createdAt || r.created_at) ? new Date(r.createdAt || r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (r.date || 'Recent'),
              status: r.status || 'approved',
              reply: r.reply || ''
            }));
          setReviewsRaw(formatted);
          writeLS('abl_reviews_v7', formatted);
        }
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      // 4. Fetch CMS Settings, Announcement Banner, & Hero Slides from Server / Database (Authoritative sync across all browsers)
      const cmsRes = await apiFetch(`/api/cms?t=${Date.now()}`);
      if (cmsRes.ok) {
        const data = await cmsRes.json();
        if (data.success && data.cms && typeof data.cms === 'object') {
          setCMSRaw(prev => {
            const merged = { ...DEFAULT_CMS, ...(prev || {}), ...data.cms };
            if (Array.isArray(data.cms.heroSlides) && data.cms.heroSlides.length > 0) {
              merged.heroSlides = data.cms.heroSlides;
            }
            writeLS('abl_cms_v5', merged);
            return merged;
          });
        }
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      // 5. Fetch Contact Inquiries from MySQL Database
      const msgRes = await apiFetch(`/api/contact/messages?t=${Date.now()}`);
      if (msgRes.ok) {
        const data = await msgRes.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessagesRaw(data.messages);
          writeLS('abl_messages_v2', data.messages);
        }
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      // 6. Fetch Newsletter Subscribers from MySQL Database
      const subRes = await apiFetch(`/api/newsletter/subscribers?t=${Date.now()}`);
      if (subRes.ok) {
        const data = await subRes.json();
        if (data.success && Array.isArray(data.subscribers)) {
          setSubscribersRaw(data.subscribers);
          writeLS('abl_subscribers_v2', data.subscribers);
        }
      }
    } catch (err) {
      // Offline fallback
    }

    try {
      // 7. Fetch Coupons from Server / Database (Authoritative sync across all browsers)
      const cpRes = await apiFetch(`/api/coupons?t=${Date.now()}`);
      if (cpRes.ok) {
        const data = await cpRes.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCouponsRaw(data.coupons);
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    syncBackendData();
  }, [syncBackendData, adminLoggedIn, currentUser?.email]);

  // Cross-tab real-time sync via storage event (for session, cart, wishlist, products)
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        const val = JSON.parse(e.newValue);
        if (e.key === 'abl_products_v12') setProductsRaw(val);
        else if (e.key === 'abl_orders_v9') setOrdersRaw(val);
        else if (e.key === 'abl_categories_v5') setCategoriesRaw(val);
        else if (e.key === 'abl_customers_v7') setCustomersRaw(val);
        else if (e.key === 'abl_reviews_v7') setReviewsRaw(val);
        else if (e.key === 'abl_stock_history_v6') setStockHistoryRaw(val);
        else if (e.key === 'abl_cms_v5') setCMSRaw(val);
        else if (e.key === 'abl_settings') setSettingsRaw(val);
        else if (e.key === 'abl_messages_v2') setMessagesRaw(val);
        else if (e.key === 'abl_subscribers_v2') setSubscribersRaw(val);
        else if (e.key === 'abl_cart') setCartRaw(val);
        else if (e.key === 'abl_wishlist') setWishlistRaw(val);
        else if (e.key === 'abl_current_user') setCurrentUserRaw(val);
        else if (e.key === 'abl_admin_auth') setAdminLoggedIn(val);
        else if (e.key === 'abl_admin_user') setAdminUserRaw(val);
      } catch (err) {
        // Ignore parse error
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Persisting helpers
  const setProducts = useCallback((updaterOrValue) => {
    setProductsRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_products_v12', next);
      return next;
    });
  }, []);
  const setCategories = useCallback((updaterOrValue) => {
    setCategoriesRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_categories_v5', next);
      return next;
    });
  }, []);
  const setOrders = useCallback((updaterOrValue) => {
    setOrdersRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_orders_v9', next);
      return next;
    });
  }, []);
  const setCustomers = useCallback((updaterOrValue) => {
    setCustomersRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_customers_v7', next);
      return next;
    });
  }, []);
  const setCoupons = useCallback((updaterOrValue) => {
    setCouponsRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      return next;
    });
  }, []);
  const setReviews = useCallback((updaterOrValue) => {
    setReviewsRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_reviews_v7', next);
      return next;
    });
  }, []);
  const setStockHistory = useCallback((updaterOrValue) => {
    setStockHistoryRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_stock_history_v6', next);
      return next;
    });
  }, []);
  const setRoles = useCallback((v) => { setRolesRaw(v); writeLS('abl_roles', v); }, []);
  const setSettings = useCallback((v) => { setSettingsRaw(v); writeLS('abl_settings', v); }, []);
  const setSubscribers = useCallback((updaterOrValue) => {
    setSubscribersRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_subscribers_v2', next);
      return next;
    });
  }, []);
  const setCMS = useCallback((updaterOrValue) => {
    setCMSRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_cms_v5', next);
      try {
        apiFetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cms: next })
        }).catch(() => {});
      } catch {}
      return next;
    });
  }, []);
  const setCart = useCallback((updaterOrValue) => {
    let nextItems;
    setCartRaw(prev => {
      nextItems = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      if (!Array.isArray(nextItems)) nextItems = [];
      writeLS('abl_cart', nextItems);
      return nextItems;
    });

    const user = readLS('abl_current_user', null) || currentUser;
    const email = user?.email?.trim().toLowerCase();
    if (email && Array.isArray(nextItems)) {
      writeLS(`abl_cart_${email}`, nextItems);
      const token = localStorage.getItem('abl_access_token');
      apiFetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, items: nextItems })
      }).catch(err => console.warn('⚠️ Cart sync note:', err.message));
    }
  }, [currentUser]);

  const setWishlist = useCallback((v) => { setWishlistRaw(v); writeLS('abl_wishlist', v); }, []);
  const setCurrentUser = useCallback((v) => { setCurrentUserRaw(v); writeLS('abl_current_user', v); }, []);
  const setAdminUser = useCallback((v) => { setAdminUserRaw(v); writeLS('abl_admin_user', v); }, []);
  const setMessages = useCallback((updaterOrValue) => {
    setMessagesRaw(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      writeLS('abl_messages_v2', next);
      return next;
    });
  }, []);

  // Continuous auto-sync: when cart changes or user logs in, persist cart to DB
  useEffect(() => {
    const userEmail = currentUser?.email?.trim().toLowerCase();
    if (!userEmail || !Array.isArray(cart) || cart.length === 0) return;

    const token = localStorage.getItem('abl_access_token');
    apiFetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ email: userEmail, items: cart })
    }).catch(() => {});
  }, [cart, currentUser?.email]);

  // Long-term multi-device & Incognito Cart preservation: sync account cart from MySQL DB
  useEffect(() => {
    const userEmail = currentUser?.email?.trim().toLowerCase();
    if (!userEmail) return;

    let isMounted = true;
    setCartLoading(true);

    const syncUserCartFromDB = async () => {
      try {
        const token = localStorage.getItem('abl_access_token');
        const res = await apiFetch(`/api/cart?email=${encodeURIComponent(userEmail)}&t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items) && isMounted) {
            const dbList = data.items;
            const localList = readLS('abl_cart', []) || [];
            const userSavedList = readLS(`abl_cart_${userEmail}`, []) || [];

            let finalList = mergeCartLists(dbList, userSavedList);
            finalList = mergeCartLists(finalList, localList);

            setCartRaw(finalList);
            writeLS('abl_cart', finalList);
            writeLS(`abl_cart_${userEmail}`, finalList);

            if (finalList.length > 0) {
              apiFetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ email: userEmail, items: finalList })
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ User cart sync error:', err.message);
      } finally {
        if (isMounted) setCartLoading(false);
      }
    };

    syncUserCartFromDB();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

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
  const addToCart = useCallback((id, qty = 1, size = '', color = '') => {
    setCart(prev => {
      const existing = prev.find(i => (i.id === id || i.productId === id) && (i.size || '') === (size || '') && (i.color || '') === (color || ''));
      const product = products.find(p => p.id === id || p.sku === id || p.slug === id);
      if (!product) return prev;
      let itemImg = product.images?.[0] || product.image;
      if (color && product.colorImages?.[color]?.[0]) {
        itemImg = product.colorImages[color][0];
      }
      const itemPrice = (product.salePrice && Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price))
        ? Number(product.salePrice)
        : Number(product.price);

      if (existing) {
        return prev.map(i => ((i.id === id || i.productId === id) && (i.size || '') === (size || '') && (i.color || '') === (color || '')) ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        id: product.id || id,
        productId: product.id || id,
        sku: product.sku || '',
        slug: product.slug || '',
        name: product.name,
        category: product.category || '',
        price: itemPrice,
        image: itemImg,
        quantity: qty,
        size: size || '',
        color: color || ''
      }];
    });
    const product = products.find(p => p.id === id || p.sku === id || p.slug === id);
    if (typeof window !== 'undefined' && window.gtag && product) {
      window.gtag('event', 'add_to_cart', {
        currency: 'AUD',
        value: product.price * qty,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }]
      });
    }
    showToast('Product Added to Cart!', 'cart', { label: 'View Bag', link: '/cart' });
  }, [products, setCart, showToast]);

  const updateCartQty = useCallback((id, qty, size = '', color = '') => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => (i.id === id && (i.size || '') === (size || '') && (i.color || '') === (color || '')) ? { ...i, quantity: qty } : i));
  }, [setCart]);

  const removeFromCart = useCallback((id, size = '', color = '') => {
    setCart(prev => prev.filter(i => !(i.id === id && (i.size || '') === (size || '') && (i.color || '') === (color || ''))));
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
  const loginWithEmail = useCallback(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const u = data.user || {};
        const userName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || cleanEmail.split('@')[0];
        const userObj = {
          id: u.uuid || u.id || `c_${Date.now()}`,
          name: userName,
          email: u.email || cleanEmail,
          role: u.role || 'customer',
          status: 'active'
        };

        if (data.accessToken) {
          localStorage.setItem('abl_access_token', data.accessToken);
        }

        // Direct MySQL DB cart fetch or payload cart on login (ensures immediate cart visibility and auto-merges guest cart)
        const localItems = readLS('abl_cart', []) || [];
        const userSavedItems = readLS(`abl_cart_${cleanEmail}`, []) || [];
        let dbItems = Array.isArray(data.cart) ? data.cart : null;

        if (!dbItems || dbItems.length === 0) {
          try {
            const cartRes = await apiFetch(`/api/cart?email=${encodeURIComponent(cleanEmail)}&t=${Date.now()}`, {
              headers: {
                'Cache-Control': 'no-cache',
                ...(data.accessToken ? { 'Authorization': `Bearer ${data.accessToken}` } : {})
              }
            });
            if (cartRes.ok) {
              const cartData = await cartRes.json();
              if (cartData.success && Array.isArray(cartData.items)) {
                dbItems = cartData.items;
              }
            }
          } catch (cErr) {
            console.warn('⚠️ Cart fetch fallback note:', cErr.message);
          }
        }

        let finalList = mergeCartLists(dbItems || [], userSavedItems);
        finalList = mergeCartLists(finalList, localItems);
        setCartRaw(finalList);
        writeLS('abl_cart', finalList);
        writeLS(`abl_cart_${cleanEmail}`, finalList);

        if (finalList.length > 0) {
          apiFetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(data.accessToken ? { 'Authorization': `Bearer ${data.accessToken}` } : {})
            },
            body: JSON.stringify({ email: cleanEmail, items: finalList })
          }).catch(() => {});
        }

        setCurrentUser(userObj);
        writeLS('abl_current_user', userObj);
        writeLS('abl_user_token', { ...userObj, password });

        showToast(`Welcome back, ${userName}!`, 'check');
        return true;
      }

      // Server responded but login failed (wrong email/password)
      return false;
    } catch (err) {
      // Network error / server offline — try local fallback
      const found = customers.find(c => c.email.toLowerCase() === cleanEmail);
      if (found) {
        setCurrentUser({ ...found });
        writeLS('abl_current_user', { ...found });
        showToast(`Welcome back, ${found.name}!`, 'check');
        return true;
      }
      const stored = readLS('abl_user_token', null);
      if (stored && stored.email?.toLowerCase() === cleanEmail && stored.password === password) {
        setCurrentUser(stored);
        writeLS('abl_current_user', stored);
        showToast(`Welcome back, ${stored.name}!`, 'check');
        return true;
      }
      return false;
    }
  }, [customers, setCurrentUser, showToast]);

  const registerUser = useCallback(async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = customers.find(c => c.email.toLowerCase() === cleanEmail);
    if (exists) {
      showToast('An account with this email already exists', 'alert-circle');
      return false;
    }
    const newUser = { id: `c${Date.now()}`, name, email: cleanEmail, orders: 0, spent: '$0', joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), status: 'New' };
    setCustomers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    writeLS('abl_current_user', newUser);
    writeLS('abl_user_token', { ...newUser, password });

    // Sync with backend API (creates MySQL record)
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, firstName: name })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.accessToken) {
        localStorage.setItem('abl_access_token', data.accessToken);
      }
    } catch (err) {
      console.warn('⚠️ Register DB sync note:', err.message);
    }

    showToast(`Welcome to Abel's By Lincy, ${name}!`, 'check');
    return true;
  }, [customers, setCustomers, setCurrentUser, showToast]);

  const requestPasswordReset = useCallback(async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      showToast('Please enter a valid email address.', 'alert-circle');
      return { success: false, message: 'Email address is required.' };
    }

    // Client-side 24-hour rate limit check (max 3 attempts per day)
    const storageKey = `abl_pwd_reset_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const existingAttempts = readLS(storageKey, []).filter(ts => typeof ts === 'number' && ts > oneDayAgo);

    if (existingAttempts.length >= 3) {
      const msg = 'You have reached the maximum limit of 3 password reset requests per day. Please try again tomorrow or contact support.';
      showToast(msg, 'alert-circle');
      return { success: false, message: msg };
    }

    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429 || (!res.ok && data.message?.includes('limit of 3'))) {
        const msg = data.message || 'Maximum 3 password reset requests allowed per day.';
        showToast(msg, 'alert-circle');
        return { success: false, message: msg };
      }

      existingAttempts.push(Date.now());
      writeLS(storageKey, existingAttempts);
      showToast('Please check your inbox and spam folder.', 'check');
      return { success: true, message: data.message || 'Please check your inbox and spam folder.' };
    } catch (err) {
      // Local fallback simulation if server is offline
      existingAttempts.push(Date.now());
      writeLS(storageKey, existingAttempts);
      showToast('Please check your inbox and spam folder.', 'check');
      return { success: true, message: 'Please check your inbox and spam folder.' };
    }
  }, [showToast]);

  const resetUserPassword = useCallback(async (token, newPassword, userEmail = '') => {
    if (!token || !newPassword) {
      showToast('Invalid reset parameters.', 'alert-circle');
      return { success: false, message: 'Token and new password are required.' };
    }

    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, email: userEmail })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (userEmail) {
          const stored = readLS('abl_user_token', null);
          if (stored && stored.email?.toLowerCase() === userEmail.toLowerCase()) {
            writeLS('abl_user_token', { ...stored, password: newPassword });
          }
        }
        showToast('Password successfully reset! Please sign in.', 'check');
        return { success: true, message: data.message || 'Password reset successfully. You can now login.' };
      } else {
        const errorMsg = data.message || 'Invalid or expired reset link. Please request a new one.';
        showToast(errorMsg, 'alert-circle');
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      if (userEmail) {
        const stored = readLS('abl_user_token', null);
        if (stored && stored.email?.toLowerCase() === userEmail.toLowerCase()) {
          writeLS('abl_user_token', { ...stored, password: newPassword });
        }
      }
      showToast('Password reset successfully! Please sign in.', 'check');
      return { success: true, message: 'Password reset successfully. You can now login.' };
    }
  }, [showToast]);

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

  const loginWithGoogleProfile = useCallback(async (profile) => {
    if (!profile || !profile.email) {
      showToast('Google authentication failed. Please try again.', 'alert-circle');
      return false;
    }

    const { name, email, picture, sub, given_name, family_name } = profile;
    const lowerEmail = email.trim().toLowerCase();
    const existing = customers.find(c => c.email?.toLowerCase() === lowerEmail);

    const firstName = given_name || (name ? name.split(' ')[0] : '') || existing?.firstName || '';
    const lastName = family_name || (name ? name.split(' ').slice(1).join(' ') : '') || existing?.lastName || '';

    const userObj = {
      id: existing ? existing.id : `c_google_${sub || Date.now()}`,
      name: name || (firstName ? `${firstName} ${lastName}`.trim() : '') || existing?.name || email.split('@')[0],
      firstName: firstName,
      lastName: lastName,
      email: lowerEmail,
      avatar: picture || existing?.avatar || '',
      provider: 'google',
      joined: existing ? existing.joined : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      spent: existing ? existing.spent : '$0',
      orders: existing ? existing.orders : 0
    };

    // Immediately set currentUser & write localStorage so authentication takes effect with zero delay
    setCurrentUser(userObj);
    writeLS('abl_current_user', userObj);
    writeLS('abl_user_token', { email: lowerEmail, name: userObj.name, provider: 'google' });

    if (!existing) {
      setCustomers(prev => [userObj, ...(prev || [])]);
    } else {
      setCustomers(prev => (prev || []).map(c => c.email?.toLowerCase() === lowerEmail ? { ...c, avatar: userObj.avatar || c.avatar } : c));
    }

    // Immediately restore user's saved cart & guest items into state
    const userSavedCart = readLS(`abl_cart_${lowerEmail}`, []) || [];
    const localGuestCart = readLS('abl_cart', []) || [];
    let immediateList = mergeCartLists(userSavedCart, localGuestCart);
    if (immediateList.length > 0) {
      setCartRaw(immediateList);
      writeLS('abl_cart', immediateList);
      writeLS(`abl_cart_${lowerEmail}`, immediateList);
    }

    showToast(`Welcome back, ${userObj.name}!`, 'check');

    // If currently on /account, redirect immediately to target destination or home
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account')) {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('redirect') || '/';
      setTimeout(() => {
        if (window.location.pathname.startsWith('/account')) {
          window.location.href = target;
        }
      }, 50);
    }

    // Background asynchronous account linking & MySQL cart sync
    (async () => {
      let backendCart = [];
      try {
        const authRes = await apiFetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: lowerEmail,
            googleSub: sub || profile.id || `g_${Date.now()}`,
            firstName,
            lastName,
            avatarUrl: picture || ''
          })
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.accessToken) {
            localStorage.setItem('abl_access_token', authData.accessToken);
          }
          if (Array.isArray(authData.cart) && authData.cart.length > 0) {
            backendCart = authData.cart;
          }
        }
      } catch (authErr) {
        console.warn('⚠️ Google Auth backend sync note:', authErr.message);
      }

      if (backendCart.length === 0) {
        try {
          const token = localStorage.getItem('abl_access_token');
          const cartRes = await apiFetch(`/api/cart?email=${encodeURIComponent(lowerEmail)}&t=${Date.now()}`, {
            headers: {
              'Cache-Control': 'no-cache',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData.success && Array.isArray(cartData.items)) {
              backendCart = cartData.items;
            }
          }
        } catch (_) {}
      }

      let combinedList = mergeCartLists(backendCart, userSavedCart);
      combinedList = mergeCartLists(combinedList, localGuestCart);

      if (combinedList.length > 0) {
        setCartRaw(combinedList);
        writeLS('abl_cart', combinedList);
        writeLS(`abl_cart_${lowerEmail}`, combinedList);

        const token = localStorage.getItem('abl_access_token');
        apiFetch('/api/cart/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ email: lowerEmail, items: combinedList })
        }).catch(() => {});
      }
    })();

    return true;
  }, [customers, setCustomers, setCurrentUser, showToast]);

  const loginWithGoogle = useCallback((credentialOrEvent) => {
    if (typeof credentialOrEvent === 'string') {
      const profile = parseJwt(credentialOrEvent);
      if (profile) return loginWithGoogleProfile(profile);
      showToast('Invalid Google credential token', 'alert-circle');
      return false;
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
    writeLS('abl_current_user', null);
    setCartRaw([]);
    writeLS('abl_cart', []);
    try {
      localStorage.removeItem('abl_access_token');
      localStorage.removeItem('abl_user_token');
    } catch (_) {}
    showToast('Signed out successfully', 'check');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
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
    syncBackendData();
    showToast(`Welcome, ${role.user}!`, 'check');
    return true;
  }, [roles, setAdminUser, showToast, syncBackendData]);

  const adminLogout = useCallback(() => {
    setAdminLoggedIn(false);
    writeLS('abl_admin_auth', false);
    setAdminUser(null);
    showToast('Admin signed out', 'check');
  }, [setAdminUser, showToast]);

  // ============================================================
  // Contact form
  // ============================================================
  const handleContactForm = useCallback(async (name, email, subject, message) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || 'Website Visitor').trim();
    const cleanSubject = (subject || 'Contact Inquiry').trim();
    const cleanMessage = (message || '').trim();

    const newMsg = {
      id: `m_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'contact',
      status: 'unread'
    };

    setMessages(prev => [newMsg, ...(prev || [])]);
    showToast("Message sent! We'll be in touch soon.", 'check');

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage })
      });
    } catch (err) {
      console.warn('⚠️ Contact form API note:', err.message);
    }
    return true;
  }, [setMessages, showToast]);

  // ============================================================
  // Newsletter
  // ============================================================
  const handleNewsletter = useCallback(async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'alert-circle');
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Check local store list first
    const list = subscribers || [];
    if (list.some(s => s.email?.toLowerCase() === cleanEmail)) {
      showToast('You are already in the Lincy circle.', 'info');
      return { success: false, alreadySubscribed: true, message: 'You are already in the Lincy circle.' };
    }

    try {
      const res = await apiFetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json().catch(() => ({}));

      if (data.alreadySubscribed || (data.message && data.message.includes('already in the Lincy circle'))) {
        showToast('You are already in the Lincy circle.', 'info');
        return { success: false, alreadySubscribed: true, message: 'You are already in the Lincy circle.' };
      }

      if (res.ok && data.success) {
        const newSub = data.subscriber || {
          id: `sub_${Date.now()}`,
          email: cleanEmail,
          status: 'Active',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        setSubscribers(prev => [newSub, ...(prev || [])]);
        showToast('Thank you for joining the Circle!', 'check');
        return { success: true, message: 'Thank you for subscribing! Check your inbox for exclusive access.' };
      }
    } catch (err) {
      console.warn('⚠️ Newsletter subscribe API note:', err.message);
    }

    const newSub = {
      id: `sub_${Date.now()}`,
      email: cleanEmail,
      status: 'Active',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setSubscribers(prev => [newSub, ...(prev || [])]);
    showToast('Thank you for joining the Circle!', 'check');
    return { success: true, message: 'Thank you for subscribing! Check your inbox for exclusive access.' };
  }, [subscribers, setSubscribers, showToast]);

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

    const isExpress = checkoutData.shippingMethod === 'express' || String(checkoutData.shippingMethod || '').toLowerCase().includes('express');
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + (isExpress ? 2 : 4));
    const deliveryDateStr = estDelivery.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const newOrder = {
      id: `#ABL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: `${checkoutData.firstName || ''} ${checkoutData.lastName || ''}`.trim() || 'Valued Customer',
      email: checkoutData.email || '',
      phone: checkoutData.phone || '',
      address: checkoutData.address || '',
      city: checkoutData.city || '',
      state: checkoutData.state || '',
      postcode: checkoutData.postcode || '',
      product: cart.length > 1 ? `${cart[0]?.name || 'Fine Jewellery'} (+${cart.length - 1} items)` : (cart[0]?.name || 'Fine Jewellery'),
      items: cart,
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      deliveryEstimate: deliveryDateStr,
      shippingMethod: isExpress ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)',
      status: 'Confirmed',
      total: formatMoney(orderSubtotal),
      rawAmount: orderSubtotal,
      itemsCount: cart.length,
    };
    setOrders(prev => [newOrder, ...prev]);

    // Async sync to server
    try {
      apiFetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      }).catch(() => {});
    } catch {}

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
  }, [cart, products, customers, setProducts, setOrders, setCustomers, setCart, showToast, formatMoney]);

  // ============================================================
  // Admin CRUD helpers
  // ============================================================
  const saveProduct = useCallback(async (productData) => {
    const isEditing = Boolean(productData.id);
    const id = productData.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const rawProduct = {
      ...productData,
      id,
      category: (productData.category || 'necklaces').trim().toLowerCase(),
      price: Number(productData.price) || 0,
      salePrice: Number(productData.salePrice || 0),
      stockQty: Number(productData.stockQty ?? 10),
      inStock: (Number(productData.stockQty ?? 10)) > 0,
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : [productData.image].filter(Boolean),
      image: productData.image || (Array.isArray(productData.images) && productData.images[0]) || ''
    };
    const productToSave = sanitizeProduct(rawProduct);

    // Remove from deleted blacklist if saved/re-added
    const currentDeleted = readLS('abl_deleted_product_ids', []);
    const newDeleted = currentDeleted.filter(d => d !== id && d !== productData.id && d !== productData.sku);
    writeLS('abl_deleted_product_ids', newDeleted);
    setDeletedProductIds(newDeleted);

    // Optimistically update React state and storage immediately
    setProductsRaw(prev => {
      const idx = isEditing ? prev.findIndex(p => p.id === id || (productToSave.sku && p.sku && p.sku.toLowerCase() === productToSave.sku.toLowerCase())) : -1;
      let next;
      if (idx !== -1) {
        next = prev.map((p, i) => i === idx ? { ...p, ...productToSave } : p);
      } else {
        next = [productToSave, ...prev];
      }
      const sanitized = sanitizeProducts(next);
      writeLS('abl_products_v12', sanitized);
      return sanitized;
    });

    // Authoritative Server & Database sync — wait until MySQL write finishes
    try {
      const res = await apiFetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productToSave })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        showToast(data.message || 'Product saved locally, but the server did not accept it.', 'alert-circle');
        return;
      }
      if (data.dbSynced === false) {
        showToast(data.dbError ? `Saved locally; MySQL error: ${data.dbError}` : 'Product saved locally, but MySQL did not store it.', 'alert-circle');
        return;
      }
      if (Array.isArray(data.products)) {
        const cleanServerList = sanitizeProducts(data.products.filter(isAllowedProduct));
        setProductsRaw(cleanServerList);
        writeLS('abl_products_v12', cleanServerList);
      }
      showToast('Product saved to the store and database.', 'check');
    } catch (err) {
      console.warn('Sync server offline, updated local state only:', err);
      showToast('Product saved locally. Could not reach the server to store it in MySQL.', 'alert-circle');
    }
  }, [showToast]);

  const deleteProduct = useCallback(async (id) => {
    // 1. Add to permanent deleted blacklist
    const currentDeleted = readLS('abl_deleted_product_ids', []);
    const updatedDeleted = Array.from(new Set([...currentDeleted, String(id)]));
    writeLS('abl_deleted_product_ids', updatedDeleted);
    setDeletedProductIds(updatedDeleted);

    // 2. Remove immediately from React state and localStorage
    setProductsRaw(prev => {
      const updated = prev.filter(p => p.id !== id && p.sku !== id);
      writeLS('abl_products_v12', updated);
      return updated;
    });

    // 3. Authoritative Server & Database deletion
    try {
      const res = await apiFetch('/api/products/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteId: id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProductsRaw(prev => {
            const map = new Map();
            data.products.forEach(p => {
              const k = p.id || p.sku;
              if (k && (!p.id || !updatedDeleted.includes(p.id)) && (!p.sku || !updatedDeleted.includes(p.sku))) {
                map.set(String(k), sanitizeProduct(p));
              }
            });
            const filtered = Array.from(map.values());
            writeLS('abl_products_v12', filtered);
            return filtered;
          });
        }
      }
    } catch (err) {
      console.warn('Delete sync server offline, deleted locally only:', err);
    }

    showToast('Product deleted from database & store', 'trash');
  }, [showToast]);

  const adjustStockQty = useCallback((id, delta) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, (p.stockQty || 0) + delta);
        return { ...p, stockQty: newQty, inStock: newQty > 0 };
      }
      return p;
    }));
  }, [setProducts]);

  const restockAllLowStock = useCallback((qty) => {
    setProducts(prev => prev.map(p => (p.stockQty || 0) <= 8 ? { ...p, stockQty: (p.stockQty || 0) + qty, inStock: true } : p));
    showToast('Low stock items restocked!', 'check');
  }, [setProducts, showToast]);

  const saveCategory = useCallback((catData) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === catData.id);
      if (idx !== -1) {
        return prev.map((c, i) => i === idx ? { ...c, ...catData } : c);
      }
      return [...prev, catData];
    });
    showToast('Category saved!', 'check');
  }, [setCategories, showToast]);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted', 'check');
  }, [setCategories, showToast]);

  const updateOrderStatus = useCallback(async (id, newStatus, additionalData = {}) => {
    if (!id) return;
    let affectedOrder = null;
    setOrdersRaw(prev => {
      const currentList = Array.isArray(prev) ? prev : [];
      const updated = currentList.map(o => {
        if (matchesOrderId(o, id)) {
          affectedOrder = {
            ...o,
            status: newStatus,
            lastUpdated: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            ...additionalData
          };
          return affectedOrder;
        }
        return o;
      });
      writeLS('abl_orders_v9', updated);
      return updated;
    });

    // Authoritative Server sync
    if (affectedOrder) {
      try {
        const res = await apiFetch('/api/orders/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: affectedOrder })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrdersRaw(prev => {
              const current = Array.isArray(prev) ? prev : [];
              const merged = mergeOrdersAuthoritatively(data.orders, current);
              writeLS('abl_orders_v9', merged);
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Orders sync server offline, status updated locally only:', err);
      }
    }

    // Update customer spending when an order is cancelled or refunded
    if (affectedOrder && (newStatus === 'Cancelled' || newStatus === 'Refunded') && affectedOrder.email) {
      setCustomers(prev => prev.map(c => {
        if (c.email?.toLowerCase() === affectedOrder.email?.toLowerCase()) {
          const currentSpent = parseFloat(String(c.spent || '0').replace(/[^0-9.]/g, '')) || 0;
          const refundAmt = Number(affectedOrder.refundAmount || affectedOrder.rawAmount || 0);
          const newSpent = Math.max(0, currentSpent - refundAmt);
          return { ...c, spent: `$${newSpent.toLocaleString()}` };
        }
        return c;
      }));
    }

    showToast(`Order status updated to ${newStatus}`, 'check');
  }, [setCustomers, showToast]);

  const cycleOrderStatus = useCallback((id) => {
    if (!id) return;
    const statuses = ['Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    let affectedOrder = null;
    setOrdersRaw(prevOrders => {
      const current = Array.isArray(prevOrders) ? prevOrders : [];
      const updated = current.map(o => {
        if (matchesOrderId(o, id)) {
          const currentStatus = o.status || 'Confirmed';
          const idx = statuses.indexOf(currentStatus);
          const nextStatus = statuses[idx !== -1 ? (idx + 1) % statuses.length : 0];
          affectedOrder = {
            ...o,
            status: nextStatus,
            lastUpdated: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          };
          return affectedOrder;
        }
        return o;
      });
      writeLS('abl_orders_v9', updated);
      return updated;
    });

    if (affectedOrder) {
      apiFetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: affectedOrder })
      }).catch(() => {});
    }
  }, []);

  const deleteOrder = useCallback(async (id) => {
    if (!id) return;
    setOrdersRaw(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = current.filter(o => !matchesOrderId(o, id));
      writeLS('abl_orders_v9', updated);
      return updated;
    });
    try {
      const res = await apiFetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteId: id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrdersRaw(prev => {
            const current = Array.isArray(prev) ? prev : [];
            const merged = mergeOrdersAuthoritatively(data.orders, current);
            writeLS('abl_orders_v9', merged);
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Orders delete server offline, deleted locally only:', err);
    }
    showToast('Order deleted', 'trash');
  }, [showToast]);

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

  const saveCoupon = useCallback(async (cpData) => {
    if (!cpData || !cpData.code) return;
    const cleanCode = String(cpData.code).trim().toUpperCase();
    const formattedCp = {
      ...cpData,
      code: cleanCode,
      id: cpData.id || `cp_${cleanCode}`
    };

    // 1. Optimistic React state update
    setCouponsRaw(prev => {
      const currentList = Array.isArray(prev) ? prev : [];
      const existingIdx = currentList.findIndex(c => (formattedCp.id && c.id === formattedCp.id) || String(c.code).trim().toUpperCase() === cleanCode);
      let next;
      if (existingIdx !== -1) {
        next = [...currentList];
        next[existingIdx] = { ...next[existingIdx], ...formattedCp };
      } else {
        next = [...currentList, formattedCp];
      }
      return next;
    });

    // 2. Persist to MySQL DB & server, sync authoritative coupon list
    try {
      const res = await apiFetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedCp)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCouponsRaw(data.coupons);
          showToast(`Coupon "${cleanCode}" saved successfully!`, 'check');
          return true;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Failed to save coupon to database', 'alert-circle');
      }
    } catch (err) {
      console.warn('⚠️ Save coupon API note:', err.message);
      showToast('Network error saving coupon to server', 'alert-circle');
    }
  }, [showToast]);

  const deleteCoupon = useCallback(async (codeOrId) => {
    if (!codeOrId) return;
    const clean = String(codeOrId).trim().toUpperCase();

    // 1. Remove immediately from React state
    setCouponsRaw(prev => {
      return (prev || []).filter(c => String(c.code).trim().toUpperCase() !== clean && String(c.id) !== String(codeOrId));
    });

    // 2. Delete permanently from MySQL DB & server, sync authoritative coupon list
    try {
      const res = await apiFetch(`/api/coupons/${encodeURIComponent(codeOrId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCouponsRaw(data.coupons);
          showToast(`Coupon "${clean}" deleted successfully!`, 'check');
          return true;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Failed to delete coupon from database', 'alert-circle');
      }
    } catch (err) {
      console.warn('⚠️ Delete coupon API note:', err.message);
      showToast('Network error deleting coupon from server', 'alert-circle');
    }
  }, [showToast]);

  const saveGlobalCMS = useCallback(async (updates) => {
    let nextState;
    setCMSRaw(prev => {
      nextState = { ...(prev || DEFAULT_CMS), ...updates };
      writeLS('abl_cms_v5', nextState);
      return nextState;
    });
    try {
      const cur = readLS('abl_cms_v5', DEFAULT_CMS);
      const merged = { ...cur, ...updates };
      await apiFetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: merged })
      });
      showToast('Announcement & CMS saved to database!', 'check');
    } catch (err) {
      console.warn('⚠️ CMS save note:', err.message);
    }
  }, [showToast]);

  const saveHeroSlide = useCallback(async (idxOrData, slideData) => {
    let nextState;
    setCMSRaw(prev => {
      const base = prev || DEFAULT_CMS;
      const slides = [...(base.heroSlides || DEFAULT_CMS.heroSlides || [])];
      let idx = typeof idxOrData === 'number' ? idxOrData : -1;
      let data = typeof idxOrData === 'object' ? idxOrData : slideData;
      if (idx === -1) {
        slides.push({ ...data, id: data?.id || `s${Date.now()}` });
      } else {
        slides[idx] = { ...slides[idx], ...data };
      }
      nextState = { ...base, heroSlides: slides };
      writeLS('abl_cms_v5', nextState);
      return nextState;
    });

    try {
      const cur = readLS('abl_cms_v5', DEFAULT_CMS);
      const toSend = nextState || cur;
      await apiFetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: toSend })
      });
      showToast('Hero slide saved to database!', 'check');
    } catch (err) {
      console.warn('⚠️ Hero slide save note:', err.message);
    }
  }, [showToast]);

  const deleteHeroSlide = useCallback(async (target) => {
    let nextState;
    setCMSRaw(prev => {
      const base = prev || DEFAULT_CMS;
      const slides = [...(base.heroSlides || DEFAULT_CMS.heroSlides || [])];
      let newSlides;
      if (typeof target === 'number') {
        newSlides = slides.filter((_, i) => i !== target);
      } else {
        newSlides = slides.filter(s => s.id !== target);
      }
      nextState = { ...base, heroSlides: newSlides };
      writeLS('abl_cms_v5', nextState);
      return nextState;
    });

    try {
      const cur = readLS('abl_cms_v5', DEFAULT_CMS);
      const toSend = nextState || cur;
      await apiFetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: toSend })
      });
      showToast('Hero slide deleted from database', 'check');
    } catch (err) {
      console.warn('⚠️ Hero slide delete note:', err.message);
    }
  }, [showToast]);

  const moveHeroSlide = useCallback(async (idx, dir) => {
    let nextState;
    setCMSRaw(prev => {
      const base = prev || DEFAULT_CMS;
      const slides = [...(base.heroSlides || DEFAULT_CMS.heroSlides || [])];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= slides.length) return prev;
      const temp = slides[idx];
      slides[idx] = slides[newIdx];
      slides[newIdx] = temp;
      nextState = { ...base, heroSlides: slides };
      writeLS('abl_cms_v5', nextState);
      return nextState;
    });

    try {
      const cur = readLS('abl_cms_v5', DEFAULT_CMS);
      const toSend = nextState || cur;
      await apiFetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: toSend })
      });
      showToast('Hero slides reordered in database!', 'check');
    } catch (err) {
      console.warn('⚠️ Hero slide reorder note:', err.message);
    }
  }, [showToast]);

  const reorderHeroSlides = useCallback(async (fromIdx, toIdx) => {
    let nextState;
    setCMSRaw(prev => {
      const base = prev || DEFAULT_CMS;
      const slides = [...(base.heroSlides || DEFAULT_CMS.heroSlides || [])];
      if (fromIdx < 0 || fromIdx >= slides.length || toIdx < 0 || toIdx >= slides.length || fromIdx === toIdx) return prev;
      const [movedItem] = slides.splice(fromIdx, 1);
      slides.splice(toIdx, 0, movedItem);
      nextState = { ...base, heroSlides: slides };
      writeLS('abl_cms_v5', nextState);
      return nextState;
    });

    try {
      const cur = readLS('abl_cms_v5', DEFAULT_CMS);
      const toSend = nextState || cur;
      await apiFetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms: toSend })
      });
      showToast('Hero slides reordered in database!', 'check');
    } catch (err) {
      console.warn('⚠️ Hero slide reorder note:', err.message);
    }
  }, [showToast]);

  const saveStoreSettings = useCallback((updates) => {
    setSettings({ ...settings, ...updates });
    showToast('Settings saved!', 'check');
  }, [settings, setSettings, showToast]);


  const deleteSubscriber = useCallback(async (idOrEmail) => {
    setSubscribers(prev => (prev || []).filter(s => s.id !== idOrEmail && s.email !== idOrEmail));
    setMessages(prev => (prev || []).filter(m => m.id !== idOrEmail && m.email !== idOrEmail));
    showToast('Subscriber removed', 'check');

    try {
      await apiFetch(`/api/newsletter/subscribers/${encodeURIComponent(idOrEmail)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('⚠️ Delete subscriber API note:', err.message);
    }
  }, [setSubscribers, setMessages, showToast]);

  const deleteMessage = useCallback(async (id) => {
    setMessages(prev => (prev || []).filter(m => m.id !== id));
    showToast('Message deleted', 'check');

    try {
      await apiFetch(`/api/contact/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('⚠️ Delete message API note:', err.message);
    }
  }, [setMessages, showToast]);

  const addReview = useCallback(async (reviewData) => {
    const authorName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '') || reviewData.author || 'Customer';
    const userEmail = currentUser?.email || reviewData.userEmail || '';
    const userId = currentUser?.id || null;

    const existingUserReviews = (reviews || []).filter(r => 
      String(r.productId) === String(reviewData.productId) && 
      (
        (userId && r.userId && String(r.userId) === String(userId)) ||
        (userEmail && r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) ||
        (authorName && r.author && r.author.toLowerCase() === authorName.toLowerCase())
      )
    );

    if (existingUserReviews.length >= 5) {
      showToast('oops! You have reached the limit of 5 reviews for this product', 'alert-circle');
      return { success: false, message: 'oops! You have reached the limit of 5 reviews for this product' };
    }

    let createdReviewId = `rev_${Date.now()}`;
    let serverReview = null;

    try {
      const token = localStorage.getItem('abl_access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiFetch('/api/reviews/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: String(reviewData.productId),
          productName: reviewData.productName || 'Jewelry Piece',
          rating: Number(reviewData.rating) || 5,
          title: reviewData.title || `${reviewData.rating || 5} Star Rating`,
          reviewText: reviewData.text || '',
          userEmail: userEmail,
          authorName: authorName,
          userId: userId
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.message && data.message.includes('limit of 5 reviews')) {
        showToast('oops! You have reached the limit of 5 reviews for this product', 'alert-circle');
        return { success: false, message: 'oops! You have reached the limit of 5 reviews for this product' };
      }
      if (res.ok && data.success) {
        if (data.reviewId) createdReviewId = data.reviewId;
        if (data.review) serverReview = data.review;
      }
    } catch (err) {
      console.warn('⚠️ Review submission note:', err.message);
    }

    const newRev = serverReview ? {
      id: serverReview.id,
      productId: String(serverReview.productId || serverReview.product_id),
      productName: serverReview.productName || serverReview.product_name || reviewData.productName || 'Jewelry Piece',
      userId: serverReview.userId || userId,
      userEmail: serverReview.userEmail || userEmail,
      author: serverReview.author || serverReview.author_name || authorName,
      rating: Number(serverReview.rating || reviewData.rating || 5),
      title: serverReview.title || reviewData.title || `${reviewData.rating || 5} Star Rating`,
      text: serverReview.text || serverReview.review_text || reviewData.text || '',
      date: serverReview.created_at ? new Date(serverReview.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: serverReview.status || 'approved',
      verified: serverReview.is_verified_purchase !== undefined ? Boolean(serverReview.is_verified_purchase) : true,
      reply: serverReview.reply || ''
    } : {
      id: createdReviewId,
      productId: String(reviewData.productId),
      productName: reviewData.productName || 'Jewelry Piece',
      userId: userId,
      userEmail: userEmail,
      author: authorName,
      rating: Number(reviewData.rating) || 5,
      title: reviewData.title || `${reviewData.rating || 5} Star Rating`,
      text: reviewData.text || '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'approved',
      verified: true,
      reply: ''
    };

    setReviews(prev => [newRev, ...(prev || []).filter(r => String(r.id) !== String(newRev.id))]);
    showToast('Review submitted! Thank you.', 'check');
    return { success: true, review: newRev };
  }, [reviews, currentUser, setReviews, showToast]);

  const updateReviewStatus = useCallback(async (reviewId, newStatus) => {
    setReviews(prev => (prev || []).map(r => String(r.id) === String(reviewId) ? { ...r, status: newStatus } : r));
    showToast(`Review ${newStatus === 'approved' ? 'approved' : 'hidden'}`, 'check');

    try {
      await apiFetch(`/api/reviews/${encodeURIComponent(reviewId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('⚠️ Review status update API note:', err.message);
    }
  }, [setReviews, showToast]);

  const replyToReview = useCallback(async (reviewId, replyText) => {
    setReviews(prev => (prev || []).map(r => String(r.id) === String(reviewId) ? { ...r, reply: replyText } : r));
    showToast('Store reply saved!', 'check');

    try {
      await apiFetch(`/api/reviews/${encodeURIComponent(reviewId)}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
    } catch (err) {
      console.warn('⚠️ Review reply API note:', err.message);
    }
  }, [setReviews, showToast]);

  const deleteReview = useCallback(async (reviewId) => {
    // 1. Add to permanent deleted review blacklist
    const currentDeleted = readLS('abl_deleted_review_ids', []);
    const updatedDeleted = Array.from(new Set([...currentDeleted, String(reviewId)]));
    writeLS('abl_deleted_review_ids', updatedDeleted);
    setDeletedReviewIds(updatedDeleted);

    // 2. Remove immediately from React state and localStorage
    setReviewsRaw(prev => {
      const updated = (prev || []).filter(r => String(r.id) !== String(reviewId));
      writeLS('abl_reviews_v7', updated);
      return updated;
    });
    showToast('Review deleted', 'trash');

    // 3. Delete from backend server
    try {
      await apiFetch(`/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('⚠️ Delete review API note:', err.message);
    }
  }, [showToast]);




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
    cart, cartLoading, wishlist, currentUser, adminLoggedIn, adminUser, messages, toasts, subscribers,
    // Setters (for admin direct mutations)
    setProducts, setCategories, setOrders, setCustomers, setCoupons, setReviews, setStockHistory, setRoles,
    setSettings, setCMS, setCart, setWishlist, setCurrentUser, setAdminLoggedIn, setAdminUser, setMessages, setSubscribers,
    // Actions
    showToast, removeToast, clearToasts, formatMoney,
    addToCart, updateCartQty, removeFromCart,
    toggleWishlist,
    loginWithEmail, registerUser, loginWithGoogle, logoutUser, saveUserAddress,
    requestPasswordReset, resetUserPassword,
    adminLogin, adminLogout,
    handleContactForm, handleNewsletter, deleteSubscriber, deleteMessage, addReview, updateReviewStatus, replyToReview, deleteReview,
    placeOrder, applyCoupon,
    // Admin CRUD
    saveProduct, deleteProduct, adjustStockQty, restockAllLowStock,
    saveCategory, deleteCategory,
    updateOrderStatus, cycleOrderStatus, deleteOrder,
    saveCustomer, deleteCustomer,
    saveCoupon, deleteCoupon,
    saveGlobalCMS, saveHeroSlide, deleteHeroSlide, moveHeroSlide, reorderHeroSlides,
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
