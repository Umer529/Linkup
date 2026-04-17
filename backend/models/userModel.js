const { supabase: db } = require('../database/client');

const TABLE = 'users';

const UserModel = {
  async findById(id) {
    const { data, error } = await db
      .from(TABLE)
      .select('*, reviews(id, rating, comment, created_at, activities(title))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await db.from(TABLE).insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await db.from(TABLE).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getSavedActivities(userId) {
    const { data, error } = await db
      .from('saved_activities')
      .select('*, activities(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map((r) => r.activities);
  },
};

module.exports = UserModel;
