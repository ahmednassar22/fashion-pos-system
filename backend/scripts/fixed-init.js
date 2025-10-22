const { sequelize, disableForeignKeys, enableForeignKeys } = require('../src/config/database');
const { Product, ProductVariant } = require('../src/models');

const initializeDatabase = async () => {
  try {
    console.log('🚀 بدء تهيئة قاعدة البيانات...');
    
    // اختبار الاتصال أولاً
    await sequelize.authenticate();
    console.log('✅ الاتصال بقاعدة البيانات ناجح');

    // تعطيل المفاتيح الخارجية مؤقتاً
    await disableForeignKeys();

    // مزامنة الجداول مع force: true
    console.log('🗃️ جاري إنشاء/إعادة إنشاء الجداول...');
    await sequelize.sync({ force: true });
    console.log('✅ تم إنشاء الجداول بنجاح');

    // تفعيل المفاتيح الخارجية مرة أخرى
    await enableForeignKeys();

    // إضافة بيانات اختبارية
    console.log('📦 جاري إضافة البيانات التجريبية...');
    
    const products = await Product.bulkCreate([
      {
        name: 'تيشيرت قطني أساسي',
        description: 'تيشيرت قطني عالي الجودة',
        basePrice: 49.99,
        category: 'ملابس',
        barcode: 'TSHIRT001',
        isActive: true
      },
      {
        name: 'جينز ريلاكسد',
        description: 'جينز مريح للارتداء اليومي',
        basePrice: 129.99,
        category: 'ملابس',
        barcode: 'JEANS001',
        isActive: true
      },
      {
        name: 'جاكيت جلد طبيعي',
        description: 'جاكيت جلد عالي الجودة',
        basePrice: 299.99,
        category: 'ملابس', 
        barcode: 'JACKET001',
        isActive: true
      }
    ]);
    console.log(`✅ تم إضافة ${products.length} منتج`);

    // إضافة متغيرات المنتجات
    const variants = await ProductVariant.bulkCreate([
      // متغيرات التيشيرت
      {
        productId: products[0].id,
        size: 'S',
        color: 'أبيض',
        quantity: 25,
        priceModifier: 0,
        sku: 'TSHIRT001-S-WHITE'
      },
      {
        productId: products[0].id,
        size: 'M',
        color: 'أبيض',
        quantity: 30,
        priceModifier: 0,
        sku: 'TSHIRT001-M-WHITE'
      },
      {
        productId: products[0].id,
        size: 'L',
        color: 'أسود',
        quantity: 20,
        priceModifier: 5.00,
        sku: 'TSHIRT001-L-BLACK'
      },
      
      // متغيرات الجينز
      {
        productId: products[1].id,
        size: '28',
        color: 'أزرق',
        quantity: 15,
        priceModifier: 0,
        sku: 'JEANS001-28-BLUE'
      },
      {
        productId: products[1].id,
        size: '30',
        color: 'أزرق',
        quantity: 20,
        priceModifier: 0,
        sku: 'JEANS001-30-BLUE'
      },
      
      // متغيرات الجاكيت
      {
        productId: products[2].id,
        size: 'M',
        color: 'أسود',
        quantity: 8,
        priceModifier: 0,
        sku: 'JACKET001-M-BLACK'
      },
      {
        productId: products[2].id,
        size: 'L',
        color: 'بني',
        quantity: 6,
        priceModifier: 0,
        sku: 'JACKET001-L-BROWN'
      }
    ]);
    console.log(`✅ تم إضافة ${variants.length} متغير للمنتجات`);

    // التحقق من البيانات المضافة
    const productCount = await Product.count();
    const variantCount = await ProductVariant.count();
    
    console.log('\n📊 ملخص قاعدة البيانات:');
    console.log(`   🛍️ عدد المنتجات: ${productCount}`);
    console.log(`   🎨 عدد المتغيرات: ${variantCount}`);
    console.log('💾 ملف قاعدة البيانات: ./database.sqlite');
    console.log('🎉 تم تهيئة النظام بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
  } finally {
    // التأكد من إغلاق الاتصال
    await sequelize.close();
    console.log('🔌 تم إغلاق اتصال قاعدة البيانات');
  }
};

// تشغيل التهيئة
initializeDatabase();