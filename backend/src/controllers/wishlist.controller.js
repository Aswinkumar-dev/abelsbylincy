const db = require('../config/database');
const { getStoredWishlist, saveStoredWishlist } = require('../utils/fileStore');

const ensureWishlistTables = async () => {
  try {
    // 1. JSON-backed fast user_wishlists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_wishlists (
        user_email VARCHAR(255) PRIMARY KEY,
        user_id INT NULL,
        wishlist_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Relational wishlists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        user_email VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_w_user (user_id),
        INDEX idx_w_email (user_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure user_email column exists on wishlists
    try {
      const [wCols] = await db.query('SHOW COLUMNS FROM wishlists');
      const wColNames = wCols.map(c => c.Field);
      if (!wColNames.includes('user_email')) {
        await db.query('ALTER TABLE wishlists ADD COLUMN user_email VARCHAR(255) NULL AFTER user_id');
      }
      if (wColNames.includes('user_id')) {
        await db.query('ALTER TABLE wishlists MODIFY COLUMN user_id INT NULL');
      }
    } catch (_) {}

    // 3. Relational wishlist_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wishlist_id INT NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wi_wishlist (wishlist_id),
        INDEX idx_wi_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure product_id is VARCHAR(100)
    try {
      const [wiCols] = await db.query('SHOW COLUMNS FROM wishlist_items');
      const wiColNames = wiCols.map(c => c.Field);
      if (wiColNames.includes('product_id')) {
        await db.query('ALTER TABLE wishlist_items MODIFY COLUMN product_id VARCHAR(100) NOT NULL');
      }
    } catch (_) {}
  } catch (err) {
    console.warn('⚠️ Wishlist table migration note:', err.message);
  }
};

/**
 * Get User Wishlist (from MySQL database with fileStore fallback)
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

    // 1. Try MySQL Database
    try {
      await ensureWishlistTables();

      // Check user_wishlists table first
      const [uRows] = await db.query(
        'SELECT wishlist_json FROM user_wishlists WHERE LOWER(TRIM(user_email)) = ?',
        [userEmail]
      );

      if (uRows && uRows.length > 0 && uRows[0].wishlist_json) {
        const items = typeof uRows[0].wishlist_json === 'string' ? JSON.parse(uRows[0].wishlist_json) : uRows[0].wishlist_json;
        if (Array.isArray(items)) {
          return res.status(200).json({ success: true, items, source: 'database_json' });
        }
      }

      // Check relational wishlists & wishlist_items
      const [wRows] = await db.query(
        `SELECT wi.product_id 
         FROM wishlist_items wi
         JOIN wishlists w ON wi.wishlist_id = w.id
         WHERE LOWER(TRIM(w.user_email)) = ?
         ORDER BY wi.created_at DESC`,
        [userEmail]
      );

      if (wRows && wRows.length > 0) {
        const items = wRows.map(r => String(r.product_id));
        return res.status(200).json({ success: true, items, source: 'database_relational' });
      }
    } catch (dbErr) {
      console.warn('⚠️ getWishlist DB note:', dbErr.message);
    }

    // 2. Fallback to fileStore / memory
    if (typeof getStoredWishlist === 'function') {
      const stored = getStoredWishlist(userEmail);
      if (Array.isArray(stored)) {
        return res.status(200).json({ success: true, items: stored, source: 'fileStore' });
      }
    }

    return res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync User Wishlist (Persists to MySQL user_wishlists, wishlists, and wishlist_items)
 */
const syncWishlist = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const userEmail = (req.user?.email || req.body?.email || req.query?.email || '').trim().toLowerCase();
    const items = Array.isArray(req.body?.items) ? req.body.items : (Array.isArray(req.body?.wishlist) ? req.body.wishlist : []);

    if (!userEmail) {
      return res.status(200).json({ success: true, message: 'Wishlist received (guest).' });
    }

    // 1. Save to FileStore & Memory Cache immediately
    if (typeof saveStoredWishlist === 'function') {
      saveStoredWishlist(userEmail, items);
    }

    // 2. Persist to MySQL Database
    try {
      await ensureWishlistTables();
      const wishlistJson = JSON.stringify(items);
      let userId = req.user?.id || null;

      if (!userId) {
        try {
          const [u] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [userEmail]);
          if (u.length > 0) userId = u[0].id;
        } catch (_) {}
      }

      // Save to user_wishlists JSON table
      await db.query(
        `INSERT INTO user_wishlists (user_email, user_id, wishlist_json)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE user_id = COALESCE(?, user_id), wishlist_json = ?, updated_at = CURRENT_TIMESTAMP`,
        [userEmail, userId, wishlistJson, userId, wishlistJson]
      );

      // Save to relational wishlists & wishlist_items tables
      let wishlistId = null;
      const [existingW] = await db.query(
        'SELECT id FROM wishlists WHERE LOWER(TRIM(user_email)) = ? OR (user_id IS NOT NULL AND user_id = ?)',
        [userEmail, userId || -1]
      );

      if (existingW.length > 0) {
        wishlistId = existingW[0].id;
        if (userId) {
          await db.query('UPDATE wishlists SET user_id = ? WHERE id = ?', [userId, wishlistId]);
        }
      } else {
        const [wRes] = await db.query(
          'INSERT INTO wishlists (user_id, user_email) VALUES (?, ?)',
          [userId, userEmail]
        );
        wishlistId = wRes.insertId;
      }

      if (wishlistId) {
        await db.query('DELETE FROM wishlist_items WHERE wishlist_id = ?', [wishlistId]);
        for (const prodId of items) {
          if (!prodId) continue;
          await db.query(
            'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
            [wishlistId, String(prodId)]
          );
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ syncWishlist DB note:', dbErr.message);
    }

    return res.status(200).json({ success: true, message: 'Wishlist synced to database.', items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  syncWishlist
};
