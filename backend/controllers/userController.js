const UserModel = require('../models/userModel');
const ParticipantModel = require('../models/participantModel');

const userController = {
  async getOne(req, res) {
    try {
      const data = await UserModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'User not found' });
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, avatar, bio, interests } = req.body;
      const data = await UserModel.create({ name, avatar, bio, interests });
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      const { name, avatar, bio, interests } = req.body;
      const data = await UserModel.update(req.params.id, { name, avatar, bio, interests });
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getSaved(req, res) {
    try {
      if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      const data = await UserModel.getSavedActivities(req.params.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getJoined(req, res) {
    try {
      if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      const data = await ParticipantModel.getJoinedActivities(req.user.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;
