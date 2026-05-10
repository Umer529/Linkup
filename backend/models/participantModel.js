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

  async getJoinedActivities(userId) {
    // Step 1: get activity IDs the user has joined
    const { data: rows, error: rowsError } = await db
      .from('participants')
      .select('activity_id')
      .eq('user_id', userId);
    if (rowsError) throw rowsError;
    if (!rows || rows.length === 0) return [];

    const activityIds = rows.map((r) => r.activity_id);

    // Step 2: fetch full activity data (same pattern as activityModel.findAll)
    const { data: acts, error: actsError } = await db
      .from('activities')
      .select('*, users(id, name, avatar)')
      .in('id', activityIds)
      .order('date', { ascending: true });
    if (actsError) throw actsError;
    return acts || [];
  },
};

module.exports = ParticipantModel;
