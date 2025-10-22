const { Customer } = require('../src/models');

const addSampleCustomers = async () => {
  try {
    console.log('👥 جاري إضافة العملاء التجريبيين...');

    const customers = await Customer.bulkCreate([
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
        email: 'khaled@example.com',
        loyaltyPoints: 200,
        totalSpent: 1890.00,
        lastPurchaseDate: new Date('2024-01-10'),
        notes: 'عميل VIP، يشتري بانتظام'
      },
      {
        name: 'نورة القحطاني',
        phone: '0543334444',
        email: 'nora@example.com',
        loyaltyPoints: 30,
        totalSpent: 320.75,
        lastPurchaseDate: new Date('2024-01-14'),
        notes: 'عميلة جديدة'
      },
      {
        name: 'محمد العتيبي',
        phone: '0535556666',
        loyaltyPoints: 50,
        totalSpent: 450.00,
        lastPurchaseDate: new Date('2024-01-12'),
        notes: 'يفضل الملابس الرياضية'
      }
    ]);

    console.log(`✅ تم إضافة ${customers.length} عميل تجريبي`);
    console.log('🎉 تم إعداد نظام العملاء بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إضافة العملاء:', error);
  }
};

// إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  addSampleCustomers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addSampleCustomers;