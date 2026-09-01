const { createOrderFromCart } = require('../services/order.service');
const db = require('../config/database');

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const {
      guestEmail,
      shippingAddress,
      billingAddress,
      shippingMethodId,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount,
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in the order request.' });
    }

    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping and billing addresses are required.' });
    }

    const orderDetails = await createOrderFromCart(
      userId,
      guestEmail || null,
      shippingAddress,
      billingAddress,
      shippingMethodId || null,
      items,
      subtotal || 0,
      discountAmount || 0,
      taxAmount || 0,
      shippingAmount || 0,
      totalAmount
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      ...orderDetails
    });
  } catch (error) {
    next(error);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      const [addresses] = await db.query('SELECT * FROM order_addresses WHERE order_id = ?', [order.id]);
      
      order.items = items;
      order.addresses = addresses;
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderDetails = async (req, res, next) => {
  try {
    const { orderUuid } = req.params;

    let orders = [];
    try {
      const [rows] = await db.query('SELECT * FROM orders WHERE uuid = ?', [orderUuid]);
      orders = rows;
    } catch {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Security validation: guest email or user id matching (Horizontal Privilege Escalation Protection)
    if (order.user_id && (!req.user || req.user.id !== order.user_id)) {
      return res.status(403).json({ success: false, message: 'You do not have access to view this order.' });
    }

    let items = [], addresses = [], payments = [];
    try {
      const [iRows] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      const [aRows] = await db.query('SELECT * FROM order_addresses WHERE order_id = ?', [order.id]);
      const [pRows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);
      items = iRows; addresses = aRows; payments = pRows;
    } catch {}

    order.items = items;
    order.addresses = addresses;
    order.payments = payments;

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderDetails
};
