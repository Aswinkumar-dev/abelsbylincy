const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, syncProducts } = require('../controllers/product.controller');

router.get('/', getProducts);
router.post('/sync', syncProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
