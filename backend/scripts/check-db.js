const { sequelize, Product, ProductVariant } = require('../src/models');

const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من الجداول
    const tables = await sequelize.showAllSchemas();
    console.log('📊 الجداول الموجودة:', tables);

    // جلب جميع المنتجات
    const products = await Product.findAll({
      include: [{
        model: ProductVariant,
        as: 'variants'
      }]
    });

    console.log(`\n📦 عدد المنتجات: ${products.length}`);
    
    products.forEach(product => {
      console.log(`\n🏷️  المنتج: ${product.name}`);
      console.log(`   السعر: $${product.basePrice}`);
      console.log(`   الفئة: ${product.category}`);
      console.log(`   عدد المتغيرات: ${product.variants.length}`);
      
      product.variants.forEach(variant => {
        console.log(`   ├─ ${variant.size} - ${variant.color} (${variant.quantity} قطعة)`);
      });
    });

  } catch (error) {
    console.error('❌ خطأ في التحقق من قاعدة البيانات:', error);
  } finally {
    await sequelize.close();
  }
};

checkDatabase();