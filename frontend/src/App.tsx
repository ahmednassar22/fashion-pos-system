import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Sales from './components/Sales/Sales';

const App: React.FC = () => {
  return (
    <ConfigProvider direction="rtl" locale={arEG}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;