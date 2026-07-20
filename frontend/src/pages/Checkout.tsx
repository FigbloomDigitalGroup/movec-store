import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Cart, Address } from '../types';
import { FiMapPin, FiTag, FiFileText, FiShoppingBag, FiCheck, FiPlus, FiX, FiLock } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';

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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardBody className="text-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLock className="text-blue-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Checkout</h1>
              <p className="text-gray-600 mb-6">You need an account to complete your order. Your cart will be saved.</p>
              <Link to="/login?redirect=checkout">
                <Button size="lg">Sign In</Button>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Register
                </Link>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (syncing) return <div className="min-h-screen flex items-center justify-center text-gray-600">Syncing your cart...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-700">Complete your order</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiMapPin className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>

                {addresses?.length === 0 && !showAddAddress && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">No addresses found. You must add an address to complete checkout.</p>
                  </div>
                )}

                {addresses?.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-4 border-2 rounded-lg mb-3 cursor-pointer transition ${
                      shippingId === addr.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={addr.id}
                        checked={shippingId === addr.id}
                        onChange={(e) => setShippingId(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{addr.line1}</p>
                        <p className="text-gray-700">{addr.city}, {addr.postalCode}</p>
                        <p className="text-gray-700">{addr.country}</p>
                      </div>
                    </div>
                  </label>
                ))}

                {!showAddAddress ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAddress(true)}
                    className="w-full"
                  >
                    <FiPlus className="mr-2" size={18} />
                    Add New Shipping Address
                  </Button>
                ) : (
                  <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Add Shipping Address</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}>
                        <FiX size={18} />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <Input
                        label="Street Address"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        placeholder="e.g. 123 Moi Avenue"
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Nairobi"
                          required
                        />
                        <Input
                          label="Postal Code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="e.g. 00100"
                          required
                        />
                      </div>
                      <Input
                        label="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Kenya"
                      />
                      <Button
                        onClick={() => addAddress.mutate()}
                        disabled={!line1 || !city || !postalCode || addAddress.isPending}
                        className="w-full"
                      >
                        {addAddress.isPending ? 'Saving...' : 'Save Address'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Coupon */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiTag className="text-green-600" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Coupon Code</h2>
                </div>
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
              </CardBody>
            </Card>

            {/* Notes */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="text-purple-600" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Notes</h2>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions for your order..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardBody>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {cartEmpty ? (
                  <div className="text-center py-8">
                    <FiShoppingBag className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 mb-4">Your cart is empty.</p>
                    <Link to="/products">
                      <Button variant="outline">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {items.map((item: any) => (
                        <div key={item.productId || item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.productNameSnapshot || item.name} x {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            KES {(Number(item.priceSnapshot ?? item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-medium">KES {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span className="font-medium">Calculated at checkout</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span className="font-medium">Calculated at checkout</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>KES {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {!shippingId && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm">⚠️ Please select a shipping address to continue.</p>
                      </div>
                    )}

                    <Button
                      onClick={() => placeOrder.mutate()}
                      disabled={!shippingId || placeOrder.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                    </Button>

                    <p className="text-xs text-gray-600 text-center mt-4">
                      By placing this order, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}