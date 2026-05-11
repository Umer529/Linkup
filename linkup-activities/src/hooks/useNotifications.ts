import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: fetchNotifications,
    enabled: !!user?.id,
    refetchInterval: 30000,
    staleTime: 0,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
};
