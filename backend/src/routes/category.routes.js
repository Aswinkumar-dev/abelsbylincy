const express = require('express');
const router = express.Router();
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const upload = require('../middleware/upload.middleware');

router.get('/', getCategories);
router.post('/', upload.any(), addCategory);
router.put('/:id', upload.any(), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
