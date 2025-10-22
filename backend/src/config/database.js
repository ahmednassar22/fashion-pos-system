const { Sequelize } = require('sequelize');
require('dotenv').config();

// استخدام SQLite للتطوير
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    freezeTableName: true
  }
});

// اختبار الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;