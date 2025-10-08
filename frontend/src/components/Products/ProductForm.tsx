import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Table,
  message,
  Card,
  Divider,
  Typography
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface ProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (productData: any) => void;
  initialData?: any;
}

interface ProductVariant {
  id?: number;
  size: string;
  color: string;
  quantity: number;
  priceModifier: number;
  sku: string;
  key?: number;
}

const ProductForm: React.FC<ProductFormProps> = ({
  visible,
  onCancel,
  onSave,
  initialData
}) => {
  const [form] = Form.useForm();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue(initialData);
        setVariants(initialData.variants?.map((v: any, index: number) => ({
          ...v,
          key: index
        })) || []);
      } else {
        form.resetFields();
        setVariants([]);
      }
    }
  }, [visible, initialData, form]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      size: '',
      color: '',
      quantity: 0,
      priceModifier: 0,
      sku: '',
      key: Date.now()
    };
    setVariants([...variants, newVariant]);
    setEditingVariant(newVariant);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
    if (editingVariant && editingVariant.key === variants[index].key) {
      setEditingVariant(null);
    }
  };

  const generateSku = (baseSku: string, size: string, color: string) => {
    if (!baseSku || !size || !color) return '';
    return `${baseSku}-${size.toUpperCase()}-${color.toUpperCase()}`;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // التحقق من المتغيرات
      if (variants.length === 0) {
        message.warning('يرجى إضافة متغير واحد على الأقل للمنتج');
        return;
      }

      for (const variant of variants) {
        if (!variant.size || !variant.color) {
          message.warning('جميع المتغيرات يجب أن تحتوي على مقاس ولون');
          return;
        }
      }

      const productData = {
        ...values,
        variants: variants.map(v => ({
          ...v,
          sku: v.sku || generateSku(values.barcode, v.size, v.color)
        }))
      };

      onSave(productData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const variantColumns = [
    {
      title: 'المقاس',
      dataIndex: 'size',
      key: 'size',
      render: (text: string, record: ProductVariant, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateVariant(index, 'size', e.target.value)}
          placeholder="S, M, L, XL..."
        />
      ),
    },
    {
      title: 'اللون',
      dataIndex: 'color',
      key: 'color',
      render: (text: string, record: ProductVariant, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateVariant(index, 'color', e.target.value)}
          placeholder="أبيض, أسود, أزرق..."
        />
      ),
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: ProductVariant, index: number) => (
        <InputNumber
          value={text}
          onChange={(value) => updateVariant(index, 'quantity', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'تعديل السعر',
      dataIndex: 'priceModifier',
      key: 'priceModifier',
      render: (text: number, record: ProductVariant, index: number) => (
        <InputNumber
          value={text}
          onChange={(value) => updateVariant(index, 'priceModifier', value || 0)}
          formatter={value => `$ ${value}`}
          parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string, record: ProductVariant, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
          placeholder="يتم إنشاؤه تلقائياً"
        />
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (text: string, record: ProductVariant, index: number) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeVariant(index)}
          size="small"
        />
      ),
    },
  ];

  return (
    <Modal
      title={initialData ? "تعديل المنتج" : "إضافة منتج جديد"}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          إلغاء
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          حفظ المنتج
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          season: 'all',
          gender: 'unisex',
          isActive: true
        }}
      >
        <Card title="المعلومات الأساسية" size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="name"
              label="اسم المنتج"
              rules={[{ required: true, message: 'يرجى إدخال اسم المنتج' }]}
            >
              <Input placeholder="اسم المنتج" />
            </Form.Item>

            <Form.Item
              name="barcode"
              label="الباركود"
              rules={[{ required: true, message: 'يرجى إدخال الباركود' }]}
            >
              <Input placeholder="BARCODE001" />
            </Form.Item>

            <Form.Item
              name="basePrice"
              label="السعر الأساسي"
              rules={[{ required: true, message: 'يرجى إدخال السعر' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`}
                parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                placeholder="0.00"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="الفئة"
              rules={[{ required: true, message: 'يرجى إدخال الفئة' }]}
            >
              <Input placeholder="ملابس, أحذية, إكسسوارات..." />
            </Form.Item>

            <Form.Item
              name="season"
              label="الموسم"
            >
              <Select>
                <Option value="all">جميع المواسم</Option>
                <Option value="spring">ربيع</Option>
                <Option value="summer">صيف</Option>
                <Option value="autumn">خريف</Option>
                <Option value="winter">شتاء</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="gender"
              label="الجنس"
            >
              <Select>
                <Option value="unisex">مناسب للجميع</Option>
                <Option value="men">رجالي</Option>
                <Option value="women">نسائي</Option>
                <Option value="kids">أطفال</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="الوصف"
          >
            <TextArea
              rows={3}
              placeholder="وصف المنتج..."
            />
          </Form.Item>
        </Card>

        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>متغيرات المنتج (المقاسات والألوان)</span>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addVariant}>
                إضافة متغير
              </Button>
            </div>
          }
          size="small"
        >
          {variants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              لا توجد متغيرات مضافة. اضغط على "إضافة متغير" لبدء إضافة المقاسات والألوان.
            </div>
          ) : (
            <Table
              columns={variantColumns}
              dataSource={variants}
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          )}
          
          <Divider />
          
          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>ملاحظات:</strong>
            <ul>
              <li>المقاس: يمكن أن يكون S, M, L, XL أو أرقام مثل 28, 30, 32</li>
              <li>تعديل السعر: إضافة أو خصم من السعر الأساسي (يمكن أن يكون سالب)</li>
              <li>SKU: سيتم إنشاؤه تلقائياً إذا ترك فارغاً</li>
            </ul>
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProductForm;