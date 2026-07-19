import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Cart } from '../types';

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const guestCart = useCartStore();

  const { data: apiCart, isLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data;
    },
    enabled: isAuthenticated,
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await api.patch(`/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (isAuthenticated && isLoading) return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;

  const items = isAuthenticated ? (apiCart?.items || []) : guestCart.items;
  const total = isAuthenticated
    ? (apiCart?.total || 0)
    : guestCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Shopping Cart</h1>
      {!isAuthenticated && <p className="text-gray-300 mb-6 text-sm">You're browsing as a guest. <button onClick={() => navigate('/login')} className="text-blue-400 underline">Sign in</button> to save your cart.</p>}

      {!items.length ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <button onClick={() => navigate('/products')} className="mt-4 text-blue-600 hover:underline">Browse Products</button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.productId || item.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-400">No img</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-blue-600 font-bold">KES {item.price.toLocaleString()}</p>
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1} className="px-2 py-1 border rounded">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="px-2 py-1 border rounded">+</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => guestCart.updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2 py-1 border rounded">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => guestCart.updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                </div>
              )}
              <p className="font-semibold w-24 text-right">KES {(item.price * item.quantity).toLocaleString()}</p>
              <button
                onClick={() => isAuthenticated ? removeItem.mutate(item.id) : guestCart.removeItem(item.productId)}
                className="text-red-500 hover:text-red-700"
              >Remove</button>
            </div>
          ))}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 text-right">
            <p className="text-xl font-bold">Total: KES {total.toLocaleString()}</p>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/checkout');
                } else {
                  navigate('/login?redirect=checkout');
                }
              }}
              className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}