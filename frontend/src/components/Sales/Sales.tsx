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
  message,
  Spin
} from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  BarcodeOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  DollarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { productService, saleService } from '../../services/api';

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
  const [loading, setLoading] = useState(false);
  const [processingSale, setProcessingSale] = useState(false);
  const [paymentForm] = Form.useForm();

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
      message.error('فشل في تحميل المنتجات');
      console.error('Error loading products:', error);
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

  // إضافة منتج إلى السلة
  const addToCart = (product: Product, variant?: ProductVariant) => {
    // التحقق من توفر المخزون
    if (variant && variant.quantity <= 0) {
      message.warning('هذا المتغير غير متوفر في المخزون');
      return;
    }

    const finalPrice = product.basePrice + (variant?.priceModifier || 0);
    
    const existingItemIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      item.variant?.id === variant?.id
    );

    if (existingItemIndex > -1) {
      // التحقق من توفر الكمية الإضافية
      const currentItem = cart[existingItemIndex];
      const newQuantity = currentItem.quantity + 1;
      
      if (variant && newQuantity > variant.quantity) {
        message.warning(`الكمية المتاحة: ${variant.quantity} فقط`);
        return;
      }

      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = newQuantity;
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

    const item = cart[index];
    if (item.variant && newQuantity > item.variant.quantity) {
      message.warning(`الكمية المتاحة: ${item.variant.quantity} فقط`);
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
  const handlePayment = async (values: any) => {
    setProcessingSale(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.product.id,
          variantId: item.variant?.id,
          productName: item.product.name,
          price: item.price,
          quantity: item.quantity,
          size: item.variant?.size,
          color: item.variant?.color
        })),
        paymentMethod: values.paymentMethod,
        amountPaid: values.amountPaid,
        totalAmount: calculateTotal()
      };

      const result = await saleService.processSale(saleData);
      
      message.success(`تمت عملية البيع بنجاح! رقم الإيصال: ${result.receiptNumber}`);
      setIsPaymentModalVisible(false);
      setCart([]);
      
      // إعادة تحميل المنتجات لتحديث المخزون
      loadProducts();
      
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في معالجة البيع');
    } finally {
      setProcessingSale(false);
    }
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
              onSearch={handleSearch}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
              enterButton
            />
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button icon={<BarcodeOutlined />} type="dashed" style={{ flex: 1 }}>
                مسح باركود
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadProducts}
                loading={loading}
              >
                تحديث
              </Button>
            </div>

            <Divider>المنتجات المتاحة</Divider>

            <Spin spinning={loading}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {products.map(product => (
                  <Card 
                    key={product.id} 
                    size="small" 
                    style={{ marginBottom: '8px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{product.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {product.category} - ${product.basePrice.toFixed(2)}
                        </div>
                        {product.description && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                            {product.description}
                          </div>
                        )}
                      </div>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => addToCart(product)}
                      >
                        إضافة
                      </Button>
                    </div>
                    
                    {/* عرض المتغيرات إذا كانت موجودة */}
                    {product.variants && product.variants.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>
                          المتغيرات المتاحة:
                        </div>
                        <Space wrap>
                          {product.variants.map(variant => (
                            <Button 
                              key={variant.id}
                              size="small"
                              type={variant.quantity > 0 ? "default" : "dashed"}
                              danger={variant.quantity <= 0}
                              onClick={() => addToCart(product, variant)}
                              title={`المخزون: ${variant.quantity}`}
                            >
                              {variant.size} - {variant.color}
                              {variant.quantity <= 0 && ' (غير متوفر)'}
                            </Button>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Spin>
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
            locale={{ emptyText: 'السلة فارغة' }}
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
        confirmLoading={processingSale}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
          initialValues={{
            amountPaid: calculateTotal()
          }}
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
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={processingSale}
            >
              {processingSale ? 'جاري المعالجة...' : 'تأكيد العملية'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;