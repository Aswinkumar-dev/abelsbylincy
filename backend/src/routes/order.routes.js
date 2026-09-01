const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getOrderDetails } = require('../controllers/order.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Order details endpoint with authentication guard
router.get('/:orderUuid', authenticateToken, getOrderDetails);

// Protected user orders
router.use(authenticateToken);
router.post('/create', createOrder);
router.get('/', getOrderHistory);

module.exports = router;
