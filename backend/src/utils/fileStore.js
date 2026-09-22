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

module.exports = {
  getStoredOrders,
  saveStoredOrders,
  getStoredProducts,
  saveStoredProducts,
  getStoredCms,
  saveStoredCms
};

