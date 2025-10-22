import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, AppstoreOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>لوحة تحكم نظام نقاط البيع</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="إجمالي المبيعات اليوم"
              value={11280}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="عدد المنتجات"
              value={93}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="المبيعات النشطة"
              value={5}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="عدد العملاء"
              value={45}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="العمليات السريعة">
        <p>مرحباً بك في نظام نقاط البيع لمحلات الملابس</p>
        <p>يمكنك البدء بإدارة المنتجات أو بدء عملية بيع جديدة</p>
      </Card>
    </div>
  );
};

export default Dashboard;