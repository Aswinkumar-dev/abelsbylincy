const db = require('../config/database');

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [reviews] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.profile_image_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
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
    const userId = req.user.id;
    const { productId, rating, title, reviewText } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating (1-5) are required.' });
    }

    // Check if user has ordered the product to set is_verified_purchase
    const [purchases] = await db.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'paid'`,
      [userId, productId]
    );

    const isVerifiedPurchase = purchases.length > 0;

    await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, review_text, is_verified_purchase, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [productId, userId, rating, title || null, reviewText || null, isVerifiedPurchase]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will display once approved by the administrator.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview
};
