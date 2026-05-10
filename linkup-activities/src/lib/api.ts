import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────
export const sendOtp = (email: string) =>
  api.post('/auth/send-otp', { email }).then((r) => r.data);

export const verifyOtp = (email: string, token: string) =>
  api.post('/auth/verify-otp', { email, token }).then((r) => r.data);

export const refreshToken = (refresh_token: string) =>
  api.post('/auth/refresh', { refresh_token }).then((r) => r.data);

export const fetchMe = () =>
  api.get('/auth/me').then((r) => r.data.data);

// Google OAuth — handled entirely client-side via Supabase JS
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ── Activities ──────────────────────────────────────────────
export interface ActivityFilters {
  category?: string;
  city?: string;
  difficulty?: string;
  search?: string;
  is_public?: boolean;
  limit?: number;
  offset?: number;
}

export const fetchActivities = (filters: ActivityFilters = {}) =>
  api.get('/activities', { params: filters }).then((r) => r.data.data);

export const fetchActivity = (id: string) =>
  api.get(`/activities/${id}`).then((r) => r.data.data);

export const createActivity = (payload: Record<string, unknown>) =>
  api.post('/activities', payload).then((r) => r.data.data);

export const updateActivity = (id: string, payload: Record<string, unknown>) =>
  api.put(`/activities/${id}`, payload).then((r) => r.data.data);

export const deleteActivity = (id: string) =>
  api.delete(`/activities/${id}`);

// ── Participants ─────────────────────────────────────────────
export const joinActivity = (id: string) =>
  api.post(`/activities/${id}/join`).then((r) => r.data.data);

export const leaveActivity = (id: string) =>
  api.delete(`/activities/${id}/leave`);

export const saveActivity = (id: string) =>
  api.post(`/activities/${id}/save`).then((r) => r.data.data);

export const unsaveActivity = (id: string) =>
  api.delete(`/activities/${id}/save`);

export const fetchParticipants = (id: string) =>
  api.get(`/activities/${id}/participants`).then((r) => r.data.data);

// ── Reviews ──────────────────────────────────────────────────
export const fetchReviews = (activityId: string) =>
  api.get(`/activities/${activityId}/reviews`).then((r) => r.data.data);

export const createReview = (activityId: string, payload: { rating: number; comment: string }) =>
  api.post(`/activities/${activityId}/reviews`, payload).then((r) => r.data.data);

export const deleteReview = (activityId: string, reviewId: string) =>
  api.delete(`/activities/${activityId}/reviews/${reviewId}`);

// ── Categories ───────────────────────────────────────────────
export const fetchCategories = () =>
  api.get('/categories').then((r) => r.data.data);

// ── Users ────────────────────────────────────────────────────
export const fetchUser = (id: string) =>
  api.get(`/users/${id}`).then((r) => r.data.data);

export const updateUser = (id: string, payload: Record<string, unknown>) =>
  api.put(`/users/${id}`, payload).then((r) => r.data.data);

export const fetchUserActivities = (userId: string) =>
  api.get(`/users/${userId}/activities`).then((r) => r.data.data);

export const fetchSavedActivities = (userId: string) =>
  api.get(`/users/${userId}/saved`).then((r) => r.data.data);

export const fetchJoinedActivities = (userId: string) =>
  api.get(`/users/${userId}/joined`).then((r) => r.data.data);

// ── Chat ─────────────────────────────────────────────────────
export const fetchMessages = (activityId: string) =>
  api.get(`/activities/${activityId}/messages`).then((r) => r.data.data);

export const sendMessage = (activityId: string, content: string) =>
  api.post(`/activities/${activityId}/messages`, { content }).then((r) => r.data.data);

// ── Calls ───────────────────────────────────────────────────
export const startCall = (activityId: string) =>
  api.post(`/calls/activity/${activityId}/start`).then((r) => r.data);

export const getCall = (activityId: string) =>
  api.get(`/calls/activity/${activityId}`).then((r) => r.data);

export const endCall = (callId: string) =>
  api.put(`/calls/${callId}/end`).then((r) => r.data);

export const sendSignal = (callId: string, type: string, data: any) =>
  api.post(`/calls/${callId}/signal`, { type, data }).then((r) => r.data);

export const getSignals = (callId: string) =>
  api.get(`/calls/${callId}/signals`).then((r) => r.data);

export default api;
