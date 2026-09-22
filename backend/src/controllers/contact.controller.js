const db = require('../config/database');

const ensureContactTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('⚠️ Contact messages table migration note:', err.message);
  }
};

/**
 * Submit a Contact Message
 */
const submitContactMessage = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { name, email, subject, message } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ success: false, message: 'Email and message are required.' });
    }

    await ensureContactTable();

    const id = `m_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const cleanName = (name || 'Website Visitor').trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = (subject || 'General Inquiry').trim();
    const cleanMessage = message.trim();

    await db.query(
      `INSERT INTO contact_messages (id, name, email, subject, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'unread', NOW())`,
      [id, cleanName, cleanEmail, cleanSubject, cleanMessage]
    );

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully. We will be in touch soon!',
      messageId: id
    });
  } catch (error) {
    console.error('⚠️ Submit contact message error:', error.message);
    next(error);
  }
};

/**
 * Get All Contact Messages (For Admin Panel)
 */
const getAllContactMessages = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    await ensureContactTable();

    const [rows] = await db.query(
      `SELECT id, name, email, subject, message, status, created_at
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    const formatted = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      status: r.status || 'unread',
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
      type: 'contact'
    }));

    return res.status(200).json({
      success: true,
      messages: formatted
    });
  } catch (error) {
    console.error('⚠️ Get contact messages error:', error.message);
    next(error);
  }
};

/**
 * Delete Contact Message
 */
const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Message ID is required.' });
    }

    await ensureContactTable();

    await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('⚠️ Delete contact message error:', error.message);
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllContactMessages,
  deleteContactMessage
};
