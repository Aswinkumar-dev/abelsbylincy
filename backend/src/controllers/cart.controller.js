const db = require('../config/database');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch or create user cart
    let [carts] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    let cartId;

    if (carts.length === 0) {
      const [insertResult] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = insertResult.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Fetch items with variant and product details
    const [items] = await db.query(
      `SELECT ci.id, ci.quantity, ci.variant_id, pv.sku, pv.price, pv.compare_at_price, pv.stock_quantity, pv.attributes, p.name as product_name, p.slug as product_slug, pi.secure_url as image_url
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    res.status(200).json({ success: true, cart: { id: cartId, items } });
  } catch (error) {
    next(error);
  }
};

const syncCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Array of { variantId, quantity }

    // Fetch user cart
    let [carts] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    let cartId;

    if (carts.length === 0) {
      const [insertResult] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      cartId = insertResult.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Clear existing cart items
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    // Re-insert synced items
    if (items && items.length > 0) {
      const insertParams = items.map((item) => [cartId, item.variantId, item.quantity]);
      await db.query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ?',
        [insertParams]
      );
    }

    res.status(200).json({ success: true, message: 'Cart synced successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  syncCart
};
