const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getStoredOrders() {
  try {
    ensureDataDir();
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function saveStoredOrders(orders) {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

function getStoredProducts() {
  try {
    ensureDataDir();
    if (!fs.existsSync(PRODUCTS_FILE)) return null;
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return null;
  }
}

function saveStoredProducts(products) {
  try {
    ensureDataDir();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  getStoredOrders,
  saveStoredOrders,
  getStoredProducts,
  saveStoredProducts
};
