const express = require('express');
const router = express.Router();
const { createOrder, getOrderHistory, getOrderDetails } = require('../controllers/order.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public order details (with verification rules inside controller)
router.get('/:orderUuid', getOrderDetails);

// Protected user orders
router.use(authenticateToken);
router.post('/create', createOrder);
router.get('/', getOrderHistory);

module.exports = router;
