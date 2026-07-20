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

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Kenya');

  const { data: cart } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data),
    enabled: isAuthenticated,
  });

  const { data: addresses, refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/me/addresses').then(r => r.data),
    enabled: isAuthenticated,
  });

  // Auto select first address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !shippingId) {
      setShippingId(addresses[0].id);
    }
  }, [addresses, shippingId]);

  const addAddress = useMutation({
    mutationFn: () => api.post('/users/me/addresses', {
      type: 'SHIPPING',
      line1,
      city,
      postalCode,
      country,
      isDefault: true,
    }),
    onSuccess: (res) => {
      refetchAddresses().then(() => {
        setShippingId(res.data.id);
        setShowAddAddress(false);
        setLine1('');
        setCity('');
        setPostalCode('');
      });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to add address');
    }
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
      navigate(`/payment/${data.orderNumber}`);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to place order';
      alert(msg);
    },
  });

  const items = isAuthenticated ? (cart?.items || []) : guestCart.items;
  const total = isAuthenticated ? (cart?.total || 0) : guestCart.getTotal();
  const cartEmpty = isAuthenticated ? items.length === 0 && cart !== undefined : items.length === 0;

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
            {addresses?.length === 0 && !showAddAddress && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-3">No addresses found. You must add an address to complete checkout.</p>
              </div>
            )}
            {addresses?.map((addr) => (
              <label key={addr.id} className={`block p-3 border rounded-lg mb-2 cursor-pointer bg-white/80 backdrop-blur-sm ${shippingId === addr.id ? 'border-blue-600 bg-blue-50/80' : ''}`}>
                <input type="radio" name="shipping" value={addr.id} checked={shippingId === addr.id} onChange={(e) => setShippingId(e.target.value)} className="mr-2" />
                {addr.line1}, {addr.city}, {addr.postalCode}
              </label>
            ))}

            {!showAddAddress ? (
              <button
                type="button"
                onClick={() => setShowAddAddress(true)}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold"
              >
                + Add New Shipping Address
              </button>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 mt-3 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Add Shipping Address</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="e.g. 123 Moi Avenue"
                    className="border rounded-lg px-3 py-1.5 w-full text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Nairobi"
                      className="border rounded-lg px-3 py-1.5 w-full text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 00100"
                      className="border rounded-lg px-3 py-1.5 w-full text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Kenya"
                    className="border rounded-lg px-3 py-1.5 w-full text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => addAddress.mutate()}
                    disabled={!line1 || !city || !postalCode || addAddress.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {addAddress.isPending ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
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
          {cartEmpty && (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Browse Products
              </button>
            </div>
          )}
          {items.map((item: any) => (
            <div key={item.productId || item.id} className="flex justify-between py-2 border-b">
              <span>{item.productNameSnapshot || item.name} x {item.quantity}</span>
              <span>KES {(Number(item.priceSnapshot ?? item.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {items.length > 0 && (
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          )}
          {!cartEmpty && (
            <>
              {!shippingId && (
                <p className="text-amber-600 text-sm mt-4">⚠️ Please select a shipping address above to continue.</p>
              )}
              <button
                onClick={() => placeOrder.mutate()}
                disabled={!shippingId || placeOrder.isPending}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}