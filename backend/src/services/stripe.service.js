const stripe = require('../config/stripe');
const db = require('../config/database');

const createPaymentIntent = async (amount, currency = 'aud', metadata = {}) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency,
    metadata
  });
};

const handleWebhookEvent = async (event) => {
  const eventId = event.id;
  const eventType = event.type;
  
  // 1. Double check webhook idempotency
  const [existing] = await db.query('SELECT id FROM stripe_webhook_events WHERE stripe_event_id = ?', [eventId]);
  if (existing.length > 0) {
    console.log(`⚠️ Stripe Event ${eventId} was already processed.`);
    return { status: 'ignored' };
  }

  // Insert event row
  const [insertResult] = await db.query(
    'INSERT INTO stripe_webhook_events (stripe_event_id, event_type, payload) VALUES (?, ?, ?)',
    [eventId, eventType, JSON.stringify(event)]
  );
  const webhookRecordId = insertResult.insertId;

  try {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (eventType === 'payment_intent.succeeded') {
      // 2. Mark order as paid
      await db.query(
        "UPDATE orders SET status = 'paid', payment_status = 'paid', placed_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId]
      );

      // 3. Save payment details
      await db.query(
        `INSERT INTO payments (order_id, stripe_payment_intent_id, stripe_charge_id, amount, status, paid_at) 
         VALUES (?, ?, ?, ?, 'succeeded', CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE status = 'succeeded', paid_at = CURRENT_TIMESTAMP`,
        [orderId, paymentIntent.id, paymentIntent.latest_charge || null, paymentIntent.amount / 100]
      );
    } else if (eventType === 'payment_intent.payment_failed') {
      // Mark order payment status failed
      await db.query(
        "UPDATE orders SET status = 'payment_pending', payment_status = 'failed' WHERE id = ?",
        [orderId]
      );

      await db.query(
        `INSERT INTO payments (order_id, stripe_payment_intent_id, amount, status, failure_code, failure_message) 
         VALUES (?, ?, ?, 'failed', ?, ?) 
         ON DUPLICATE KEY UPDATE status = 'failed', failure_code = ?, failure_message = ?`,
        [orderId, paymentIntent.id, paymentIntent.amount / 100, paymentIntent.last_payment_error?.code || null, paymentIntent.last_payment_error?.message || null, paymentIntent.last_payment_error?.code || null, paymentIntent.last_payment_error?.message || null]
      );
    }

    // Mark event processed
    await db.query(
      'UPDATE stripe_webhook_events SET processed = TRUE, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [webhookRecordId]
    );

    return { status: 'processed' };
  } catch (error) {
    // Save error log
    await db.query(
      'UPDATE stripe_webhook_events SET processing_error = ? WHERE id = ?',
      [error.message, webhookRecordId]
    );
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhookEvent
};
