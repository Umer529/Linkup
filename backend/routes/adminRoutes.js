const { Router } = require('express');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/stats', authenticate, adminController.getStats);
router.get('/engagement', authenticate, adminController.getEngagement);
router.get('/reports', authenticate, adminController.getReports);
router.patch('/reports/:id/resolve', authenticate, adminController.resolveReport);

module.exports = router;
