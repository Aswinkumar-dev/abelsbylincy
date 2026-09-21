const express = require('express');
const router = express.Router();
const { getAllReviews, getProductReviews, createReview } = require('../controllers/review.controller');
const { optionalAuthenticateToken } = require('../middleware/auth.middleware');

router.get('/', getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/create', optionalAuthenticateToken, createReview);
router.post('/', optionalAuthenticateToken, createReview);

module.exports = router;
