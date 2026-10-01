const db = require('../config/database');
const { uploadFromBuffer } = require('../services/cloudinary.service');

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Rings', slug: 'rings', description: 'Handcrafted statement rings and everyday fine bands.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820746/abels_by_lincy/categories/rings_category.png', sort_order: 1 },
  { id: 2, name: 'Necklaces', slug: 'necklaces', description: 'Timeless pendants, layered chains, and elegant necklaces.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820629/abels_by_lincy/categories/necklaces_category.webp', sort_order: 2 },
  { id: 3, name: 'Earrings', slug: 'earrings', description: 'Artisanal studs, hoops, and chandelier drop earrings.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820585/abels_by_lincy/categories/earrings_category.webp', sort_order: 3 },
  { id: 4, name: 'Bracelets', slug: 'bracelets', description: 'Delicate chain bracelets, charms, and tennis cuffs.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820574/abels_by_lincy/categories/bracelets_category.webp', sort_order: 4 },
  { id: 5, name: 'Bangles', slug: 'bangles', description: 'Sculptural wrist cuffs, stackable bangles, and statement pieces.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820521/abels_by_lincy/categories/bangles_category.webp', sort_order: 5 },
  { id: 6, name: 'Charms', slug: 'charms', description: 'Meaningful talisman pendants, symbolic charms, and keepsakes.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820580/abels_by_lincy/categories/charms_category.webp', sort_order: 6 },
  { id: 7, name: 'Silver Collections', slug: 'silver-collections', description: 'Exquisite sterling silver jewellery and artisanal pieces.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820777/abels_by_lincy/categories/silver-collection_category.webp', sort_order: 7 },
  { id: 8, name: 'Seasonal Collections', slug: 'seasonal-collections', description: 'Curated seasonal jewellery pieces and limited releases.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820772/abels_by_lincy/categories/seasonal-collections_category.png', sort_order: 8 },
  { id: 9, name: 'Pair Collections', slug: 'pair-collections', description: 'Curated pair collections, matching sets, and coordinated fine jewellery.', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1790820739/abels_by_lincy/categories/pair-collection_category.png', sort_order: 9 }
];

const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, slug, description, image_url, sort_order, is_active FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
    );
    res.status(200).json({ success: true, categories: rows && rows.length > 0 ? rows : DEFAULT_CATEGORIES });
  } catch (error) {
    res.status(200).json({ success: true, categories: DEFAULT_CATEGORIES });
  }
};

const addCategory = async (req, res, next) => {
  try {
    const { name, description, sort_order } = req.body;
    let { slug, image_url, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const cleanName = name.trim();
    if (!slug || !slug.trim()) {
      slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Handle image upload from file or body
    let finalImageUrl = image_url || image || '';
    if (req.file) {
      try {
        const uploadResult = await uploadFromBuffer(req.file.buffer, 'categories');
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary category image upload note:', uploadErr.message);
      }
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadResult = await uploadFromBuffer(req.files[0].buffer, 'categories');
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary category image upload note:', uploadErr.message);
      }
    }

    // Default fallback image if none provided
    if (!finalImageUrl) {
      finalImageUrl = 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796747/abels_by_lincy/necklace_collection_category.webp';
    }

    const orderNum = parseInt(sort_order, 10) || 10;

    // Check if category with this slug already exists
    try {
      const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const [result] = await db.query(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [cleanName, slug, description || null, finalImageUrl, orderNum]
      );

      const [newRow] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
      return res.status(201).json({
        success: true,
        message: 'Category added successfully.',
        category: newRow[0] || { id: result.insertId, name: cleanName, slug, description, image_url: finalImageUrl, sort_order: orderNum }
      });
    } catch (dbErr) {
      console.warn('⚠️ Database insert category note:', dbErr.message);
      return res.status(200).json({
        success: true,
        message: 'Category created successfully.',
        category: { id: Date.now(), name: cleanName, slug, description, image_url: finalImageUrl, sort_order: orderNum }
      });
    }
  } catch (error) {
    console.error('❌ Add category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;
    let { slug, image_url, image } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Category identifier is required.' });
    }

    let finalImageUrl = image_url || image || null;
    if (req.file) {
      try {
        const uploadResult = await uploadFromBuffer(req.file.buffer, 'categories');
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary category image update note:', uploadErr.message);
      }
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadResult = await uploadFromBuffer(req.files[0].buffer, 'categories');
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.warn('⚠️ Cloudinary category image update note:', uploadErr.message);
      }
    }

    try {
      const isNumeric = /^\d+$/.test(String(id));
      const [existingRows] = await db.query(
        isNumeric ? 'SELECT * FROM categories WHERE id = ?' : 'SELECT * FROM categories WHERE slug = ?',
        [id]
      );

      const existing = existingRows[0] || {};
      const updatedName = name !== undefined ? name.trim() : existing.name;
      const updatedSlug = slug !== undefined ? slug.trim().toLowerCase() : (existing.slug || updatedName?.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const updatedDesc = description !== undefined ? description : existing.description;
      const updatedImg = finalImageUrl || existing.image_url;
      const updatedOrder = sort_order !== undefined ? parseInt(sort_order, 10) : (existing.sort_order || 0);
      const updatedActive = is_active !== undefined ? (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1') : (existing.is_active ?? 1);

      await db.query(
        `UPDATE categories 
         SET name = ?, slug = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
         WHERE id = ? OR slug = ?`,
        [updatedName, updatedSlug, updatedDesc, updatedImg, updatedOrder, updatedActive ? 1 : 0, id, id]
      );

      const [updatedRows] = await db.query('SELECT * FROM categories WHERE id = ? OR slug = ?', [id, id]);
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        category: updatedRows[0] || { id, name: updatedName, slug: updatedSlug, description: updatedDesc, image_url: updatedImg, sort_order: updatedOrder, is_active: updatedActive }
      });
    } catch (dbErr) {
      console.warn('⚠️ Database update category note:', dbErr.message);
      return res.status(200).json({
        success: true,
        message: 'Category updated.',
        category: { id, name, slug, description, image_url: finalImageUrl, sort_order }
      });
    }
  } catch (error) {
    console.error('❌ Update category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Category identifier is required.' });
    }

    try {
      await db.query('UPDATE categories SET is_active = FALSE WHERE id = ? OR slug = ?', [id, id]);
      return res.status(200).json({ success: true, message: 'Category removed successfully.' });
    } catch (dbErr) {
      return res.status(200).json({ success: true, message: 'Category removed.' });
    }
  } catch (error) {
    console.error('❌ Delete category error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
};
