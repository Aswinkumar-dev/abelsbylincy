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
        let unitPrice = parseFloat(item.price || item.salePrice || item.unitPrice || 0);
        const cleanId = String(item.productId || item.id || '').trim();
        const cleanSku = String(item.sku || '').trim().toUpperCase();
        
        // If product_id / variant_id / sku present, fetch authoritative price from DB
        if (cleanId || cleanSku) {
          try {
            const [prods] = await db.query(
              'SELECT price, sale_price FROM products WHERE id = ? OR sku = ? OR uuid = ? LIMIT 1',
              [cleanId || null, cleanSku || null, cleanId || null]
            );
            if (prods.length > 0) {
              const dbP = parseFloat(prods[0].sale_price || prods[0].price || 0);
              if (dbP > 0) unitPrice = dbP;
            }
          } catch {}
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

    // Fetch all stored products from fileStore to support custom products seamlessly
    const { getStoredProducts } = require('../utils/fileStore');
    const storedProducts = getStoredProducts() || [];

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
      const cleanItemId = String(item.id || item.productId || '').replace(/['";<>\\]/g, '').trim();
      const cleanSku = String(item.sku || '').trim().toUpperCase();
      let authoritativePrice = 0;
      let authoritativeName = String(item.name || item.productName || 'Fine Jewellery').replace(/<[^>]*>/g, '').trim();

      // 1. Authoritative DB Lookup via Parameterized Query
      if (cleanItemId || cleanSku) {
        try {
          const [dbProducts] = await db.query(
            'SELECT name, price, sale_price FROM products WHERE id = ? OR sku = ? OR uuid = ? LIMIT 1',
            [cleanItemId || null, cleanSku || null, cleanItemId || null]
          );
          if (dbProducts && dbProducts.length > 0) {
            const p = dbProducts[0];
            const pPrice = parseFloat(p.sale_price || p.price || 0);
            if (pPrice > 0) {
              authoritativePrice = pPrice;
            }
            if (p.name) {
              authoritativeName = p.name;
            }
          }
        } catch {
          // DB connection fallback
        }
      }

      // 2. Authoritative FileStore Product Lookup
      if (!authoritativePrice && storedProducts.length > 0) {
        const stored = storedProducts.find(
          p => String(p.id) === cleanItemId || String(p.sku).toUpperCase() === cleanSku || (p.name && p.name.toLowerCase() === authoritativeName.toLowerCase())
        );
        if (stored) {
          const sPrice = parseFloat(stored.salePrice || stored.price || 0);
          if (sPrice > 0) {
            authoritativePrice = sPrice;
          }
          if (stored.name) {
            authoritativeName = stored.name;
          }
        }
      }

      // 3. Fallback to client item price if valid positive number
      if (!authoritativePrice) {
        const clientPrice = parseFloat(item.price || item.salePrice || item.unitPrice || 0);
        if (clientPrice > 0) {
          authoritativePrice = clientPrice;
        }
      }

      // Stripe strictly requires images in product_data to be valid absolute HTTP/HTTPS URLs
      const validImages = (item.image && typeof item.image === 'string' && /^https?:\/\//i.test(item.image))
        ? [item.image]
        : [];

      const unitCents = Math.max(50, Math.round(authoritativePrice * 100));

      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: authoritativeName,
            ...(validImages.length > 0 ? { images: validImages } : {})
          },
          unit_amount: unitCents,
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

    // Apply coupon discount if provided with strict alphanumeric sanitization
    let discounts = [];
    let discountAmount = parseFloat(req.body.discountAmount) || 0;
    const rawCoupon = req.body.couponCode;
    const sanitizedCouponCode = typeof rawCoupon === 'string' ? rawCoupon.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30) : null;

    // First-order coupon restriction server-side guard
    if (sanitizedCouponCode && /FIRST|WELCOME/i.test(sanitizedCouponCode) && email) {
      const cleanCustomerEmail = String(email).trim().toLowerCase();
      try {
        const [priorOrders] = await db.query(
          'SELECT id FROM orders WHERE LOWER(guest_email) = ? OR user_id = (SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1) LIMIT 1',
          [cleanCustomerEmail, cleanCustomerEmail]
        );
        if (priorOrders && priorOrders.length > 0) {
          discountAmount = 0;
        }
      } catch {}
    }

    const totalCents = lineItems.reduce((s, li) => s + (li.price_data.unit_amount * li.quantity), 0);

    if (discountAmount > 0 && totalCents > 100) {
      const discountCents = Math.min(Math.round(discountAmount * 100), totalCents - 100);
      if (discountCents > 0) {
        try {
          const stripeCoupon = await stripe.coupons.create({
            amount_off: discountCents,
            currency: 'aud',
            duration: 'once',
            name: sanitizedCouponCode ? `Coupon: ${sanitizedCouponCode}` : 'Promotional Discount'
          });
          discounts.push({ coupon: stripeCoupon.id });
        } catch (couponErr) {
          console.warn('Stripe coupon creation note:', couponErr.message);
        }
      }
    }

    const crypto = require('crypto');
    const cartFingerprint = items.map(i => `${i.id || i.name}:${i.quantity || 1}`).join('|');
    const idempotencyKey = `cs_idemp_${crypto.createHash('md5').update(`${email || ''}:${cartFingerprint}:${discountAmount}:${sanitizedCouponCode || ''}:${Date.now()}`).digest('hex')}`;

    const validEmail = (email && typeof email === 'string' && email.includes('@'))
      ? email.trim().toLowerCase()
      : (req.user && req.user.email ? req.user.email.trim().toLowerCase() : undefined);

    let origin = req.headers.origin || req.headers.referer;
    if (origin) {
      try {
        const u = new URL(origin);
        origin = `${u.protocol}//${u.host}`;
      } catch {}
    }
    if (!origin || !origin.startsWith('http')) {
      origin = process.env.FRONTEND_URL || 'https://abelsbylincy.com';
    }
    origin = origin.replace(/\/+$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(discounts.length > 0 ? { discounts } : {}),
      mode: 'payment',
      locale: 'en',
      ...(validEmail ? { customer_email: validEmail } : {}),
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
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to create Stripe checkout session'
    });
  }
};

