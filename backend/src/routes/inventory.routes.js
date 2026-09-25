const express = require('express');
const router = express.Router();
const { adjustStock, restockAllLowStock, getInventoryHistory } = require('../controllers/inventory.controller');

router.post('/adjust', adjustStock);
router.post('/restock-all', restockAllLowStock);
router.get('/history', getInventoryHistory);

module.exports = router;
