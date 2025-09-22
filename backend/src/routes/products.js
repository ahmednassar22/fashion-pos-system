const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// GET /api/products
router.get('/', ProductController.getAllProducts);

// GET /api/products/:id
router.get('/:id', ProductController.getProductById);

// POST /api/products
router.post('/', ProductController.createProduct);

// PUT /api/products/:id
router.put('/:id', ProductController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', ProductController.deleteProduct);

// GET /api/products/search/:query
router.get('/search/:query', ProductController.searchProducts);

module.exports = router;