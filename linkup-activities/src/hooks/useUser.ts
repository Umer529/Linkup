import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, updateUser, fetchUserActivities, fetchSavedActivities } from '@/lib/api';

export const useUser = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });

export const useUserActivities = (userId: string) =>
  useQuery({
    queryKey: ['userActivities', userId],
    queryFn: () => fetchUserActivities(userId),
    enabled: !!userId,
  });

export const useSavedActivities = (userId: string) =>
  useQuery({
    queryKey: ['savedActivities', userId],
    queryFn: () => fetchSavedActivities(userId),
    enabled: !!userId,
  });

export const useUpdateUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }),
  });
};
