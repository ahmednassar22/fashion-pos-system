// سكريبت تهيئة يعمل بدون مشاكل
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

console.log('🚀 بدء تهيئة قاعدة البيانات...');

// حذف ملف قاعدة البيانات القديم إذا كان موجوداً
const dbPath = path.join(__dirname, '../database.sqlite');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ تم حذف ملف قاعدة البيانات القديم');
}

// إنشاء اتصال جديد بقاعدة البيانات
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log,
  define: {
    timestamps: true,
    freezeTableName: true
  }
});

// تعريف النماذج مباشرة في السكريبت
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  season: {
    type: DataTypes.STRING,
    defaultValue: 'all'
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: 'unisex'
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products'
});

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  priceModifier: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'product_variants'
});

// تعريف العلاقات
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants'
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// دالة التهيئة
const initializeDatabase = async () => {
  try {
    // اختبار الاتصال
    await sequelize.authenticate();
    console.log('✅ الاتصال بقاعدة البيانات ناجح');

    // إنشاء الجداول
    console.log('🗃️ جاري إنشاء الجداول...');
    await sequelize.sync({ force: true });
    console.log('✅ تم إنشاء الجداول بنجاح');

    // إضافة بيانات اختبارية
    console.log('📦 جاري إضافة البيانات التجريبية...');
    
    const product1 = await Product.create({
      name: 'تيشيرت قطني أساسي',
      description: 'تيشيرت قطني عالي الجودة',
      basePrice: 49.99,
      category: 'ملابس',
      barcode: 'TSHIRT001'
    });

    const product2 = await Product.create({
      name: 'جينز ريلاكسد',
      description: 'جينز مريح للارتداء اليومي',
      basePrice: 129.99,
      category: 'ملابس',
      barcode: 'JEANS001'
    });

    console.log(`✅ تم إضافة 2 منتج`);

    // إضافة متغيرات
    await ProductVariant.bulkCreate([
      {
        productId: product1.id,
        size: 'S',
        color: 'أبيض',
        quantity: 25,
        sku: 'TSHIRT001-S-WHITE'
      },
      {
        productId: product1.id,
        size: 'M',
        color: 'أبيض',
        quantity: 30,
        sku: 'TSHIRT001-M-WHITE'
      },
      {
        productId: product1.id,
        size: 'L',
        color: 'أسود',
        quantity: 20,
        priceModifier: 5.00,
        sku: 'TSHIRT001-L-BLACK'
      },
      {
        productId: product2.id,
        size: '28',
        color: 'أزرق',
        quantity: 15,
        sku: 'JEANS001-28-BLUE'
      },
      {
        productId: product2.id,
        size: '30',
        color: 'أزرق',
        quantity: 20,
        sku: 'JEANS001-30-BLUE'
      }
    ]);

    console.log(`✅ تم إضافة 5 متغيرات للمنتجات`);

    // التحقق من البيانات
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
    await sequelize.close();
    console.log('🔌 تم إغلاق اتصال قاعدة البيانات');
  }
};

// تشغيل التهيئة
initializeDatabase();