const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getOrderDetails, getAllOrders, syncOrders } = require('../controllers/order.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public/Admin sync & retrieval endpoints
router.get('/all', getAllOrders);
router.post('/sync', syncOrders);

// Order details endpoint with authentication guard
router.get('/:orderUuid', authenticateToken, getOrderDetails);

// Protected user orders
router.use(authenticateToken);
router.post('/create', createOrder);
router.get('/', getOrderHistory);

module.exports = router;
