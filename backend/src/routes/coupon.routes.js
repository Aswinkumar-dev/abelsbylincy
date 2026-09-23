const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  createOrUpdateCoupon,
  deleteCoupon
} = require('../controllers/coupon.controller');

router.get('/', getAllCoupons);
router.post('/', createOrUpdateCoupon);
router.delete('/:codeOrId', deleteCoupon);

module.exports = router;
