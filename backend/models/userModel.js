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
    // Step 1: get saved activity IDs
    const { data: rows, error: rowsError } = await db
      .from('saved_activities')
      .select('activity_id')
      .eq('user_id', userId);
    if (rowsError) throw rowsError;
    if (!rows || rows.length === 0) return [];

    const activityIds = rows.map((r) => r.activity_id);

    // Step 2: fetch full activity data including host
    const { data: acts, error: actsError } = await db
      .from('activities')
      .select('*, users(id, name, avatar)')
      .in('id', activityIds)
      .order('date', { ascending: true });
    if (actsError) throw actsError;
    return acts || [];
  },
};

module.exports = UserModel;
