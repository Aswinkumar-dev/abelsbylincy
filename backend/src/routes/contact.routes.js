const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllContactMessages,
  deleteContactMessage
} = require('../controllers/contact.controller');

// Public contact submission
router.post('/', submitContactMessage);
router.post('/submit', submitContactMessage);

// Admin retrieval & deletion
router.get('/messages', getAllContactMessages);
router.get('/all', getAllContactMessages);
router.delete('/messages/:id', deleteContactMessage);
router.delete('/:id', deleteContactMessage);

module.exports = router;
