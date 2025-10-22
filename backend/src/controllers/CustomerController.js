const { Customer, Op } = require('../models');

const CustomerController = {
  // الحصول على جميع العملاء
  async getAllCustomers(req, res) {
    try {
      console.log('Fetching all customers...');
      const customers = await Customer.findAll({
        order: [['createdAt', 'DESC']]
      });
      console.log(`Found ${customers.length} customers`);
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // البحث عن العملاء
  async searchCustomers(req, res) {
    try {
      const { query } = req.params;
      console.log('Searching customers for:', query);
      
      const customers = await Customer.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { phone: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['name', 'ASC']]
      });
      
      console.log(`Search found ${customers.length} customers`);
      res.json(customers);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // الحصول على عميل بواسطة ID
  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // إنشاء عميل جديد
  async createCustomer(req, res) {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // تحديث عميل
  async updateCustomer(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      await customer.update(req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // حذف عميل
  async deleteCustomer(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      await customer.destroy();
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // تحديث نقاط الولاء
  async updateLoyaltyPoints(req, res) {
    try {
      const { id } = req.params;
      const { points, operation = 'add' } = req.body;
      
      const customer = await Customer.findByPk(id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      let newPoints;
      if (operation === 'add') {
        newPoints = customer.loyaltyPoints + points;
      } else if (operation === 'subtract') {
        newPoints = customer.loyaltyPoints - points;
      } else {
        newPoints = points;
      }
      
      await customer.update({ loyaltyPoints: newPoints });
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = CustomerController;