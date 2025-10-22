const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔧 إنشاء الجداول يدوياً...');

const dbPath = path.join(__dirname, '../database.sqlite');

// حذف قاعدة البيانات القديمة إذا كانت موجودة
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ تم حذف قاعدة البيانات القديمة');
}

// إنشاء اتصال جديد
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
    return;
  }
  console.log('✅ تم الاتصال بقاعدة البيانات SQLite');
});

// تفعيل المفاتيح الخارجية
db.run('PRAGMA foreign_keys = ON');

// إنشاء الجداول واحدة تلو الأخرى
const createTables = async () => {
  try {
    console.log('\n🗃️ جاري إنشاء الجداول...');

    // جدول المنتجات
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        basePrice DECIMAL(10,2) NOT NULL,
        category TEXT,
        season TEXT DEFAULT 'all',
        gender TEXT DEFAULT 'unisex',
        barcode TEXT UNIQUE,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ تم إنشاء جدول products');
          resolve();
        }
      });
    });

    // جدول متغيرات المنتج
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        sku TEXT UNIQUE,
        quantity INTEGER DEFAULT 0,
        priceModifier DECIMAL(10,2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ تم إنشاء جدول product_variants');
          resolve();
        }
      });
    });

    // إضافة بيانات اختبارية
    console.log('\n📦 جاري إضافة البيانات التجريبية...');
    
    // إضافة منتجات
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO products (name, description, basePrice, category, barcode) 
              VALUES (?, ?, ?, ?, ?)`, 
        ['تيشيرت قطني أساسي', 'تيشيرت قطني عالي الجودة', 49.99, 'ملابس', 'TSHIRT001'],
        function(err) {
          if (err) reject(err);
          else {
            const productId = this.lastID;
            console.log('✅ تم إضافة المنتج 1 - ID:', productId);
            
            // إضافة متغيرات للمنتج الأول
            db.run(`INSERT INTO product_variants (productId, size, color, quantity, sku) 
                    VALUES (?, ?, ?, ?, ?)`, 
              [productId, 'S', 'أبيض', 25, 'TSHIRT001-S-WHITE']);
            
            db.run(`INSERT INTO product_variants (productId, size, color, quantity, sku) 
                    VALUES (?, ?, ?, ?, ?)`, 
              [productId, 'M', 'أبيض', 30, 'TSHIRT001-M-WHITE']);
            
            db.run(`INSERT INTO product_variants (productId, size, color, quantity, sku) 
                    VALUES (?, ?, ?, ?, ?)`, 
              [productId, 'L', 'أسود', 20, 'TSHIRT001-L-BLACK']);
            
            resolve();
          }
        }
      );
    });

    // إضافة منتج ثاني
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO products (name, description, basePrice, category, barcode) 
              VALUES (?, ?, ?, ?, ?)`, 
        ['جينز ريلاكسد', 'جينز مريح للارتداء اليومي', 129.99, 'ملابس', 'JEANS001'],
        function(err) {
          if (err) reject(err);
          else {
            const productId = this.lastID;
            console.log('✅ تم إضافة المنتج 2 - ID:', productId);
            
            // إضافة متغيرات للمنتج الثاني
            db.run(`INSERT INTO product_variants (productId, size, color, quantity, sku) 
                    VALUES (?, ?, ?, ?, ?)`, 
              [productId, '28', 'أزرق', 15, 'JEANS001-28-BLUE']);
            
            db.run(`INSERT INTO product_variants (productId, size, color, quantity, sku) 
                    VALUES (?, ?, ?, ?, ?)`, 
              [productId, '30', 'أزرق', 20, 'JEANS001-30-BLUE']);
            
            resolve();
          }
        }
      );
    });

    // التحقق من البيانات المضافة
    console.log('\n🔍 التحقق من البيانات...');
    
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (err) {
        console.error('❌ خطأ في عد المنتجات:', err);
      } else {
        console.log(`🛍️ عدد المنتجات: ${row.count}`);
      }
    });

    db.get("SELECT COUNT(*) as count FROM product_variants", (err, row) => {
      if (err) {
        console.error('❌ خطأ في عد المتغيرات:', err);
      } else {
        console.log(`🎨 عدد المتغيرات: ${row.count}`);
      }
    });

    console.log('\n🎉 تم إنشاء الجداول والبيانات بنجاح!');
    console.log('💾 ملف قاعدة البيانات:', dbPath);

  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error);
  } finally {
    // إغلاق الاتصال بعد ثانيتين للسماح بجميع الاستعلامات
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('❌ خطأ في إغلاق الاتصال:', err);
        } else {
          console.log('🔌 تم إغلاق اتصال قاعدة البيانات');
        }
      });
    }, 2000);
  }
};

// بدء العملية
createTables();