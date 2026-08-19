import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { FiTrash2 } from 'react-icons/fi';
import Skeleton from '../components/ui/Skeleton';
import type { WishlistItem } from '../types';

// Shape actually used when rendering a row, satisfied by both the authenticated
// API response (WishlistItem) and the guest GuestWishlistItem from wishlistStore
// — the latter has no `id`, since it isn't persisted server-side.
interface WishlistDisplayItem {
  id?: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const guestWishlist = useWishlistStore();

  const { data: apiWishlist, isLoading: wishlistLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data),
    enabled: isAuthenticated,
  });

  const removeApi = useMutation({
    mutationFn: (id: string) => api.delete(`/wishlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const items: WishlistDisplayItem[] = isAuthenticated ? (apiWishlist || []) : guestWishlist.items;
  const isLoading = isAuthenticated && wishlistLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-section-title mb-2 text-gray-900">Wishlist</h1>
      {!isAuthenticated && (
        <p className="text-gray-500 mb-6 text-sm">Browsing as guest. Items are saved in your browser.</p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <Skeleton className="w-16 h-16 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/6" />
              </div>
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          <Link to="/products" className="mt-4 inline-block text-primary-500 hover:text-primary-600 hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: WishlistDisplayItem) => (
            <div key={item.productId || item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-xs">No img</span>}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.slug}`} className="font-semibold hover:text-primary-500">{item.name}</Link>
                <p className="text-primary-500 font-bold">KES {item.price?.toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated && item.id) {
                    removeApi.mutate(item.id);
                  } else {
                    guestWishlist.removeItem(item.productId);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}