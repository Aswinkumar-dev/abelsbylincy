const db = require('../config/database');
const { getStoredCms, saveStoredCms } = require('../utils/fileStore');

/**
 * Get CMS Content (Announcement bar, Hero slides, Featured collections, etc.)
 */
const getCms = async (req, res, next) => {
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
 * Update / Save CMS Content
 */
const updateCms = async (req, res, next) => {
  try {
    const { cms } = req.body;

    if (!cms || typeof cms !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid CMS payload. Expected an object.'
      });
    }

    const cmsJson = JSON.stringify(cms);

    // 1. Ensure site_settings table exists and insert/update in MySQL
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value) 
         VALUES ('cms_data', ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [cmsJson, cmsJson]
      );
    } catch (dbErr) {
      console.warn('⚠️ CMS DB write note:', dbErr.message);
    }

    // 2. Save to fileStore / memory
    saveStoredCms(cms);

    return res.status(200).json({
      success: true,
      message: 'CMS settings saved successfully across all devices and browsers!',
      cms
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCms,
  updateCms
};
