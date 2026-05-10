import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchActivities,
  fetchActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  saveActivity,
  unsaveActivity,
  fetchParticipants,
  type ActivityFilters,
} from '@/lib/api';

export const useActivities = (filters: ActivityFilters = {}) =>
  useQuery({
    queryKey: ['activities', filters],
    queryFn: () => fetchActivities(filters),
  });

export const useActivity = (id: string) =>
  useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivity(id),
    enabled: !!id,
  });

export const useParticipants = (id: string) =>
  useQuery({
    queryKey: ['participants', id],
    queryFn: () => fetchParticipants(id),
    enabled: !!id,
    refetchOnMount: 'stale',
    staleTime: 0,
  });

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
};

export const useUpdateActivity = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateActivity(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['activity', id] });
    },
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
};

export const useJoinActivity = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => joinActivity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['participants', id] });
      qc.invalidateQueries({ queryKey: ['joinedActivities'] });
    },
  });
};

export const useLeaveActivity = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => leaveActivity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['participants', id] });
      qc.invalidateQueries({ queryKey: ['joinedActivities'] });
    },
  });
};

export const useSaveActivity = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saved: boolean) => (saved ? unsaveActivity(id) : saveActivity(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['savedActivities'] });
    },
  });
};
