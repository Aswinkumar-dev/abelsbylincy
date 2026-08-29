const stripe = require('../config/stripe');
const db = require('../config/database');
const { adjustStock } = require('./inventory.service');
const { sendOrderConfirmationEmail } = require('./email.service');

/**
 * Retrieve or create a Stripe Customer ID for a registered user.
 */
const getOrCreateStripeCustomer = async (userId) => {
  if (!userId) return null;

  const [users] = await db.query(
    'SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) return null;
  const user = users[0];

  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Create customer in Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
    metadata: { user_id: String(user.id) }
  });

  await db.query(
    'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
    [customer.id, user.id]
  );

  return customer.id;
};

/**
 * Create a Stripe PaymentIntent for an order with idempotency.
 */
const createPaymentIntentForOrder = async (order, userId) => {
  const stripeCustomerId = await getOrCreateStripeCustomer(userId);
  const idempotencyKey = `pi_create_${order.uuid || order.id}`;

  const intent = await stripe.paymentIntents.create(
    {
      amount: Math.round(parseFloat(order.total_amount) * 100), // AUD in cents
      currency: 'aud',
      customer: stripeCustomerId || undefined,
      metadata: {
        order_id: String(order.id),
        order_number: order.order_number
      }
    },
    { idempotencyKey }
  );

  // Insert or update payments record
  await db.query(
    `INSERT INTO payments (order_id, stripe_payment_intent_id, idempotency_key, amount, currency, status)
     VALUES (?, ?, ?, ?, 'AUD', 'requires_payment_method')
     ON DUPLICATE KEY UPDATE 
       stripe_payment_intent_id = VALUES(stripe_payment_intent_id),
       amount = VALUES(amount),
       status = 'requires_payment_method'`,
    [order.id, intent.id, idempotencyKey, order.total_amount]
  );

  // Mark order status as payment_pending
  await db.query(
    "UPDATE orders SET status = 'payment_pending' WHERE id = ?",
    [order.id]
  );

  return intent;
};

/**
 * Handle incoming Stripe Webhook events.
 */
