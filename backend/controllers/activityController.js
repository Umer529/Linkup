const ActivityModel = require('../models/activityModel');
const { validationResult } = require('express-validator');

const activityController = {
  async getAll(req, res) {
    try {
      const { category, city, difficulty, search, is_public, limit, offset } = req.query;
      const data = await ActivityModel.findAll({ category, city, difficulty, search, is_public, limit: +limit || 20, offset: +offset || 0 });
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getOne(req, res) {
    try {
      const data = await ActivityModel.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Activity not found' });
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const { title, description, category, date, time, city, location,
        participant_limit, difficulty, tags, is_public, safety_instructions,
        agenda, rules, required_items } = req.body;

      const data = await ActivityModel.create({
        title, description, category, date, time, city, location,
        host_id: req.user.id,
        participant_limit: participant_limit || 10,
        difficulty: difficulty || 'easy',
        tags: tags || [],
        is_public: is_public !== undefined ? is_public : true,
        safety_instructions, agenda, rules, required_items,
      });
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    try {
      const existing = await ActivityModel.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Activity not found' });
      if (existing.host_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

      const data = await ActivityModel.update(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const existing = await ActivityModel.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Activity not found' });
      if (existing.host_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await ActivityModel.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByHost(req, res) {
    try {
      const data = await ActivityModel.findByHost(req.params.userId);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = activityController;
