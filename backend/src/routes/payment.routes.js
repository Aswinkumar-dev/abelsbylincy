const express = require('express');
const router = express.Router();
const { createStripeIntent, handleStripeWebhook, processAdminRefund } = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public Stripe webhook receiver (expects RAW body buffer, parsed in app.js entry point)
router.post('/webhook', handleStripeWebhook);

// Protected endpoint to create PaymentIntent for logged-in user
router.post('/create-intent', authenticateToken, createStripeIntent);

// Protected admin endpoint for processing refunds
router.post('/admin/refund/:orderId', authenticateToken, processAdminRefund);

module.exports = router;
