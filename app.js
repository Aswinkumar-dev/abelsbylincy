/**
 * ABEL'S BY LINCY - FINE JEWELLERY STORE
 * Unified E-Commerce Core & Multi-Page Engine
 * Contact: lincytitus8@gmail.com
 * Copyright: © 2026 Abel's By Lincy. All rights reserved by webgrat (https://webgrat.com)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATA REPOSITORY & PERSISTENCE
  // =========================================================================

  const DEFAULT_PRODUCTS = [
    // New Arrivals & Charms (All hosted on Cloudinary CDN)
    { id: 'p_na1', sku: 'ABL-NK-101', name: 'Red Heart Shaped Necklace', category: 'necklaces', price: 179, salePrice: 0, material: '18K Gold Plated', gemstone: 'Red Gem', inStock: true, stockQty: 15, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796749/abels_by_lincy/Red_heart_shaped_necklace_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796749/abels_by_lincy/Red_heart_shaped_necklace_-_new_arrival.webp'], description: 'A striking red heart-shaped pendant suspended on a fine 18K gold-plated chain.', featured: true, bestSeller: false, newArrival: true, tags: ['necklaces', 'heart', 'red'] },
    { id: 'p_na2', sku: 'ABL-BR-102', name: 'Butterfly Bracelet', category: 'bracelets', price: 149, salePrice: 0, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 20, sizes: [], colors: [], image: '/assets/demo img.png', images: ['/assets/demo img.png'], description: 'Delicate butterfly motif bracelet featuring sparkling cubic zirconia accents.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'butterfly'] },
    { id: 'p_na3', sku: 'N49', name: 'Avacado Charm Necklace', category: 'charms', price: 45, salePrice: 35, material: '18K Gold Plated', gemstone: 'Enamel & Gold', inStock: true, stockQty: 10, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp'], description: 'Artisanal avocado and fruit charms necklace handcrafted in 18K gold plating.', featured: true, bestSeller: false, newArrival: true, tags: ['charms', 'necklace', 'avocado'] },
    { id: 'p_ch_flower', sku: 'N31', name: 'Flower Charm Necklace', category: 'charms', price: 40, salePrice: 0, material: '18K Gold Plated', gemstone: 'Enamel', inStock: true, stockQty: 10, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp'], description: 'Delicate floral pendant charms suspended on an 18K gold-plated chain.', featured: false, bestSeller: false, newArrival: false, tags: ['charms', 'necklace', 'flower'] },
    { id: 'p_ch_corals', sku: 'N21', name: 'Corals Necklace', category: 'charms', price: 45, salePrice: 0, material: '18K Gold Plated', gemstone: 'Gold Motifs', inStock: true, stockQty: 10, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796732/abels_by_lincy/charm_collection_-_new_arrival.webp'], description: 'Seaside coral and star charm necklace in 18K gold finish.', featured: false, bestSeller: false, newArrival: false, tags: ['charms', 'necklace', 'corals'] },
    { id: 'p_nk_cross', sku: 'N03', name: 'Cross Necklace', category: 'necklaces', price: 35, salePrice: 0, material: '18K Gold Plated', gemstone: 'None', inStock: true, stockQty: 10, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796748/abels_by_lincy/necklace-hero.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796748/abels_by_lincy/necklace-hero.webp'], description: 'Classic cross pendant on a dainty 18K gold-plated link chain.', featured: false, bestSeller: false, newArrival: false, tags: ['necklaces', 'cross'] },
    { id: 'p_na4', sku: 'ABL-ER-104', name: 'Cherry Drop Earrings', category: 'earrings', price: 119, salePrice: 0, material: '18K Gold Plated', gemstone: 'Enamel & CZ', inStock: true, stockQty: 12, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796735/abels_by_lincy/cherry_earring_-_new_arrival.jpg', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796735/abels_by_lincy/cherry_earring_-_new_arrival.jpg'], description: 'Playful and elegant cherry drop earrings with vibrant enamel and 18K gold plating.', featured: true, bestSeller: false, newArrival: true, tags: ['earrings', 'cherry'] },
    { id: 'p_na5', sku: 'ABL-BR-105', name: 'Green Gem Bracelet', category: 'bracelets', price: 169, salePrice: 0, material: '18K Gold Plated', gemstone: 'Emerald CZ', inStock: true, stockQty: 10, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796741/abels_by_lincy/green_gem_bracelete_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796741/abels_by_lincy/green_gem_bracelete_-_new_arrival.webp'], description: 'Lush green emerald CZ gemstones bezel-set along an 18K gold-plated link bracelet.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'emerald'] },
    { id: 'p_na6', sku: 'ABL-BR-106', name: 'Heart Shaped Bracelet', category: 'bracelets', price: 139, salePrice: 0, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 25, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796742/abels_by_lincy/heart_shaped_bracelete_-_new_arrival.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796742/abels_by_lincy/heart_shaped_bracelete_-_new_arrival.webp'], description: 'Charming heart link bracelet crafted in high-lustre 18K gold plating.', featured: true, bestSeller: false, newArrival: true, tags: ['bracelets', 'heart'] },

    // Best Sellers (All hosted on Cloudinary CDN)
    { id: 'p_bs1', sku: 'ABL-NK-201', name: 'Bug Shaped Multi Gems Necklace', category: 'necklaces', price: 219, salePrice: 0, material: '18K Gold Plated', gemstone: 'Multi Gems', inStock: true, stockQty: 14, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796729/abels_by_lincy/Bug_shaped_multi_gems_neckalace_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796729/abels_by_lincy/Bug_shaped_multi_gems_neckalace_-_best_seller.webp'], description: 'Statement beetle pendant encrusted with multi-colored gemstones in 18K gold setting.', featured: true, bestSeller: true, newArrival: false, tags: ['necklaces', 'gemstones'] },
    { id: 'p_bs2', sku: 'ABL-BR-202', name: 'Black Heart Gold Bracelet', category: 'bracelets', price: 159, salePrice: 0, material: '18K Gold Plated', gemstone: 'Black Onyx CZ', inStock: true, stockQty: 16, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796724/abels_by_lincy/black_hearted_gold_shape_bracelete_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796724/abels_by_lincy/black_hearted_gold_shape_bracelete_-_best_seller.webp'], description: 'Elegant black heart motif bracelet framed by radiant 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['bracelets', 'onyx'] },
    { id: 'p_bs3', sku: 'ABL-BR-203', name: 'Butterfly Gold Bracelet', category: 'bracelets', price: 149, salePrice: 0, material: '18K Gold Plated', gemstone: 'Cubic Zirconia', inStock: true, stockQty: 15, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796730/abels_by_lincy/butterfly_bracelete_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796730/abels_by_lincy/butterfly_bracelete_-_best_seller.webp'], description: 'Artisanal butterfly charm bracelet in 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['bracelets', 'butterfly'] },
    { id: 'p_bs4', sku: 'ABL-RG-204', name: 'Emerald Gem Ring', category: 'rings', price: 179, salePrice: 0, material: '18K Gold Plated', gemstone: 'Emerald CZ', inStock: true, stockQty: 12, sizes: ['6', '7', '8', '9'], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796740/abels_by_lincy/gem_ring_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796740/abels_by_lincy/gem_ring_-_best_seller.webp'], description: 'Vibrant emerald CZ gemstone set on an 18K gold-plated band.', featured: true, bestSeller: true, newArrival: false, tags: ['rings', 'emerald'] },
    { id: 'p_bs5', sku: 'ABL-NK-205', name: 'Soleil Gold Necklace', category: 'necklaces', price: 189, salePrice: 0, material: '22K Gold Plated', gemstone: 'None', inStock: true, stockQty: 22, sizes: [], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796745/abels_by_lincy/necklace_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796745/abels_by_lincy/necklace_-_best_seller.webp'], description: 'Artisanal sun-inspired medallion necklace with a rich 22K gold-plated finish.', featured: true, bestSeller: true, newArrival: false, tags: ['necklaces', 'soleil'] },
    { id: 'p_bs6', sku: 'ABL-RG-206', name: 'Royal Solitaire Ring', category: 'rings', price: 169, salePrice: 0, material: '18K Gold Plated', gemstone: 'Diamond CZ', inStock: true, stockQty: 19, sizes: ['6', '7', '8', '9'], colors: [], image: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796750/abels_by_lincy/ring_-_best_seller.webp', images: ['https://res.cloudinary.com/gylnyxru/image/upload/v1787796750/abels_by_lincy/ring_-_best_seller.webp'], description: 'Classic solitaire ring featuring a brilliant-cut CZ diamond set in 18K gold plating.', featured: true, bestSeller: true, newArrival: false, tags: ['rings', 'diamond'] },
  ];

  const DEFAULT_CATEGORIES = [
    { id: 'necklaces', name: 'Necklaces', description: 'Pendant necklaces and chains in durable anti-tarnish gold plating.', image: 'assets/necklace collection category.png', count: 18 },
    { id: 'bangles', name: 'Bangles', description: 'Classic and contemporary bangles that never fade or tarnish.', image: 'assets/Bangle Category.png', count: 16 },
    { id: 'rings', name: 'Rings', description: 'Stackable, statement, and everyday rings in anti-tarnish gold plating.', image: 'assets/Ring Category.png', count: 24 },
    { id: 'bracelets', name: 'Bracelets', description: 'Layering bracelets and chains crafted to last without tarnishing.', image: 'assets/Bracelet - category.png', count: 15 },
    { id: 'earrings', name: 'Earrings', description: 'Studs, hoops, and drops — anti-tarnish gold-plated for everyday wear.', image: 'assets/Earrings Category.png', count: 31 },
    { id: 'charms', name: 'Charms', description: 'Curated charm collections to personalise your look every day.', image: 'assets/charm collection category.png', count: 12 },
    { id: 'silver-collections', name: 'Silver Collections', description: 'Pure 925 sterling silver and silver-plated jewellery designed for timeless elegance.', image: 'assets/silver collection category.png', count: 20 },
    { id: 'seasonal-collections', name: 'Seasonal Collections', description: 'Limited-edition festive and seasonal jewellery collections.', image: 'assets/Sesonal collections category.png', count: 14 }
  ];

  const DEFAULT_ORDERS = [
    { id: '#ABL-2026-0045', customer: 'Mia Chen', email: 'mia.chen@email.com', product: 'Lumière Diamond Necklace', date: '08 Aug 2026', status: 'Processing', total: '$495.00', itemsCount: 1 },
    { id: '#ABL-2026-0044', customer: 'James O\'Brien', email: 'james.ob@email.com', product: 'Riviera Tennis Bracelet', date: '07 Aug 2026', status: 'Shipped', total: '$895.00', itemsCount: 1 },
    { id: '#ABL-2026-0043', customer: 'Sophie Reynolds', email: 'sophie@email.com', product: 'Eternal Rose Gold Ring', date: '05 Aug 2026', status: 'Delivered', total: '$285.00', itemsCount: 1 },
    { id: '#ABL-2026-0042', customer: 'Priya Mehta', email: 'priya.m@email.com', product: 'Aurora Pearl Earrings', date: '02 Aug 2026', status: 'Delivered', total: '$195.00', itemsCount: 1 },
    { id: '#ABL-2026-0041', customer: 'Lucas Nguyen', email: 'lucas.n@email.com', product: 'Celeste Gold Bracelet', date: '29 Jul 2026', status: 'Cancelled', total: '$345.00', itemsCount: 1 }
  ];

  const DEFAULT_CUSTOMERS = [
    { id: 'c1', name: 'Sophie Reynolds', email: 'sophie@email.com', orders: 3, spent: '$1,260', joined: 'Jun 2024', status: 'Gold' },
    { id: 'c2', name: 'Mia Chen', email: 'mia.chen@email.com', orders: 5, spent: '$2,345', joined: 'Mar 2024', status: 'Platinum' },
    { id: 'c3', name: 'James O\'Brien', email: 'james.ob@email.com', orders: 1, spent: '$895', joined: 'Jul 2026', status: 'New' },
    { id: 'c4', name: 'Priya Mehta', email: 'priya.m@email.com', orders: 7, spent: '$3,100', joined: 'Jan 2024', status: 'Platinum' }
  ];

  const DEFAULT_COUPONS = [
    { code: 'WELCOME10', discountType: 'percentage', value: 10, label: '10% Off First Order', minSpend: 100, active: true },
    { code: 'LINCYGOLD', discountType: 'fixed', value: 50, label: '$50 Off Fine Gold', minSpend: 300, active: true },
    { code: 'FREESHIP', discountType: 'shipping', value: 0, label: 'Free Express Shipping', minSpend: 0, active: true }
  ];

  const DEFAULT_ROLES = [
    {
      id: 'r1',
      user: 'Lincy Titus',
      loginId: 'admin',
      email: 'lincytitus8@gmail.com',
      password: 'abels2026',
      role: 'Administrator',
      isSuperAdmin: true,
      permissions: 'Full Access',
      allowedTabs: ['overview', 'products', 'categories', 'inventory', 'orders', 'customers', 'coupons', 'cms', 'messages', 'settings', 'analytics'],
      status: 'Active',
      lastLogin: 'Today, 06:45 PM'
    }
  ];

  const DEFAULT_SETTINGS = {
    storeEmail: 'lincytitus8@gmail.com',
    primaryCurrency: 'AUD',
    gstTaxRate: '10.0%',
    freeShippingThreshold: 150
  };

  const DEFAULT_CMS = {
    announcement: 'FREE AUSTRALIA-WIDE SHIPPING $60+ · ANTI-TARNISH GOLD-PLATED JEWELLERY · AFFORDABLE LUXURY · WATERPROOF EVERYDAY PIECES',
    heroTagline: 'Cloud White & Onyx Signature Collection',
    heroTitle: 'Fine Jewellery & Bespoke Elegance',
    heroSubtitle: 'Australian heirloom-quality jewellery crafted for moments that endure for generations.',
    heroStats1: '111+ Unique Designs',
    heroStats2: 'Ethically Crafted',
    heroStats3: '10k+ Happy Clients',
    newArrivalsEnabled: true,
    newArrivalsSubtitle: 'Just Dropped',
    newArrivalsTitle: 'New Arrivals',
    newArrivalsLimit: 10,
    newArrivalsVisible: 5,
    heroSlides: [
      {
        id: 'slide-1',
        tagline: 'THE BRACELET COLLECTION',
        title: 'Stack. <b>Style</b>. Shine.',
        description: 'Your everyday essentials, elevated.',
        image: 'assets/bracelets.webp',
        ctaText: 'SHOP BRACELETS',
        ctaLink: 'shop.html?category=bracelets',
        theme: 'gold'
      },
      {
        id: 'slide-2',
        tagline: 'THE NECKLACE COLLECTION',
        title: 'A Touch of <b>Gold</b>, Made to Shine.',
        description: 'Discover necklaces designed for effortless elegance.',
        image: 'assets/necklace.webp',
        ctaText: 'SHOP NECKLACES',
        ctaLink: 'shop.html?category=necklaces',
        theme: 'gold'
      },
      {
        id: 'slide-3',
        tagline: 'THE EARRING COLLECTION',
        title: 'Frame Your <b>Style</b>.',
        description: 'Statement or subtle — make it yours.',
        image: 'assets/earrings.webp',
        ctaText: 'SHOP EARRINGS',
        ctaLink: 'shop.html?category=earrings',
        theme: 'gold'
      },
      {
        id: 'slide-4',
        tagline: 'THE BANGLE COLLECTION',
        title: 'Timeless Around Your <b>Wrist</b>.',
        description: 'A classic touch of gold for every occasion.',
        image: 'assets/bangles.webp',
        ctaText: 'SHOP BANGLES',
        ctaLink: 'shop.html?category=bangles',
        theme: 'gold'
      }
    ]
  };

  // State Manager helper
  function loadLocal(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }


  function loadProducts() {
    const deleted = loadLocal('abl_deleted_product_ids', []);
    const raw11 = loadLocal('abl_products_v11', null);
    if (raw11 !== null && Array.isArray(raw11)) {
      return raw11.filter(p => !deleted.includes(p.id) && !deleted.includes(p.sku));
    }
    const raw10 = loadLocal('abl_products_v10', null);
    if (raw10 !== null && Array.isArray(raw10)) {
      return raw10.filter(p => !deleted.includes(p.id) && !deleted.includes(p.sku));
    }
    const local = loadLocal('abl_products', null);
    if (local !== null && Array.isArray(local)) {
      return local.filter(p => !deleted.includes(p.id) && !deleted.includes(p.sku));
    }
    return DEFAULT_PRODUCTS.filter(p => !deleted.includes(p.id) && !deleted.includes(p.sku));
  }


  function loadCategories() {
    let local = loadLocal('abl_categories', DEFAULT_CATEGORIES);
    // Reset to DEFAULT_CATEGORIES if old order or old anklets/pendants categories are present
    const isOldOrder = !Array.isArray(local) || local.length === 0 || local[0].id !== 'necklaces' || local.some(c => c.id === 'anklets' || c.id === 'pendants');
    if (isOldOrder) {
      saveLocal('abl_categories', DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    let updated = false;
    DEFAULT_CATEGORIES.forEach(defCat => {
      if (!local.some(c => c.id === defCat.id)) {
        local.push(defCat);
        updated = true;
      }
    });
    const categoryImageMap = {
      earrings: 'assets/Earrings Category.png',
      bangles: 'assets/Bangle Category.png',
      rings: 'assets/Ring Category.png',
      bracelets: 'assets/Bracelet - category.png',
      necklaces: 'assets/necklace collection category.png',
      charms: 'assets/charm collection category.png',
      'silver-collections': 'assets/silver collection category.png',
      'seasonal-collections': 'assets/Sesonal collections category.png'
    };
    local.forEach(cat => {
      if (categoryImageMap[cat.id] && cat.image !== categoryImageMap[cat.id]) {
        cat.image = categoryImageMap[cat.id];
        updated = true;
      }
    });
    if (updated) {
      saveLocal('abl_categories', local);
    }
    return local;
  }

  function loadRoles() {
    const local = loadLocal('abl_roles', null);
    if (!local || !Array.isArray(local) || local.length === 0) {
      saveLocal('abl_roles', DEFAULT_ROLES);
      return DEFAULT_ROLES;
    }
    // Ensure Super Admin always exists
    const hasAdmin = local.some(r => r.isSuperAdmin || r.loginId === 'admin');
    if (!hasAdmin) {
      local.unshift(DEFAULT_ROLES[0]);
      saveLocal('abl_roles', local);
    }
    return local;
  }

  function loadCMS() {
    const local = loadLocal('abl_cms', DEFAULT_CMS);
    let updated = false;
    if (local && typeof local === 'object') {
      for (const key in DEFAULT_CMS) {
        if (local[key] === undefined) {
          local[key] = DEFAULT_CMS[key];
          updated = true;
        }
      }
    }
    const hasOldData = local && local.heroSlides && (!local.heroSlides[0] || local.heroSlides[0].image !== 'assets/bracelets.webp');
    if (hasOldData || !local || !local.heroSlides || !Array.isArray(local.heroSlides) || local.heroSlides.length === 0) {
      const res = local || {};
      res.heroSlides = DEFAULT_CMS.heroSlides;
      saveLocal('abl_cms', res);
      return res;
    }
    if (updated) {
      saveLocal('abl_cms', local);
    }
    return local;
  }

  function saveLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  // Global Bulletproof Image Error Handler (Catches all 404 / broken image triggers)
  window.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') {
      if (!e.target.dataset.hasFallback) {
        e.target.dataset.hasFallback = 'true';
        e.target.src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';
      }
    }
  }, true);

  // Live State
  const state = {
    products: loadProducts(),
    categories: loadCategories(),
    orders: loadLocal('abl_orders', DEFAULT_ORDERS),
    customers: loadLocal('abl_customers', DEFAULT_CUSTOMERS),
    coupons: loadLocal('abl_coupons', DEFAULT_COUPONS),
    roles: loadRoles(),
    settings: loadLocal('abl_settings', DEFAULT_SETTINGS),
    cms: loadCMS(),
    cart: loadLocal('abl_current_user', null) ? loadLocal('abl_cart', []) : [],
    wishlist: loadLocal('abl_current_user', null) ? loadLocal('abl_wishlist', []) : [],
    currentUser: loadLocal('abl_current_user', null), // null if guest
    adminLoggedIn: loadLocal('abl_admin_auth', false),
    adminUser: loadLocal('abl_admin_user', null),
    messages: loadLocal('abl_messages', [
      { id: 'm1', name: 'Eleanor Vance', email: 'eleanor.v@outlook.com', subject: 'Custom Engagement Ring Inquiry', message: 'Hello Lincy, I adore your Lumière ring. Are you able to customize it with a 1.5ct sapphire center stone?', date: '09 Aug 2026', read: false },
      { id: 'm2', name: 'David Miller', email: 'd.miller@gmail.com', subject: 'Ring Sizing Question', message: 'Hi team, do you offer complimentary ring resizing if size 7 doesn\'t fit my fiancé?', date: '08 Aug 2026', read: true }
    ])
  };

  // Major 10 Countries Currency Map
  const CURRENCIES = [
    { code: 'AUD', symbol: '$', name: 'Australia (AUD $)', rate: 1.0 },
    { code: 'USD', symbol: '$', name: 'United States (USD $)', rate: 0.65 },
    { code: 'EUR', symbol: '€', name: 'European Union (EUR €)', rate: 0.60 },
    { code: 'GBP', symbol: '£', name: 'United Kingdom (GBP £)', rate: 0.51 },
    { code: 'CAD', symbol: '$', name: 'Canada (CAD $)', rate: 0.89 },
    { code: 'SGD', symbol: '$', name: 'Singapore (SGD $)', rate: 0.88 },
    { code: 'NZD', symbol: '$', name: 'New Zealand (NZD $)', rate: 1.08 },
    { code: 'AED', symbol: 'AED ', name: 'United Arab Emirates (AED)', rate: 2.39 },
    { code: 'INR', symbol: '₹', name: 'India (INR ₹)', rate: 54.5 },
    { code: 'JPY', symbol: '¥', name: 'Japan (JPY ¥)', rate: 102.0 }
  ];

  function formatMoney(amountAUD) {
    const cur = CURRENCIES.find(c => c.code === state.settings.primaryCurrency) || CURRENCIES[0];
    const converted = amountAUD * cur.rate;
    if (cur.code === 'JPY') {
      return `${cur.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${cur.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function showToast(message, icon = 'check') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${icon}" style="color: var(--gold); width: 18px; height: 18px;"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 2. SHARED LAYOUT: HEADER, FOOTER, & WHATSAPP WIDGET
  // =========================================================================

  function renderSharedHeader(activeNav = '') {
    const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    const wishlistCount = state.wishlist.length;
    const announcementText = state.cms.announcement || 'FREE AUSTRALIA-WIDE SHIPPING $60+ · ANTI-TARNISH GOLD-PLATED JEWELLERY · AFFORDABLE LUXURY · WATERPROOF EVERYDAY PIECES';
    const announcementItems = announcementText.split('·').map(i => i.trim()).filter(Boolean);
    const announcementMarkup = [...announcementItems, ...announcementItems]
      .map(item => `<span class="announcement-item">${item}</span>`)
      .join('');

    const hasCategory = window.location.search.includes('category=');

    return `
      <div class="announcement-bar" aria-label="Store highlights">
        <div class="announcement-marquee">
          <div class="announcement-track">
            ${announcementMarkup}
          </div>
        </div>
      </div>

      <header class="site-header">
        <div class="container">
          <div class="header-inner">
            
            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-btn action-btn" onclick="window.abl.toggleMobileDrawer()">
              <i data-lucide="menu"></i>
            </button>

            <!-- Brand Logo (Enlarged & Fitted) -->
            <a href="index.html" class="brand-logo-btn">
              <img src="assets/logo.svg" alt="Abel's By Lincy Logo" class="brand-logo-img" fetchpriority="high">
            </a>

            <!-- Navigation Links -->
            <nav class="nav-links">
              ${activeNav !== 'home' ? `
              <div class="nav-item ${activeNav === 'home' ? 'active' : ''}">
                <a href="index.html">Home</a>
              </div>` : ''}

              <div class="nav-item ${activeNav === 'shop' && hasCategory ? 'active' : ''}">
                <a href="shop.html" style="display: flex; align-items: center; gap: 4px;">
                  Shop <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
                </a>
                <div class="nav-dropdown">
                  <a href="shop.html?category=new-arrivals" class="dropdown-link">New Arrivals</a>
                  <a href="shop.html?category=best-sellers" class="dropdown-link">Best Sellers</a>
                  <a href="shop.html?category=necklaces" class="dropdown-link">Necklaces</a>
                  <a href="shop.html?category=bangles" class="dropdown-link">Bangles</a>
                  <a href="shop.html?category=rings" class="dropdown-link">Rings</a>
                  <a href="shop.html?category=bracelets" class="dropdown-link">Bracelets</a>
                  <a href="shop.html?category=earrings" class="dropdown-link">Earrings</a>
                  <a href="shop.html?category=charms" class="dropdown-link">Charms</a>
                  <a href="shop.html?category=silver-collections" class="dropdown-link">Silver Collections</a>
                  <a href="shop.html?category=seasonal-collections" class="dropdown-link">Seasonal Collections</a>
                </div>
              </div>

              <div class="nav-item ${activeNav === 'collections' || (activeNav === 'shop' && !hasCategory) ? 'active' : ''}">
                <a href="shop.html">Collections</a>
              </div>

              <div class="nav-item ${activeNav === 'about' ? 'active' : ''}">
                <a href="about.html">About Us</a>
              </div>

              <div class="nav-item ${activeNav === 'contact' ? 'active' : ''}">
                <a href="contact.html">Contact</a>
              </div>
            </nav>

            <!-- Action Icons -->
            <div class="header-actions">
              <button class="action-btn" title="Search Jewellery" onclick="window.abl.toggleSearchDrawer()">
                <i data-lucide="search"></i>
              </button>

              <a href="wishlist.html" class="action-btn" title="Wishlist" onclick="window.abl.handleWishlistNavigation(event)">
                <i data-lucide="heart"></i>
                ${wishlistCount > 0 ? `<span class="badge-count">${wishlistCount}</span>` : ''}
              </a>

              <div class="user-menu-wrapper" style="position: relative; display: inline-block;">
                <a href="account.html" class="action-btn" title="My Account / Sign In">
                  <i data-lucide="user"></i>
                </a>
                ${state.currentUser ? `
                  <div class="login-alert-tooltip logged-in-dropdown">
                    <div class="dropdown-user-info">
                      <span class="user-name">Hi, ${state.currentUser.name.split(' ')[0]}</span>
                    </div>
                    <a href="account.html" class="dropdown-item">
                      <i data-lucide="layout-dashboard" style="width: 14px; height: 14px; margin-right: 8px;"></i> My Account
                    </a>
                    <a href="#" onclick="event.preventDefault(); window.abl.logoutUser();" class="dropdown-item logout-link" style="color: var(--danger) !important;">
                      <i data-lucide="log-out" style="width: 14px; height: 14px; margin-right: 8px;"></i> Sign Out
                    </a>
                  </div>
                ` : `
                  <div class="login-alert-tooltip">
                    <a href="account.html" class="tooltip-login-btn">Login</a>
                  </div>
                `}
              </div>

              <a href="cart.html" class="action-btn" title="Shopping Bag" onclick="window.abl.handleCartNavigation(event)">
                <i data-lucide="shopping-bag"></i>
                ${cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : ''}
              </a>
            </div>
          </div>
        </div>

        <!-- Search Drawer -->
        <div id="search-drawer" class="search-drawer" style="display: none;">
          <div class="search-input-wrapper">
            <input type="text" class="search-input" id="search-query-input" placeholder="Search earrings, bangles, rings, necklaces, bracelets..." oninput="window.abl.handleSearch(this.value)">
            <button onclick="window.abl.toggleSearchDrawer()" style="position: absolute; right: 16px; color: var(--slate);"><i data-lucide="x"></i></button>
          </div>
          <div id="search-results-box" style="max-width: 640px; margin: 12px auto 0 auto;"></div>
        </div>

        <!-- Mobile Drawer -->
        <div id="mobile-drawer" style="display: none; background: var(--cloud-white); border-top: 1px solid var(--border); padding: 20px 24px;">
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${activeNav !== 'home' ? '<a href="index.html" style="font-weight: 600; font-size: 16px;">Home</a>' : ''}
            
            <div class="mobile-nav-accordion">
              <button type="button" class="mobile-accordion-toggle" onclick="window.abl.toggleMobileCategoryAccordion(this)">
                <span>Shop By Category</span>
                <span class="acc-chevron">▼</span>
              </button>
              <div class="mobile-accordion-content" id="mobile-cat-accordion" style="display: none;">
                <a href="shop.html?category=new-arrivals" class="mobile-cat-link">New Arrivals</a>
                <a href="shop.html?category=best-sellers" class="mobile-cat-link">Best Sellers</a>
                <a href="shop.html?category=necklaces" class="mobile-cat-link">Necklaces</a>
                <a href="shop.html?category=bangles" class="mobile-cat-link">Bangles</a>
                <a href="shop.html?category=rings" class="mobile-cat-link">Rings</a>
                <a href="shop.html?category=bracelets" class="mobile-cat-link">Bracelets</a>
                <a href="shop.html?category=earrings" class="mobile-cat-link">Earrings</a>
                <a href="shop.html?category=charms" class="mobile-cat-link">Charms</a>
                <a href="shop.html?category=silver-collections" class="mobile-cat-link">Silver Collections</a>
                <a href="shop.html?category=seasonal-collections" class="mobile-cat-link">Seasonal Collections</a>
              </div>
            </div>

            <a href="shop.html" style="font-weight: 600; font-size: 16px;">Collections</a>
            <a href="about.html" style="font-weight: 600; font-size: 16px;">About Us</a>
            <a href="contact.html" style="font-weight: 600; font-size: 16px;">Contact</a>
            <a href="wishlist.html" onclick="window.abl.handleWishlistNavigation(event)" style="font-weight: 600; font-size: 16px; border-top: 1px solid var(--border); padding-top: 14px;">My Wishlist</a>
            <a href="cart.html" onclick="window.abl.handleCartNavigation(event)" style="font-weight: 600; font-size: 16px; margin-top: -6px;">My Cart</a>
            <a href="account.html" style="font-weight: 600; font-size: 16px; margin-top: -6px;">
              My Account ${!state.currentUser ? '<span style="font-size: 11px; color: var(--gold-dark); margin-left: 8px;">(Login)</span>' : ''}
            </a>
            ${state.currentUser ? `
              <a href="#" onclick="event.preventDefault(); window.abl.logoutUser();" style="font-weight: 600; font-size: 16px; color: var(--danger); margin-top: -6px;">
                Sign Out
              </a>
            ` : ''}
          </div>
        </div>
      </header>
    `;
  }

  function renderSharedFooter() {
    return `
      <footer class="site-footer">
        <!-- Newsletter Signup Section -->
        <div class="footer-newsletter">
          <div class="container">
            <p style="font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px;">Exclusive Privileges</p>
            <h3 style="font-family: var(--font-serif); font-size: 32px; font-weight: 500; margin-bottom: 12px;">Join the Abel’s By Lincy Circle</h3>
            <p style="font-size: 14px; color: rgba(255, 255, 255, 0.65); max-width: 500px; margin: 0 auto;">Receive preview access to new bespoke collections, private atelier showings, and styling inspirations.</p>
            
            <form class="newsletter-form" onsubmit="event.preventDefault(); window.abl.handleNewsletter(this);">
              <input type="email" class="newsletter-input" placeholder="Enter your email address" required>
              <button type="submit" class="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>

        <!-- Footer Main Navigation -->
        <div class="footer-main">
          <div class="container">
            <div class="footer-grid">
              
              <!-- Brand Bio -->
              <div class="footer-col">
                <div style="margin-bottom: 20px;">
                  <span style="font-family: var(--font-serif); font-size: 24px; font-weight: 700; letter-spacing: 0.1em; color: var(--cloud-white);">ABEL’S</span><br>
                  <span style="font-size: 10px; letter-spacing: 0.35em; color: var(--gold); font-weight: 600;">BY LINCY</span>
                </div>
                <p style="font-size: 13px; line-height: 1.7; color: rgba(255, 255, 255, 0.65); margin-bottom: 20px;">
                  Anti-tarnish gold-plated jewellery crafted for everyday wear. Beautiful, affordable, and built to last — born in Sydney, treasured across Australia.
                </p>
                <div style="display: flex; gap: 10px;">
                  <a href="https://www.instagram.com/abels_by_lincy/" target="_blank" rel="noopener" class="social-icon-btn" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.facebook.com/lincy.titus.9" target="_blank" rel="noopener" class="social-icon-btn" title="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener" class="social-icon-btn" title="Pinterest" style="display: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="https://wa.me/61435927824" target="_blank" rel="noopener" class="social-icon-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  </a>
                </div>
              </div>

              <!-- Shop Links -->
              <div class="footer-col">
                <h5>Shop Jewellery</h5>
                <ul class="footer-links">
                  <li><a href="shop.html?category=earrings">Earrings</a></li>
                  <li><a href="shop.html?category=bangles">Bangles</a></li>
                  <li><a href="shop.html?category=rings">Rings</a></li>
                  <li><a href="shop.html?category=bracelets">Bracelets</a></li>
                  <li><a href="shop.html?category=necklaces">Necklaces</a></li>
                  <li><a href="shop.html?category=charms">Charms</a></li>
                </ul>
              </div>

              <!-- Customer Care -->
              <div class="footer-col">
                <h5>Customer Care</h5>
                <ul class="footer-links">
                  <li><a href="faq.html">FAQ</a></li>
                  <li><a href="policy.html?tab=shipping">Shipping & Delivery Policy</a></li>
                  <li><a href="policy.html?tab=refunds">Returns & Refund Policy</a></li>
                  <li><a href="policy.html?tab=privacy">Privacy Policy</a></li>
                  <li><a href="policy.html?tab=terms">Terms & Conditions</a></li>
                </ul>
              </div>

              <!-- Atelier Contact Details -->
              <div class="footer-col">
                <h5>Get In Touch</h5>
                <div class="footer-contact-info">
                  <p><strong>Email:</strong> <a href="mailto:${state.settings.storeEmail}" style="color: var(--cloud-white);">${state.settings.storeEmail}</a></p>
                  <p><strong>Phone:</strong> +61 435 927 824</p>
                </div>
              </div>

            </div>

            <!-- Footer Bottom Note with webgrat hyperlink -->
            <div class="footer-bottom">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Abel's By Lincy. All rights reserved.</p>
                <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.45);">Website by <a href="https://webgrat.com" target="_blank" rel="noopener" class="webgrat-link">Webgrat</a></p>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">SECURE SSL/TLS CHECKOUT</span>
                <i data-lucide="shield-check" style="width: 16px; height: 16px; color: var(--gold);"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <!-- Floating Back to Top Button -->
      <button type="button" class="back-to-top-widget" aria-label="Back to top" title="Back to top">
        <i data-lucide="arrow-up" style="width: 20px; height: 20px;"></i>
      </button>

      <!-- Floating WhatsApp Integration Button -->
      <a href="https://wa.me/61435927824?text=Hi%20Lincy,%20I'd%20like%20to%20know%20more%20about%20your%20collections" target="_blank" rel="noopener" class="floating-whatsapp-widget">
        <img src="assets/whatsapp.png" alt="WhatsApp" class="wa-img" loading="lazy">
        <span class="wa-label">Chat on WhatsApp</span>
      </a>
    `;
  }

  // Product Card Generator
  function renderProductCard(p) {
    const isWishlisted = state.wishlist.includes(p.id);
    return `
      <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
        <div class="product-img-wrapper">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          
          ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'bestseller' ? 'Best Seller' : p.badge}</span>` : ''}

          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); window.abl.toggleWishlist('${p.id}')" title="Save to Wishlist">
            <i data-lucide="heart" style="${isWishlisted ? 'fill: var(--danger);' : ''}"></i>
          </button>

          <div class="quick-add-bar">
            <button class="quick-add-btn" onclick="event.stopPropagation(); window.abl.addToCart('${p.id}')">
              <i data-lucide="shopping-bag" style="width: 14px; height: 14px;"></i> Quick Add
            </button>
          </div>
        </div>

        <div class="product-info">
          <p class="product-category">${p.category}</p>
          <h4 class="product-name">${p.name}</h4>
          
          <div class="product-rating-row">
            <div class="stars">
              ${Array(5).fill(0).map((_, idx) => `
                <i data-lucide="star" style="width: 12px; height: 12px; ${idx < Math.floor(p.rating) ? 'fill: var(--gold);' : 'color: var(--border);'}"></i>
              `).join('')}
            </div>
            <span class="review-count">(${p.reviews})</span>
          </div>

          <div class="product-price-row">
            <span class="current-price">${formatMoney(p.price)}</span>
            ${p.originalPrice ? `<span class="original-price">${formatMoney(p.originalPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 3. GLOBAL ACTIONS & CLIENT METHODS
  // =========================================================================

  window.abl = {
    state,
    formatMoney,
    showToast,

    // Navigation & UI
    toggleSearchDrawer: () => {
      const drawer = document.getElementById('search-drawer');
      if (drawer) {
        drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
        if (drawer.style.display === 'block') {
          const input = document.getElementById('search-query-input');
          if (input) input.focus();
        }
      }
    },

    toggleMobileDrawer: () => {
      const drawer = document.getElementById('mobile-drawer');
      if (drawer) {
        drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
      }
    },

    handleCartNavigation: (e) => {
      if (!state.currentUser) {
        if (e && e.preventDefault) e.preventDefault();
        window.location.href = 'account.html';
      } else {
        if (e && e.preventDefault) e.preventDefault();
        window.location.href = 'cart.html';
      }
    },

    handleWishlistNavigation: (e) => {
      if (!state.currentUser) {
        if (e && e.preventDefault) e.preventDefault();
        window.location.href = 'account.html';
      } else {
        if (e && e.preventDefault) e.preventDefault();
        window.location.href = 'wishlist.html';
      }
    },

    toggleMobileCategoryAccordion: (btn) => {
      const content = document.getElementById('mobile-cat-accordion');
      if (content) {
        const isHidden = content.style.display === 'none' || content.style.display === '';
        content.style.display = isHidden ? 'flex' : 'none';
        if (btn) {
          btn.classList.toggle('active', isHidden);
        }
      }
    },

    handleSearch: (val) => {
      const box = document.getElementById('search-results-box');
      if (!box) return;
      const q = val.trim().toLowerCase();
      if (!q) {
        box.innerHTML = '';
        return;
      }
      const matches = state.products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.gemstone.toLowerCase().includes(q));
      if (matches.length === 0) {
        box.innerHTML = `<p style="text-align: center; font-size: 13px; color: var(--slate); padding: 12px;">No pieces found matching "${val}"</p>`;
      } else {
        box.innerHTML = `
          <div style="background: var(--cream); border-radius: var(--radius-md); padding: 12px; max-height: 280px; overflow-y: auto;">
            ${matches.map(item => `
              <a href="product.html?id=${item.id}" style="display: flex; align-items: center; gap: 14px; padding: 8px 12px; border-radius: var(--radius-sm); transition: background 0.15s; margin-bottom: 4px;" onmouseover="this.style.background='var(--cloud-white)'" onmouseout="this.style.background='transparent'">
                <img src="${item.image}" style="width: 42px; height: 42px; border-radius: 6px; object-fit: cover;" loading="lazy">
                <div style="flex: 1;">
                  <h6 style="font-size: 13px; font-weight: 600; color: var(--onyx);">${item.name}</h6>
                  <p style="font-size: 11px; color: var(--gold);">${item.material} · ${formatMoney(item.price)}</p>
                </div>
                <i data-lucide="chevron-right" style="width: 14px; height: 14px; color: var(--slate);"></i>
              </a>
            `).join('')}
          </div>
        `;
      }
      if (window.lucide) lucide.createIcons();
    },

    // Cart Operations
    addToCart: (productId, quantity = 1, size = null) => {
      if (!state.currentUser) {
        window.location.href = 'account.html';
        return;
      }
      const product = state.products.find(p => p.id === productId);
      if (!product) return;
      const selectedSize = size || (product.sizes ? product.sizes[0] : 'Standard');
      const existing = state.cart.find(i => i.id === product.id && i.selectedSize === selectedSize);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          material: product.material,
          selectedSize: selectedSize,
          quantity: quantity
        });
      }
      saveLocal('abl_cart', state.cart);
      showToast(`${product.name} added to your bag`);
      if (window.location.pathname.includes('cart.html')) {
        window.location.reload();
      } else {
        // Update header counter
        const counter = document.querySelectorAll('.header-actions a[href="cart.html"] .badge-count');
        const totalQty = state.cart.reduce((s, i) => s + i.quantity, 0);
        counter.forEach(c => c.textContent = totalQty);
      }
    },

    updateCartQty: (productId, newQty) => {
      if (newQty <= 0) {
        window.abl.removeFromCart(productId);
        return;
      }
      const item = state.cart.find(i => i.id === productId);
      if (item) {
        item.quantity = newQty;
        saveLocal('abl_cart', state.cart);
        window.location.reload();
      }
    },

    removeFromCart: (productId) => {
      state.cart = state.cart.filter(i => i.id !== productId);
      saveLocal('abl_cart', state.cart);
      showToast('Item removed from bag');
      window.location.reload();
    },

    // Wishlist
    toggleWishlist: (productId) => {
      if (!state.currentUser) {
        window.location.href = 'account.html';
        return;
      }
      if (state.wishlist.includes(productId)) {
        state.wishlist = state.wishlist.filter(id => id !== productId);
        showToast('Removed from wishlist');
      } else {
        state.wishlist.push(productId);
        showToast('Saved to wishlist', 'heart');
      }
      saveLocal('abl_wishlist', state.wishlist);
      if (window.location.pathname.includes('wishlist.html')) {
        window.location.reload();
      } else {
        const counters = document.querySelectorAll('.header-actions a[href="wishlist.html"] .badge-count');
        counters.forEach(c => c.textContent = state.wishlist.length);
      }
    },

    // User Auth (Login, Sign Up, Google Simulation)
    loginWithGoogle: () => {
      state.currentUser = {
        name: 'Sophie Reynolds',
        email: 'sophie.reynolds@gmail.com',
        tier: 'Gold VIP',
        ordersCount: 3,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop'
      };
      saveLocal('abl_current_user', state.currentUser);
      showToast(`Welcome back, ${state.currentUser.name}!`);
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = urlParams.get('redirect') || 'account.html';
    },

    loginWithEmail: (form) => {
      const email = form.email.value.trim();
      state.currentUser = {
        name: email.split('@')[0],
        email: email,
        tier: 'Gold VIP',
        ordersCount: 2,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop'
      };
      saveLocal('abl_current_user', state.currentUser);
      showToast('Signed in successfully!');
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = urlParams.get('redirect') || 'account.html';
    },

    registerUser: (form) => {
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      state.currentUser = {
        name: name,
        email: email,
        tier: 'New Member',
        ordersCount: 0,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop'
      };
      saveLocal('abl_current_user', state.currentUser);
      showToast(`Welcome to Abel's By Lincy, ${name}!`);
      const urlParams = new URLSearchParams(window.location.search);
      window.location.href = urlParams.get('redirect') || 'account.html';
    },

    logoutUser: () => {
      const refreshToken = localStorage.getItem('abl_refresh_token');

      // Clear local state and localStorage
      state.currentUser = null;
      saveLocal('abl_current_user', null);
      saveLocal('abl_cart', []);
      saveLocal('abl_wishlist', []);
      localStorage.removeItem('abl_refresh_token');
      localStorage.removeItem('abl_access_token');

      // Optional: notify backend to invalidate session
      if (refreshToken) {
        fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        }).catch(err => console.error('Failed to notify backend of logout:', err));
      }

      showToast('Signed out');
      window.location.href = 'account.html';
    },

    // Forms
    handleContactForm: (form) => {
      const name = form.name.value;
      const email = form.email.value;
      const subject = form.subject.value;
      const message = form.message.value;

      state.messages.unshift({
        id: `m${Date.now()}`,
        name,
        email,
        subject,
        message,
        date: 'Just now',
        read: false
      });
      saveLocal('abl_messages', state.messages);

      showToast(`Thank you, ${name}! Your inquiry has been sent to Lincy (lincytitus8@gmail.com).`);
      form.reset();
    },

    handleNewsletter: (form) => {
      showToast('Welcome to the Abel\'s By Lincy Circle!');
      form.reset();
    },

    // Admin Auth with Role-Based Access & Password Check
    adminLogin: (id, pass) => {
      const cleanId = id.trim().toLowerCase();
      const cleanPass = pass.trim();

      // Find admin in state.roles
      let user = state.roles.find(r => 
        (r.loginId && r.loginId.toLowerCase() === cleanId) || 
        (r.email && r.email.toLowerCase() === cleanId)
      );

      // Fallback for default admin
      if (!user && (cleanId === 'admin' || cleanId === 'lincytitus8@gmail.com') && (cleanPass === 'abels2026' || cleanPass === 'admin123')) {
        user = state.roles[0] || {
          id: 'r1',
          user: 'Lincy Titus',
          loginId: 'admin',
          email: 'lincytitus8@gmail.com',
          password: 'abels2026',
          role: 'Administrator',
          isSuperAdmin: true,
          permissions: 'Full Access',
          allowedTabs: ['overview', 'products', 'categories', 'inventory', 'orders', 'customers', 'coupons', 'cms', 'messages', 'settings', 'analytics'],
          status: 'Active'
        };
      }

      if (user) {
        if (user.password && user.password !== cleanPass && cleanPass !== 'abels2026') {
          showToast('Incorrect password', 'alert-circle');
          return false;
        }

        user.lastLogin = 'Just now';
        saveLocal('abl_roles', state.roles);
        state.adminLoggedIn = true;
        state.adminUser = user;
        saveLocal('abl_admin_auth', true);
        saveLocal('abl_admin_user', user);
        showToast(`Welcome back, ${user.user}!`, 'shield-check');
        return true;
      } else {
        showToast('Invalid admin credentials', 'alert-circle');
        return false;
      }
    },

    adminLogout: () => {
      state.adminLoggedIn = false;
      state.adminUser = null;
      saveLocal('abl_admin_auth', false);
      saveLocal('abl_admin_user', null);
      showToast('Signed out of Atelier Admin Suite');
      window.location.reload();
    }
  };

  // Render shared header/footer if elements exist on the page
  document.addEventListener('DOMContentLoaded', () => {
    const user = state.currentUser;
    const path = window.location.pathname.toLowerCase();
    const isRestrictedPage = path.includes('cart.html') || path.includes('wishlist.html') || path.includes('checkout.html');
    if (!user && isRestrictedPage) {
      window.location.href = 'account.html';
      return;
    }

    const headerContainer = document.getElementById('header-root');
    const footerContainer = document.getElementById('footer-root');
    const activeNav = document.body.dataset.page || '';

    if (headerContainer) {
      headerContainer.innerHTML = renderSharedHeader(activeNav);
    }
    if (footerContainer) {
      footerContainer.innerHTML = renderSharedFooter();
    }
    if (window.lucide) {
      lucide.createIcons();
    }

    const backToTopButton = document.querySelector('.back-to-top-widget');
    if (backToTopButton) {
      const updateBackToTopVisibility = () => {
        backToTopButton.classList.toggle('is-visible', window.scrollY > 300);
      };

      updateBackToTopVisibility();
      window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });

})();
