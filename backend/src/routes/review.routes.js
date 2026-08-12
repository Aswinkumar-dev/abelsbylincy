const express = require('express');
const router = express.Router();
const { getProductReviews, createReview } = require('../controllers/review.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.get('/product/:productId', getProductReviews);
router.post('/create', authenticateToken, createReview);

module.exports = router;
