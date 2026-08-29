const stripe = require('../config/stripe');
const stripeService = require('../services/stripe.service');
const { createOrderFromCart } = require('../services/order.service');
const db = require('../config/database');

const createStripeIntent = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    let { orderId, orderUuid, items, shippingAddress, billingAddress, shippingMethodId, couponCode } = req.body;

    let order = null;

    if (orderId || orderUuid) {
      const [orders] = await db.query(
        'SELECT * FROM orders WHERE id = ? OR uuid = ?',
        [orderId || null, orderUuid || null]
      );
      if (orders.length > 0) {
        order = orders[0];
      }
    }

    // If order was not created yet, create order server-side from request payload
    if (!order) {
      if (!items || items.length === 0 || !shippingAddress || !billingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Order creation details (items, shippingAddress, billingAddress) are required.'
        });
      }

      // Server-side recalculation of pricing
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        let unitPrice = parseFloat(item.price || item.unitPrice || 0);
        
        // If product_id / variant_id present, fetch authoritative price from DB
        if (item.variantId || item.productId) {
          const [prods] = await db.query('SELECT price FROM products WHERE id = ?', [item.productId || item.id]);
          if (prods.length > 0) {
            unitPrice = parseFloat(prods[0].price);
          }
        }

        const quantity = parseInt(item.quantity || 1, 10);
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        verifiedItems.push({
          productId: item.productId || item.id,
          variantId: item.variantId || null,
          sku: item.sku || 'ABL-JEW-001',
          productName: item.name || item.productName || 'Fine Jewellery',
          variantName: item.variantName || item.selectedSize || null,
          quantity: quantity,
          unitPrice: unitPrice,
          discountAmount: 0,
          taxAmount: 0.00, // GST included / zero extra tax
          totalAmount: itemTotal,
          productImageUrl: item.image || item.productImageUrl || null
        });
      }

      let discountAmount = 0;
      if (couponCode) {
        const [coupons] = await db.query(
          'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
          [couponCode.trim().toUpperCase()]
        );
        if (coupons.length > 0) {
          const cp = coupons[0];
          if (cp.discount_type === 'percentage') {
            discountAmount = (subtotal * parseFloat(cp.discount_value)) / 100;
          } else if (cp.discount_type === 'fixed') {
            discountAmount = Math.min(subtotal, parseFloat(cp.discount_value));
          }
        }
      }

      let shippingAmount = 0;
      if (shippingMethodId) {
        const [shipMethods] = await db.query('SELECT price FROM shipping_methods WHERE id = ?', [shippingMethodId]);
        if (shipMethods.length > 0) {
          shippingAmount = parseFloat(shipMethods[0].price);
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

      const createdDetails = await createOrderFromCart(
        userId,
        req.body.email || (req.user ? req.user.email : null),
        shippingAddress,
        billingAddress,
        shippingMethodId || null,
        verifiedItems,
        subtotal,
        discountAmount,
        0.00,
        shippingAmount,
        totalAmount
      );

      const [newOrders] = await db.query('SELECT * FROM orders WHERE id = ?', [createdDetails.orderId]);
      order = newOrders[0];
    }

    // Generate Stripe PaymentIntent with idempotency
    const intent = await stripeService.createPaymentIntentForOrder(order, userId);

    res.status(200).json({
      success: true,
      clientSecret: intent.client_secret,
      stripePaymentIntentId: intent.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      order: {
        id: order.id,
        uuid: order.uuid,
        orderNumber: order.order_number,
        totalAmount: order.total_amount
      }
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
    console.error('❌ Webhook handling error:', error.message);
    next(error);
  }
};

const processAdminRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const refund = await stripeService.createRefundForOrder(orderId, amount, reason);

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully via Stripe.',
      refundId: refund.id,
      amountRefunded: refund.amount / 100
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStripeIntent,
  handleStripeWebhook,
  processAdminRefund
};
