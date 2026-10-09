const express = require('express');
const router = express.Router();
const { createStripeIntent, createCheckoutSession, handleStripeWebhook, processAdminRefund, sendConfirmationEmail, sendNewsletterEmail, sendDispatchEmail, sendRefundEmail, reconcilePayments, recordStripeOrder, getSessionDetails, checkStripeRefund, placePickupOrder } = require('../controllers/payment.controller');
const authenticateToken = require('../middleware/auth.middleware');

// Public Stripe webhook receiver (expects RAW body buffer, parsed in app.js entry point)
router.post('/webhook', handleStripeWebhook);

// Stripe Hosted Checkout Session creation
router.post('/create-checkout-session', createCheckoutSession);

// In-Person Pick Up Order Placement (Cash / In-Person Collection, Immediate Stock Deduction)
router.post('/place-pickup-order', placePickupOrder);

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

// Send Customer Stripe Refund Email
router.post('/send-order-refund-email', sendRefundEmail);

// Check / verify Stripe refund status live
router.post('/check-stripe-refund', checkStripeRefund);

// Refund endpoints
router.post('/refund', processAdminRefund);
router.post('/refund/:orderId', processAdminRefund);
router.post('/admin/refund', processAdminRefund);
router.post('/admin/refund/:orderId', processAdminRefund);

// Protected endpoint to create PaymentIntent for logged-in user
router.post('/create-intent', authenticateToken, createStripeIntent);

// Admin recovery endpoint for DB failure payment reconciliation
router.post('/admin/reconcile-pending', authenticateToken, reconcilePayments);

module.exports = router;
