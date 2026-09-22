const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber
} = require('../controllers/newsletter.controller');

// Public subscription
router.post('/', subscribeNewsletter);
router.post('/subscribe', subscribeNewsletter);

// Admin retrieval & deletion
router.get('/subscribers', getAllSubscribers);
router.get('/all', getAllSubscribers);
router.delete('/subscribers/:idOrEmail', deleteSubscriber);
router.delete('/:idOrEmail', deleteSubscriber);

module.exports = router;
