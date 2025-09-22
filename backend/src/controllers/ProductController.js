const { Product, ProductVariant } = require('../models');

const ProductController = {
  
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

  //
  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  //
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

  //
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

  //
  async searchProducts(req, res) {
    try {
      const { query } = req.params;
      const products = await Product.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } },
            { barcode: { [Op.iLike]: `%${query}%` } }
          ]
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

module.exports = ProductController;