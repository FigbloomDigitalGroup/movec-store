import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Cart } from '../types';

/**
 * The authenticated user's server-side cart. Shared by the navbar badge, the
 * cart page, and checkout so the fetch/queryKey only exists in one place —
 * React Query dedupes the underlying request across every consumer.
 */
export function useCart() {
  const { isAuthenticated } = useAuthStore();
  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled: isAuthenticated,
  });
}
