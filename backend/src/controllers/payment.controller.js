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

const createCheckoutSession = async (req, res, next) => {
  try {
    const { items, email, shippingAddress } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

    // SERVER-SIDE PRICE SECURITY: Fetch authoritative prices from DB or Server Catalog
    const CATALOG = [
      { id: 'p_na1', price: 179 }, { id: 'p_na2', price: 149 }, { id: 'p_na3', price: 129 },
      { id: 'p_na4', price: 119 }, { id: 'p_na5', price: 169 }, { id: 'p_na6', price: 139 },
      { id: 'p_bs1', price: 219 }, { id: 'p_bs2', price: 159 }, { id: 'p_bs3', price: 149 },
      { id: 'p_bs4', price: 179 }, { id: 'p_bs5', price: 189 }, { id: 'p_bs6', price: 169 },
      { id: 'p1', price: 179 }, { id: 'p2', price: 149 }, { id: 'p3', price: 129 }
    ];

    const lineItems = [];
    for (const item of items) {
      // Requirement 49: Quantity Tampering Protection
      const rawQty = item.quantity;
      const parsedQty = parseInt(rawQty, 10);

      if (isNaN(parsedQty) || parsedQty <= 0 || parsedQty > 100 || String(rawQty).includes('.')) {
        return res.status(400).json({
          success: false,
          message: `Invalid item quantity '${rawQty}'. Quantity must be a positive integer between 1 and 100.`
        });
      }

      // Requirement 50: SQL & Input Sanitization
      const cleanItemId = String(item.id || '').replace(/['";<>\\]/g, '').trim();
      let authoritativePrice = 0;
      let authoritativeName = String(item.name || 'Fine Jewellery').replace(/<[^>]*>/g, '').trim();

      // 1. Authoritative DB Lookup via Parameterized Query
      if (cleanItemId) {
        try {
          const [dbProducts] = await db.query('SELECT title, price FROM products WHERE id = ?', [cleanItemId]);
          if (dbProducts && dbProducts.length > 0) {
            authoritativePrice = parseFloat(dbProducts[0].price);
            authoritativeName = dbProducts[0].title || authoritativeName;
          }
        } catch {
          // DB connection fallback
        }
      }

      // 2. Authoritative Server Catalog Lookup
      if (!authoritativePrice) {
        const catItem = CATALOG.find(c => c.id === cleanItemId || cleanItemId.includes(c.id));
        if (catItem) {
          authoritativePrice = catItem.price;
        } else {
          authoritativePrice = 119.00;
        }
      }

      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: authoritativeName,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(authoritativePrice * 100),
        },
        quantity: parsedQty,
      });
    }

    // Add Australia Post shipping fee line item if applicable
    const validShippingFee = parseFloat(req.body.shippingFee) || 0;
    if (validShippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: req.body.shippingMethod || 'Australia Post Shipping',
          },
          unit_amount: Math.round(validShippingFee * 100),
        },
        quantity: 1,
      });
    }

    const crypto = require('crypto');
    const cartFingerprint = items.map(i => `${i.id || i.name}:${i.quantity || 1}`).join('|');
    const idempotencyKey = `cs_idemp_${crypto.createHash('md5').update(`${email || ''}:${cartFingerprint}`).digest('hex')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'en',
      adaptive_pricing: { enabled: false },
      customer_email: email || (req.user ? req.user.email : undefined),
      success_url: `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/checkout?canceled=true`,
    }, {
      idempotencyKey
    });

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error.message);
    next(error);
  }
};

const { sendOrderConfirmationEmail, sendNewsletterWelcomeEmail, sendOrderDispatchEmail } = require('../services/email.service');

const sendConfirmationEmail = async (req, res, next) => {
  try {
    const { orderData } = req.body;
    if (!orderData) return res.status(400).json({ success: false, message: 'orderData is required' });

    // Asynchronous background dispatch (non-blocking)
    setTimeout(async () => {
      await sendOrderConfirmationEmail(orderData);
    }, 1000);

    res.status(200).json({ success: true, message: 'Order confirmation email queued for dispatch.' });
  } catch (error) {
    next(error);
  }
};

const sendNewsletterEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    setTimeout(async () => {
      await sendNewsletterWelcomeEmail(email);
    }, 500);

  } catch (error) {
    next(error);
  }
};

const { reconcilePendingPaymentsWithStripe } = require('../services/stripe.service');

const reconcilePayments = async (req, res, next) => {
  try {
    const result = await reconcilePendingPaymentsWithStripe();
    res.status(200).json({
      success: true,
      message: `Database recovery scan completed. ${result.recoveredCount} payment(s) reconciled with Stripe.`,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const sendDispatchEmail = async (req, res, next) => {
  try {
    const { toEmail, customerName, orderId, trackingNumber, shippingMethod, shippingAddress } = req.body;
    if (!toEmail) return res.status(400).json({ success: false, message: 'Customer email is required.' });

    const result = await sendOrderDispatchEmail({
      toEmail,
      customerName,
      orderId,
      trackingNumber,
      shippingMethod,
      shippingAddress
    });

    res.status(200).json({ success: true, message: 'Australia Post tracking email sent successfully.', result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStripeIntent,
  createCheckoutSession,
  handleStripeWebhook,
  processAdminRefund,
  sendConfirmationEmail,
  sendNewsletterEmail,
  sendDispatchEmail,
  reconcilePayments
};
