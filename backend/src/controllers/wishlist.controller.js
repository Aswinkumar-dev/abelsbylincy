const db = require('../config/database');

const ensureWishlistTable = async () => {
  try {
    // Standard single table for user wishlists
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_wishlists (
        user_email VARCHAR(255) PRIMARY KEY,
        user_id INT NULL,
        wishlist_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Clean up redundant duplicate tables
    try {
      await db.query('DROP TABLE IF EXISTS wishlist_items');
      await db.query('DROP TABLE IF EXISTS wishlists');
    } catch (_) {}
  } catch (err) {
    console.warn('⚠️ Wishlist table setup note:', err.message);
  }
};

/**
 * Get User Wishlist strictly from MySQL user_wishlists table
 */
const getWishlist = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const userEmail = (req.user?.email || req.query?.email || '').trim().toLowerCase();
    if (!userEmail) {
      return res.status(200).json({ success: true, items: [] });
    }

    await ensureWishlistTable();

    const [rows] = await db.query(
      'SELECT wishlist_json FROM user_wishlists WHERE LOWER(TRIM(user_email)) = ?',
      [userEmail]
    );

    if (rows && rows.length > 0 && rows[0].wishlist_json) {
      const items = typeof rows[0].wishlist_json === 'string' ? JSON.parse(rows[0].wishlist_json) : rows[0].wishlist_json;
      if (Array.isArray(items)) {
        return res.status(200).json({ success: true, items });
      }
    }

    return res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync User Wishlist directly into MySQL user_wishlists table
 */
const syncWishlist = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const userEmail = (req.user?.email || req.body?.email || req.query?.email || '').trim().toLowerCase();
    const items = Array.isArray(req.body?.items) ? req.body.items : (Array.isArray(req.body?.wishlist) ? req.body.wishlist : []);

    if (!userEmail) {
      return res.status(200).json({ success: true, message: 'Wishlist ignored for non-logged-in sessions.', items: [] });
    }

    await ensureWishlistTable();

    let userId = req.user?.id || null;
    if (!userId) {
      try {
        const [u] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [userEmail]);
        if (u.length > 0) userId = u[0].id;
      } catch (_) {}
    }

    const cleanItems = Array.from(new Set(items.map(String).filter(Boolean)));
    const wishlistJson = JSON.stringify(cleanItems);

    await db.query(
      `INSERT INTO user_wishlists (user_email, user_id, wishlist_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = COALESCE(?, user_id), wishlist_json = ?, updated_at = CURRENT_TIMESTAMP`,
      [userEmail, userId, wishlistJson, userId, wishlistJson]
    );

    return res.status(200).json({ success: true, message: 'Wishlist updated in database.', items: cleanItems });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle single product in Wishlist directly in DB
 */
const toggleWishlistItem = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const userEmail = (req.user?.email || req.body?.email || req.query?.email || '').trim().toLowerCase();
    const productId = String(req.body?.productId || req.body?.id || '').trim();

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Please sign in to save items to your wishlist.' });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    await ensureWishlistTable();

    const [rows] = await db.query(
      'SELECT wishlist_json, user_id FROM user_wishlists WHERE LOWER(TRIM(user_email)) = ?',
      [userEmail]
    );

    let items = [];
    let userId = null;
    if (rows && rows.length > 0) {
      userId = rows[0].user_id;
      if (rows[0].wishlist_json) {
        items = typeof rows[0].wishlist_json === 'string' ? JSON.parse(rows[0].wishlist_json) : rows[0].wishlist_json;
      }
    }
    if (!Array.isArray(items)) items = [];

    const index = items.indexOf(productId);
    let added = false;
    if (index > -1) {
      items.splice(index, 1);
      added = false;
    } else {
      items.push(productId);
      added = true;
    }

    const wishlistJson = JSON.stringify(items);

    await db.query(
      `INSERT INTO user_wishlists (user_email, user_id, wishlist_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = COALESCE(?, user_id), wishlist_json = ?, updated_at = CURRENT_TIMESTAMP`,
      [userEmail, userId, wishlistJson, userId, wishlistJson]
    );

    return res.status(200).json({
      success: true,
      added,
      message: added ? 'Added to wishlist' : 'Removed from wishlist',
      items
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  syncWishlist,
  toggleWishlistItem
};
