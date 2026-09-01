const express = require('express');
const router = express.Router();
const { createStripeIntent, createCheckoutSession, handleStripeWebhook, processAdminRefund, sendConfirmationEmail, sendNewsletterEmail, reconcilePayments } = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public Stripe webhook receiver (expects RAW body buffer, parsed in app.js entry point)
router.post('/webhook', handleStripeWebhook);

// Stripe Hosted Checkout Session creation
router.post('/create-checkout-session', createCheckoutSession);

// Send Order Confirmation Email
router.post('/send-order-confirmation-email', sendConfirmationEmail);

// Send Newsletter Welcome Email
router.post('/subscribe-newsletter', sendNewsletterEmail);

// Protected endpoint to create PaymentIntent for logged-in user
router.post('/create-intent', authenticateToken, createStripeIntent);

// Protected admin endpoint for processing refunds
router.post('/admin/refund/:orderId', authenticateToken, processAdminRefund);

// Admin recovery endpoint for DB failure payment reconciliation
router.post('/admin/reconcile-pending', authenticateToken, reconcilePayments);

module.exports = router;
