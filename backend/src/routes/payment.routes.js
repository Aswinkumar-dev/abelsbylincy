const express = require('express');
const router = express.Router();
const { createStripeIntent, createCheckoutSession, handleStripeWebhook, processAdminRefund, sendConfirmationEmail, sendNewsletterEmail, sendDispatchEmail, reconcilePayments, recordStripeOrder, getSessionDetails } = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public Stripe webhook receiver (expects RAW body buffer, parsed in app.js entry point)
router.post('/webhook', handleStripeWebhook);

// Stripe Hosted Checkout Session creation
router.post('/create-checkout-session', createCheckoutSession);

// Get Stripe Checkout Session Details (for confirmation screen verification)
router.get('/session-details/:sessionId', getSessionDetails);

// Record Stripe Order into Database
router.post('/record-stripe-order', recordStripeOrder);

// Send Order Confirmation Email
router.post('/send-order-confirmation-email', sendConfirmationEmail);

// Send Newsletter Welcome Email
router.post('/subscribe-newsletter', sendNewsletterEmail);

// Send Australia Post Order Dispatch Email
router.post('/send-order-dispatch-email', sendDispatchEmail);

// Protected endpoint to create PaymentIntent for logged-in user
router.post('/create-intent', authenticateToken, createStripeIntent);

// Protected admin endpoint for processing refunds
router.post('/admin/refund/:orderId', authenticateToken, processAdminRefund);

// Admin recovery endpoint for DB failure payment reconciliation
router.post('/admin/reconcile-pending', authenticateToken, reconcilePayments);

module.exports = router;
