const db = require('../config/database');

const getAllReviews = async (req, res, next) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.email as user_email, u.profile_image_url
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [reviews] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.email as user_email, u.profile_image_url
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    let userId = req.user?.id;
    const { productId, rating, title, reviewText, authorName, userEmail } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating (1-5) are required.' });
    }

    const cleanEmail = (req.user?.email || userEmail || '').trim().toLowerCase();

    // Look up userId by email if not present
    if (!userId && cleanEmail) {
      try {
        const [uRows] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        if (uRows.length > 0) {
          userId = uRows[0].id;
        }
      } catch (err) {
        console.warn('⚠️ User lookup note:', err.message);
      }
    }

    // 1. Strict Lifetime Review Check: maximum 5 reviews per user for a product
    let reviewCount = 0;
    if (userId) {
      const [existingReviews] = await db.query(
        'SELECT COUNT(*) as review_count FROM reviews WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      reviewCount = (existingReviews && existingReviews[0]?.review_count) || 0;
    }

    if (reviewCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'oops! You have reached the limit of 5 reviews for this product'
      });
    }

    // Check if user has ordered the product to set is_verified_purchase
    let isVerifiedPurchase = false;
    if (userId) {
      try {
        const [purchases] = await db.query(
          `SELECT oi.id 
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'paid'`,
          [userId, productId]
        );
        isVerifiedPurchase = purchases.length > 0;
      } catch (purchaseErr) {
        console.warn('⚠️ Purchase check note:', purchaseErr.message);
      }
    }

    const [result] = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, review_text, is_verified_purchase, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'approved')`,
      [productId, userId || null, rating, title || `${rating} Star Rating`, reviewText || null, isVerifiedPurchase]
    );

    res.status(201).json({
      success: true,
      reviewId: result.insertId,
      message: 'Review submitted successfully! Thank you.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getProductReviews,
  createReview
};
