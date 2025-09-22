const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to database established successfully.');
    
    // مزامنة النماذج مع قاعدة البيانات
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // إضافة بيانات اختبارية هنا لاحقاً
    
  } catch (error) {
    console.error('Unable to initialize database:', error);
  } finally {
    await sequelize.close();
  }
};

initDatabase();