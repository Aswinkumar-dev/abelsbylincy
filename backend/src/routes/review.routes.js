const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getProductReviews,
  createReview,
  updateReviewStatus,
  replyToReview,
  deleteReview
} = require('../controllers/review.controller');
const { optionalAuthenticateToken } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/create', optionalAuthenticateToken, createReview);
router.post('/', optionalAuthenticateToken, createReview);

// Moderation endpoints (Admin / Management)
router.put('/:id/status', updateReviewStatus);
router.patch('/:id/status', updateReviewStatus);
router.put('/:id/reply', replyToReview);
router.post('/:id/reply', replyToReview);
router.delete('/:id', deleteReview);

module.exports = router;
