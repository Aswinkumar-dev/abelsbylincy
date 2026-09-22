const db = require('../config/database');

const ensureNewsletterTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('⚠️ Newsletter table migration note:', err.message);
  }
};

/**
 * Subscribe to Newsletter
 */
const subscribeNewsletter = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { email } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    await ensureNewsletterTable();

    const cleanEmail = email.trim().toLowerCase();
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    await db.query(
      `INSERT INTO newsletter_subscribers (id, email, status, created_at)
       VALUES (?, ?, 'Active', NOW())
       ON DUPLICATE KEY UPDATE status = 'Active'`,
      [id, cleanEmail]
    );

    return res.status(200).json({
      success: true,
      message: 'Thank you for joining the Circle! VIP offers and updates will arrive shortly.',
      subscriber: { id, email: cleanEmail, status: 'Active' }
    });
  } catch (error) {
    console.error('⚠️ Subscribe newsletter error:', error.message);
    next(error);
  }
};

/**
 * Get All Newsletter Subscribers (For Admin Panel)
 */
const getAllSubscribers = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    await ensureNewsletterTable();

    const [rows] = await db.query(
      `SELECT id, email, status, created_at
       FROM newsletter_subscribers
       ORDER BY created_at DESC`
    );

    const formatted = (rows || []).map(r => ({
      id: r.id,
      email: r.email,
      status: r.status || 'Active',
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
    }));

    return res.status(200).json({
      success: true,
      subscribers: formatted
    });
  } catch (error) {
    console.error('⚠️ Get subscribers error:', error.message);
    next(error);
  }
};

/**
 * Delete / Unsubscribe Newsletter Subscriber
 */
const deleteSubscriber = async (req, res, next) => {
  try {
    const { idOrEmail } = req.params;
    if (!idOrEmail) {
      return res.status(400).json({ success: false, message: 'Subscriber ID or email is required.' });
    }

    await ensureNewsletterTable();

    const target = idOrEmail.trim().toLowerCase();
    await db.query(
      'DELETE FROM newsletter_subscribers WHERE id = ? OR LOWER(email) = ?',
      [idOrEmail, target]
    );

    return res.status(200).json({
      success: true,
      message: 'Subscriber removed successfully.'
    });
  } catch (error) {
    console.error('⚠️ Delete subscriber error:', error.message);
    next(error);
  }
};

module.exports = {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber
};
