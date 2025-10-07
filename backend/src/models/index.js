const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// استيراد النماذج
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');

// تعريف العلاقات بين النماذج
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants'
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// تصدير النماذج و sequelize
module.exports = {
  sequelize,
  Product,
  ProductVariant,
  Op: Sequelize.Op // إضافة Op للاستعلامات
};