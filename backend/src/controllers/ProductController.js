const { Product, ProductVariant, Op, sequelize } = require('../models');

const ProductController = {
  // الحصول على جميع المنتجات
  async getAllProducts(req, res) {
    try {
      console.log('Fetching all products...');
      const products = await Product.findAll({
        where: { isActive: true },
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      console.log(`Found ${products.length} products`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // إنشاء منتج جديد مع متغيراته
  async createProduct(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { variants, ...productData } = req.body;
      
      console.log('Creating product with data:', productData);
      console.log('Variants:', variants);
      
      // إنشاء المنتج الأساسي
      const product = await Product.create(productData, { transaction });
      
      // إنشاء المتغيرات إذا كانت موجودة
      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          productId: product.id
        }));
        await ProductVariant.bulkCreate(variantsWithProductId, { transaction });
      }
      
      await transaction.commit();
      
      // جلب المنتج مع متغيراته
      const createdProduct = await Product.findByPk(product.id, {
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      
      res.status(201).json(createdProduct);
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating product:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // تحديث منتج مع متغيراته
  async updateProduct(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { variants, ...productData } = req.body;
      
      const product = await Product.findByPk(id, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // تحديث بيانات المنتج الأساسية
      await product.update(productData, { transaction });
      
      // حذف المتغيرات القديمة وإضافة الجديدة
      if (variants) {
        await ProductVariant.destroy({ 
          where: { productId: id },
          transaction 
        });
        
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          productId: id
        }));
        
        await ProductVariant.bulkCreate(variantsWithProductId, { transaction });
      }
      
      await transaction.commit();
      
      // جلب المنتج المحدث مع متغيراته
      const updatedProduct = await Product.findByPk(id, {
        include: [{
          model: ProductVariant,
          as: 'variants'
        }]
      });
      
      res.json(updatedProduct);
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating product:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // البحث عن المنتجات
  async searchProducts(req, res) {
    try {
      const { query } = req.params;
      console.log('Searching products for:', query);
      
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
      
      console.log(`Search found ${products.length} products`);
      res.json(products);
    } catch (error) {
      console.error('Search error:', error);
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
  }
};

module.exports = ProductController;