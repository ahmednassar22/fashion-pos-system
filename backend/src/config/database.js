const { Sequelize } = require('sequelize');
require('dotenv').config();

// استخدام SQLite للتطوير (لا يحتاج إلى خادم منفصل)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // سيتم إنشاء ملف في مجلد backend
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// اختبار الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;