const db = require('../config/database');
const { getStoredProducts, saveStoredProducts } = require('../utils/fileStore');

const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, newArrival } = req.query;

    let dbProducts = [];
    try {
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

      const [rows] = await db.query(query, params);

      for (const product of rows) {
        const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
        const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE', [product.id]);
        
        product.images = images;
        product.variants = variants;
      }
      dbProducts = rows;
    } catch (e) {
      // DB offline fallback
    }

    const fileProducts = getStoredProducts();
    if (dbProducts.length > 0) {
      return res.status(200).json({ success: true, products: dbProducts });
    }

    if (fileProducts && fileProducts.length > 0) {
      let result = [...fileProducts];
      if (category) {
        result = result.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        result = result.filter(p => p.featured || p.isFeatured);
      }
      if (newArrival === 'true') {
        result = result.filter(p => p.newArrival);
      }
      return res.status(200).json({ success: true, products: result });
    }

    res.status(200).json({ success: true, products: [] });
  } catch (error) {
    next(error);
  }
};

const syncProducts = async (req, res, next) => {
  try {
    const { products, product, deleteId } = req.body;
    let currentList = getStoredProducts() || [];

    if (Array.isArray(products)) {
      saveStoredProducts(products);
      return res.status(200).json({ success: true, message: 'Products synchronized successfully.', products });
    }

    if (deleteId) {
      currentList = currentList.filter(p => p.id !== deleteId && p.sku !== deleteId);
      saveStoredProducts(currentList);
      return res.status(200).json({ success: true, message: 'Product deleted from server.', products: currentList });
    }

    if (product) {
      const key = product.id || product.sku || `p_${Date.now()}`;
      const idx = currentList.findIndex(p => p.id === key || (product.id && p.id === product.id) || (product.sku && p.sku && p.sku.toLowerCase() === product.sku.toLowerCase()));
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...product, id: key };
      } else {
        currentList.unshift({ ...product, id: key });
      }
      saveStoredProducts(currentList);
      return res.status(200).json({ success: true, message: 'Product saved.', products: currentList });
    }

    res.status(200).json({ success: true, products: currentList });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let product = null;
    try {
      const [products] = await db.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         JOIN categories c ON p.category_id = c.id
         WHERE p.slug = ? AND p.is_active = TRUE`,
        [slug]
      );
      if (products.length > 0) {
        product = products[0];
        const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
        const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE', [product.id]);
        product.images = images;
        product.variants = variants;
      }
    } catch (e) {
      // DB offline fallback
    }

    if (!product) {
      const fileProducts = getStoredProducts() || [];
      product = fileProducts.find(p => p.slug === slug || p.id === slug || p.sku === slug);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  syncProducts
};
