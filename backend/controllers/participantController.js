const ParticipantModel = require('../models/participantModel');
const ActivityModel = require('../models/activityModel');
const { supabase: db } = require('../database/client');

const participantController = {
  async join(req, res) {
    try {
      const activity = await ActivityModel.findById(req.params.id);
      if (!activity) return res.status(404).json({ error: 'Activity not found' });
      if (activity.current_participants >= activity.participant_limit) {
        return res.status(409).json({ error: 'Activity is full' });
      }
      const already = await ParticipantModel.isParticipant(req.params.id, req.user.id);
      if (already) return res.status(409).json({ error: 'Already joined' });

      const data = await ParticipantModel.join(req.params.id, req.user.id);
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async leave(req, res) {
    try {
      await ParticipantModel.leave(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getParticipants(req, res) {
    try {
      const data = await ParticipantModel.getByActivity(req.params.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveActivity(req, res) {
    try {
      const { data, error } = await db
        .from('saved_activities')
        .insert({ activity_id: req.params.id, user_id: req.user.id })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async unsaveActivity(req, res) {
    try {
      const { error } = await db
        .from('saved_activities')
        .delete()
        .eq('activity_id', req.params.id)
        .eq('user_id', req.user.id);
      if (error) throw error;
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = participantController;
