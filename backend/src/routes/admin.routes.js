const express = require('express');
const router = express.Router();
const { addProduct, updateProduct, deleteProduct, adjustStockQuantity, getAllOrders, updateOrderStatus } = require('../controllers/admin.controller');
const authenticateToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// Protect all admin endpoints
router.use(authenticateToken);
router.use(isAdmin);

// Products CRUD
router.post('/products', upload.any(), addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Inventory
router.post('/inventory/adjust', adjustStockQuantity);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
