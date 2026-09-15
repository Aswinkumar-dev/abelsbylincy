const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { getProducts, getProductBySlug, syncProducts, uploadProductImage } = require('../controllers/product.controller');

router.get('/', getProducts);
router.post('/upload', upload.any(), uploadProductImage);
router.post('/sync', syncProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;

