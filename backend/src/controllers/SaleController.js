const { Product, ProductVariant, Customer, sequelize, Op } = require('../models');

const SaleController = {
  // معالجة عملية بيع جديدة
  async processSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { items, paymentMethod, amountPaid, customerId } = req.body;
      
      console.log('Processing sale with items:', items);
      console.log('Customer ID:', customerId);

      // التحقق من توفر المخزون
      for (const item of items) {
        if (item.variantId) {
          const variant = await ProductVariant.findByPk(item.variantId, { transaction });
          if (!variant) {
            await transaction.rollback();
            return res.status(400).json({ 
              error: `المتغير غير موجود للمنتج: ${item.productName}` 
            });
          }
          if (variant.quantity < item.quantity) {
            await transaction.rollback();
            return res.status(400).json({ 
              error: `غير متوفر كمية كافية من ${item.productName} (المتاح: ${variant.quantity})` 
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
          console.log(`Updated variant ${item.variantId} quantity, decreased by ${item.quantity}`);
        }
      }

      // حساب الإجماليات
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const change = amountPaid - totalAmount;

      // تحديث بيانات العميل إذا كان موجوداً
      if (customerId) {
        const customer = await Customer.findByPk(customerId, { transaction });
        if (customer) {
          // تحديث إجمالي المشتريات وآخر تاريخ شراء
          const newTotalSpent = parseFloat(customer.totalSpent) + totalAmount;
          
          await customer.update({
            totalSpent: newTotalSpent,
            lastPurchaseDate: new Date()
          }, { transaction });
          
          console.log(`Updated customer ${customerId} data: total spent = ${newTotalSpent}`);
        }
      }

      await transaction.commit();
      
      console.log('Sale processed successfully');

      res.json({
        success: true,
        message: 'تمت عملية البيع بنجاح',
        sale: {
          totalAmount,
          paymentMethod,
          amountPaid,
          change: change > 0 ? change : 0,
          items: items.length,
          customerId: customerId || null
        },
        receiptNumber: `REC-${Date.now()}`
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error processing sale:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // البحث السريع عن المنتجات
  async quickSearch(req, res) {
    try {
      const { query } = req.params;
      console.log('Searching for:', query);
      
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
          required: false
        }]
      });

      console.log('Found products:', products.length);
      res.json(products);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SaleController;