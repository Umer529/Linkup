const { supabase: db } = require('../database/client');

const ParticipantModel = {
  async join(activityId, userId) {
    const { data, error } = await db
      .from('participants')
      .insert({ activity_id: activityId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async leave(activityId, userId) {
    const { error } = await db
      .from('participants')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async getByActivity(activityId) {
    const { data, error } = await db
      .from('participants')
      .select('*, users(id, name, avatar)')
      .eq('activity_id', activityId);
    if (error) throw error;
    return data;
  },

  async isParticipant(activityId, userId) {
    const { data, error } = await db
      .from('participants')
      .select('id')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
};

module.exports = ParticipantModel;
