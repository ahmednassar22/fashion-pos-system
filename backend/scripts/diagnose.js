const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

console.log('🔍 بدء تشخيص المشكلة...\n');

// التحقق من إصدارات الحزم
console.log('📦 إصدارات الحزم:');
console.log('Sequelize:', require('sequelize/package.json').version);
console.log('sqlite3:', require('sqlite3/package.json').version);

// التحقق من وجود قاعدة البيانات
const dbPath = path.join(__dirname, '../database.sqlite');
console.log('\n📁 مسار قاعدة البيانات:', dbPath);
console.log('📊 قاعدة البيانات موجودة:', fs.existsSync(dbPath));

if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log('📏 حجم قاعدة البيانات:', stats.size, 'بايت');
}

// اختبار Sequelize مباشرة
console.log('\n🧪 اختبار Sequelize مباشرة...');
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // استخدام ذاكرة مؤقتة للاختبار
  logging: false
});

// تعريف نموذج اختباري بسيط
const TestModel = testSequelize.define('TestModel', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// اختبار النموذج
testSequelize.authenticate()
  .then(async () => {
    console.log('✅ اختبار الاتصال بنجاح');
    
    try {
      await testSequelize.sync({ force: true });
      console.log('✅ اختبار إنشاء الجداول بنجاح');
      
      const testInstance = await TestModel.create({ name: 'test' });
      console.log('✅ اختبار إدراج البيانات بنجاح - ID:', testInstance.id);
      
      const count = await TestModel.count();
      console.log('✅ اختبار عد البيانات بنجاح - العدد:', count);
      
    } catch (syncError) {
      console.error('❌ خطأ في اختبار الجداول:', syncError.message);
    }
  })
  .catch(authError => {
    console.error('❌ خطأ في اختبار الاتصال:', authError.message);
  })
  .finally(() => {
    testSequelize.close();
  });