const express = require('express');
const router = express.Router();
const { getCart, syncCart } = require('../controllers/cart.controller');
const { optionalAuthenticateToken } = require('../middleware/auth.middleware');

// Support both authenticated tokens and user email identification for robust cart syncing
router.use(optionalAuthenticateToken);

router.get('/', getCart);
router.post('/sync', syncCart);

module.exports = router;
