const express = require('express');
const router = express.Router();
const { getCms, updateCms } = require('../controllers/cms.controller');

// Public route to get CMS content for storefront
router.get('/', getCms);

// Route to save/update CMS content (Admin & Storefront sync)
router.post('/', updateCms);
router.put('/', updateCms);

module.exports = router;
