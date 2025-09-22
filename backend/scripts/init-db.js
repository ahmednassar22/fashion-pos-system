const { sequelize, Product, ProductVariant } = require('../src/models');

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection established successfully.');
    
    // مزامنة النماذج مع قاعدة البيانات
    console.log('Syncing database tables...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // إضافة بيانات اختبارية
    console.log('Adding sample data...');
    
    const sampleProduct = await Product.create({
      name: 'تيشيرت قطني أساسي',
      description: 'تيشيرت قطني عالي الجودة بمقاسات وألوان متعددة',
      basePrice: 49.99,
      category: 'ملابس',
      season: 'all',
      gender: 'unisex',
      barcode: 'TSHIRT001',
      isActive: true
    });
    
    console.log('Sample product created:', sampleProduct.id);
    
    await ProductVariant.bulkCreate([
      {
        productId: sampleProduct.id,
        size: 'S',
        color: 'أبيض',
        sku: 'TSHIRT001-S-WHITE',
        quantity: 25,
        priceModifier: 0
      },
      {
        productId: sampleProduct.id,
        size: 'M', 
        color: 'أبيض',
        sku: 'TSHIRT001-M-WHITE',
        quantity: 30,
        priceModifier: 0
      },
      {
        productId: sampleProduct.id,
        size: 'L',
        color: 'أسود',
        sku: 'TSHIRT001-L-BLACK',
        quantity: 20,
        priceModifier: 5.00
      }
    ]);
    
    console.log('Sample data added successfully!');
    console.log('SQLite database file created at: ./database.sqlite');
    
  } catch (error) {
    console.error('Unable to initialize database:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

initDatabase();