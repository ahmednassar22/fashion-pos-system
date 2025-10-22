const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');

// GET /api/customers - الحصول على جميع العملاء
router.get('/', CustomerController.getAllCustomers);

// GET /api/customers/:id - الحصول على عميل بواسطة ID
router.get('/:id', CustomerController.getCustomerById);

// POST /api/customers - إنشاء عميل جديد
router.post('/', CustomerController.createCustomer);

// PUT /api/customers/:id - تحديث عميل
router.put('/:id', CustomerController.updateCustomer);

// DELETE /api/customers/:id - حذف عميل
router.delete('/:id', CustomerController.deleteCustomer);

// GET /api/customers/search/:query - البحث عن العملاء
router.get('/search/:query', CustomerController.searchCustomers);

// PUT /api/customers/:id/loyalty - تحديث نقاط الولاء
router.put('/:id/loyalty', CustomerController.updateLoyaltyPoints);

module.exports = router;