const { Router } = require('express');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', authenticate, notificationController.getAll);
router.patch('/read-all', authenticate, notificationController.markAllRead);
router.patch('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
