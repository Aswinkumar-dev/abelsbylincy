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

    const fileProducts = getStoredProducts() || [];
    const prodMap = new Map();

    // 1. Add MySQL products (if active DB)
    dbProducts.forEach(p => {
      const k = p.id || p.sku || p.slug;
      if (k) {
        prodMap.set(String(k), {
          ...p,
          price: p.variants?.[0]?.price || p.price,
          salePrice: p.variants?.[0]?.compare_at_price ? p.variants?.[0]?.price : 0,
          stockQty: p.variants?.[0]?.stock_quantity ?? p.stock_quantity ?? 10,
          inStock: (p.variants?.[0]?.stock_quantity ?? p.stock_quantity ?? 10) > 0,
          image: p.images?.[0]?.secure_url || p.image || '',
          images: p.images?.map(img => img.secure_url) || (p.image ? [p.image] : []),
          category: p.category_slug || p.category || 'necklaces'
        });
      }
    });

    // 2. Add / merge file & memory products (includes newly created Bangles, Charms, etc.)
    fileProducts.forEach(p => {
      const k = p.id || p.sku || p.slug;
      if (k) {
        if (prodMap.has(String(k))) {
          prodMap.set(String(k), { ...prodMap.get(String(k)), ...p });
        } else {
          prodMap.set(String(k), p);
        }
      }
    });

    let result = Array.from(prodMap.values());

    if (category) {
      result = result.filter(p => {
        const pCat = (p.category || p.category_slug || '').toLowerCase();
        const target = category.toLowerCase();
        return pCat === target || (target === 'bangles' && pCat.includes('bangle')) || (target === 'charms' && pCat.includes('charm'));
      });
    }
    if (featured === 'true') {
      result = result.filter(p => p.featured || p.isFeatured || p.is_featured);
    }
    if (newArrival === 'true') {
      result = result.filter(p => p.newArrival || p.is_new_arrival);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => (p.name && p.name.toLowerCase().includes(s)) || (p.sku && p.sku.toLowerCase().includes(s)));
    }

    res.status(200).json({ success: true, products: result });
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
      try {
        await db.query('DELETE FROM products WHERE id = ? OR uuid = ? OR slug = ?', [deleteId, deleteId, deleteId]);
      } catch (dbErr) {
        // Fallback for DB offline
      }
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
