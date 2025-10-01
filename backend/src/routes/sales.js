const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/SaleController');

// POST /api/sales - معالجة عملية بيع جديدة
router.post('/', SaleController.processSale);

// GET /api/sales/search/:query - بحث سريع عن المنتجات
router.get('/search/:query', SaleController.quickSearch);

module.exports = router;