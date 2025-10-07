const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// GET /api/products - الحصول على جميع المنتجات
router.get('/', ProductController.getAllProducts);

// GET /api/products/:id - الحصول على منتج بواسطة ID
router.get('/:id', ProductController.getProductById);

// POST /api/products - إنشاء منتج جديد
router.post('/', ProductController.createProduct);

// PUT /api/products/:id - تحديث منتج
router.put('/:id', ProductController.updateProduct);

// DELETE /api/products/:id - حذف منتج
router.delete('/:id', ProductController.deleteProduct);

// GET /api/products/search/:query - البحث عن المنتجات
router.get('/search/:query', ProductController.searchProducts);

module.exports = router;