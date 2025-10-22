import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Sales from './components/Sales/Sales';
import Customers from './components/Customers/Customers';

const App: React.FC = () => {
  return (
    <ConfigProvider 
      direction="rtl" 
      locale={arEG}
      theme={{
        token: {
          fontFamily: 'Tahoma, Arial, sans-serif',
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div dir="rtl" style={{ minHeight: '100vh', fontFamily: 'Tahoma, Arial, sans-serif' }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/customers" element={<Customers />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </ConfigProvider>
  );
};

export default App;