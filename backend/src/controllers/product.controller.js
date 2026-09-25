const db = require('../config/database');
const { getStoredProducts, saveStoredProducts } = require('../utils/fileStore');

const PURGED_MOCK_SKUS = [
  'ABL-RG-206', 'ABL-NK-205', 'ABL-RG-204', 'ABL-BR-203', 'ABL-BR-102',
  'ABL-ER-104', 'ABL-NK-201', 'ABL-BR-202', 'ABL-BR-106', 'ABL-BR-105', 'ABL-NK-101',
  'p_na1', 'p_na2', 'p_na4', 'p_na5', 'p_na6', 'p_bs1', 'p_bs2', 'p_bs3', 'p_bs4', 'p_bs5', 'p_bs6'
];

const isPurgedProduct = (p) => {
  if (!p || typeof p !== 'object') return true;
  const sku = String(p.sku || '').trim().toUpperCase();
  const id = String(p.id || '').trim();
  return PURGED_MOCK_SKUS.includes(sku) || PURGED_MOCK_SKUS.includes(id);
};

const fetchAllProductsFromDB = async () => {
  let dbProducts = [];
  try {
    try {
      await db.query('DELETE FROM products WHERE sku IN (?) OR uuid IN (?)', [PURGED_MOCK_SKUS, PURGED_MOCK_SKUS]);
    } catch {}

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);

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
    if (k && !isPurgedProduct(p)) {
      const imageRows = Array.isArray(p.images) ? p.images : [];
      const galleryUrls = imageRows.filter(img => !img.color).map(img => img.secure_url).filter(Boolean);
      const allUrls = imageRows.map(img => img.secure_url).filter(Boolean);
      const colorImages = {};
      imageRows.forEach(img => {
        if (img.color && img.secure_url) {
          if (!colorImages[img.color]) colorImages[img.color] = [];
          colorImages[img.color].push(img.secure_url);
        }
      });
      const uuid = p.uuid ? String(p.uuid) : '';
      const stableId = uuid.startsWith('p_') ? uuid : (p.sku || uuid || String(p.id));
      const directStock = (p.stock_quantity !== undefined && p.stock_quantity !== null) ? Number(p.stock_quantity) : null;
      const totalVariantStock = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.reduce((sum, v) => sum + (v.stock_quantity !== null && v.stock_quantity !== undefined ? Number(v.stock_quantity) : 0), 0)
        : null;

      let finalStock = 0;
      if (directStock !== null && totalVariantStock !== null) {
        finalStock = Math.max(directStock, totalVariantStock);
      } else if (totalVariantStock !== null) {
        finalStock = totalVariantStock;
      } else if (directStock !== null) {
        finalStock = directStock;
      } else {
        finalStock = 10;
      }


        prodMap.set(String(stableId), {
          ...p,
          id: stableId,
          dbId: p.id,
          sku: p.sku || p.variants?.[0]?.sku || '',
          price: p.variants?.[0]?.price !== undefined ? parseFloat(p.variants[0].price) : parseFloat(p.price) || 0,
          salePrice: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : (p.salePrice || 0),
          stockQty: finalStock,
          inStock: finalStock > 0,
        image: galleryUrls[0] || allUrls[0] || p.image || '',
        images: galleryUrls.length > 0 ? galleryUrls : (allUrls.length > 0 ? allUrls : (p.image ? [p.image] : [])),
        colorImages,
        category: p.category_slug || p.category || 'necklaces',
        isFeatured: !!(p.is_featured || p.isFeatured || p.featured),
        featured: !!(p.is_featured || p.isFeatured || p.featured),
        is_featured: !!(p.is_featured || p.isFeatured || p.featured) ? 1 : 0,
        bestSeller: !!(p.is_best_seller || p.bestSeller || p.best_seller || p.isBestSeller),
        is_best_seller: !!(p.is_best_seller || p.bestSeller || p.best_seller || p.isBestSeller) ? 1 : 0,
        newArrival: !!(p.is_new_arrival || p.newArrival || p.new_arrival || p.isNewArrival),
        is_new_arrival: !!(p.is_new_arrival || p.newArrival || p.new_arrival || p.isNewArrival) ? 1 : 0
      });
    }
  });

  // 2. Add / merge file & memory products (ensuring MySQL authoritative stockQty and price are strictly preserved)
  fileProducts.forEach(p => {
    const k = p.id || p.sku || p.slug;
    if (k && !isPurgedProduct(p)) {
      const existingKey = Array.from(prodMap.keys()).find(mapKey => {
        const item = prodMap.get(mapKey);
        return mapKey === String(k) ||
          String(item.id) === String(p.id) ||
          (p.sku && item.sku && String(item.sku).trim().toUpperCase() === String(p.sku).trim().toUpperCase()) ||
          (p.slug && item.slug && String(item.slug).trim().toLowerCase() === String(p.slug).trim().toLowerCase()) ||
          (p.name && item.name && String(item.name).trim().toLowerCase() === String(p.name).trim().toLowerCase());
      });

      if (existingKey) {
        const dbProd = prodMap.get(existingKey);
        prodMap.set(existingKey, {
          ...p,
          ...dbProd,
          stockQty: dbProd.stockQty !== undefined ? dbProd.stockQty : (p.stockQty ?? 10),
          inStock: dbProd.stockQty !== undefined ? (dbProd.stockQty > 0) : (p.inStock ?? true),
          price: dbProd.price !== undefined ? dbProd.price : (parseFloat(p.price) || 0),
          salePrice: dbProd.salePrice !== undefined ? dbProd.salePrice : (parseFloat(p.salePrice) || 0)
        });
      } else {
        prodMap.set(String(k), p);
      }
    }
  });

  return Array.from(prodMap.values()).filter(p => !isPurgedProduct(p));
};

