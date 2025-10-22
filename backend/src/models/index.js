const { Op } = require('sequelize');
const sequelize = require('../config/database');

// استيراد النماذج
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Customer = require('./Customer');

// تعريف العلاقات بين النماذج مع CASCADE للحذف
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants',
  onDelete: 'CASCADE',
  hooks: true
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'CASCADE',
  hooks: true
});

// تصدير النماذج و sequelize
module.exports = {
  sequelize,
  Product,
  ProductVariant,
  Customer,
  Op
};