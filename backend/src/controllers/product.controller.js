const db = require('../config/database');

const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, newArrival } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, category);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = TRUE';
    }

    if (newArrival === 'true') {
      query += ' AND p.is_new_arrival = TRUE';
    }

    if (search) {
      query += ' AND MATCH(p.name, p.short_description, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)';
      params.push(search);
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await db.query(query, params);

    // Fetch images and variants for each product
    for (const product of products) {
      const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
      const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE', [product.id]);
      
      product.images = images;
      product.variants = variants;
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];

    // Fetch images and variants
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
    const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE', [product.id]);

    product.images = images;
    product.variants = variants;

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug
};
