const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { getProducts, getProductBySlug, syncProducts, uploadProductImage, deleteProductImage, deductStock } = require('../controllers/product.controller');

router.get('/', getProducts);
router.post('/upload', upload.any(), uploadProductImage);
router.post('/delete-image', deleteProductImage);
router.post('/sync', syncProducts);
router.post('/deduct-stock', deductStock);
router.get('/:slug', getProductBySlug);

module.exports = router;


