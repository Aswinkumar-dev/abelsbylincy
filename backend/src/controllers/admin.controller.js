const db = require('../config/database');
const { uploadFromBuffer, deleteFile } = require('../services/cloudinary.service');
const { sendEmail } = require('../services/email.service');
const crypto = require('crypto');

// ── PRODUCTS CRUD ───────────────────────────────────────────

const addProduct = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { categoryId, name, slug, shortDescription, description, material, jewelleryType, careInstructions, isFeatured, isNewArrival, variants } = req.body;

    if (!categoryId || !name || !slug) {
      return res.status(400).json({ success: false, message: 'Category ID, name, and slug are required.' });
    }

    const uuid = crypto.randomUUID();

    // 1. Insert product record
    const [prodResult] = await connection.query(
      `INSERT INTO products (uuid, category_id, name, slug, short_description, description, material, jewellery_type, care_instructions, is_featured, is_new_arrival)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, categoryId, name, slug, shortDescription || null, description || null, material || null, jewelleryType || null, careInstructions || null, isFeatured === 'true', isNewArrival === 'true']
    );
    const productId = prodResult.insertId;

    // 2. Insert variants
    let parsedVariants = [];
    if (variants) {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    }

    for (const v of parsedVariants) {
      await connection.query(
        `INSERT INTO product_variants (product_id, sku, variant_name, price, compare_at_price, cost_price, stock_quantity, low_stock_threshold, weight_grams, attributes, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, v.sku, v.variantName || null, v.price, v.compareAtPrice || null, v.costPrice || null, v.stockQuantity || 0, v.lowStockThreshold || 5, v.weightGrams || null, v.attributes ? JSON.stringify(v.attributes) : null, v.isDefault || false]
      );
    }

    // 3. Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadResult = await uploadFromBuffer(req.files[i].buffer, 'products');

        await connection.query(
          `INSERT INTO product_images (product_id, cloudinary_public_id, secure_url, width, height, format, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [productId, uploadResult.public_id, uploadResult.secure_url, uploadResult.width, uploadResult.height, uploadResult.format, i, i === 0]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Product added successfully.', productId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, shortDescription, description, material, jewelleryType, careInstructions, isFeatured, isNewArrival, isActive } = req.body;

    await db.query(
      `UPDATE products 
       SET category_id = ?, name = ?, slug = ?, short_description = ?, description = ?, material = ?, jewellery_type = ?, care_instructions = ?, is_featured = ?, is_new_arrival = ?, is_active = ?
       WHERE id = ?`,
      [categoryId, name, slug, shortDescription || null, description || null, material || null, jewelleryType || null, careInstructions || null, isFeatured === 'true', isNewArrival === 'true', isActive === 'true', id]
    );

    res.status(200).json({ success: true, message: 'Product base info updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;

    // 1. Fetch images from DB to delete from Cloudinary
    const [images] = await connection.query('SELECT cloudinary_public_id FROM product_images WHERE product_id = ?', [id]);
    for (const img of images) {
      await deleteFile(img.cloudinary_public_id);
    }

    // 2. Delete product (foreign key constraint CASCADE deletes variants and images rows)
    await connection.query('DELETE FROM products WHERE id = ?', [id]);

    await connection.commit();
    res.status(200).json({ success: true, message: 'Product and all associated media deleted successfully.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// ── INVENTORY MANAGEMENT ─────────────────────────────────────

const adjustStockQuantity = async (req, res, next) => {
  try {
    const { variantId, quantity, movementType, note } = req.body; // quantity can be positive or negative

    if (!variantId || quantity === undefined || !movementType) {
      return res.status(400).json({ success: false, message: 'Variant ID, quantity adjustment, and movementType are required.' });
    }

    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Log movement and update variant level
      await connection.query('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, variantId]);
      await connection.query(
        `INSERT INTO inventory_movements (variant_id, movement_type, quantity, note)
         VALUES (?, ?, ?, ?)`,
        [variantId, movementType, quantity, note || null]
      );

      await connection.commit();
      res.status(200).json({ success: true, message: 'Inventory adjusted successfully.' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

// ── ORDERS & FULFILLMENT ─────────────────────────────────────

const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');

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

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    const customerEmail = order.guest_email || await db.query('SELECT email FROM users WHERE id = ?', [order.user_id]).then(([r]) => r[0]?.email);

    // Update fulfillment / shipping status
    let updateQuery = 'UPDATE orders SET status = ?';
    const params = [status];

    if (status === 'shipped') {
      updateQuery += ", fulfillment_status = 'shipped'";
      // Send shipping notification
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Your Order Has Shipped — Abel's By Lincy #${order.order_number}`,
          templateName: 'order-shipped',
          variables: {
            orderNumber: order.order_number,
            customerName: 'Customer',
            carrier: carrier || 'Australia Post',
            trackingNumber: trackingNumber || 'N/A',
            trackingUrl: `https://auspost.com.au/mypost/track/#/details/${trackingNumber || ''}`
          },
          userId: order.user_id
        });
      }
    } else if (status === 'delivered') {
      updateQuery += ", fulfillment_status = 'delivered'";
      // Send delivery notification
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Your Order Has Been Delivered — Abel's By Lincy #${order.order_number}`,
          templateName: 'order-delivered',
          variables: {
            orderNumber: order.order_number,
            customerName: 'Customer'
          },
          userId: order.user_id
        });
      }
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.status(200).json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  adjustStockQuantity,
  getAllOrders,
  updateOrderStatus
};
