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
  Spin,
  Tag,
  Alert
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
  ReloadOutlined,
  UserOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { productService, saleService, customerService, Customer, Product } from '../../services/api';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CartItem {
  product: Product;
  variant?: any;
  quantity: number;
  price: number;
}

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [processingSale, setProcessingSale] = useState(false);
  const [paymentForm] = Form.useForm();
  const [customerForm] = Form.useForm();

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      message.error('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await customerService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleCustomerSearch = async (value: string) => {
    setCustomerSearchQuery(value);
    if (!value.trim()) {
      loadCustomers();
      return;
    }

    setCustomerLoading(true);
    try {
      const searchResults = await customerService.searchCustomers(value);
      setCustomers(searchResults);
    } catch (error) {
      message.error('فشل في البحث عن العملاء');
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleAddCustomer = async (values: any) => {
    try {
      const newCustomer = await customerService.createCustomer(values);
      message.success('تم إضافة العميل بنجاح');
      setIsCustomerModalVisible(false);
      customerForm.resetFields();
      setSelectedCustomer(newCustomer);
      loadCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في إضافة العميل');
    }
  };

  const addToCart = (product: Product, variant?: any) => {
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

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!selectedCustomer) return 0;
    
    // خصم 5% للعملاء المميزين (200+ نقطة)
    if (selectedCustomer.loyaltyPoints >= 200) {
      return calculateTotal() * 0.05;
    }
    
    // خصم 2% للعملاء النشطين (100+ نقطة)
    if (selectedCustomer.loyaltyPoints >= 100) {
      return calculateTotal() * 0.02;
    }
    
    return 0;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateDiscount();
  };

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
        totalAmount: calculateFinalTotal(),
        customerId: selectedCustomer?.id || null
      };

      const result = await saleService.processSale(saleData);
      
      // تحديث نقاط الولاء إذا كان هناك عميل
      if (selectedCustomer) {
        const pointsEarned = Math.floor(calculateFinalTotal() / 10); // نقطة لكل 10 دولار
        await customerService.addPoints(selectedCustomer.id, {
          points: pointsEarned,
          reason: `شراء بقيمة $${calculateFinalTotal().toFixed(2)}`
        });
      }
      
      let successMessage = `تمت عملية البيع بنجاح! رقم الإيصال: ${result.receiptNumber}`;
      if (selectedCustomer) {
        const pointsEarned = Math.floor(calculateFinalTotal() / 10);
        successMessage += ` - تم إضافة ${pointsEarned} نقطة للعميل`;
      }
      
      message.success(successMessage);
      setIsPaymentModalVisible(false);
      setCart([]);
      setSelectedCustomer(null);
      
      loadProducts();
      loadCustomers();
      
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في معالجة البيع');
    } finally {
      setProcessingSale(false);
    }
  };

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
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="ابحث بالاسم أو الباركود..."
                prefix={<SearchOutlined />}
                onSearch={(value) => {
                  if (!value.trim()) {
                    loadProducts();
                    return;
                  }
                  setLoading(true);
                  productService.searchProducts(value)
                    .then(setProducts)
                    .catch(() => message.error('فشل في البحث'))
                    .finally(() => setLoading(false));
                }}
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
            </Space>
          </Card>

          <Card title="المنتجات المتاحة" style={{ flex: 1, overflow: 'auto' }}>
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
          </Card>
        </div>

        {/* العمود الأيمن: العملاء وسلة التسوق */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="إدارة العملاء">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="ابحث عن عميل..."
                prefix={<SearchOutlined />}
                onSearch={handleCustomerSearch}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                loading={customerLoading}
                style={{ width: '100%' }}
              />
              
              <Button 
                icon={<UserAddOutlined />} 
                onClick={() => setIsCustomerModalVisible(true)}
                block
              >
                إضافة عميل جديد
              </Button>

              {selectedCustomer && (
                <Alert
                  message={
                    <div>
                      <strong>العميل المحدد:</strong> {selectedCustomer.name}
                      <br />
                      <span>نقاط الولاء: {selectedCustomer.loyaltyPoints}</span>
                      {selectedCustomer.loyaltyPoints >= 200 && (
                        <Tag color="gold" style={{ marginRight: '8px' }}>مميز (خصم 5%)</Tag>
                      )}
                      {selectedCustomer.loyaltyPoints >= 100 && selectedCustomer.loyaltyPoints < 200 && (
                        <Tag color="blue" style={{ marginRight: '8px' }}>نشط (خصم 2%)</Tag>
                      )}
                    </div>
                  }
                  type="success"
                  action={
                    <Button 
                      size="small" 
                      onClick={() => setSelectedCustomer(null)}
                    >
                      إلغاء
                    </Button>
                  }
                />
              )}

              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {customers.map(customer => (
                  <Card 
                    key={customer.id}
                    size="small" 
                    style={{ 
                      marginBottom: '4px',
                      cursor: 'pointer',
                      border: selectedCustomer?.id === customer.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div>
                      <strong>{customer.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {customer.phone} - {customer.loyaltyPoints} نقطة
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Space>
          </Card>

          <Card title="سلة التسوق" style={{ flex: 1 }}>
            <Table 
              columns={cartColumns}
              dataSource={cart.map((item, index) => ({ ...item, key: index }))}
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
              locale={{ emptyText: 'السلة فارغة' }}
            />
            
            <Divider />
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>الإجمالي: ${calculateTotal().toFixed(2)}</strong>
              </div>
              
              {selectedCustomer && calculateDiscount() > 0 && (
                <div style={{ marginBottom: '8px', color: '#52c41a' }}>
                  <strong>الخصم: ${calculateDiscount().toFixed(2)}</strong>
                </div>
              )}
              
              <Title level={3} style={{ margin: '8px 0', color: '#1890ff' }}>
                المبلغ النهائي: ${calculateFinalTotal().toFixed(2)}
              </Title>
              
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
          initialValues={{
            amountPaid: calculateFinalTotal()
          }}
        >
          {selectedCustomer && (
            <Form.Item label="العميل">
              <Alert
                message={selectedCustomer.name}
                description={`نقاط الولاء: ${selectedCustomer.loyaltyPoints}`}
                type="info"
              />
            </Form.Item>
          )}

          <Form.Item label="المبلغ المستحق">
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              ${calculateFinalTotal().toFixed(2)}
            </Title>
            {calculateDiscount() > 0 && (
              <div style={{ color: '#52c41a', fontSize: '14px' }}>
                شامل خصم ${calculateDiscount().toFixed(2)}
              </div>
            )}
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
              min={calculateFinalTotal()}
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

      {/* نافذة إضافة عميل */}
      <Modal
        title="إضافة عميل جديد"
        open={isCustomerModalVisible}
        onCancel={() => {
          setIsCustomerModalVisible(false);
          customerForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleAddCustomer}
        >
          <Form.Item
            name="name"
            label="اسم العميل"
            rules={[{ required: true, message: 'يرجى إدخال اسم العميل' }]}
          >
            <Input placeholder="اسم العميل" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="رقم الهاتف"
          >
            <Input placeholder="05XXXXXXXX" />
          </Form.Item>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[{ type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setIsCustomerModalVisible(false);
                  customerForm.resetFields();
                }}
              >
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                إضافة العميل
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;