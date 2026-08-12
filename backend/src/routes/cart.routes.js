const express = require('express');
const router = express.Router();
const { getCart, syncCart } = require('../controllers/cart.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', getCart);
router.post('/sync', syncCart);

module.exports = router;
