const stripe = require('../config/stripe');
const stripeService = require('../services/stripe.service');

const createStripeIntent = async (req, res, next) => {
  try {
    const { amount, currency, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: 'Amount and orderId are required.' });
    }

    const intent = await stripeService.createPaymentIntent(amount, currency || 'aud', { orderId: String(orderId) });

    res.status(200).json({
      success: true,
      clientSecret: intent.client_secret,
      stripePaymentIntentId: intent.id
    });
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // RAW body buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook Signature Verification Failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const result = await stripeService.handleWebhookEvent(event);
    res.status(200).json({ received: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStripeIntent,
  handleStripeWebhook
};
