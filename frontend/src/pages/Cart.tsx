import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import type { CartDisplayItem } from '../types';

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const guestCart = useCartStore();

  const { data: apiCart, isLoading } = useCart();

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await api.patch(`/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if ((isAuthenticated && isLoading) || guestCart.isSyncing) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 py-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <div className="w-full px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardBody>
                  <Skeleton className="h-8 w-40 mb-6" />
                  <div className="space-y-3 mb-6">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <Skeleton className="h-px w-full mb-6" />
                  <Skeleton className="h-8 w-32 mb-6" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-5 w-40 mx-auto mt-4" />
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items: CartDisplayItem[] = isAuthenticated ? (apiCart?.items || []) : guestCart.items;
  const total = isAuthenticated
    ? (apiCart?.total || 0)
    : guestCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-section-title text-gray-900 mb-2">Shopping Cart</h1>
          {!isAuthenticated && (
            <p className="text-gray-700 text-sm">
              You're browsing as a guest.{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-600 hover:underline font-medium">
                Sign in
              </Link>{' '}
              to save your cart.
            </p>
          )}
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {!items.length ? (
          <Card>
            <CardBody className="text-center py-16">
              <FiShoppingBag className="text-gray-300 mx-auto mb-4" size={64} />
              <p className="text-gray-700 text-lg mb-4">Your cart is empty.</p>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.productId || item.id}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FiShoppingBag className="text-gray-500" size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link to={`/products/${item.slug}`} className="font-product-name text-gray-900 hover:text-primary-500 transition">
                          {item.name}
                        </Link>
                        <p className="text-primary-500 font-price mt-1">KES {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => item.id && updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                              disabled={item.quantity <= 1 || updateQuantity.isPending}
                            >
                              <FiMinus size={16} />
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => item.id && updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                              disabled={updateQuantity.isPending}
                            >
                              <FiPlus size={16} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => guestCart.updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus size={16} />
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => guestCart.updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <FiPlus size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-price text-gray-900">KES {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isAuthenticated && item.id ? removeItem.mutate(item.id) : guestCart.removeItem(item.productId)}
                        disabled={isAuthenticated && removeItem.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardBody>
                  <h2 className="text-xl font-section-title text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({items.length} items)</span>
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
                    <div className="flex justify-between text-lg font-price text-gray-900">
                      <span>Total</span>
                      <span>KES {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/checkout');
                      } else {
                        navigate('/login?redirect=/checkout');
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Proceed to Checkout
                    <FiArrowRight className="ml-2" size={18} />
                  </Button>

                  <Link to="/products" className="block text-center mt-4 text-primary-500 hover:text-primary-600 hover:underline text-sm font-medium">
                    Continue Shopping
                  </Link>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}