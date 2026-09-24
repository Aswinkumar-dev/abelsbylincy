const db = require('../config/database');

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Rings', slug: 'rings', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png' },
  { id: 2, name: 'Necklaces', slug: 'necklaces', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796747/abels_by_lincy/necklace_collection_category.webp' },
  { id: 3, name: 'Earrings', slug: 'earrings', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796736/abels_by_lincy/Earrings_Category.webp' },
  { id: 4, name: 'Bracelets', slug: 'bracelets', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796726/abels_by_lincy/Bracelet_-_category.webp' },
  { id: 5, name: 'Bangles', slug: 'bangles', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796721/abels_by_lincy/Bangle_Category.webp' },
  { id: 6, name: 'Charms', slug: 'charms', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796734/abels_by_lincy/charm_collection_category.webp' },
  { id: 7, name: 'Silver Collections', slug: 'silver-collections', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp' },
  { id: 8, name: 'Seasonal Collections', slug: 'seasonal-collections', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png' },
  { id: 9, name: 'Pair Collections', slug: 'pair-collections', image_url: 'https://res.cloudinary.com/gylnyxru/image/upload/v1787796758/abels_by_lincy/Sesonal_collections_category.png' }
];

const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, slug, description, image_url, sort_order FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    res.status(200).json({ success: true, categories: rows && rows.length > 0 ? rows : DEFAULT_CATEGORIES });
  } catch (error) {
    res.status(200).json({ success: true, categories: DEFAULT_CATEGORIES });
  }
};

module.exports = {
  getCategories
};
