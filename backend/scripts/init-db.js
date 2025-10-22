const { sequelize, Product, ProductVariant, Customer } = require('../src/models');

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection established successfully.');
    
    // مزامنة النماذج مع قاعدة البيانات
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // إضافة بيانات اختبارية
    console.log('Adding sample data...');
    
    // إضافة منتجات
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
        description: 'جينز مريح للارتداء اليومي',
        basePrice: 129.99,
        category: 'ملابس',
        season: 'all',
        gender: 'unisex',
        barcode: 'JEANS001',
        isActive: true
      },
      {
        name: 'جاكيت جلد طبيعي',
        description: 'جاكيت جلد عالي الجودة',
        basePrice: 299.99,
        category: 'ملابس',
        season: 'winter',
        gender: 'unisex',
        barcode: 'JACKET001',
        isActive: true
      }
    ]);

    // إضافة متغيرات المنتجات
    await ProductVariant.bulkCreate([
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
        productId: products[1].id,
        size: '28',
        color: 'أزرق',
        sku: 'JEANS001-28-BLUE',
        quantity: 15,
        priceModifier: 0
      },
      {
        productId: products[1].id,
        size: '30',
        color: 'أزرق',
        sku: 'JEANS001-30-BLUE',
        quantity: 20,
        priceModifier: 0
      },
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
      }
    ]);

    // إضافة عملاء
    await Customer.bulkCreate([
      {
        name: 'أحمد محمد',
        phone: '0512345678',
        email: 'ahmed@example.com',
        loyaltyPoints: 150,
        totalSpent: 1250.00,
        lastPurchaseDate: new Date('2024-01-15'),
        notes: 'عميل دائم، يفضل التيشيرتات القطنية'
      },
      {
        name: 'فاطمة عبدالله',
        phone: '0554321000',
        email: 'fatima@example.com',
        loyaltyPoints: 75,
        totalSpent: 680.50,
        lastPurchaseDate: new Date('2024-01-16'),
        notes: 'تهتم بالموضة الصيفية'
      },
      {
        name: 'خالد السعدي',
        phone: '0501112222',
        loyaltyPoints: 200,
        totalSpent: 1890.00,
        lastPurchaseDate: new Date('2024-01-10'),
        notes: 'عميل VIP، يشتري بانتظام'
      }
    ]);

    console.log('Sample data added successfully!');
    console.log('SQLite database file created at: ./database.sqlite');
    
  } catch (error) {
    console.error('Unable to initialize database:', error);
  } finally {
    await sequelize.close();
  }
};

initDatabase();