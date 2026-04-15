const db = require('../database/client');

const CategoryModel = {
  async findAll() {
    const { data, error } = await db.from('categories').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await db.from('categories').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
};

module.exports = CategoryModel;
