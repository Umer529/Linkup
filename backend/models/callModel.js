const { supabase } = require('../database/client');

const createCall = async (activityId, hostId) => {
  const { data, error } = await supabase
    .from('calls')
    .insert({ activity_id: activityId, host_id: hostId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getCallByActivity = async (activityId) => {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('activity_id', activityId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
};

const updateCallStatus = async (callId, status) => {
  const { data, error } = await supabase
    .from('calls')
    .update({ status })
    .eq('id', callId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const createSignal = async (callId, type, data) => {
  const { data: signal, error } = await supabase
    .from('signals')
    .insert({ call_id: callId, type, data })
    .select()
    .single();
  if (error) throw error;
  return signal;
};

const getSignalsByCall = async (callId) => {
  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .eq('call_id', callId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

module.exports = {
  createCall,
  getCallByActivity,
  updateCallStatus,
  createSignal,
  getSignalsByCall,
};