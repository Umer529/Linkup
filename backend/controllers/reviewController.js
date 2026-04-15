const ReviewModel = require('../models/reviewModel');

const reviewController = {
  async getByActivity(req, res) {
    try {
      const data = await ReviewModel.findByActivity(req.params.id);
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(422).json({ error: 'Rating must be between 1 and 5' });
      }
      const data = await ReviewModel.create({
        activity_id: req.params.id,
        user_id: req.user.id,
        rating,
        comment,
      });
      res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await ReviewModel.remove(req.params.reviewId, req.user.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = reviewController;