const handleWebhookEvent = async (event) => {
  const eventId = event.id;
  const eventType = event.type;

  // 1. Idempotency: insert first, bail out on duplicate delivery
  let webhookRecordId;
  try {
    const [insertResult] = await db.query(
      'INSERT INTO stripe_webhook_events (stripe_event_id, event_type, payload) VALUES (?, ?, ?)',
      [eventId, eventType, JSON.stringify(event)]
    );
    webhookRecordId = insertResult.insertId;
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      console.log(`⚠️ Duplicate webhook event ${eventId}, already processed.`);
      return { status: 'duplicate_ignored' };
    }
    throw e;
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.order_id || paymentIntent.metadata?.orderId;

    if (eventType === 'payment_intent.succeeded') {
      if (orderId) {
        // Extract card details if available from latest charge
        let cardBrand = null;
        let cardLast4 = null;
        let chargeId = paymentIntent.latest_charge || null;

        if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
          const charge = paymentIntent.charges.data[0];
          chargeId = charge.id;
          const pmDetails = charge.payment_method_details;
          if (pmDetails && pmDetails.card) {
            cardBrand = pmDetails.card.brand || null;
            cardLast4 = pmDetails.card.last4 || null;
          }
        }

        // Update payment record
        await connection.query(
          `INSERT INTO payments (order_id, stripe_payment_intent_id, stripe_charge_id, amount, currency, status, card_brand, card_last4, paid_at) 
           VALUES (?, ?, ?, ?, 'AUD', 'succeeded', ?, ?, CURRENT_TIMESTAMP) 
           ON DUPLICATE KEY UPDATE 
             status = 'succeeded',
             stripe_charge_id = VALUES(stripe_charge_id),
             card_brand = VALUES(card_brand),
             card_last4 = VALUES(card_last4),
             paid_at = CURRENT_TIMESTAMP`,
          [orderId, paymentIntent.id, chargeId, paymentIntent.amount / 100, cardBrand, cardLast4]
        );

        // Update order status to paid
        await connection.query(
          "UPDATE orders SET status = 'paid', payment_status = 'paid', placed_at = CURRENT_TIMESTAMP WHERE id = ?",
          [orderId]
        );

        // Fetch order details for inventory decrement and email confirmation
        const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const order = orders[0];

        if (order) {
          const [orderItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

          // Decrement stock for each item in the order
          for (const item of orderItems) {
            if (item.variant_id) {
              await adjustStock(
                connection,
                item.variant_id,
                -item.quantity,
                'sale',
                'orders',
                orderId,
                `Sale order #${order.order_number}`
              );
            }
          }

          // Trigger email confirmation asynchronously
          try {
            await sendOrderConfirmationEmail(order.user_id, order, orderItems);
          } catch (emailErr) {
            console.error('⚠️ Failed to send order confirmation email:', emailErr.message);
          }
        }
      }
    } else if (eventType === 'payment_intent.payment_failed') {
      if (orderId) {
        await connection.query(
          "UPDATE orders SET payment_status = 'failed' WHERE id = ?",
          [orderId]
        );

        const lastErr = paymentIntent.last_payment_error;
        await connection.query(
          `INSERT INTO payments (order_id, stripe_payment_intent_id, amount, currency, status, failure_code, failure_message) 
           VALUES (?, ?, ?, 'AUD', 'failed', ?, ?) 
           ON DUPLICATE KEY UPDATE 
             status = 'failed', 
             failure_code = VALUES(failure_code), 
             failure_message = VALUES(failure_message)`,
          [orderId, paymentIntent.id, paymentIntent.amount / 100, lastErr?.code || null, lastErr?.message || null]
        );
      }
    } else if (eventType === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;
      const amountRefunded = charge.amount_refunded / 100;

      const [payRows] = await connection.query(
        'SELECT order_id FROM payments WHERE stripe_payment_intent_id = ?',
        [paymentIntentId]
      );

      if (payRows.length > 0) {
        const orderIdRef = payRows[0].order_id;
        const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderIdRef]);

        if (orderRows.length > 0) {
          const totalAmt = parseFloat(orderRows[0].total_amount);
          const isFullRefund = amountRefunded >= totalAmt;
          const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

          await connection.query(
            'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
            [newStatus, newStatus, orderIdRef]
          );

          await connection.query(
            `INSERT INTO refunds (order_id, payment_id, stripe_refund_id, amount, status, reason)
             SELECT order_id, id, ?, ?, 'succeeded', ? FROM payments WHERE stripe_payment_intent_id = ?
             ON DUPLICATE KEY UPDATE status = 'succeeded'`,
            [charge.refunds?.data?.[0]?.id || null, amountRefunded, charge.refunds?.data?.[0]?.reason || 'customer_requested', paymentIntentId]
          );
        }
      }
    }

    await connection.commit();

    // Mark event processed
    await db.query(
      'UPDATE stripe_webhook_events SET processed = TRUE, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [webhookRecordId]
    );

    return { status: 'processed' };
  } catch (error) {
    await connection.rollback();
    await db.query(
      'UPDATE stripe_webhook_events SET processing_error = ? WHERE id = ?',
      [error.message, webhookRecordId]
    );
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Process admin refund via Stripe API.
 */
const createRefundForOrder = async (orderId, amount, reason = 'requested_by_customer') => {
  const [payments] = await db.query(
    "SELECT stripe_payment_intent_id FROM payments WHERE order_id = ? AND status = 'succeeded'",
    [orderId]
  );

  if (payments.length === 0 || !payments[0].stripe_payment_intent_id) {
    throw new Error('No succeeded Stripe payment found for this order.');
  }

  const paymentIntentId = payments[0].stripe_payment_intent_id;
  const idempotencyKey = `ref_${orderId}_${Date.now()}`;

  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(parseFloat(amount) * 100) : undefined, // full refund if undefined
      reason
    },
    { idempotencyKey }
  );

  return refund;
};

module.exports = {
  getOrCreateStripeCustomer,
  createPaymentIntentForOrder,
  handleWebhookEvent,
  createRefundForOrder
};
