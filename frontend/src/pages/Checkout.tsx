import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Cart, Address } from '../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [shippingId, setShippingId] = useState('');
  const [billingId, setBillingId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');

  const { data: cart } = useQuery<Cart>({ queryKey: ['cart'], queryFn: () => api.get('/cart').then(r => r.data) });
  const { data: addresses } = useQuery<Address[]>({ queryKey: ['addresses'], queryFn: () => api.get('/users/me/addresses').then(r => r.data) });

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Shipping Address</h2>
            {addresses?.map((addr) => (
              <label key={addr.id} className={`block p-3 border rounded-lg mb-2 cursor-pointer ${shippingId === addr.id ? 'border-blue-600 bg-blue-50' : ''}`}>
                <input type="radio" name="shipping" value={addr.id} checked={shippingId === addr.id} onChange={(e) => setShippingId(e.target.value)} className="mr-2" />
                {addr.line1}, {addr.city}, {addr.postalCode}
              </label>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Coupon</h2>
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="border rounded-lg px-4 py-2 w-full" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border rounded-lg px-4 py-2 w-full" rows={3} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart?.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>{item.name} x {item.quantity}</span>
              <span>KES {item.subtotal.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
            <span>Total</span>
            <span>KES {cart?.total?.toLocaleString()}</span>
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