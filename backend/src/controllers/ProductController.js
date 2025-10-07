const { Product, ProductVariant, Op } = require('../models');

const ProductController = {
  // الحصول على جميع المنتجات
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: { isActive: true },
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // الحصول على منتج بواسطة ID
  async getProductById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // إنشاء منتج جديد
  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // تحديث منتج
  async updateProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await product.update(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // حذف منتج
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      await product.update({ isActive: false });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // البحث عن المنتجات
  async searchProducts(req, res) {
    try {
      const { query } = req.params;
      
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { barcode: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ],
          isActive: true
        },
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// تأكد من التصدير بشكل صحيح
module.exports = ProductController;