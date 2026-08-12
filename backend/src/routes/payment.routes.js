const express = require('express');
const router = express.Router();
const { createStripeIntent, handleStripeWebhook } = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public Stripe webhook receiver (expects RAW body, parsed in app.js entry point)
router.post('/webhook', handleStripeWebhook);

// Protected endpoint to generate client checkout credentials
router.post('/create-intent', authenticateToken, createStripeIntent);

module.exports = router;
