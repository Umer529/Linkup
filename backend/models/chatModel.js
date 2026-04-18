const { supabase: db } = require('../database/client');

const ChatModel = {
  async getMessages(activityId) {
    const { data, error } = await db
      .from('messages')
      .select('*, users(id, name, avatar)')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(activityId, userId, content) {
    const { data, error } = await db
      .from('messages')
      .insert({ activity_id: activityId, user_id: userId, content })
      .select('*, users(id, name, avatar)')
      .single();
    if (error) throw error;
    return data;
  },

  async isParticipant(activityId, userId) {
    // host also counts
    const { data: activity } = await db
      .from('activities')
      .select('host_id')
      .eq('id', activityId)
      .single();
    if (activity?.host_id === userId) return true;

    const { data } = await db
      .from('participants')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  },
};

module.exports = ChatModel;
