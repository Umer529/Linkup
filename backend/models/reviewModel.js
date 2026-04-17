const { supabase: db } = require('../database/client');

const ReviewModel = {
  async findByActivity(activityId) {
    const { data, error } = await db
      .from('reviews')
      .select('*, users(id, name, avatar)')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await db.from('reviews').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id, userId) {
    const { error } = await db.from('reviews').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },
};

module.exports = ReviewModel;
