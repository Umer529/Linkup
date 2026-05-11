const NotificationModel = require('../models/notificationModel');

const notificationController = {
  async getAll(req, res) {
    try {
      const data = await NotificationModel.getForUser(req.user.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async markRead(req, res) {
    try {
      const data = await NotificationModel.markRead(req.params.id, req.user.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async markAllRead(req, res) {
    try {
      await NotificationModel.markAllRead(req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = notificationController;
