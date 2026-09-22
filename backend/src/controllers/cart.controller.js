const db = require('../config/database');

const ensureCartTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_carts (
        user_email VARCHAR(255) PRIMARY KEY,
        user_id INT NULL,
        cart_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.warn('⚠️ User carts table migration note:', err.message);
  }
};

/**
 * Get User Cart (Fetched from MySQL database)
 */
const getCart = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const userEmail = (req.user?.email || req.query?.email || '').trim().toLowerCase();
    if (!userEmail) {
      return res.status(200).json({ success: true, items: [] });
    }

    await ensureCartTable();

    const [rows] = await db.query(
      'SELECT cart_json FROM user_carts WHERE LOWER(user_email) = ?',
      [userEmail]
    );

    if (rows && rows.length > 0 && rows[0].cart_json) {
      try {
        const items = JSON.parse(rows[0].cart_json);
        if (Array.isArray(items)) {
          return res.status(200).json({ success: true, items });
        }
      } catch (_) {}
    }

    return res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync User Cart (Persisted in MySQL database)
 */
const syncCart = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const userEmail = (req.user?.email || req.body?.email || '').trim().toLowerCase();
    const items = Array.isArray(req.body?.items) ? req.body.items : (Array.isArray(req.body?.cart) ? req.body.cart : []);

    if (!userEmail) {
      return res.status(200).json({ success: true, message: 'Cart received (guest).' });
    }

    await ensureCartTable();

    const cartJson = JSON.stringify(items);
    const userId = req.user?.id || null;

    await db.query(
      `INSERT INTO user_carts (user_email, user_id, cart_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = COALESCE(?, user_id), cart_json = ?, updated_at = CURRENT_TIMESTAMP`,
      [userEmail, userId, cartJson, userId, cartJson]
    );

    return res.status(200).json({ success: true, message: 'Cart synced to database.', items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  syncCart
};
