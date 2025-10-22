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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// واجهات البيانات
export interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  season: string;
  gender: string;
  barcode: string;
  isActive: boolean;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  priceModifier: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastPurchaseDate: string;
  notes: string;
}

export interface SaleData {
  items: Array<{
    productId: number;
    variantId?: number;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  paymentMethod: string;
  amountPaid: number;
  totalAmount: number;
}

// خدمات المنتجات
export const productService = {
  // جلب جميع المنتجات
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // البحث عن المنتجات
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/search/${encodeURIComponent(query)}`);
    return response.data;
  },

  // جلب منتج بواسطة ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // إنشاء منتج جديد
  createProduct: async (productData: any): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // تحديث منتج
  updateProduct: async (id: number, productData: any): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // حذف منتج
  deleteProduct: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// خدمات المبيعات
export const saleService = {
  // معالجة عملية بيع
  processSale: async (saleData: SaleData): Promise<any> => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // البحث السريع عن المنتجات
  quickSearch: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/sales/search/${encodeURIComponent(query)}`);
    return response.data;
  },
};

// خدمات العملاء
export const customerService = {
  // جلب جميع العملاء
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  // البحث عن العملاء
  searchCustomers: async (query: string): Promise<Customer[]> => {
    const response = await api.get(`/customers/search/${encodeURIComponent(query)}`);
    return response.data;
  },

  // جلب عميل بواسطة ID
  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // إنشاء عميل جديد
  createCustomer: async (customerData: any): Promise<Customer> => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // تحديث عميل
  updateCustomer: async (id: number, customerData: any): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // حذف عميل
  deleteCustomer: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // تحديث نقاط الولاء
  updateLoyaltyPoints: async (id: number, points: number, operation: string = 'add'): Promise<Customer> => {
    const response = await api.put(`/customers/${id}/loyalty`, { points, operation });
    return response.data;
  },

  // إضافة نقاط - اسم بديل لـ updateLoyaltyPoints
  addPoints: async (id: number, data: { points: number; reason?: string }): Promise<Customer> => {
    const response = await api.put(`/customers/${id}/loyalty`, { 
      points: data.points, 
      operation: 'add',
      reason: data.reason 
    });
    return response.data;
  },

  // استبدال نقاط
  redeemPoints: async (id: number, data: { points: number }): Promise<Customer> => {
    const response = await api.put(`/customers/${id}/loyalty`, { 
      points: data.points, 
      operation: 'subtract' 
    });
    return response.data;
  },
};

export default api;