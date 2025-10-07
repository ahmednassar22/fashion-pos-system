const { Product, ProductVariant, sequelize, Op } = require('../models');

const SaleController = {
  // معالجة عملية بيع جديدة
  async processSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { items, paymentMethod, amountPaid } = req.body;
      
      // التحقق من توفر المخزون
      for (const item of items) {
        if (item.variantId) {
          const variant = await ProductVariant.findByPk(item.variantId, { transaction });
          if (!variant || variant.quantity < item.quantity) {
            await transaction.rollback();
            return res.status(400).json({ 
              error: `غير متوفر كمية كافية من ${item.productName}` 
            });
          }
        }
      }

      // تحديث المخزون
      for (const item of items) {
        if (item.variantId) {
          await ProductVariant.decrement('quantity', {
            by: item.quantity,
            where: { id: item.variantId },
            transaction
          });
        }
      }

      // حفظ بيانات البيع
      const saleData = {
        totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod,
        amountPaid,
        change: amountPaid - items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        items: items.length
      };

      await transaction.commit();
      
      res.json({
        success: true,
        message: 'تمت عملية البيع بنجاح',
        sale: saleData,
        receiptNumber: `REC-${Date.now()}`
      });

    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // البحث السريع عن المنتجات
  async quickSearch(req, res) {
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
          as: 'variants',
          where: { quantity: { [Op.gt]: 0 } },
          required: false
        }]
      });

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SaleController;