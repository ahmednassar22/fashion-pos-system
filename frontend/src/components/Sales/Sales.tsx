import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Table, 
  Space, 
  InputNumber, 
  Divider,
  Typography,
  Modal,
  Form,
  Select,
  message
} from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  BarcodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  barcode: string;
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

interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();

  // تحميل المنتجات (سيتم استبدال هذا بطلب API حقيقي)
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // TODO: استبدال بطلب API حقيقي
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'تيشيرت قطني أساسي',
          description: 'تيشيرت قطني عالي الجودة',
          basePrice: 49.99,
          category: 'ملابس',
          barcode: 'TSHIRT001',
          variants: [
            { id: 1, size: 'S', color: 'أبيض', quantity: 25, priceModifier: 0, sku: 'TSHIRT001-S-WHITE' },
            { id: 2, size: 'M', color: 'أبيض', quantity: 30, priceModifier: 0, sku: 'TSHIRT001-M-WHITE' },
            { id: 3, size: 'L', color: 'أسود', quantity: 20, priceModifier: 5, sku: 'TSHIRT001-L-BLACK' }
          ]
        },
        {
          id: 2,
          name: 'جينز ريلاكسد',
          description: 'جينز مريح ومناسب للارتداء اليومي',
          basePrice: 129.99,
          category: 'ملابس',
          barcode: 'JEANS001',
          variants: [
            { id: 4, size: '28', color: 'أزرق', quantity: 15, priceModifier: 0, sku: 'JEANS001-28-BLUE' },
            { id: 5, size: '30', color: 'أزرق', quantity: 20, priceModifier: 0, sku: 'JEANS001-30-BLUE' }
          ]
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      message.error('فشل في تحميل المنتجات');
    }
  };

  // البحث عن المنتجات
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  // إضافة منتج إلى السلة
  const addToCart = (product: Product, variant?: ProductVariant) => {
    const finalPrice = product.basePrice + (variant?.priceModifier || 0);
    
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      item.variant?.id === variant?.id
    );

    if (existingItemIndex > -1) {
      // زيادة الكمية إذا المنتج موجود
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // إضافة عنصر جديد
      const newItem: CartItem = {
        product,
        variant,
        quantity: 1,
        price: finalPrice
      };
      setCart([...cart, newItem]);
    }
    
    message.success('تمت إضافة المنتج إلى السلة');
  };

  // تحديث كمية العنصر في السلة
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  // إزالة عنصر من السلة
  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  // حساب الإجمالي
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // معالجة الدفع
  const handlePayment = (values: any) => {
    console.log('قيم الدفع:', values);
    message.success('تمت عملية البيع بنجاح!');
    setIsPaymentModalVisible(false);
    setCart([]); // تفريغ السلة بعد البيع
  };

  // أعمدة جدول السلة
  const cartColumns = [
    {
      title: 'المنتج',
      dataIndex: 'product',
      key: 'product',
      render: (product: Product, record: CartItem) => (
        <div>
          <div><strong>{product.name}</strong></div>
          {record.variant && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.variant.size} - {record.variant.color}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'الكمية',
      key: 'quantity',
      render: (_: any, record: CartItem, index: number) => (
        <Space>
          <Button 
            size="small" 
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(index, record.quantity - 1)}
          />
          <InputNumber 
            min={1} 
            value={record.quantity}
            onChange={(value) => updateQuantity(index, value || 1)}
            style={{ width: 60 }}
          />
          <Button 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(index, record.quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: 'المجموع',
      key: 'total',
      render: (_: any, record: CartItem) => `$${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, __: CartItem, index: number) => (
        <Button 
          danger 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(index)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>نقطة البيع</Title>
      
      <div style={{ display: 'flex', gap: '24px', height: '70vh' }}>
        {/* العمود الأيسر: البحث وعرض المنتجات */}
        <Card style={{ flex: 1 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Search
              placeholder="ابحث بالاسم أو الباركود..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
            
            <Button icon={<BarcodeOutlined />} type="dashed" block>
              مسح باركود
            </Button>

            <Divider>المنتجات المتاحة</Divider>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  size="small" 
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                  onClick={() => addToCart(product)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{product.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {product.category} - ${product.basePrice.toFixed(2)}
                      </div>
                    </div>
                    <Button type="primary" size="small">
                      إضافة
                    </Button>
                  </div>
                  
                  {/* عرض المتغيرات إذا كانت موجودة */}
                  {product.variants && product.variants.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <Space wrap>
                        {product.variants.map(variant => (
                          <Button 
                            key={variant.id}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, variant);
                            }}
                          >
                            {variant.size} - {variant.color}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Space>
        </Card>

        {/* العمود الأيمن: سلة التسوق */}
        <Card style={{ flex: 1 }}>
          <Title level={4}>سلة التسوق</Title>
          
          <Table 
            columns={cartColumns}
            dataSource={cart.map((item, index) => ({ ...item, key: index }))}
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>الإجمالي: ${calculateTotal().toFixed(2)}</Title>
            
            <Space>
              <Button 
                type="primary" 
                size="large"
                icon={<DollarOutlined />}
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalVisible(true)}
              >
                معالجة الدفع
              </Button>
              
              <Button 
                size="large"
                icon={<PrinterOutlined />}
                disabled={cart.length === 0}
              >
                طباعة الفاتورة
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      {/* نافذة الدفع */}
      <Modal
        title="معالجة الدفع"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
        >
          <Form.Item label="المبلغ المستحق" style={{ marginBottom: 8 }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              ${calculateTotal().toFixed(2)}
            </Title>
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="طريقة الدفع"
            rules={[{ required: true, message: 'يرجى اختيار طريقة الدفع' }]}
          >
            <Select placeholder="اختر طريقة الدفع">
              <Option value="cash">نقداً</Option>
              <Option value="card">بطاقة ائتمان</Option>
              <Option value="stc-pay">STC Pay</Option>
              <Option value="apple-pay">Apple Pay</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amountPaid"
            label="المبلغ المدفوع"
            rules={[{ required: true, message: 'يرجى إدخال المبلغ المدفوع' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              min={calculateTotal()}
              defaultValue={calculateTotal()}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              تأكيد العملية
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;