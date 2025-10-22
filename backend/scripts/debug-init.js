// سكريبت مبسط لتصحيح الأخطاء
const path = require('path');
const fs = require('fs');

console.log('🔍 بدء تصحيح تهيئة قاعدة البيانات...');

// التحقق من وجود الملفات
const filesToCheck = [
  '../src/config/database.js',
  '../src/models/index.js', 
  '../src/models/Product.js',
  '../src/models/ProductVariant.js'
];

console.log('\n📁 التحقق من وجود الملفات:');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'موجود' : 'غير موجود'}`);
});

// محاولة استيراد النماذج
console.log('\n🔄 محاولة استيراد النماذج...');
try {
  const { sequelize, Product, ProductVariant } = require('../src/models');
  console.log('✅ تم استيراد النماذج بنجاح');
  
  // اختبار الاتصال بقاعدة البيانات
  console.log('\n🔌 اختبار الاتصال بقاعدة البيانات...');
  sequelize.authenticate()
    .then(async () => {
      console.log('✅ الاتصال بقاعدة البيانات ناجح');
      
      // محاولة مزامنة الجداول
      console.log('\n🗃️ محاولة إنشاء الجداول...');
      try {
        await sequelize.sync({ force: true });
        console.log('✅ تم إنشاء الجداول بنجاح!');
        
        // اختبار إضافة بيانات
        console.log('\n🧪 اختبار إضافة بيانات...');
        const testProduct = await Product.create({
          name: 'منتج اختباري',
          basePrice: 99.99,
          category: 'اختبار',
          barcode: 'TEST001'
        });
        
        await ProductVariant.create({
          productId: testProduct.id,
          size: 'M',
          color: 'أحمر',
          quantity: 10,
          priceModifier: 0
        });
        
        console.log('✅ تم إضافة البيانات الاختبارية بنجاح');
        console.log('🎉 كل شيء يعمل بشكل صحيح!');
        
      } catch (syncError) {
        console.error('❌ خطأ في إنشاء الجداول:', syncError.message);
        console.error('تفاصيل الخطأ:', syncError);
      }
      
    })
    .catch(authError => {
      console.error('❌ خطأ في الاتصال بقاعدة البيانات:', authError.message);
    });
  
} catch (importError) {
  console.error('❌ خطأ في استيراد النماذج:', importError.message);
  console.error('تفاصيل الخطأ:', importError);
}