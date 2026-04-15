const CategoryModel = require('../models/categoryModel');

const categoryController = {
  async getAll(req, res) {
    try {
      const data = await CategoryModel.findAll();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, icon, color } = req.body;
      if (!name) return res.status(422).json({ error: 'Name is required' });
      const data = await CategoryModel.create({ name, icon, color });
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = categoryController;
