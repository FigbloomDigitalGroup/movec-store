import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import type { Product } from '../types';

interface ProductLike {
  id: string;
  name: string;
  slug: string;
  price: number;
}

/**
 * Shared add-to-cart / wishlist-toggle logic for anywhere a single product is
 * displayed (grid cards, carousels, the detail page). Centralizes the
 * guest-vs-authenticated branching and error handling that used to be
 * copy-pasted in three places, and only subscribes to this one product's
 * wishlist state — not the whole cart/wishlist store — so adding to cart on
 * one card doesn't re-render every other card on the page.
 */
export function useProductActions(productId: string) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addGuestCartItem = useCartStore((s) => s.addItem);
  const toggleGuestWishlistItem = useWishlistStore((s) => s.toggleItem);
  const isGuestWishlisted = useWishlistStore((s) => s.items.some((i) => i.productId === productId));

  const { data: apiWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then((r) => r.data),
    enabled: isAuthenticated,
  });

  const addToCartApi = useMutation({
    mutationFn: async ({ product, quantity }: { product: ProductLike; quantity: number }) => {
      await api.post('/cart/items', { productId: product.id, quantity });
    },
    onSuccess: (_data, { product }) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Added ${product.name} to cart`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const addToWishlistApi = useMutation({
    mutationFn: async (product: ProductLike) => {
      await api.post('/wishlist', { productId: product.id });
    },
    onSuccess: (_data, product) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(`Added ${product.name} to wishlist`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const removeFromWishlistApi = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      await api.delete(`/wishlist/${wishlistItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const apiWishlistEntry = isAuthenticated && Array.isArray(apiWishlist)
    ? apiWishlist.find((i: any) => i.productId === productId)
    : undefined;

  const isWishlisted = isAuthenticated ? Boolean(apiWishlistEntry) : isGuestWishlisted;

  const addToCart = (product: Product, quantity = 1, image: string | null = null) => {
    if (isAuthenticated) {
      addToCartApi.mutate({ product, quantity });
    } else {
      addGuestCartItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image,
        quantity,
      });
    }
  };

  const toggleWishlist = (product: Product, image: string | null = null) => {
    if (isAuthenticated) {
      if (apiWishlistEntry) {
        removeFromWishlistApi.mutate(apiWishlistEntry.id);
      } else {
        addToWishlistApi.mutate(product);
      }
    } else {
      toggleGuestWishlistItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image,
      });
    }
  };

  return {
    isWishlisted,
    addToCart,
    toggleWishlist,
    isAddingToCart: addToCartApi.isPending,
    isTogglingWishlist: addToWishlistApi.isPending || removeFromWishlistApi.isPending,
  };
}
