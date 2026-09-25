const express = require('express');
const router = express.Router();
const { getWishlist, syncWishlist } = require('../controllers/wishlist.controller');
const { optionalAuthenticateToken } = require('../middleware/auth.middleware');

router.get('/', optionalAuthenticateToken, getWishlist);
router.post('/sync', optionalAuthenticateToken, syncWishlist);

module.exports = router;
