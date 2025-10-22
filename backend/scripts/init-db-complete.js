const { sequelize, Product, ProductVariant, Sale, SaleItem, Customer } = require('../src/models');

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ اتصال SQLite تم بنجاح');
    
    // مزامنة جميع النماذج مع قاعدة البيانات
    console.log('🔄 جاري إنشاء الجداول...');
    await sequelize.sync({ force: true });
    console.log('✅ تم مزامنة قاعدة البيانات بنجاح');
    
    // إضافة بيانات اختبارية
    console.log('📦 جاري إضافة البيانات التجريبية...');
    
    // 1. إضافة عملاء تجريبيين
    const customers = await Customer.bulkCreate([
      {
        name: 'أحمد محمد',
        phone: '0512345678',
        email: 'ahmed@example.com',
        loyaltyPoints: 150,
        totalSpent: 1250.00
      },
      {
        name: 'فاطمة عبدالله',
        phone: '0554321000',
        email: 'fatima@example.com',
        loyaltyPoints: 75,
        totalSpent: 680.50
      },
      {
        name: 'خالد السعدي',
        phone: '0501112222',
        loyaltyPoints: 200,
        totalSpent: 1890.00
      }
    ]);
    console.log(`✅ تم إضافة ${customers.length} عميل`);

    // 2. إضافة منتجات تجريبية
    const products = await Product.bulkCreate([
      {
        name: 'تيشيرت قطني أساسي',
        description: 'تيشيرت قطني عالي الجودة بمقاسات وألوان متعددة',
        basePrice: 49.99,
        category: 'ملابس',
        season: 'all',
        gender: 'unisex',
        barcode: 'TSHIRT001',
        isActive: true
      },
      {
        name: 'جينز ريلاكسد',
        description: 'جينز مريح ومناسب للارتداء اليومي',
        basePrice: 129.99,
        category: 'ملابس',
        season: 'all',
        gender: 'unisex',
        barcode: 'JEANS001',
        isActive: true
      },
      {
        name: 'جاكيت جلد طبيعي',
        description: 'جاكيت جلد طبيعي عالي الجودة',
        basePrice: 299.99,
        category: 'ملابس',
        season: 'winter',
        gender: 'unisex',
        barcode: 'JACKET001',
        isActive: true
      },
      {
        name: 'فستان صيفي',
        description: 'فستان خفيف ومريح للصيف',
        basePrice: 89.99,
        category: 'ملابس',
        season: 'summer',
        gender: 'women',
        barcode: 'DRESS001',
        isActive: true
      }
    ]);
    console.log(`✅ تم إضافة ${products.length} منتج`);

    // 3. إضافة متغيرات للمنتجات
    const variants = await ProductVariant.bulkCreate([
      // متغيرات التيشيرت
      {
        productId: products[0].id,
        size: 'S',
        color: 'أبيض',
        sku: 'TSHIRT001-S-WHITE',
        quantity: 25,
        priceModifier: 0
      },
      {
        productId: products[0].id,
        size: 'M',
        color: 'أبيض',
        sku: 'TSHIRT001-M-WHITE',
        quantity: 30,
        priceModifier: 0
      },
      {
        productId: products[0].id,
        size: 'L',
        color: 'أسود',
        sku: 'TSHIRT001-L-BLACK',
        quantity: 20,
        priceModifier: 5.00
      },
      {
        productId: products[0].id,
        size: 'XL',
        color: 'أزرق',
        sku: 'TSHIRT001-XL-BLUE',
        quantity: 15,
        priceModifier: 8.00
      },
      
      // متغيرات الجينز
      {
        productId: products[1].id,
        size: '28',
        color: 'أزرق',
        sku: 'JEANS001-28-BLUE',
        quantity: 10,
        priceModifier: 0
      },
      {
        productId: products[1].id,
        size: '30',
        color: 'أزرق',
        sku: 'JEANS001-30-BLUE',
        quantity: 15,
        priceModifier: 0
      },
      {
        productId: products[1].id,
        size: '32',
        color: 'أسود',
        sku: 'JEANS001-32-BLACK',
        quantity: 12,
        priceModifier: 10.00
      },
      
      // متغيرات الجاكيت
      {
        productId: products[2].id,
        size: 'M',
        color: 'أسود',
        sku: 'JACKET001-M-BLACK',
        quantity: 8,
        priceModifier: 0
      },
      {
        productId: products[2].id,
        size: 'L',
        color: 'بني',
        sku: 'JACKET001-L-BROWN',
        quantity: 6,
        priceModifier: 0
      },
      
      // متغيرات الفستان
      {
        productId: products[3].id,
        size: 'S',
        color: 'أحمر',
        sku: 'DRESS001-S-RED',
        quantity: 7,
        priceModifier: 0
      },
      {
        productId: products[3].id,
        size: 'M',
        color: 'أزرق',
        sku: 'DRESS001-M-BLUE',
        quantity: 9,
        priceModifier: 0
      },
      {
        productId: products[3].id,
        size: 'L',
        color: 'أخضر',
        sku: 'DRESS001-L-GREEN',
        quantity: 5,
        priceModifier: 5.00
      }
    ]);
    console.log(`✅ تم إضافة ${variants.length} متغير للمنتجات`);

    // 4. إضافة مبيعات تجريبية
    const sales = await Sale.bulkCreate([
      {
        receiptNumber: `REC-${Date.now()}-1`,
        totalAmount: 179.98,
        paymentMethod: 'cash',
        amountPaid: 200.00,
        change: 20.02,
        customerId: customers[0].id,
        saleDate: new Date('2024-01-15')
      },
      {
        receiptNumber: `REC-${Date.now()}-2`,
        totalAmount: 429.98,
        paymentMethod: 'card',
        amountPaid: 429.98,
        change: 0,
        customerId: customers[1].id,
        saleDate: new Date('2024-01-16')
      }
    ]);
    console.log(`✅ تم إضافة ${sales.length} عملية بيع`);

    // 5. إضافة عناصر المبيعات
    const saleItems = await SaleItem.bulkCreate([
      // عناصر البيع الأول
      {
        saleId: sales[0].id,
        productId: products[0].id,
        variantId: variants[1].id, // تيشيرت مقاس M أبيض
        productName: 'تيشيرت قطني أساسي',
        size: 'M',
        color: 'أبيض',
        quantity: 2,
        unitPrice: 49.99,
        totalPrice: 99.98
      },
      {
        saleId: sales[0].id,
        productId: products[1].id,
        variantId: variants[4].id, // جينز مقاس 28 أزرق
        productName: 'جينز ريلاكسد',
        size: '28',
        color: 'أزرق',
        quantity: 1,
        unitPrice: 129.99,
        totalPrice: 129.99
      },
      
      // عناصر البيع الثاني
      {
        saleId: sales[1].id,
        productId: products[2].id,
        variantId: variants[7].id, // جاكيت مقاس M أسود
        productName: 'جاكيت جلد طبيعي',
        size: 'M',
        color: 'أسود',
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99
      },
      {
        saleId: sales[1].id,
        productId: products[3].id,
        variantId: variants[10].id, // فستان مقاس M أزرق
        productName: 'فستان صيفي',
        size: 'M',
        color: 'أزرق',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      },
      {
        saleId: sales[1].id,
        productId: products[0].id,
        variantId: variants[2].id, // تيشيرت مقاس L أسود
        productName: 'تيشيرت قطني أساسي',
        size: 'L',
        color: 'أسود',
        quantity: 2,
        unitPrice: 54.99, // 49.99 + 5.00
        totalPrice: 109.98
      }
    ]);
    console.log(`✅ تم إضافة ${saleItems.length} عنصر بيع`);

    // تحديث إحصائيات العملاء
    await Customer.update(
      { lastPurchaseDate: new Date('2024-01-15') },
      { where: { id: customers[0].id } }
    );
    
    await Customer.update(
      { lastPurchaseDate: new Date('2024-01-16') },
      { where: { id: customers[1].id } }
    );

    console.log('🎉 تم تهيئة النظام بالكامل بنجاح!');
    console.log('📊 ملخص البيانات المضافة:');
    console.log(`   👥 ${customers.length} عميل`);
    console.log(`   🛍️ ${products.length} منتج`);
    console.log(`   🎨 ${variants.length} متغير منتج`);
    console.log(`   💰 ${sales.length} عملية بيع`);
    console.log(`   📦 ${saleItems.length} عنصر بيع`);
    console.log('💾 ملف قاعدة البيانات: ./database.sqlite');
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 تم إغلاق اتصال قاعدة البيانات');
  }
};

initDatabase();