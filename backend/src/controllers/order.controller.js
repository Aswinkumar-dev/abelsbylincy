const { createOrderFromCart } = require('../services/order.service');
const { adjustOrderStockOnce } = require('../services/inventory.service');
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

const fetchAllCombinedOrders = async () => {
  let dbOrders = [];
  try {
    try {
      await db.query("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Confirmed'");
      await db.query("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'paid'");
      await db.query("ALTER TABLE orders MODIFY COLUMN fulfillment_status VARCHAR(50) NULL DEFAULT 'unfulfilled'");
    } catch (_) {}

    try {
      const [oCols] = await db.query('SHOW COLUMNS FROM orders');
      const oColNames = oCols.map(c => c.Field);
      if (!oColNames.includes('refund_amount')) {
        await db.query("ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total_amount");
      }
      if (!oColNames.includes('refund_status')) {
        await db.query("ALTER TABLE orders ADD COLUMN refund_status VARCHAR(100) NULL AFTER refund_amount");
      }
      if (!oColNames.includes('refund_reason')) {
        await db.query("ALTER TABLE orders ADD COLUMN refund_reason TEXT NULL AFTER refund_status");
      }
    } catch (_) {}

    try {
      const [rCols] = await db.query('SHOW COLUMNS FROM refunds');
      const rColNames = rCols.map(c => c.Field);
      if (!rColNames.includes('order_id')) {
        await db.query("ALTER TABLE refunds ADD COLUMN order_id INT NULL AFTER id");
      }
      if (!rColNames.includes('currency')) {
        await db.query("ALTER TABLE refunds ADD COLUMN currency VARCHAR(10) DEFAULT 'AUD' AFTER amount");
      }
    } catch (_) {}

    const [rows] = await db.query(
      `SELECT orders.*, users.email AS user_email, users.first_name AS user_fname, users.last_name AS user_lname 
       FROM orders 
       LEFT JOIN users ON orders.user_id = users.id 
       ORDER BY orders.created_at DESC`
    );
    for (const order of rows) {
      try {
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const [addresses] = await db.query('SELECT * FROM order_addresses WHERE order_id = ?', [order.id]);
        const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);
        let refunds = [];
        try {
          const [rRows] = await db.query(
            `SELECT r.* FROM refunds r 
             LEFT JOIN payments p ON r.payment_id = p.id 
             WHERE (p.order_id IS NOT NULL AND p.order_id = ?) 
                OR (r.order_id IS NOT NULL AND r.order_id = ?) 
             ORDER BY r.created_at DESC`,
            [order.id, order.id]
          );
          refunds = rRows;
        } catch (_) {
          try {
            const [rRows] = await db.query('SELECT * FROM refunds WHERE order_id = ? ORDER BY created_at DESC', [order.id]);
            refunds = rRows;
          } catch (_) {}
        }

        const shipAddr = addresses.find(a => a.address_type === 'shipping') || addresses[0] || {};
        const custName = `${shipAddr.first_name || order.user_fname || ''} ${shipAddr.last_name || order.user_lname || ''}`.trim() || 'Valued Customer';
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

        const totalRefundedFromTable = refunds.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const orderRefundAmount = order.refund_amount !== undefined && order.refund_amount !== null ? parseFloat(order.refund_amount) : 0;
        const finalRefundAmount = Math.max(orderRefundAmount, totalRefundedFromTable);

        dbOrders.push({
          id: order.order_number || String(order.id),
          order_number: order.order_number,
          dbId: order.id,
          uuid: order.uuid,
          customer: custName,
          email: order.guest_email || order.user_email || '',
          phone: shipAddr.phone || '',
          address: shipAddr.address_line_1 || '',
          city: shipAddr.suburb || '',
          state: shipAddr.state || '',
          postcode: shipAddr.postcode || '',
          product: primaryProdName,
          items: formattedItems,
          date: dateStr,
          status: order.status || 'Confirmed',
          payment_status: order.payment_status || (finalRefundAmount >= parseFloat(order.total_amount || 0) && parseFloat(order.total_amount || 0) > 0 ? 'refunded' : (finalRefundAmount > 0 ? 'partially_refunded' : 'paid')),
          fulfillment_status: order.fulfillment_status || 'unfulfilled',
          total: `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
          rawAmount: parseFloat(order.total_amount || 0),
          subtotal: parseFloat(order.subtotal || 0),
          discountAmount: parseFloat(order.discount_amount || 0),
          shippingFee: parseFloat(order.shipping_amount || 0),
          trackingNumber: order.tracking_number || null,
          refundAmount: finalRefundAmount,
          refundStatus: order.refund_status || (finalRefundAmount >= parseFloat(order.total_amount || 0) && parseFloat(order.total_amount || 0) > 0 ? 'Full Refund Processed' : (finalRefundAmount > 0 ? 'Partial Refund Processed' : null)),
          refundReason: order.refund_reason || (refunds.length > 0 ? refunds[0].reason : null),
          refunds: refunds.map(r => ({
            id: r.id,
            stripeRefundId: r.stripe_refund_id,
            amount: parseFloat(r.amount) || 0,
            status: r.status,
            reason: r.reason,
            createdAt: r.created_at
          })),
          sessionId: payments?.[0]?.stripe_payment_intent_id || null,
          paymentMethod: payments?.[0]?.payment_method_type || 'Stripe Encrypted Payment'
        });
      } catch {}
    }
  } catch (e) {
    // DB offline fallback
  }

  const fileOrders = getStoredOrders() || [];
  
  // Merge unique orders by order number / ID / uuid
  const mergedList = [];
  const isSameOrder = (a, b) => {
    if (!a || !b) return false;
    const aId = a.id ? String(a.id).trim() : '';
    const bId = b.id ? String(b.id).trim() : '';
    const aNum = a.order_number ? String(a.order_number).trim() : '';
    const bNum = b.order_number ? String(b.order_number).trim() : '';
    const aUuid = a.uuid ? String(a.uuid).trim() : '';
    const bUuid = b.uuid ? String(b.uuid).trim() : '';
    const aDbId = (a.dbId !== undefined && a.dbId !== null) ? String(a.dbId).trim() : '';
    const bDbId = (b.dbId !== undefined && b.dbId !== null) ? String(b.dbId).trim() : '';

    if (aId && bId && aId === bId) return true;
    if (aNum && bNum && aNum === bNum) return true;
    if (aId && bNum && aId === bNum) return true;
    if (aNum && bId && aNum === bId) return true;
    if (aUuid && bUuid && aUuid === bUuid) return true;
    if (aDbId && bDbId && aDbId === bDbId) return true;
    return false;
  };

  // Base: file orders as fallback
  fileOrders.forEach(fileO => {
    const idx = mergedList.findIndex(m => isSameOrder(m, fileO));
    if (idx === -1) {
      mergedList.push({ ...fileO });
    } else {
      mergedList[idx] = { ...mergedList[idx], ...fileO };
    }
  });

  // Authoritative MySQL DB orders overwrite
  dbOrders.forEach(dbO => {
    const idx = mergedList.findIndex(m => isSameOrder(m, dbO));
    if (idx === -1) {
      mergedList.push({ ...dbO });
    } else {
      mergedList[idx] = { ...mergedList[idx], ...dbO };
    }
  });

  return mergedList;
};

const getAllOrders = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const orders = await fetchAllCombinedOrders();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

const syncOrders = async (req, res, next) => {
  try {
    const { order, orders, deleteId } = req.body;
    let currentOrders = getStoredOrders() || [];

    const isMatch = (o, targetKey, targetOrder = null) => {
      if (!o) return false;
      const k = targetKey ? String(targetKey).trim() : '';
      const oId = o.id ? String(o.id).trim() : '';
      const oNum = o.order_number ? String(o.order_number).trim() : '';
      const oUuid = o.uuid ? String(o.uuid).trim() : '';
      const oDbId = (o.dbId !== undefined && o.dbId !== null) ? String(o.dbId).trim() : '';

      if (k) {
        if (oId === k || oNum === k || oUuid === k || oDbId === k) return true;
      }
      if (targetOrder) {
        const tUuid = targetOrder.uuid ? String(targetOrder.uuid).trim() : '';
        const tNum = targetOrder.order_number ? String(targetOrder.order_number).trim() : '';
        const tDbId = (targetOrder.dbId !== undefined && targetOrder.dbId !== null) ? String(targetOrder.dbId).trim() : '';
        if (tUuid && oUuid && tUuid === oUuid) return true;
        if (tNum && oNum && tNum === oNum) return true;
        if (tDbId && oDbId && tDbId === oDbId) return true;
      }
      return false;
    };

    if (Array.isArray(orders)) {
      saveStoredOrders(orders);
      const allOrders = await fetchAllCombinedOrders();
      return res.status(200).json({ success: true, message: 'Orders synchronized successfully.', orders: allOrders });
    }

    if (deleteId) {
      currentOrders = currentOrders.filter(o => !isMatch(o, deleteId));
      saveStoredOrders(currentOrders);
      try {
        await db.query('DELETE FROM orders WHERE order_number = ? OR uuid = ? OR id = ?', [deleteId, deleteId, (!isNaN(deleteId) && Number(deleteId) > 0) ? Number(deleteId) : -1]);
      } catch (_) {}
      const allOrders = await fetchAllCombinedOrders();
      return res.status(200).json({ success: true, message: 'Order deleted.', orders: allOrders });
    }

    if (order) {
      const primaryKey = String(order.id || order.order_number || order.uuid || `ABL-${Date.now()}`).trim();
      const idx = currentOrders.findIndex(o => isMatch(o, primaryKey, order));
      if (idx !== -1) {
        currentOrders[idx] = { 
          ...currentOrders[idx], 
          ...order, 
          id: currentOrders[idx].id || primaryKey, 
          order_number: currentOrders[idx].order_number || order.order_number || primaryKey 
        };
      } else {
        currentOrders.unshift({ ...order, id: primaryKey, order_number: order.order_number || primaryKey });
      }
      saveStoredOrders(currentOrders);

      // Persist full order, addresses, items into MySQL
      try {
        // Ensure status column in orders table is VARCHAR(50) so it supports any lifecycle status
        try {
          await db.query("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Confirmed'");
        } catch (_) {}

        const [oCols] = await db.query('SHOW COLUMNS FROM orders');
        const oColNames = oCols.map(c => c.Field);

        const orderUuid = order.uuid || require('crypto').randomUUID();
        const guestEmail = order.email || order.guest_email || 'customer@abelsbylincy.com';
        const totalAmount = parseFloat(order.rawAmount !== undefined ? order.rawAmount : String(order.total || '0').replace(/[^0-9.]/g, '')) || 0;
        const subtotal = parseFloat(order.subtotal || totalAmount) || totalAmount;
        const discountAmount = parseFloat(order.discountAmount || 0) || 0;
        const shippingAmount = parseFloat(order.shippingFee || order.shippingAmount || 0) || 0;
        const statusVal = order.status || 'Confirmed';

        let orderDbId = order.dbId || null;
        let isNewOrder = false;

        if (!orderDbId) {
          const [existing] = await db.query(
            'SELECT id FROM orders WHERE order_number = ? OR uuid = ? OR id = ?', 
            [primaryKey, orderUuid, (!isNaN(primaryKey) && Number(primaryKey) > 0) ? Number(primaryKey) : -1]
          );
          if (existing.length > 0) {
            orderDbId = existing[0].id;
          }
        }

        let userId = null;
        if (guestEmail) {
          try {
            const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [guestEmail.trim().toLowerCase()]);
            if (uRows.length > 0) userId = uRows[0].id;
          } catch (_) {}
        }

        const refundAmt = order.refundAmount !== undefined && order.refundAmount !== null ? parseFloat(order.refundAmount) : 0;
        const refundStatusVal = order.refundStatus || (refundAmt >= totalAmount && totalAmount > 0 ? 'Full Refund Processed' : (refundAmt > 0 ? 'Partial Refund Processed' : null));
        const refundReasonVal = order.refundReason || order.cancelReason || (refundAmt > 0 ? 'Customer Refund' : null);
        const paymentStatusVal = order.payment_status || (refundAmt >= totalAmount && totalAmount > 0 ? 'refunded' : (refundAmt > 0 ? 'partially_refunded' : (statusVal === 'Cancelled' ? 'cancelled' : 'paid')));

        if (orderDbId) {
          const updateSets = [];
          const updateVals = [];

          if (oColNames.includes('status')) { updateSets.push('status = ?'); updateVals.push(statusVal); }
          if (oColNames.includes('tracking_number') && order.trackingNumber !== undefined) { updateSets.push('tracking_number = ?'); updateVals.push(order.trackingNumber || null); }
          if (oColNames.includes('user_id') && userId !== null) { updateSets.push('user_id = COALESCE(?, user_id)'); updateVals.push(userId); }
          if (oColNames.includes('guest_email') && guestEmail) { updateSets.push('guest_email = ?'); updateVals.push(guestEmail); }
          if (oColNames.includes('currency')) { updateSets.push("currency = 'AUD'"); }
          if (oColNames.includes('subtotal') && (order.subtotal !== undefined || order.rawAmount !== undefined || order.total !== undefined)) { updateSets.push('subtotal = ?'); updateVals.push(subtotal); }
          if (oColNames.includes('discount_amount') && order.discountAmount !== undefined) { updateSets.push('discount_amount = ?'); updateVals.push(discountAmount); }
          if (oColNames.includes('shipping_amount') && (order.shippingFee !== undefined || order.shippingAmount !== undefined)) { updateSets.push('shipping_amount = ?'); updateVals.push(shippingAmount); }
          if (oColNames.includes('total_amount') && (order.rawAmount !== undefined || order.total !== undefined)) { updateSets.push('total_amount = ?'); updateVals.push(totalAmount); }
          if (oColNames.includes('payment_status')) { updateSets.push('payment_status = ?'); updateVals.push(paymentStatusVal); }
          if (oColNames.includes('refund_amount') && order.refundAmount !== undefined) { updateSets.push('refund_amount = ?'); updateVals.push(refundAmt); }
          if (oColNames.includes('refund_status') && refundStatusVal !== null) { updateSets.push('refund_status = ?'); updateVals.push(refundStatusVal); }
          if (oColNames.includes('refund_reason') && refundReasonVal !== null) { updateSets.push('refund_reason = ?'); updateVals.push(refundReasonVal); }
          if (oColNames.includes('updated_at')) { updateSets.push('updated_at = NOW()'); }

          if (updateSets.length > 0) {
            updateVals.push(orderDbId);
            await db.query(`UPDATE orders SET ${updateSets.join(', ')} WHERE id = ?`, updateVals);
          }
        } else {
          isNewOrder = true;
          const insertCols = [];
          const insertPlaceholders = [];
          const insertVals = [];

          if (oColNames.includes('uuid')) { insertCols.push('uuid'); insertPlaceholders.push('?'); insertVals.push(orderUuid); }
          if (oColNames.includes('order_number')) { insertCols.push('order_number'); insertPlaceholders.push('?'); insertVals.push(primaryKey); }
          if (oColNames.includes('user_id')) { insertCols.push('user_id'); insertPlaceholders.push('?'); insertVals.push(userId); }
          if (oColNames.includes('guest_email')) { insertCols.push('guest_email'); insertPlaceholders.push('?'); insertVals.push(guestEmail); }
          if (oColNames.includes('currency')) { insertCols.push('currency'); insertPlaceholders.push("'AUD'"); }
          if (oColNames.includes('subtotal')) { insertCols.push('subtotal'); insertPlaceholders.push('?'); insertVals.push(subtotal); }
          if (oColNames.includes('discount_amount')) { insertCols.push('discount_amount'); insertPlaceholders.push('?'); insertVals.push(discountAmount); }
          if (oColNames.includes('tax_amount')) { insertCols.push('tax_amount'); insertPlaceholders.push('0'); }
          if (oColNames.includes('shipping_amount')) { insertCols.push('shipping_amount'); insertPlaceholders.push('?'); insertVals.push(shippingAmount); }
          if (oColNames.includes('total_amount')) { insertCols.push('total_amount'); insertPlaceholders.push('?'); insertVals.push(totalAmount); }
          if (oColNames.includes('status')) { insertCols.push('status'); insertPlaceholders.push('?'); insertVals.push(statusVal); }
          if (oColNames.includes('payment_status')) { insertCols.push('payment_status'); insertPlaceholders.push('?'); insertVals.push(paymentStatusVal); }
          if (oColNames.includes('fulfillment_status')) { insertCols.push('fulfillment_status'); insertPlaceholders.push("'dispatching'"); }
          if (oColNames.includes('tracking_number')) { insertCols.push('tracking_number'); insertPlaceholders.push('?'); insertVals.push(order.trackingNumber || null); }
          if (oColNames.includes('refund_amount')) { insertCols.push('refund_amount'); insertPlaceholders.push('?'); insertVals.push(refundAmt); }
          if (oColNames.includes('refund_status')) { insertCols.push('refund_status'); insertPlaceholders.push('?'); insertVals.push(refundStatusVal); }
          if (oColNames.includes('refund_reason')) { insertCols.push('refund_reason'); insertPlaceholders.push('?'); insertVals.push(refundReasonVal); }
          if (oColNames.includes('placed_at')) { insertCols.push('placed_at'); insertPlaceholders.push('NOW()'); }

          const [orderResult] = await db.query(
            `INSERT INTO orders (${insertCols.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`,
            insertVals
          );
          orderDbId = orderResult.insertId;
        }

        // Ensure refund record is inserted into refunds table if refund amount is specified
        if (orderDbId && refundAmt > 0) {
          try {
            const [pRows] = await db.query('SELECT id, stripe_payment_intent_id FROM payments WHERE order_id = ? LIMIT 1', [orderDbId]);
            const paymentId = pRows.length > 0 ? pRows[0].id : null;
            const stripeRefundId = order.stripeRefundId || (pRows.length > 0 ? pRows[0].stripe_payment_intent_id : null);

            const [existingRefunds] = await db.query('SELECT id FROM refunds WHERE order_id = ? AND amount = ? LIMIT 1', [orderDbId, refundAmt]);
            if (existingRefunds.length === 0) {
              await db.query(
                `INSERT INTO refunds (order_id, payment_id, stripe_refund_id, amount, status, reason)
                 VALUES (?, ?, ?, ?, 'succeeded', ?)`,
                [orderDbId, paymentId, stripeRefundId, refundAmt, refundReasonVal || 'customer_requested']
              );
            }
          } catch (rErr) {
            console.warn('⚠️ Refunds table insert note:', rErr.message);
          }
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
                 first_name = ?, last_name = ?, address_line_1 = ?, suburb = ?, state = ?, postcode = ?, country = 'Australia', country_code = 'AU', phone = ?
               WHERE id = ?`,
              [firstName, lastName, order.address || '', order.city || '', order.state || '', order.postcode || '', order.phone || '', existingAddr[0].id]
            );
          } else {
            await db.query(
              `INSERT INTO order_addresses (order_id, address_type, first_name, last_name, address_line_1, suburb, state, postcode, country, country_code, phone) 
               VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, 'Australia', 'AU', ?)`,
              [orderDbId, firstName, lastName, order.address || '', order.city || '', order.state || '', order.postcode || '', order.phone || '']
            );
          }
        }

        // Record items and deduct stock in MySQL ONLY on initial order creation
        if (isNewOrder && orderDbId && Array.isArray(order.items) && order.items.length > 0) {
          await db.query('DELETE FROM order_items WHERE order_id = ?', [orderDbId]);
          for (const item of order.items) {
            const qty = parseInt(item.quantity || 1, 10);
            const unitPrice = parseFloat(item.price || item.unitPrice || 0);
            const cleanId = item.id || item.productId;
            const cleanSku = item.sku || null;
            const cleanName = (item.name || item.productName || '').trim();

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
          }

          // Deduct stock idempotently in DB
          try {
            await adjustOrderStockOnce(db, orderDbId, primaryKey, order.items);
          } catch (stockDbErr) {
            console.warn('DB stock update note:', stockDbErr.message);
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Order sync DB note:', dbErr.message);
      }

      const allOrders = await fetchAllCombinedOrders();
      return res.status(200).json({ success: true, message: 'Order saved.', orders: allOrders });
    }

    const allOrders = await fetchAllCombinedOrders();
    res.status(200).json({ success: true, orders: allOrders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, orderNumber, status, trackingNumber } = req.body;
    const targetKey = orderId || orderNumber || req.params.orderId;
    if (!targetKey || !status) {
      return res.status(400).json({ success: false, message: 'Order identifier and status are required.' });
    }

    try {
      await db.query("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Confirmed'");
    } catch (_) {}

    const [oCols] = await db.query('SHOW COLUMNS FROM orders');
    const oColNames = oCols.map(c => c.Field);

    const updateSets = ['status = ?'];
    const updateVals = [status];

    if (oColNames.includes('tracking_number') && trackingNumber !== undefined) {
      updateSets.push('tracking_number = ?');
      updateVals.push(trackingNumber || null);
    }
    if (oColNames.includes('updated_at')) {
      updateSets.push('updated_at = NOW()');
    }

    const numKey = (!isNaN(targetKey) && Number(targetKey) > 0) ? Number(targetKey) : -1;
    updateVals.push(targetKey, targetKey, numKey);

    await db.query(
      `UPDATE orders SET ${updateSets.join(', ')} WHERE order_number = ? OR uuid = ? OR id = ?`,
      updateVals
    );

    // Also update file store
    try {
      const fileOrders = getStoredOrders() || [];
      const updatedFileOrders = fileOrders.map(o => {
        if (o.id === targetKey || o.order_number === targetKey || o.uuid === targetKey || String(o.dbId) === String(targetKey)) {
          return { ...o, status, ...(trackingNumber !== undefined ? { trackingNumber } : {}) };
        }
        return o;
      });
      saveStoredOrders(updatedFileOrders);
    } catch (_) {}

    const allOrders = await fetchAllCombinedOrders();
    res.status(200).json({ success: true, message: `Order status updated to ${status}`, orders: allOrders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  syncOrders,
  updateOrderStatus
};
