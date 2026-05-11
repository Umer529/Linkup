const { supabase: db } = require('../database/client');

const NotificationModel = {
  async create(payload) {
    const { data, error } = await db
      .from('notifications')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getForUser(userId, limit = 30) {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async markRead(id, userId) {
    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAllRead(userId) {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },
};

module.exports = NotificationModel;
