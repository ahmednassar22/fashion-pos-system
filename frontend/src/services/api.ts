import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// إنشاء instance من axios بالإعدادات الأساسية
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لمعالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// خدمات المنتجات
export const productService = {
  // جلب جميع المنتجات
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // البحث عن المنتجات
  searchProducts: async (query: string) => {
    const response = await api.get(`/products/search/${encodeURIComponent(query)}`);
    return response.data;
  },

  // جلب منتج بواسطة ID
  getProductById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // إنشاء منتج جديد
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // تحديث منتج
  updateProduct: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // حذف منتج
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// خدمات المبيعات
export const saleService = {
  // معالجة عملية بيع
  processSale: async (saleData: any) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // البحث السريع عن المنتجات
  quickSearch: async (query: string) => {
    const response = await api.get(`/sales/search/${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api;