const getProducts = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const { category, search, featured, newArrival } = req.query;
    let result = await fetchAllProductsFromDB();

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
      result = result.filter(p => p.newArrival || p.is_new_arrival || p.isNewArrival);
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

const tableColsCache = {};

async function getTableColumns(table) {
  const allowed = { products: true, product_images: true, product_variants: true };
  if (!allowed[table]) throw new Error(`Unsupported table ${table}`);
  if (tableColsCache[table]) return tableColsCache[table];
  const [cols] = await db.query(`SHOW COLUMNS FROM ${table}`);
  tableColsCache[table] = new Set(cols.map((c) => c.Field));
  return tableColsCache[table];
}

function pickExistingColumns(row, cols) {
  const out = {};
  Object.entries(row).forEach(([key, value]) => {
    if (cols.has(key) && value !== undefined) out[key] = value;
  });
  return out;
}

async function insertFiltered(table, row, cols) {
  const data = pickExistingColumns(row, cols);
  const keys = Object.keys(data);
  if (!keys.length) return null;
  const [res] = await db.query(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    keys.map((k) => data[k])
  );
  return res.insertId;
}

async function updateFiltered(table, row, cols, id) {
  const data = pickExistingColumns(row, cols);
  delete data.id;
  const keys = Object.keys(data);
  if (!keys.length) return;
  await db.query(
    `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`,
    [...keys.map((k) => data[k]), id]
  );
}

function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
}

