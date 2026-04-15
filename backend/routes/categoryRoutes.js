const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', categoryController.getAll);
router.post('/', authenticate, categoryController.create);

module.exports = router;