const { sendOrderConfirmationEmail, sendNewsletterWelcomeEmail, sendOrderDispatchEmail } = require('../services/email.service');

const sendConfirmationEmail = async (req, res, next) => {
  try {
    const { orderData } = req.body;
    if (!orderData) return res.status(400).json({ success: false, message: 'orderData is required' });

    // Directly await email dispatch for reliable delivery in serverless environment
    const result = await sendOrderConfirmationEmail(orderData);
    res.status(200).json({ success: true, message: 'Order confirmation email processed.', result });
  } catch (error) {
    next(error);
  }
};

const sendNewsletterEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const result = await sendNewsletterWelcomeEmail(email);
    res.status(200).json({ success: true, message: 'Newsletter email processed.', result });
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

const recordStripeOrder = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!order) return res.status(400).json({ success: false, message: 'Order data is required.' });

    const orderNumber = String(order.id || order.orderNumber || order.order_number || `ABL-${Date.now()}`).trim();
    const orderUuid = order.uuid || require('crypto').randomUUID();
    const guestEmail = order.email || order.guest_email || 'guest@abelsbylincy.com';
    const totalAmount = parseFloat(order.rawAmount !== undefined ? order.rawAmount : String(order.total || '0').replace(/[^0-9.]/g, '')) || 0;
    const subtotal = parseFloat(order.subtotal || totalAmount) || totalAmount;
    const discountAmount = parseFloat(order.discountAmount || 0) || 0;
    const shippingAmount = parseFloat(order.shippingFee || order.shippingAmount || 0) || 0;
    const statusVal = order.status || 'Confirmed';
    let lastDbError = null;
    try {
      let orderId = null;
      let userId = null;
      if (guestEmail) {
        try {
          const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [guestEmail.trim().toLowerCase()]);
          if (uRows.length > 0) userId = uRows[0].id;
        } catch (_) {}
      }

      // Dynamic column inspection for orders table
      const [oCols] = await db.query('SHOW COLUMNS FROM orders');
      const oColNames = oCols.map(c => c.Field);

      const [existing] = await db.query('SELECT id FROM orders WHERE order_number = ? OR uuid = ?', [orderNumber, orderUuid]);
      if (existing.length > 0) {
        orderId = existing[0].id;
        const updateSets = [];
        const updateVals = [];
        
        if (oColNames.includes('user_id')) { updateSets.push('user_id = COALESCE(?, user_id)'); updateVals.push(userId); }
        if (oColNames.includes('guest_email')) { updateSets.push('guest_email = ?'); updateVals.push(guestEmail); }
        if (oColNames.includes('currency')) { updateSets.push("currency = 'AUD'"); }
        if (oColNames.includes('subtotal')) { updateSets.push('subtotal = ?'); updateVals.push(subtotal); }
        if (oColNames.includes('discount_amount')) { updateSets.push('discount_amount = ?'); updateVals.push(discountAmount); }
        if (oColNames.includes('shipping_amount')) { updateSets.push('shipping_amount = ?'); updateVals.push(shippingAmount); }
        if (oColNames.includes('total_amount')) { updateSets.push('total_amount = ?'); updateVals.push(totalAmount); }
        if (oColNames.includes('status')) { updateSets.push('status = ?'); updateVals.push(statusVal); }
        if (oColNames.includes('payment_status')) { updateSets.push("payment_status = 'paid'"); }
        if (oColNames.includes('tracking_number')) { updateSets.push('tracking_number = COALESCE(?, tracking_number)'); updateVals.push(order.trackingNumber || null); }
        if (oColNames.includes('updated_at')) { updateSets.push('updated_at = NOW()'); }

        updateVals.push(orderId);
        await db.query(`UPDATE orders SET ${updateSets.join(', ')} WHERE id = ?`, updateVals);
      } else {
        const insertCols = [];
        const insertPlaceholders = [];
        const insertVals = [];

        if (oColNames.includes('uuid')) { insertCols.push('uuid'); insertPlaceholders.push('?'); insertVals.push(orderUuid); }
        if (oColNames.includes('order_number')) { insertCols.push('order_number'); insertPlaceholders.push('?'); insertVals.push(orderNumber); }
        if (oColNames.includes('user_id')) { insertCols.push('user_id'); insertPlaceholders.push('?'); insertVals.push(userId); }
        if (oColNames.includes('guest_email')) { insertCols.push('guest_email'); insertPlaceholders.push('?'); insertVals.push(guestEmail); }
        if (oColNames.includes('currency')) { insertCols.push('currency'); insertPlaceholders.push("'AUD'"); }
        if (oColNames.includes('subtotal')) { insertCols.push('subtotal'); insertPlaceholders.push('?'); insertVals.push(subtotal); }
        if (oColNames.includes('discount_amount')) { insertCols.push('discount_amount'); insertPlaceholders.push('?'); insertVals.push(discountAmount); }
        if (oColNames.includes('tax_amount')) { insertCols.push('tax_amount'); insertPlaceholders.push('0'); }
        if (oColNames.includes('shipping_amount')) { insertCols.push('shipping_amount'); insertPlaceholders.push('?'); insertVals.push(shippingAmount); }
        if (oColNames.includes('total_amount')) { insertCols.push('total_amount'); insertPlaceholders.push('?'); insertVals.push(totalAmount); }
        if (oColNames.includes('status')) { insertCols.push('status'); insertPlaceholders.push('?'); insertVals.push(statusVal); }
        if (oColNames.includes('payment_status')) { insertCols.push('payment_status'); insertPlaceholders.push("'paid'"); }
        if (oColNames.includes('fulfillment_status')) { insertCols.push('fulfillment_status'); insertPlaceholders.push("'dispatching'"); }
        if (oColNames.includes('tracking_number')) { insertCols.push('tracking_number'); insertPlaceholders.push('?'); insertVals.push(order.trackingNumber || null); }
        if (oColNames.includes('placed_at')) { insertCols.push('placed_at'); insertPlaceholders.push('NOW()'); }

        const [orderResult] = await db.query(
          `INSERT INTO orders (${insertCols.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`,
          insertVals
        );
        orderId = orderResult.insertId;
      }

      // Record / update shipping address
      if (orderId && (order.address || order.city || order.state)) {
        const [aCols] = await db.query('SHOW COLUMNS FROM order_addresses');
        const aColNames = aCols.map(c => c.Field);

        const custName = String(order.customer || order.name || '').trim();
        const firstName = custName.split(' ')[0] || 'Valued';
        const lastName = custName.split(' ').slice(1).join(' ') || 'Customer';

        const [existingAddr] = await db.query('SELECT id FROM order_addresses WHERE order_id = ? AND address_type = "shipping"', [orderId]);
        if (existingAddr.length > 0) {
          const uSets = [];
          const uVals = [];
          if (aColNames.includes('first_name')) { uSets.push('first_name = ?'); uVals.push(firstName); }
          if (aColNames.includes('last_name')) { uSets.push('last_name = ?'); uVals.push(lastName); }
          if (aColNames.includes('address_line_1')) { uSets.push('address_line_1 = ?'); uVals.push(order.address || ''); }
          if (aColNames.includes('suburb')) { uSets.push('suburb = ?'); uVals.push(order.city || ''); }
          if (aColNames.includes('state')) { uSets.push('state = ?'); uVals.push(order.state || ''); }
          if (aColNames.includes('postcode')) { uSets.push('postcode = ?'); uVals.push(order.postcode || ''); }
          if (aColNames.includes('country')) { uSets.push("country = 'Australia'"); }
          if (aColNames.includes('country_code')) { uSets.push("country_code = 'AU'"); }
          if (aColNames.includes('phone')) { uSets.push('phone = ?'); uVals.push(order.phone || ''); }

          uVals.push(existingAddr[0].id);
          await db.query(`UPDATE order_addresses SET ${uSets.join(', ')} WHERE id = ?`, uVals);
        } else {
          const iCols = ['order_id', 'address_type'];
          const iPlaceholders = ['?', "'shipping'"];
          const iVals = [orderId];

          if (aColNames.includes('first_name')) { iCols.push('first_name'); iPlaceholders.push('?'); iVals.push(firstName); }
          if (aColNames.includes('last_name')) { iCols.push('last_name'); iPlaceholders.push('?'); iVals.push(lastName); }
          if (aColNames.includes('address_line_1')) { iCols.push('address_line_1'); iPlaceholders.push('?'); iVals.push(order.address || ''); }
          if (aColNames.includes('suburb')) { iCols.push('suburb'); iPlaceholders.push('?'); iVals.push(order.city || ''); }
          if (aColNames.includes('state')) { iCols.push('state'); iPlaceholders.push('?'); iVals.push(order.state || ''); }
          if (aColNames.includes('postcode')) { iCols.push('postcode'); iPlaceholders.push('?'); iVals.push(order.postcode || ''); }
          if (aColNames.includes('country')) { iCols.push('country'); iPlaceholders.push("'Australia'"); }
          if (aColNames.includes('country_code')) { iCols.push('country_code'); iPlaceholders.push("'AU'"); }
          if (aColNames.includes('phone')) { iCols.push('phone'); iPlaceholders.push('?'); iVals.push(order.phone || ''); }

          await db.query(`INSERT INTO order_addresses (${iCols.join(', ')}) VALUES (${iPlaceholders.join(', ')})`, iVals);
        }
      }

      // Record items & deduct stock in MySQL
      if (Array.isArray(order.items) && order.items.length > 0) {
        const [itCols] = await db.query('SHOW COLUMNS FROM order_items');
        const itColNames = itCols.map(c => c.Field);

        await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of order.items) {
          const qty = parseInt(item.quantity || 1, 10);
          const unitPrice = parseFloat(item.price || item.unitPrice || 0);
          const cleanId = item.id || item.productId;
          const cleanSku = item.sku || null;
          const cleanName = (item.name || item.productName || '').trim();
          const cleanSlug = (item.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '').trim();

          let realProductId = null;
          const numId = parseInt(String(cleanId).replace(/[^0-9]/g, ''), 10);
          if (!isNaN(numId) && numId > 0) realProductId = numId;
          try {
            const [pRows] = await db.query(
              'SELECT id FROM products WHERE id = ? OR sku = ? OR name = ? LIMIT 1',
              [realProductId || -1, cleanSku || '', cleanName || '']
            );
            if (pRows.length > 0) realProductId = pRows[0].id;
          } catch (_) {}

          const iCols = ['order_id', 'product_name', 'quantity', 'unit_price', 'total_amount'];
          const iPlaceholders = ['?', '?', '?', '?', '?'];
          const iVals = [orderId, cleanName || 'Fine Jewellery Selection', qty, unitPrice, unitPrice * qty];

          if (itColNames.includes('product_id')) { iCols.push('product_id'); iPlaceholders.push('?'); iVals.push(realProductId || null); }
          if (itColNames.includes('sku')) { iCols.push('sku'); iPlaceholders.push('?'); iVals.push(cleanSku || 'ABL-JEW'); }
          if (itColNames.includes('variant_name')) { iCols.push('variant_name'); iPlaceholders.push('?'); iVals.push(item.size || item.color || item.variantName || null); }
          if (itColNames.includes('product_image_url')) { iCols.push('product_image_url'); iPlaceholders.push('?'); iVals.push(item.image || item.productImageUrl || null); }

          await db.query(`INSERT INTO order_items (${iCols.join(', ')}) VALUES (${iPlaceholders.join(', ')})`, iVals);

          // Deduct stock in DB — product_variants is the authoritative stock column
          if (cleanId || cleanSku || cleanName || cleanSlug) {
            try {
              await db.query(
                `UPDATE product_variants SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) 
                 WHERE product_id IN (
                   SELECT id FROM products 
                   WHERE id = ? OR uuid = ? OR sku = ? OR slug = ? OR (name = ? AND name != '') OR (slug = ? AND slug != '')
                 ) OR (sku = ? AND sku != '')`,
                [qty, realProductId || null, cleanId || null, cleanSku || null, cleanSlug || null, cleanName || null, cleanSlug || null, cleanSku || null]
              );
            } catch (stockDbErr) {
              console.warn('DB stock update note:', stockDbErr.message);
            }
          }
        }
      }

      // Record payment
      const [pCols] = await db.query('SHOW COLUMNS FROM payments');
      const pColNames = pCols.map(c => c.Field);

      const paymentIntentId = order.sessionId || order.stripePaymentIntentId || order.paymentIntentId || `pi_stripe_${Date.now()}`;
      const [existingPay] = await db.query('SELECT id FROM payments WHERE order_id = ? OR stripe_payment_intent_id = ?', [orderId, paymentIntentId]);

      if (existingPay.length > 0) {
        const uSets = [];
        const uVals = [];
        if (pColNames.includes('provider')) { uSets.push("provider = 'stripe'"); }
        if (pColNames.includes('amount')) { uSets.push('amount = ?'); uVals.push(totalAmount); }
        if (pColNames.includes('amount_received')) { uSets.push('amount_received = ?'); uVals.push(totalAmount); }
        if (pColNames.includes('currency')) { uSets.push("currency = 'AUD'"); }
        if (pColNames.includes('status')) { uSets.push("status = 'succeeded'"); }
        if (pColNames.includes('stripe_payment_intent_id')) { uSets.push('stripe_payment_intent_id = ?'); uVals.push(paymentIntentId); }
        if (pColNames.includes('paid_at')) { uSets.push('paid_at = NOW()'); }

        uVals.push(existingPay[0].id);
        await db.query(`UPDATE payments SET ${uSets.join(', ')} WHERE id = ?`, uVals);
      } else {
        const iCols = ['order_id', 'amount'];
        const iPlaceholders = ['?', '?'];
        const iVals = [orderId, totalAmount];

        if (pColNames.includes('provider')) { iCols.push('provider'); iPlaceholders.push("'stripe'"); }
        if (pColNames.includes('payment_method_type')) { iCols.push('payment_method_type'); iPlaceholders.push("'card'"); }
        if (pColNames.includes('stripe_payment_intent_id')) { iCols.push('stripe_payment_intent_id'); iPlaceholders.push('?'); iVals.push(paymentIntentId); }
        if (pColNames.includes('amount_received')) { iCols.push('amount_received'); iPlaceholders.push('?'); iVals.push(totalAmount); }
        if (pColNames.includes('currency')) { iCols.push('currency'); iPlaceholders.push("'AUD'"); }
        if (pColNames.includes('status')) { iCols.push('status'); iPlaceholders.push("'succeeded'"); }
        if (pColNames.includes('paid_at')) { iCols.push('paid_at'); iPlaceholders.push('NOW()'); }

        await db.query(`INSERT INTO payments (${iCols.join(', ')}) VALUES (${iPlaceholders.join(', ')})`, iVals);
      }

    } catch (dbErr) {
      lastDbError = dbErr.message;
      console.warn('⚠️ Order DB record note:', dbErr.message);
    }

    // Always persist to server-side fileStore and deduct stock
    try {
      const { getStoredOrders, saveStoredOrders, getStoredProducts, saveStoredProducts } = require('../utils/fileStore');
      
      // Save order
      const currentOrders = getStoredOrders() || [];
      const orderMap = new Map();
      currentOrders.forEach(o => {
        const key = o.id || o.order_number || o.uuid;
        if (key) orderMap.set(String(key), o);
      });
      const orderKey = order.id || order.order_number || `ABL-${Date.now()}`;
      orderMap.set(String(orderKey), { ...(orderMap.get(String(orderKey)) || {}), ...order, id: orderKey });
      saveStoredOrders(Array.from(orderMap.values()));

      // Deduct stock in stored products
      if (Array.isArray(order.items) && order.items.length > 0) {
        const currentProducts = getStoredProducts() || [];
        if (currentProducts.length > 0) {
          const updatedProds = currentProducts.map(prod => {
            const matched = order.items.find(i => 
              String(i.id || i.productId) === String(prod.id) || 
              (i.sku && prod.sku && String(i.sku).trim().toUpperCase() === String(prod.sku).trim().toUpperCase()) ||
              (i.name && prod.name && String(i.name).trim().toLowerCase() === String(prod.name).trim().toLowerCase()) ||
              (i.slug && prod.slug && String(i.slug).trim().toLowerCase() === String(prod.slug).trim().toLowerCase())
            );
            if (matched) {
              const currentStock = Number(prod.stockQty ?? prod.stock_quantity ?? 10);
              const newStock = Math.max(0, currentStock - (Number(matched.quantity) || 1));
              return { ...prod, stockQty: newStock, inStock: newStock > 0 };
            }
            return prod;
          });
          saveStoredProducts(updatedProds);
        }
      }
    } catch (fsErr) {
      console.error('FileStore order & stock update error:', fsErr.message);
    }

    // Dispatch order confirmation email reliably with accurate delivery date
    try {
      const isExpressShipping = /express/i.test(String(order.shippingMethod || '')) || shippingAmount >= 15;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + (isExpressShipping ? 2 : 4));
      const autoEstDelivery = estDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const finalDeliveryEstimate = (order.deliveryEstimate && !order.deliveryEstimate.includes('3-5')) ? order.deliveryEstimate : autoEstDelivery;

      await sendOrderConfirmationEmail({
        orderNumber: orderNumber,
        customerName: order.customer || 'Valued Customer',
        customerEmail: guestEmail,
        customerPhone: order.phone || '',
        streetAddress: order.address || '',
        suburb: order.city || '',
        state: order.state || '',
        postcode: order.postcode || '',
        estimatedDeliveryDate: finalDeliveryEstimate,
        purchasedItems: order.items || [],
        subtotal: subtotal,
        orderTotal: order.total || `$${totalAmount.toFixed(2)} AUD`,
        discountAmount: discountAmount,
        couponCode: order.couponCode || null,
        shippingFee: shippingAmount,
        shippingMethod: order.shippingMethod || (isExpressShipping ? 'Express Shipping (Australia Post)' : 'Standard Shipping (Australia Post)'),
        rawAmount: totalAmount,
        orderDate: order.date || 'Today'
      });
    } catch (emailErr) {
      console.warn('Order confirmation email trigger note:', emailErr.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Stripe order recorded and confirmation processed.',
      dbSaved: !lastDbError,
      dbError: lastDbError
    });
  } catch (error) {
    next(error);
  }
};

