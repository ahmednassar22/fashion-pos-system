import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, message, Tag, Popconfirm, 
  Input, Modal, Form, InputNumber, Select, Row, Col 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, GiftOutlined 
} from '@ant-design/icons';
import { customerService, Customer } from '../../services/api';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pointsForm] = Form.useForm();
  const [customerForm] = Form.useForm();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customersData = await customerService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      message.error('فشل في تحميل العملاء');
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      loadCustomers();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await customerService.searchCustomers(value);
      setCustomers(searchResults);
    } catch (error) {
      message.error('فشل في البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerModalVisible(true);
    customerForm.resetFields();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerModalVisible(true);
    customerForm.setFieldsValue({
      ...customer,
      // تحويل التاريخ إذا كان موجوداً
      lastPurchaseDate: customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate) : null
    });
  };

  const handleSaveCustomer = async (values: any) => {
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, values);
        message.success('تم تحديث بيانات العميل بنجاح');
      } else {
        await customerService.createCustomer(values);
        message.success('تم إضافة العميل بنجاح');
      }
      
      setCustomerModalVisible(false);
      customerForm.resetFields();
      loadCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حفظ بيانات العميل');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      await customerService.deleteCustomer(id);
      message.success('تم حذف العميل بنجاح');
      loadCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في حذف العميل');
    }
  };

  const handleAddPoints = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPointsModalVisible(true);
    pointsForm.setFieldsValue({
      points: 10,
      type: 'add',
      reason: ''
    });
  };

  const handlePointsSubmit = async (values: any) => {
    if (!selectedCustomer) return;

    try {
      if (values.type === 'add') {
        await customerService.addPoints(selectedCustomer.id, {
          points: values.points,
          reason: values.reason
        });
        message.success(`تم إضافة ${values.points} نقطة للعميل`);
      } else {
        await customerService.redeemPoints(selectedCustomer.id, {
          points: values.points
        });
        message.success(`تم استبدال ${values.points} نقطة`);
      }

      setPointsModalVisible(false);
      pointsForm.resetFields();
      loadCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'فشل في تحديث النقاط');
    }
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 200) return { text: 'مميز', color: 'gold' };
    if (points >= 100) return { text: 'نشط', color: 'blue' };
    return { text: 'عادي', color: 'green' };
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'اسم العميل',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Customer) => (
        <div>
          <div><strong>{text}</strong></div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'نقاط الولاء',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points: number) => (
        <Tag color={getLoyaltyLevel(points).color}>
          {points} نقطة
        </Tag>
      ),
    },
    {
      title: 'المستوى',
      key: 'level',
      render: (record: Customer) => {
        const level = getLoyaltyLevel(record.loyaltyPoints);
        return <Tag color={level.color}>{level.text}</Tag>;
      },
    },
    {
      title: 'إجمالي المشتريات',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'آخر شراء',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('ar-SA') : '-',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (text: string, record: Customer) => (
        <Space>
          <Button 
            size="small" 
            icon={<GiftOutlined />}
            onClick={() => handleAddPoints(record)}
          >
            نقاط
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditCustomer(record)}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا العميل؟"
            onConfirm={() => handleDeleteCustomer(record.id)}
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
        title="إدارة العملاء" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>
            إضافة عميل جديد
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="ابحث باسم العميل أو الهاتف..."
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            enterButton
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={customers} 
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* نافذة إضافة/تعديل عميل */}
      <Modal
        title={editingCustomer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
        open={customerModalVisible}
        onCancel={() => {
          setCustomerModalVisible(false);
          customerForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleSaveCustomer}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="اسم العميل"
                rules={[{ required: true, message: 'يرجى إدخال اسم العميل' }]}
              >
                <Input placeholder="اسم العميل" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="رقم الهاتف"
              >
                <Input placeholder="05XXXXXXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="ملاحظات"
          >
            <TextArea 
              rows={4}
              placeholder="ملاحظات عن العميل..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setCustomerModalVisible(false);
                  customerForm.resetFields();
                }}
              >
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'تحديث' : 'إضافة'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* نافذة إدارة النقاط */}
      <Modal
        title={`إدارة نقاط العميل: ${selectedCustomer?.name}`}
        open={pointsModalVisible}
        onCancel={() => {
          setPointsModalVisible(false);
          pointsForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={pointsForm}
          layout="vertical"
          onFinish={handlePointsSubmit}
          initialValues={{ type: 'add' }}
        >
          <Form.Item
            name="type"
            label="نوع العملية"
            rules={[{ required: true, message: 'يرجى اختيار نوع العملية' }]}
          >
            <Select>
              <Option value="add">إضافة نقاط</Option>
              <Option value="redeem">استبدال نقاط</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="عدد النقاط"
            rules={[{ required: true, message: 'يرجى إدخال عدد النقاط' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              min={1}
              placeholder="أدخل عدد النقاط"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="السبب (اختياري)"
          >
            <Input.TextArea 
              rows={3}
              placeholder="سبب إضافة النقاط..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button 
                onClick={() => {
                  setPointsModalVisible(false);
                  pointsForm.resetFields();
                }}
              >
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit">
                تأكيد العملية
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;