const { Router } = require('express');
const userController = require('../controllers/userController');
const activityController = require('../controllers/activityController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/:id', userController.getOne);
router.post('/', userController.create);
router.put('/:id', authenticate, userController.update);
router.get('/:id/saved', authenticate, userController.getSaved);
router.get('/:id/joined', authenticate, userController.getJoined);
router.get('/:userId/activities', activityController.getByHost);

module.exports = router;
