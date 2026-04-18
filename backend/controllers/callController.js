const { createCall, getCallByActivity, updateCallStatus, createSignal, getSignalsByCall } = require('../models/callModel');

const startCall = async (req, res) => {
  try {
    const { activityId } = req.params;
    const hostId = req.user.id;

    // End any existing active call for this activity first
    const existing = await getCallByActivity(activityId);
    if (existing) await updateCallStatus(existing.id, 'ended');

    const call = await createCall(activityId, hostId);
    const activeCall = await updateCallStatus(call.id, 'active');
    res.status(201).json(activeCall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCall = async (req, res) => {
  try {
    const { activityId } = req.params;
    const call = await getCallByActivity(activityId);
    res.json(call || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await updateCallStatus(callId, 'ended');
    res.json(call);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendSignal = async (req, res) => {
  try {
    const { callId } = req.params;
    const { type, data } = req.body;
    const signal = await createSignal(callId, type, data);
    res.status(201).json(signal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSignals = async (req, res) => {
  try {
    const { callId } = req.params;
    const signals = await getSignalsByCall(callId);
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startCall,
  getCall,
  endCall,
  sendSignal,
  getSignals,
};