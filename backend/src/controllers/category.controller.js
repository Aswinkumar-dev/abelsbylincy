const db = require('../config/database');

const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, slug, description, image_url, sort_order FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    res.status(200).json({ success: true, categories: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories
};
