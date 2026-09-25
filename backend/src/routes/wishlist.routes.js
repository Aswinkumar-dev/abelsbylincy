const express = require('express');
const router = express.Router();
const { getWishlist, syncWishlist, toggleWishlistItem } = require('../controllers/wishlist.controller');
const { optionalAuthenticateToken } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticateToken, getWishlist);
router.post('/sync', optionalAuthenticateToken, syncWishlist);
router.post('/toggle', optionalAuthenticateToken, toggleWishlistItem);

module.exports = router;
