const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

const TMP_DIR = path.join(os.tmpdir(), 'abl_data');
const TMP_ORDERS_FILE = path.join(TMP_DIR, 'orders.json');
const TMP_PRODUCTS_FILE = path.join(TMP_DIR, 'products.json');

// In-memory runtime cache for serverless lifecycles
let memoryProducts = null;
let memoryOrders = null;

function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function getStoredOrders() {
  if (memoryOrders && Array.isArray(memoryOrders)) return memoryOrders;
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = fs.readFileSync(TMP_ORDERS_FILE, 'utf8');
      memoryOrders = JSON.parse(data || '[]');
      return memoryOrders;
    }
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      memoryOrders = JSON.parse(data || '[]');
      return memoryOrders;
    }
    return [];
  } catch (err) {
    return memoryOrders || [];
  }
}

function saveStoredOrders(orders) {
  memoryOrders = orders;
  let saved = false;
  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    saved = true;
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    saved = true;
  } catch {}

  return saved;
}

function getStoredProducts() {
  if (memoryProducts && Array.isArray(memoryProducts)) return memoryProducts;
  try {
    if (fs.existsSync(TMP_PRODUCTS_FILE)) {
      const data = fs.readFileSync(TMP_PRODUCTS_FILE, 'utf8');
      memoryProducts = JSON.parse(data || '[]');
      return memoryProducts;
    }
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
      memoryProducts = JSON.parse(data || '[]');
      return memoryProducts;
    }
    return null;
  } catch (err) {
    return memoryProducts;
  }
}

function saveStoredProducts(products) {
  memoryProducts = products;
  let saved = false;
  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    saved = true;
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    saved = true;
  } catch {}

  return saved;
}

const CMS_FILE = path.join(DATA_DIR, 'cms.json');
const TMP_CMS_FILE = path.join(TMP_DIR, 'cms.json');
let memoryCms = null;

function getStoredCms() {
  if (memoryCms && typeof memoryCms === 'object') return memoryCms;
  try {
    if (fs.existsSync(TMP_CMS_FILE)) {
      const data = fs.readFileSync(TMP_CMS_FILE, 'utf8');
      memoryCms = JSON.parse(data || '{}');
      return memoryCms;
    }
    if (fs.existsSync(CMS_FILE)) {
      const data = fs.readFileSync(CMS_FILE, 'utf8');
      memoryCms = JSON.parse(data || '{}');
      return memoryCms;
    }
    return null;
  } catch (err) {
    return memoryCms;
  }
}

function saveStoredCms(cms) {
  memoryCms = cms;
  let saved = false;
  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(CMS_FILE, JSON.stringify(cms, null, 2), 'utf8');
    saved = true;
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_CMS_FILE, JSON.stringify(cms, null, 2), 'utf8');
    saved = true;
  } catch {}

  return saved;
}

const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const TMP_REVIEWS_FILE = path.join(TMP_DIR, 'reviews.json');
let memoryReviews = null;

function getStoredReviews() {
  if (memoryReviews && Array.isArray(memoryReviews)) return memoryReviews;
  try {
    if (fs.existsSync(TMP_REVIEWS_FILE)) {
      const data = fs.readFileSync(TMP_REVIEWS_FILE, 'utf8');
      memoryReviews = JSON.parse(data || '[]');
      return memoryReviews;
    }
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
      memoryReviews = JSON.parse(data || '[]');
      return memoryReviews;
    }
    return [];
  } catch (err) {
    return memoryReviews || [];
  }
}

function saveStoredReviews(reviews) {
  memoryReviews = reviews;
  let saved = false;
  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    saved = true;
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    saved = true;
  } catch {}

  return saved;
}

const DELETED_REVIEWS_FILE = path.join(DATA_DIR, 'deleted_reviews.json');
const TMP_DELETED_REVIEWS_FILE = path.join(TMP_DIR, 'deleted_reviews.json');
let memoryDeletedReviews = null;

function getDeletedReviewIds() {
  if (memoryDeletedReviews && Array.isArray(memoryDeletedReviews)) return memoryDeletedReviews;
  try {
    if (fs.existsSync(TMP_DELETED_REVIEWS_FILE)) {
      const data = fs.readFileSync(TMP_DELETED_REVIEWS_FILE, 'utf8');
      memoryDeletedReviews = JSON.parse(data || '[]');
      return memoryDeletedReviews;
    }
    if (fs.existsSync(DELETED_REVIEWS_FILE)) {
      const data = fs.readFileSync(DELETED_REVIEWS_FILE, 'utf8');
      memoryDeletedReviews = JSON.parse(data || '[]');
      return memoryDeletedReviews;
    }
    return [];
  } catch (err) {
    return memoryDeletedReviews || [];
  }
}

function addDeletedReviewId(id) {
  if (!id) return;
  const current = getDeletedReviewIds();
  const updated = Array.from(new Set([...current, String(id)]));
  memoryDeletedReviews = updated;

  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(DELETED_REVIEWS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_DELETED_REVIEWS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch {}

  return updated;
}

const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const TMP_CARTS_FILE = path.join(TMP_DIR, 'carts.json');
let memoryCarts = null;

function getStoredCarts() {
  if (memoryCarts && typeof memoryCarts === 'object') return memoryCarts;
  try {
    if (fs.existsSync(TMP_CARTS_FILE)) {
      const data = fs.readFileSync(TMP_CARTS_FILE, 'utf8');
      memoryCarts = JSON.parse(data || '{}');
      return memoryCarts;
    }
    if (fs.existsSync(CARTS_FILE)) {
      const data = fs.readFileSync(CARTS_FILE, 'utf8');
      memoryCarts = JSON.parse(data || '{}');
      return memoryCarts;
    }
    return {};
  } catch (err) {
    return memoryCarts || {};
  }
}

function getStoredCart(email) {
  if (!email) return [];
  const cleanEmail = String(email).trim().toLowerCase();
  const allCarts = getStoredCarts();
  const cart = allCarts[cleanEmail];
  return Array.isArray(cart) ? cart : [];
}

function saveStoredCart(email, items) {
  if (!email) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  const allCarts = getStoredCarts();
  allCarts[cleanEmail] = Array.isArray(items) ? items : [];
  memoryCarts = allCarts;

  let saved = false;
  try {
    ensureDir(DATA_DIR);
    fs.writeFileSync(CARTS_FILE, JSON.stringify(allCarts, null, 2), 'utf8');
    saved = true;
  } catch {}

  try {
    ensureDir(TMP_DIR);
    fs.writeFileSync(TMP_CARTS_FILE, JSON.stringify(allCarts, null, 2), 'utf8');
    saved = true;
  } catch {}

  return saved;
}

module.exports = {
  getStoredOrders,
  saveStoredOrders,
  getStoredProducts,
  saveStoredProducts,
  getStoredCms,
  saveStoredCms,
  getStoredReviews,
  saveStoredReviews,
  getDeletedReviewIds,
  addDeletedReviewId,
  getStoredCarts,
  getStoredCart,
  saveStoredCart
};




