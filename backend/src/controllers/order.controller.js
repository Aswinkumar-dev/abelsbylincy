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

const { getStoredOrders, saveStoredOrders } = require('../utils/fileStore');

const getAllOrders = async (req, res, next) => {
  try {
    let dbOrders = [];
    try {
      const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
      for (const order of rows) {
        try {
          const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
          const [addresses] = await db.query('SELECT * FROM order_addresses WHERE order_id = ?', [order.id]);
          const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);

          const shipAddr = addresses.find(a => a.address_type === 'shipping') || addresses[0] || {};
          const custName = `${shipAddr.first_name || ''} ${shipAddr.last_name || ''}`.trim() || 'Valued Customer';
          const dateStr = order.placed_at 
            ? new Date(order.placed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          const formattedItems = (items || []).map(i => ({
            id: i.product_id,
            name: i.product_name,
            sku: i.sku,
            quantity: Number(i.quantity) || 1,
            price: Number(i.unit_price) || 0,
            image: i.product_image_url || null
          }));

          const primaryProdName = formattedItems.length > 0 
            ? (formattedItems.length > 1 ? `${formattedItems[0].name} (+${formattedItems.length - 1} items)` : formattedItems[0].name)
            : 'Fine Jewellery Selection';

          dbOrders.push({
            id: order.order_number || String(order.id),
            order_number: order.order_number,
            dbId: order.id,
            uuid: order.uuid,
            customer: custName,
            email: order.guest_email || '',
            phone: shipAddr.phone || '',
            address: shipAddr.address_line_1 || '',
            city: shipAddr.suburb || '',
            state: shipAddr.state || '',
            postcode: shipAddr.postcode || '',
            product: primaryProdName,
            items: formattedItems,
            date: dateStr,
            status: order.status || 'Confirmed',
            payment_status: order.payment_status || 'paid',
            fulfillment_status: order.fulfillment_status || 'unfulfilled',
            total: `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
            rawAmount: parseFloat(order.total_amount || 0),
            subtotal: parseFloat(order.subtotal || 0),
            discountAmount: parseFloat(order.discount_amount || 0),
            shippingFee: parseFloat(order.shipping_amount || 0),
            trackingNumber: order.tracking_number || null,
            sessionId: payments?.[0]?.stripe_payment_intent_id || null,
            paymentMethod: payments?.[0]?.payment_method_type || 'Stripe Encrypted Payment'
          });
        } catch {}
      }
    } catch (e) {
      // DB offline fallback
    }

    const fileOrders = getStoredOrders() || [];
    
    // Merge unique orders by order number / ID
    const orderMap = new Map();
    [...fileOrders, ...dbOrders].forEach(o => {
      const key = o.id || o.order_number || o.uuid;
      if (key) {
        orderMap.set(String(key), { ...(orderMap.get(String(key)) || {}), ...o });
      }
    });

    const merged = Array.from(orderMap.values());
    res.status(200).json({ success: true, orders: merged });
  } catch (error) {
    next(error);
  }
};

const syncOrders = async (req, res, next) => {
  try {
    const { order, orders, deleteId } = req.body;
    let currentOrders = getStoredOrders() || [];

    if (Array.isArray(orders)) {
      saveStoredOrders(orders);
      return res.status(200).json({ success: true, message: 'Orders synchronized successfully.', orders });
    }

    if (deleteId) {
      currentOrders = currentOrders.filter(o => o.id !== deleteId && o.order_number !== deleteId);
      saveStoredOrders(currentOrders);
      try {
        await db.query('DELETE FROM orders WHERE order_number = ? OR id = ?', [deleteId, deleteId]);
      } catch (_) {}
      return res.status(200).json({ success: true, message: 'Order deleted.', orders: currentOrders });
    }

    if (order) {
      const key = String(order.id || order.order_number || `ABL-${Date.now()}`).trim();
      const idx = currentOrders.findIndex(o => o.id === key || o.order_number === key);
      if (idx !== -1) {
        currentOrders[idx] = { ...currentOrders[idx], ...order, id: key };
      } else {
        currentOrders.unshift({ ...order, id: key });
      }
      saveStoredOrders(currentOrders);

      // Persist full order, addresses, items, and stock reduction directly into MySQL
      try {
        const orderUuid = order.uuid || require('crypto').randomUUID();
        const guestEmail = order.email || order.guest_email || 'customer@abelsbylincy.com';
        const totalAmount = parseFloat(order.rawAmount !== undefined ? order.rawAmount : String(order.total || '0').replace(/[^0-9.]/g, '')) || 0;
        const subtotal = parseFloat(order.subtotal || totalAmount) || totalAmount;
        const discountAmount = parseFloat(order.discountAmount || 0) || 0;
        const shippingAmount = parseFloat(order.shippingFee || order.shippingAmount || 0) || 0;
        const statusVal = order.status || 'Confirmed';

        let orderDbId = null;
        const [existing] = await db.query('SELECT id FROM orders WHERE order_number = ? OR id = ?', [key, key]);
        if (existing.length > 0) {
          orderDbId = existing[0].id;
          await db.query(
            `UPDATE orders SET 
               status = COALESCE(?, status),
               tracking_number = COALESCE(?, tracking_number),
               guest_email = COALESCE(?, guest_email),
               subtotal = COALESCE(?, subtotal),
               discount_amount = COALESCE(?, discount_amount),
               shipping_amount = COALESCE(?, shipping_amount),
               total_amount = COALESCE(?, total_amount),
               payment_status = 'paid',
               updated_at = NOW()
             WHERE id = ?`,
            [order.status || null, order.trackingNumber || null, guestEmail, subtotal, discountAmount, shippingAmount, totalAmount, orderDbId]
          );
        } else {
          const [orderResult] = await db.query(
            `INSERT INTO orders 
              (uuid, order_number, guest_email, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, status, payment_status, fulfillment_status, tracking_number, placed_at) 
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'paid', 'dispatching', ?, NOW())`,
            [orderUuid, key, guestEmail, subtotal, discountAmount, shippingAmount, totalAmount, statusVal, order.trackingNumber || null]
          );
          orderDbId = orderResult.insertId;
        }

        // Record addresses if provided
        if (orderDbId && (order.address || order.city || order.state)) {
          const custName = String(order.customer || order.name || '').trim();
          const firstName = custName.split(' ')[0] || 'Valued';
          const lastName = custName.split(' ').slice(1).join(' ') || 'Customer';

          const [existingAddr] = await db.query('SELECT id FROM order_addresses WHERE order_id = ? AND address_type = "shipping"', [orderDbId]);
          if (existingAddr.length > 0) {
            await db.query(
              `UPDATE order_addresses SET
                 first_name = ?, last_name = ?, address_line_1 = ?, suburb = ?, state = ?, postcode = ?, phone = ?
               WHERE id = ?`,
              [firstName, lastName, order.address || '', order.city || '', order.state || '', order.postcode || '', order.phone || '', existingAddr[0].id]
            );
          } else {
            await db.query(
              `INSERT INTO order_addresses (order_id, address_type, first_name, last_name, address_line_1, suburb, state, postcode, country, phone) 
               VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, 'Australia', ?)`,
              [orderDbId, firstName, lastName, order.address || '', order.city || '', order.state || '', order.postcode || '', order.phone || '']
            );
          }
        }

        // Record items and deduct stock in MySQL
        if (orderDbId && Array.isArray(order.items) && order.items.length > 0) {
          await db.query('DELETE FROM order_items WHERE order_id = ?', [orderDbId]);
          for (const item of order.items) {
            const qty = parseInt(item.quantity || 1, 10);
            const unitPrice = parseFloat(item.price || item.unitPrice || 0);
            const cleanId = item.id || item.productId;
            const cleanSku = item.sku || null;
            const cleanName = (item.name || item.productName || '').trim();
            const cleanSlug = (item.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '').trim();

            await db.query(
              `INSERT INTO order_items (order_id, product_id, sku, product_name, variant_name, quantity, unit_price, total_amount, product_image_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                orderDbId,
                cleanId || null,
                cleanSku || 'ABL-JEW',
                cleanName || 'Fine Jewellery Selection',
                item.size || item.color || item.variantName || null,
                qty,
                unitPrice,
                unitPrice * qty,
                item.image || item.productImageUrl || null
              ]
            );

            // Deduct stock in DB
            if (cleanId || cleanSku || cleanName || cleanSlug) {
              try {
                await db.query(
                  `UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) 
                   WHERE product_id IN (
                     SELECT id FROM products 
                     WHERE id = ? OR uuid = ? OR sku = ? OR slug = ? OR (name = ? AND name != '') OR (slug = ? AND slug != '')
                   ) OR sku = ? OR (sku = ? AND sku != '')`,
                  [qty, cleanId || null, cleanId || null, cleanSku || null, cleanSlug || null, cleanName || null, cleanSlug || null, cleanSku || null, cleanId || null]
                );
                await db.query(
                  `UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) 
                   WHERE id = ? OR uuid = ? OR sku = ? OR slug = ? OR (name = ? AND name != '') OR (slug = ? AND slug != '')`,
                  [qty, cleanId || null, cleanId || null, cleanSku || null, cleanSlug || null, cleanName || null, cleanSlug || null]
                );
              } catch (stockDbErr) {
                console.warn('DB stock update note:', stockDbErr.message);
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Order sync DB note:', dbErr.message);
      }

      return res.status(200).json({ success: true, message: 'Order saved.', orders: currentOrders });
    }

    res.status(200).json({ success: true, orders: currentOrders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  syncOrders
};
