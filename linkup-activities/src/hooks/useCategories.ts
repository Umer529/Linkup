import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/lib/api';

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
