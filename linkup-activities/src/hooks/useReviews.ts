import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviews, createReview, deleteReview } from '@/lib/api';

export const useReviews = (activityId: string) =>
  useQuery({
    queryKey: ['reviews', activityId],
    queryFn: () => fetchReviews(activityId),
    enabled: !!activityId,
  });

export const useCreateReview = (activityId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      createReview(activityId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', activityId] }),
  });
};

export const useDeleteReview = (activityId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(activityId, reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', activityId] }),
  });
};
