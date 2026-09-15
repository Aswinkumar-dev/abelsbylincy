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

const sanitizeServerProduct = (p) => {
  if (!p || typeof p !== 'object') return p;
  let img = p.image || '';
  let images = Array.isArray(p.images)
    ? p.images.filter(Boolean)
    : (img ? [img] : []);
  if (!img && images.length > 0) {
    img = images[0];
  }
  return { ...p, image: img, images: images.length > 0 ? images : (img ? [img] : []) };
};

async function upsertProductToDB(p) {
  try {
    const slug = p.slug || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
    const name = p.name || 'Fine Jewellery Piece';
    const sku = p.sku || `SKU-${Date.now()}`;
    const categorySlug = (p.category || p.category_slug || 'necklaces').toLowerCase();
    const price = parseFloat(p.price) || 0;
    const compareAtPrice = parseFloat(p.salePrice) || 0;
    const stockQty = parseInt(p.stockQty, 10) || 10;
    const desc = p.description || p.desc || '';
    const featured = p.featured || p.isFeatured ? 1 : 0;
    const bestSeller = p.bestSeller ? 1 : 0;
    const newArrival = p.newArrival ? 1 : 0;
    const colors = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colorsText || p.colors || '');

    // 1. Get or create category_id
    let categoryId = 1;
    try {
      const [cats] = await db.query('SELECT id FROM categories WHERE slug = ? OR name = ? LIMIT 1', [categorySlug, categorySlug]);
      if (cats.length > 0) {
        categoryId = cats[0].id;
      } else {
        const [newCat] = await db.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, TRUE)', [categorySlug, categorySlug]);
        categoryId = newCat.insertId;
      }
    } catch {}

    // 2. Check if product exists by SKU or slug
    let productId = null;
    try {
      const [existing] = await db.query('SELECT id FROM products WHERE sku = ? OR slug = ? LIMIT 1', [sku, slug]);
      if (existing.length > 0) {
        productId = existing[0].id;
        await db.query(
          `UPDATE products SET name = ?, slug = ?, category_id = ?, price = ?, description = ?, is_featured = ?, is_new_arrival = ?, is_best_seller = ?, is_active = TRUE, colors = ? WHERE id = ?`,
          [name, slug, categoryId, price, desc, featured, newArrival, bestSeller, colors, productId]
        );
      } else {
        const uuid = `uuid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const [insertRes] = await db.query(
          `INSERT INTO products (uuid, category_id, name, slug, sku, description, price, is_featured, is_new_arrival, is_best_seller, is_active, colors)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
          [uuid, categoryId, name, slug, sku, desc, price, featured, newArrival, bestSeller, colors]
        );
        productId = insertRes.insertId;
      }

      // 3. Update or create default variant
      if (productId) {
        const [existingVariants] = await db.query('SELECT id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
        if (existingVariants.length > 0) {
          await db.query(
            `UPDATE product_variants SET sku = ?, price = ?, compare_at_price = ?, stock_quantity = ?, is_active = TRUE WHERE id = ?`,
            [sku, price, compareAtPrice > 0 ? compareAtPrice : null, stockQty, existingVariants[0].id]
          );
        } else {
          await db.query(
            `INSERT INTO product_variants (product_id, sku, price, compare_at_price, stock_quantity, is_active)
             VALUES (?, ?, ?, ?, ?, TRUE)`,
            [productId, sku, price, compareAtPrice > 0 ? compareAtPrice : null, stockQty]
          );
        }

        // 4. Update images
        const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
        if (imagesList.length > 0) {
          await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
          for (let i = 0; i < imagesList.length; i++) {
            const imgUrl = imagesList[i];
            if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim()) {
              await db.query(
                `INSERT INTO product_images (product_id, secure_url, sort_order, is_primary) VALUES (?, ?, ?, ?)`,
                [productId, imgUrl, i, i === 0]
              );
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ DB product upsert note:', dbErr.message);
    }
  } catch (err) {
    console.warn('⚠️ upsertProductToDB error:', err.message);
  }
}

const syncProducts = async (req, res, next) => {
  try {
    const { products, product, deleteId } = req.body;
    let currentList = getStoredProducts() || [];

    if (Array.isArray(products)) {
      const cleanList = products.map(sanitizeServerProduct);
      saveStoredProducts(cleanList);
      for (const p of cleanList) {
        upsertProductToDB(p);
      }
      return res.status(200).json({ success: true, message: 'Products synchronized successfully to database.', products: cleanList });
    }

    if (deleteId) {
      currentList = currentList.filter(p => p.id !== deleteId && p.sku !== deleteId);
      saveStoredProducts(currentList);
      try {
        await db.query('DELETE FROM products WHERE id = ? OR uuid = ? OR slug = ? OR sku = ?', [deleteId, deleteId, deleteId, deleteId]);
      } catch (dbErr) {
        // Fallback for DB offline
      }
      return res.status(200).json({ success: true, message: 'Product deleted from database & server.', products: currentList });
    }

    if (product) {
      const cleanProd = sanitizeServerProduct(product);
      const key = cleanProd.id || cleanProd.sku || `p_${Date.now()}`;
      const idx = currentList.findIndex(p => p.id === key || (cleanProd.id && p.id === cleanProd.id) || (cleanProd.sku && p.sku && p.sku.toLowerCase() === cleanProd.sku.toLowerCase()));
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...cleanProd, id: key };
      } else {
        currentList.unshift({ ...cleanProd, id: key });
      }
      saveStoredProducts(currentList);
      upsertProductToDB(cleanProd);
      return res.status(200).json({ success: true, message: 'Product saved to database.', products: currentList });
    }

    res.status(200).json({ success: true, products: currentList });
  } catch (error) {
    next(error);
  }
};

const uploadProductImage = async (req, res, next) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }
    const { uploadFromBuffer } = require('../services/cloudinary.service');
    const result = await uploadFromBuffer(file.buffer, 'products');
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Cloudinary product upload error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Image upload to CDN failed.'
    });
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const { url, public_id } = req.body;
    let targetPublicId = public_id;

    if (!targetPublicId && url && typeof url === 'string') {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        targetPublicId = match[1];
      }
    }

    if (targetPublicId) {
      const { deleteFile } = require('../services/cloudinary.service');
      try {
        await deleteFile(targetPublicId);
      } catch (cErr) {
        console.warn('Cloudinary destroy error:', cErr.message);
      }

      try {
        await db.query('DELETE FROM product_images WHERE cloudinary_public_id = ? OR secure_url = ?', [targetPublicId, url]);
      } catch (dbErr) {
        // DB offline fallback
      }
    }

    return res.status(200).json({ success: true, message: 'Image deleted from Cloudinary & storage.' });
  } catch (err) {
    console.error('Delete image error:', err);
    return res.status(200).json({ success: false, message: err.message });
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
  syncProducts,
  uploadProductImage,
  deleteProductImage
};

