const db = require('../config/database');
const { generateOrderNumber } = require('../utils/order-number');
const { adjustStock } = require('./inventory.service');

const createOrderFromCart = async (userId, guestEmail, shippingAddress, billingAddress, shippingMethodId, items, subtotal, discountAmount, taxAmount, shippingAmount, totalAmount) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const orderNumber = generateOrderNumber();
    const orderUuid = require('crypto').randomUUID();

    // 1. Insert order record
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (uuid, order_number, user_id, guest_email, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, status, payment_status, fulfillment_status, shipping_method_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', 'unfulfilled', ?)`,
      [orderUuid, orderNumber, userId, guestEmail, subtotal, discountAmount, taxAmount, shippingAmount, totalAmount, shippingMethodId]
    );
    const orderId = orderResult.insertId;

    // 2. Insert order addresses (shipping)
    await connection.query(
      `INSERT INTO order_addresses (order_id, address_type, first_name, last_name, company, address_line_1, address_line_2, suburb, state, postcode, country, country_code, phone) 
       VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        shippingAddress.firstName,
        shippingAddress.lastName,
        shippingAddress.company || null,
        shippingAddress.addressLine1,
        shippingAddress.addressLine2 || null,
        shippingAddress.suburb,
        shippingAddress.state,
        shippingAddress.postcode,
        shippingAddress.country || 'Australia',
        shippingAddress.countryCode || 'AU',
        shippingAddress.phone || null
      ]
    );

    // 2b. Insert order addresses (billing)
    await connection.query(
      `INSERT INTO order_addresses (order_id, address_type, first_name, last_name, company, address_line_1, address_line_2, suburb, state, postcode, country, country_code, phone) 
       VALUES (?, 'billing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        billingAddress.firstName,
        billingAddress.lastName,
        billingAddress.company || null,
        billingAddress.addressLine1,
        billingAddress.addressLine2 || null,
        billingAddress.suburb,
        billingAddress.state,
        billingAddress.postcode,
        billingAddress.country || 'Australia',
        billingAddress.countryCode || 'AU',
        billingAddress.phone || null
      ]
    );

    // 3. Insert order items & adjust stock
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, sku, product_name, variant_name, quantity, unit_price, discount_amount, tax_amount, total_amount, product_image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.variantId,
          item.sku,
          item.productName,
          item.variantName || null,
          item.quantity,
          item.unitPrice,
          item.discountAmount || 0.00,
          item.taxAmount || 0.00,
          item.totalAmount,
          item.productImageUrl || null
        ]
      );

      // Decrement stock and log movement
      await adjustStock(connection, item.variantId, -item.quantity, 'sale', 'orders', orderId, `Sale order #${orderNumber}`);
    }

    // 4. Clear user cart items if logged in
    if (userId) {
      const [cartRows] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
      if (cartRows.length > 0) {
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartRows[0].id]);
      }
    }

    await connection.commit();
    return { orderId, orderNumber, orderUuid };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrderFromCart
};