function collectProductImages(p) {
  const out = [];
  const seen = new Set();
  const add = (url, color = null) => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (!trimmed) return;
    const key = `${color || ''}::${trimmed}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ url: trimmed, color });
  };

  if (Array.isArray(p.images)) p.images.forEach((u) => add(u, null));
  else if (p.image) add(p.image, null);

  const colorImages = p.colorImages;
  if (colorImages && typeof colorImages === 'object') {
    Object.entries(colorImages).forEach(([color, urls]) => {
      (Array.isArray(urls) ? urls : [urls]).forEach((u) => add(u, color));
    });
  }
  return out;
}

async function persistImageForStorage(img) {
  if (img.url.startsWith('data:image')) {
    try {
      const { uploadFromBuffer } = require('../services/cloudinary.service');
      const base64 = img.url.split(',')[1];
      if (base64) {
        const result = await uploadFromBuffer(Buffer.from(base64, 'base64'), 'products');
        return {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          color: img.color
        };
      }
    } catch (err) {
      console.warn('⚠️ Inline image Cloudinary upload failed:', err.message);
    }
  }
  return {
    url: img.url,
    publicId: extractCloudinaryPublicId(img.url),
    width: null,
    height: null,
    format: null,
    color: img.color
  };
}

async function upsertProductToDB(p) {
  const slug = p.slug || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
  const name = p.name || 'Fine Jewellery Piece';
  const sku = p.sku || `SKU-${Date.now()}`;
  const categorySlug = (p.category || p.category_slug || 'necklaces').toLowerCase();
  const price = parseFloat(p.price) || 0;
  const compareAtPrice = parseFloat(p.salePrice) || 0;
  const stockQty = parseInt(p.stockQty, 10);
  const safeStock = Number.isFinite(stockQty) ? stockQty : 10;
  const desc = p.description || p.desc || '';
  const featured = p.featured || p.isFeatured ? 1 : 0;
  const bestSeller = p.bestSeller ? 1 : 0;
  const newArrival = p.newArrival ? 1 : 0;
  const colors = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colorsText || p.colors || '');
  const uuid = String(p.uuid || p.id || `uuid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const isActive = p.status && String(p.status).toLowerCase() === 'inactive' ? 0 : 1;

  const prodCols = await getTableColumns('products');
  const variantCols = await getTableColumns('product_variants');
  const imageCols = await getTableColumns('product_images');

  let categoryId = 1;
  try {
    const [cats] = await db.query('SELECT id FROM categories WHERE slug = ? OR name = ? LIMIT 1', [categorySlug, categorySlug]);
    if (cats.length > 0) {
      categoryId = cats[0].id;
    } else {
      const [newCat] = await db.query('INSERT INTO categories (name, slug, is_active) VALUES (?, ?, TRUE)', [categorySlug, categorySlug]);
      categoryId = newCat.insertId;
    }
  } catch (catErr) {
    console.warn('⚠️ Category resolve note:', catErr.message);
  }

  const findClauses = [];
  const findParams = [];
  if (prodCols.has('slug') && slug) {
    findClauses.push('slug = ?');
    findParams.push(slug);
  }
  if (prodCols.has('sku') && sku) {
    findClauses.push('sku = ?');
    findParams.push(sku);
  }
  if (prodCols.has('uuid') && uuid) {
    findClauses.push('uuid = ?');
    findParams.push(uuid);
  }
  if (/^\d+$/.test(String(p.dbId || p.id || ''))) {
    findClauses.push('id = ?');
    findParams.push(Number(p.dbId || p.id));
  }

  let productId = null;
  if (findClauses.length) {
    const [existing] = await db.query(`SELECT id FROM products WHERE ${findClauses.join(' OR ')} LIMIT 1`, findParams);
    if (existing.length > 0) productId = existing[0].id;
  }

  const productRow = {
    uuid,
    category_id: categoryId,
    name,
    slug,
    sku,
    short_description: p.shortDescription || desc.slice(0, 255) || null,
    description: desc || null,
    material: p.material || null,
    jewellery_type: p.jewelleryType || p.category || null,
    colors,
    price,
    is_featured: featured,
    is_new_arrival: newArrival,
    is_best_seller: bestSeller,
    is_active: isActive
  };

  if (productId) {
    await updateFiltered('products', productRow, prodCols, productId);
  } else {
    productId = await insertFiltered('products', productRow, prodCols);
  }

  if (!productId) {
    throw new Error('Could not insert product into MySQL.');
  }

  const [existingVariants] = await db.query('SELECT id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
  const variantRow = {
    product_id: productId,
    sku,
    variant_name: 'Default',
    price,
    compare_at_price: compareAtPrice > 0 ? compareAtPrice : null,
    stock_quantity: safeStock,
    is_default: 1,
    is_active: 1
  };
  if (existingVariants.length > 0) {
    await updateFiltered('product_variants', variantRow, variantCols, existingVariants[0].id);
  } else {
    await insertFiltered('product_variants', variantRow, variantCols);
  }

  const imagesList = collectProductImages(p);
  if (imagesList.length > 0) {
    await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    for (let i = 0; i < imagesList.length; i++) {
      const stored = await persistImageForStorage(imagesList[i]);
      await insertFiltered('product_images', {
        product_id: productId,
        cloudinary_public_id: stored.publicId || `product_${productId}_${i}`,
        secure_url: stored.url,
        width: stored.width,
        height: stored.height,
        format: stored.format,
        sort_order: i,
        is_primary: i === 0 ? 1 : 0,
        color: stored.color
      }, imageCols);
    }
  }

  return productId;
}

const syncProducts = async (req, res, next) => {
  try {
    const { products, product, deleteId, wipeAll } = req.body;

    if (wipeAll) {
      saveStoredProducts([]);
      try {
        await db.query('DELETE FROM product_images');
        await db.query('DELETE FROM product_variants');
        await db.query('DELETE FROM products');
      } catch (dbErr) {
        console.warn('⚠️ DB wipe note:', dbErr.message);
      }
      return res.status(200).json({ success: true, message: 'All products wiped cleanly from DB and server.', products: [] });
    }

    if (deleteId) {
      let currentList = (getStoredProducts() || []).filter(p => p.id !== deleteId && p.sku !== deleteId && !isPurgedProduct(p));
      saveStoredProducts(currentList);
      try {
        await db.query('DELETE FROM products WHERE id = ? OR uuid = ? OR slug = ? OR sku = ?', [deleteId, deleteId, deleteId, deleteId]);
      } catch (dbErr) {
        console.warn('⚠️ DB product delete note:', dbErr.message);
      }
      const updatedList = await fetchAllProductsFromDB();
      return res.status(200).json({ success: true, message: 'Product deleted from database & server.', products: updatedList });
    }

    if (product) {
      if (isPurgedProduct(product)) {
        return res.status(400).json({ success: false, message: 'This mock product has been permanently removed.' });
      }
      const cleanProd = sanitizeServerProduct(product);

      let dbSynced = true;
      let dbError = null;
      try {
        await upsertProductToDB(cleanProd);
      } catch (err) {
        dbSynced = false;
        dbError = err.message;
        console.warn('⚠️ DB product upsert failed:', err.message);
      }

      let currentList = getStoredProducts() || [];
      const key = cleanProd.id || cleanProd.sku || `p_${Date.now()}`;
      const idx = currentList.findIndex(p => p.id === key || (cleanProd.id && p.id === cleanProd.id) || (cleanProd.sku && p.sku && p.sku.toLowerCase() === cleanProd.sku.toLowerCase()));
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...cleanProd, id: key };
      } else {
        currentList.unshift({ ...cleanProd, id: key });
      }
      saveStoredProducts(currentList);

      const allProds = await fetchAllProductsFromDB();
      return res.status(200).json({
        success: true,
        message: dbSynced ? 'Product saved to MySQL database.' : `Saved locally; MySQL error: ${dbError}`,
        dbSynced,
        dbError,
        products: allProds
      });
    }

    if (Array.isArray(products)) {
      const cleanList = products.filter(p => !isPurgedProduct(p)).map(sanitizeServerProduct);
      saveStoredProducts(cleanList);
      for (const p of cleanList) {
        try {
          await upsertProductToDB(p);
        } catch (err) {}
      }
      const allProds = await fetchAllProductsFromDB();
      return res.status(200).json({ success: true, message: 'Products synchronized successfully to database.', products: allProds });
    }

    const allProds = await fetchAllProductsFromDB();
    res.status(200).json({ success: true, products: allProds });
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

// Dedicated stock deduction endpoint — called immediately after a successful purchase
// Uses name + sku + slug multi-match so ID format mismatches never block deduction
const deductStock = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ success: true, message: 'No items to deduct.' });
    }

    const results = [];
    for (const item of items) {
      const qty = parseInt(item.quantity || 1, 10);
      const name = (item.name || item.productName || '').trim();
      const sku = (item.sku || '').trim();
      const slug = (item.slug || '').trim();

      if (!name && !sku && !slug) {
        results.push({ item, status: 'skipped', reason: 'no identifier' });
        continue;
      }

      try {
        // Find the product numeric ID(s) first using all available identifiers
        let findClauses = [];
        let findParams = [];
        if (sku) { findClauses.push('p.sku = ?'); findParams.push(sku); }
        if (slug) { findClauses.push('p.slug = ?'); findParams.push(slug); }
        if (name) { findClauses.push('p.name = ?'); findParams.push(name); }

        if (findClauses.length === 0) continue;

        const [prodRows] = await db.query(
          `SELECT p.id FROM products p WHERE ${findClauses.join(' OR ')} LIMIT 5`,
          findParams
        );

        if (prodRows.length === 0) {
          results.push({ item, status: 'not_found' });
          continue;
        }

        const prodIds = prodRows.map(r => r.id);

        // Deduct from product_variants ONLY — this is the authoritative stock column.
        // products.stock_quantity is 0 by default (not set during product creation) so we skip it.
        const [varResult] = await db.query(
          `UPDATE product_variants 
           SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - ?) 
           WHERE product_id IN (?) AND is_active = TRUE`,
          [qty, prodIds]
        );

        // Also deduct from file store
        try {
          const { getStoredProducts, saveStoredProducts } = require('../utils/fileStore');
          const fileProds = getStoredProducts() || [];
          let changed = false;
          const updatedFileProds = fileProds.map(fp => {
            const match = (sku && fp.sku && String(fp.sku).trim().toUpperCase() === String(sku).trim().toUpperCase())
              || (slug && fp.slug && String(fp.slug).trim().toLowerCase() === String(slug).trim().toLowerCase())
              || (name && fp.name && String(fp.name).trim().toLowerCase() === String(name).trim().toLowerCase());
            if (match) {
              changed = true;
              const cur = Number(fp.stockQty ?? fp.stock_quantity ?? 0);
              const next = Math.max(0, cur - qty);
              return { ...fp, stockQty: next, stock_quantity: next, inStock: next > 0 };
            }
            return fp;
          });
          if (changed) saveStoredProducts(updatedFileProds);
        } catch (_) {}

        results.push({
          item,
          status: 'deducted',
          varRowsAffected: varResult.affectedRows,
          prodIds
        });
      } catch (itemErr) {
        results.push({ item, status: 'error', reason: itemErr.message });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  syncProducts,
  uploadProductImage,
  deleteProductImage,
  deductStock
};

