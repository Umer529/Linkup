const { Router } = require('express');
const activityController = require('../controllers/activityController');
const participantController = require('../controllers/participantController');
const reviewController = require('../controllers/reviewController');
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');

const router = Router();

const activityValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isDate().withMessage('Valid date is required').custom((val) => {
    if (new Date(val) < new Date(new Date().toDateString())) throw new Error('Date cannot be in the past');
    return true;
  }),
  body('time').notEmpty().withMessage('Time is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('difficulty').optional().isIn(['easy', 'moderate', 'intense']),
  body('participant_limit').optional().isInt({ min: 2, max: 500 }),
];

router.get('/', activityController.getAll);
router.get('/:id', activityController.getOne);
router.post('/', authenticate, activityValidation, activityController.create);
router.put('/:id', authenticate, activityValidation, activityController.update);
router.delete('/:id', authenticate, activityController.remove);

// Participants
router.get('/:id/participants', activityController.getOne, participantController.getParticipants);
router.post('/:id/join', authenticate, participantController.join);
router.delete('/:id/leave', authenticate, participantController.leave);

// Save / Unsave
router.post('/:id/save', authenticate, participantController.saveActivity);
router.delete('/:id/save', authenticate, participantController.unsaveActivity);

// Reviews
router.get('/:id/reviews', reviewController.getByActivity);
router.post('/:id/reviews', authenticate, reviewController.create);
router.delete('/:id/reviews/:reviewId', authenticate, reviewController.remove);

// Chat
router.get('/:id/messages', authenticate, chatController.getMessages);
router.post('/:id/messages', authenticate, chatController.sendMessage);

module.exports = router;
