import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select,
  Tag,
  Popconfirm,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { productService } from '../../services/api';

const { Option } = Select;
const { Search } = Input;

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();

  // تحميل المنتجات من API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      // استخدام بيانات وهمية إذا فشل الاتصال
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'تيشيرت قطني أساسي',
          description: 'تيشيرت قطني عالي الجودة',
          basePrice: 49.99,
          category: 'ملابس',
          season: 'all',
          gender: 'unisex',
          barcode: 'TSHIRT001',
          isActive: true,
          variants: [
            { id: 1, size: 'S', color: 'أبيض', quantity: 25, priceModifier: 0, sku: 'TSHIRT001-S-WHITE' },
            { id: 2, size: 'M', color: 'أبيض', quantity: 30, priceModifier: 0, sku: 'TSHIRT001-M-WHITE' },
          ]
        }
      ];
      setProducts(mockProducts);
      message.warning('جارٍ استخدام بيانات تجريبية');
    } finally {
      setLoading(false);
    }
  };

  // البحث عن المنتجات
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      loadProducts();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await productService.searchProducts(value);
      setProducts(searchResults);
    } catch (error) {
      message.error('فشل في البحث');
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // فتح نافذة إضافة منتج
  const showAddModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // فتح نافذة تعديل منتج
  const showEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      // تحويل القيم الرقمية إذا لزم الأمر
    });
    setIsModalVisible(true);
  };

  // معالجة حفظ المنتج
  const handleSave = async (values: any) => {
    try {
      if (editingProduct) {
        // تحديث المنتج الموجود
        await productService.updateProduct(editingProduct.id, values);
        message.success('تم تحديث المنتج بنجاح');
      } else {
        // إضافة منتج جديد
        await productService.createProduct(values);
        message.success('تم إضافة المنتج بنجاح');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      loadProducts(); // إعادة تحميل القائمة
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حفظ المنتج');
    }
  };

  // حذف منتج
  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success('تم حذف المنتج بنجاح');
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حذف المنتج');
    }
  };

  // أعمدة الجدول
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
      render: (name: string, record: Product) => (
        <div>
          <div><strong>{name}</strong></div>
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
      title: 'الجنس',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        const genderMap: any = {
          'men': 'رجالي',
          'women': 'نسائي',
          'kids': 'أطفال',
          'unisex': 'مناسب للجميع'
        };
        return <Tag color="blue">{genderMap[gender] || gender}</Tag>;
      },
      width: 120,
    },
    {
      title: 'المتغيرات',
      key: 'variants',
      render: (_: any, record: Product) => (
        <div>
          {record.variants && record.variants.length > 0 ? (
            <span>{record.variants.length} متغير</span>
          ) : (
            <span style={{ color: '#999' }}>لا يوجد</span>
          )}
        </div>
      ),
      width: 100,
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
      render: (_: any, record: Product) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المنتج؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="إدارة المنتجات"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            إضافة منتج
          </Button>
        }
      >
        {/* شريط البحث والأدوات */}
        <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
          <Search
            placeholder="ابحث بالاسم أو الباركود..."
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            enterButton
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadProducts}
            loading={loading}
          >
            تحديث
          </Button>
        </div>

        {/* جدول المنتجات */}
        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={products} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* نافذة إضافة/تعديل المنتج */}
      <Modal
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="اسم المنتج"
            rules={[{ required: true, message: 'يرجى إدخال اسم المنتج' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="وصف المنتج"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="basePrice"
              label="السعر الأساسي"
              rules={[{ required: true, message: 'يرجى إدخال السعر' }]}
              style={{ flex: 1 }}
            >
              <InputNumber 
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="الفئة"
              rules={[{ required: true, message: 'يرجى إدخال الفئة' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="barcode"
              label="الباركود"
              rules={[{ required: true, message: 'يرجى إدخال الباركود' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="gender"
              label="الجنس"
              initialValue="unisex"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="men">رجالي</Option>
                <Option value="women">نسائي</Option>
                <Option value="kids">أطفال</Option>
                <Option value="unisex">مناسب للجميع</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="season"
            label="الموسم"
            initialValue="all"
          >
            <Select>
              <Option value="spring">ربيع</Option>
              <Option value="summer">صيف</Option>
              <Option value="autumn">خريف</Option>
              <Option value="winter">شتاء</Option>
              <Option value="all">جميع المواسم</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;