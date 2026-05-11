const { supabase: db } = require('../database/client');

const TABLE = 'activities';

// Returns today's date string (YYYY-MM-DD) in UTC
const todayStr = () => new Date().toISOString().split('T')[0];

// Date 7 days ago (for cleanup cutoff)
const cutoffStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

const ActivityModel = {
  async findAll({ category, city, difficulty, search, is_public, limit = 20, offset = 0 }) {
    let query = db.from(TABLE).select('*, users(id, name, avatar)');

    // Only show upcoming activities (today onwards) in the main explore listing
    query = query.gte('date', todayStr());

    if (category) query = query.eq('category', category);
    if (city) query = query.ilike('city', `%${city}%`);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (is_public !== undefined) query = query.eq('is_public', is_public);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order('date', { ascending: true }).range(offset, offset + limit - 1);

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
    const { data, error } = await db
      .from(TABLE)
      .select('*')
      .eq('host_id', hostId)
      .gte('date', todayStr())
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Delete activities whose date is more than 7 days in the past
  async deleteExpired() {
    const { error } = await db.from(TABLE).delete().lt('date', cutoffStr());
    if (error) throw error;
  },
};

module.exports = ActivityModel;
