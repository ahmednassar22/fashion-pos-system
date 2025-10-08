const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware الأساسي
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// حدود المعدل للطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Routes الأساسية
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));

// Route للصحة العامة للتطبيق
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fashion POS API is running' });
});

// Route الأساسي
app.get('/', (req, res) => {
  res.json({ message: 'Fashion POS System API' });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// معالجة المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;