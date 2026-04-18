const express = require('express');
const { startCall, getCall, endCall, sendSignal, getSignals } = require('../controllers/callController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Start a call (admin only)
router.post('/activity/:activityId/start', authenticate, startCall);

// Get active call for activity
router.get('/activity/:activityId', getCall);

// End call
router.put('/:callId/end', authenticate, endCall);

// Send signal
router.post('/:callId/signal', authenticate, sendSignal);

// Get signals for call
router.get('/:callId/signals', getSignals);

module.exports = router;