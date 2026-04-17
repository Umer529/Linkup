const { supabase: db } = require('../database/client');

const TABLE = 'activities';

const ActivityModel = {
  async findAll({ category, city, difficulty, search, is_public, limit = 20, offset = 0 }) {
    let query = db.from(TABLE).select('*, users(id, name, avatar)');

    if (category) query = query.eq('category', category);
    if (city) query = query.ilike('city', `%${city}%`);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (is_public !== undefined) query = query.eq('is_public', is_public);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await db
      .from(TABLE)
      .select('*, users(id, name, avatar)')
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

  async remove(id) {
    const { error } = await db.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async findByHost(hostId) {
    const { data, error } = await db.from(TABLE).select('*').eq('host_id', hostId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

module.exports = ActivityModel;
