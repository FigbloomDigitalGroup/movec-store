import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Cart, Address } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const guestCart = useCartStore();
  const [shippingId, setShippingId] = useState('');
  const [billingId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');
  const [syncing, setSyncing] = useState(false);

  const { data: cart } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: addresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/me/addresses').then(r => r.data),
    enabled: isAuthenticated,
  });

  // Sync guest cart to server on login
  useEffect(() => {
    if (isAuthenticated && guestCart.items.length > 0) {
      setSyncing(true);
      const syncCart = async () => {
        for (const item of guestCart.items) {
          await api.post('/cart/items', { productId: item.productId, quantity: item.quantity });
        }
        guestCart.clearCart();
        setSyncing(false);
      };
      syncCart();
    }
  }, [isAuthenticated]);

  const placeOrder = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/checkout', {
        shippingAddressId: shippingId,
        billingAddressId: billingId || shippingId,
        couponCode: couponCode || undefined,
        notes: notes || undefined,
      });
      return data;
    },
    onSuccess: (data) => {
      navigate(`/orders/${data.orderNumber}`);
    },
  });

  const items = isAuthenticated ? (cart?.items || []) : guestCart.items;
  const total = isAuthenticated ? (cart?.total || 0) : guestCart.getTotal();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-4">Sign in to Checkout</h1>
          <p className="text-gray-600 mb-6">You need an account to complete your order. Your cart will be saved.</p>
          <button onClick={() => navigate('/login?redirect=checkout')} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Don't have an account? <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">Register</button>
          </p>
        </div>
      </div>
    );
  }

  if (syncing) return <div className="text-center py-16 text-white">Syncing your cart...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Shipping Address</h2>
            {addresses?.length === 0 && (
              <p className="text-gray-400 text-sm">No addresses found. Please add one in your profile.</p>
            )}
            {addresses?.map((addr) => (
              <label key={addr.id} className={`block p-3 border rounded-lg mb-2 cursor-pointer bg-white/80 backdrop-blur-sm ${shippingId === addr.id ? 'border-blue-600 bg-blue-50/80' : ''}`}>
                <input type="radio" name="shipping" value={addr.id} checked={shippingId === addr.id} onChange={(e) => setShippingId(e.target.value)} className="mr-2" />
                {addr.line1}, {addr.city}, {addr.postalCode}
              </label>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Coupon</h2>
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="border rounded-lg px-4 py-2 w-full bg-white/80 backdrop-blur-sm" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3 text-white">Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border rounded-lg px-4 py-2 w-full bg-white/80 backdrop-blur-sm" rows={3} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {items.map((item: any) => (
            <div key={item.productId || item.id} className="flex justify-between py-2 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
            <span>Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          <button
            onClick={() => placeOrder.mutate()}
            disabled={!shippingId || placeOrder.isPending}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}