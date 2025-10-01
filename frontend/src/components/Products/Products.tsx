import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  barcode: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // TODO: استبدال هذا بطلب API حقيقي
      // const response = await fetch('http://localhost:3001/api/products');
      // const data = await response.json();
      
      // بيانات تجريبية مؤقتة
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'تيشيرت قطني أساسي',
          description: 'تيشيرت قطني عالي الجودة',
          basePrice: 49.99,
          category: 'ملابس',
          barcode: 'TSHIRT001'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      message.error('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'اسم المنتج',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'السعر',
      dataIndex: 'basePrice',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button size="small">تعديل</Button>
          <Button size="small" danger>حذف</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="إدارة المنتجات" 
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          إضافة منتج
        </Button>
      }
    >
      <Table 
        columns={columns} 
        dataSource={products} 
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
};

export default Products;