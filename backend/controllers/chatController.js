const ChatModel = require('../models/chatModel');

const chatController = {
  async getMessages(req, res) {
    try {
      const allowed = await ChatModel.isParticipant(req.params.id, req.user.id);
      if (!allowed) return res.status(403).json({ error: 'Not a participant' });
      const data = await ChatModel.getMessages(req.params.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendMessage(req, res) {
    try {
      const allowed = await ChatModel.isParticipant(req.params.id, req.user.id);
      if (!allowed) return res.status(403).json({ error: 'Not a participant' });
      const { content } = req.body;
      if (!content?.trim()) return res.status(422).json({ error: 'Content is required' });
      const data = await ChatModel.create(req.params.id, req.user.id, content.trim());
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = chatController;
