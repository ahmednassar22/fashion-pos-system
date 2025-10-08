import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { productService } from '../../services/api';
import ProductForm from './ProductForm';

interface Product {
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

interface ProductVariant {
  id: number;
  size: string;
  color: string;
  quantity: number;
  priceModifier: number;
  sku: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      message.error('فشل في تحميل المنتجات');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productData: any) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        message.success('تم تحديث المنتج بنجاح');
      } else {
        await productService.createProduct(productData);
        message.success('تم إضافة المنتج بنجاح');
      }
      
      setFormVisible(false);
      setEditingProduct(null);
      loadProducts(); // إعادة تحميل المنتجات
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حفظ المنتج');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success('تم حذف المنتج بنجاح');
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حذف المنتج');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormVisible(true);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingProduct(null);
  };

  const getTotalStock = (variants: ProductVariant[] = []) => {
    return variants.reduce((total, variant) => total + variant.quantity, 0);
  };

  const getVariantsCount = (variants: ProductVariant[] = []) => {
    return variants.length;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'اسم المنتج',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.barcode}</div>
        </div>
      ),
    },
    {
      title: 'السعر',
      dataIndex: 'basePrice',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      width: 100,
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'المتغيرات',
      key: 'variants',
      render: (record: Product) => (
        <div>
          <Tag color="blue">{getVariantsCount(record.variants)} متغير</Tag>
        </div>
      ),
      width: 120,
    },
    {
      title: 'المخزون',
      key: 'stock',
      render: (record: Product) => (
        <div>
          <Tag color={getTotalStock(record.variants) > 0 ? 'green' : 'red'}>
            {getTotalStock(record.variants)} قطعة
          </Tag>
        </div>
      ),
      width: 120,
    },
    {
      title: 'الحالة',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
      width: 80,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (text: string, record: Product) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المنتج؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="إدارة المنتجات" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            إضافة منتج جديد
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={products} 
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      <ProductForm
        visible={formVisible}
        onCancel={handleFormCancel}
        onSave={handleSave}
        initialData={editingProduct}
      />
    </div>
  );
};

export default Products;