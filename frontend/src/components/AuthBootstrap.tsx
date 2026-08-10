import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthBootstrap() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartItemsCount = useCartStore((s) => s.items.length);
  const wishlistItemsCount = useWishlistStore((s) => s.items.length);
  const syncCart = useCartStore((s) => s.syncCart);
  const syncWishlist = useWishlistStore((s) => s.syncWishlist);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      loadUser();
    }
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated) {
      if (cartItemsCount > 0) {
        syncCart(queryClient);
      }
      if (wishlistItemsCount > 0) {
        syncWishlist(queryClient);
      }
    }
  }, [isAuthenticated, cartItemsCount, wishlistItemsCount, syncCart, syncWishlist, queryClient]);

  return null;
}