const getSessionDetails = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

    res.status(200).json({
      success: true,
      amountTotal,
      currency: session.currency ? session.currency.toUpperCase() : 'AUD',
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email || session.customer_email || null,
      customerName: session.customer_details?.name || null
    });
  } catch (error) {
    console.error('Failed to retrieve Stripe session details:', error.message);
    res.status(200).json({
      success: false,
      message: error.message
    });
  }
};

const { sendOrderRefundEmail } = require('../services/email.service');
const { checkStripeRefundStatus } = require('../services/stripe.service');

const checkStripeRefund = async (req, res, next) => {
  try {
    const { orderId, sessionId, paymentIntentId, email } = req.body;
    const result = await checkStripeRefundStatus({ orderId, sessionId, paymentIntentId, email });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const sendRefundEmail = async (req, res, next) => {
  try {
    const { toEmail, customerName, orderId, refundAmount, isFullRefund, originalTotal, daysTimeline } = req.body;
    if (!toEmail) return res.status(400).json({ success: false, message: 'Customer email is required.' });

    const result = await sendOrderRefundEmail({
      toEmail,
      customerName,
      orderId,
      refundAmount,
      isFullRefund,
      originalTotal,
      daysTimeline: daysTimeline || '5 to 10 business days'
    });

    res.status(200).json({ success: true, message: 'Refund confirmation email dispatched to customer.', result });
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
  sendRefundEmail,
  reconcilePayments,
  recordStripeOrder,
  getSessionDetails,
  checkStripeRefund
};
