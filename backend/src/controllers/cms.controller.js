const db = require('../config/database');
const { getStoredCms, saveStoredCms } = require('../utils/fileStore');

/**
 * Get CMS Content (Announcement bar, Hero slides, Featured collections, etc.)
 */
const getCms = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    // 1. Try fetching from MySQL site_settings table
    try {
      const [rows] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = 'cms_data'");
      if (rows && rows.length > 0 && rows[0].setting_value) {
        const parsed = JSON.parse(rows[0].setting_value);
        if (parsed && typeof parsed === 'object') {
          return res.status(200).json({
            success: true,
            cms: parsed,
            source: 'database'
          });
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ CMS DB read note:', dbErr.message);
    }

    // 2. Fallback to fileStore / memory
    const fileCms = getStoredCms();
    if (fileCms && typeof fileCms === 'object' && Object.keys(fileCms).length > 0) {
      return res.status(200).json({
        success: true,
        cms: fileCms,
        source: 'fileStore'
      });
    }

    // 3. Fallback default
    return res.status(200).json({
      success: true,
      cms: null,
      message: 'No custom CMS data configured yet'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update / Save CMS Content (Merges announcement banner, hero slides, promo, etc.)
 */
const updateCms = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const { cms } = req.body;

    if (!cms || typeof cms !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid CMS payload. Expected an object.'
      });
    }

    // 1. Fetch existing CMS data to merge cleanly
    let existingCms = {};
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [rows] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = 'cms_data'");
      if (rows && rows.length > 0 && rows[0].setting_value) {
        existingCms = JSON.parse(rows[0].setting_value) || {};
      }
    } catch (dbErr) {
      console.warn('⚠️ CMS DB existing read note:', dbErr.message);
    }

    const mergedCms = { ...existingCms, ...cms };
    if (Array.isArray(cms.heroSlides)) {
      mergedCms.heroSlides = cms.heroSlides;
    }

    const cmsJson = JSON.stringify(mergedCms);

    // 2. Insert/Update in MySQL
    try {
      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value) 
         VALUES ('cms_data', ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [cmsJson, cmsJson]
      );
    } catch (dbErr) {
      console.warn('⚠️ CMS DB write note:', dbErr.message);
    }

    // 3. Save to fileStore / memory
    saveStoredCms(mergedCms);

    return res.status(200).json({
      success: true,
      message: 'CMS settings and Hero slides saved successfully across all devices and browsers!',
      cms: mergedCms
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCms,
  updateCms
};
