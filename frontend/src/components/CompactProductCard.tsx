import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { FiPlus, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

interface CompactProductCardProps {
  product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
  const images = product.images || [];
  const mainImage = images[0]?.url;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  const addToCartApi = useMutation({
    mutationFn: async () => {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Added ${product.name} to cart`);
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      addToCartApi.mutate();
    } else {
      cartStore.addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: mainImage || null,
        quantity: 1,
      });
    }
  };

  // Format stock/delivery message
  const getStockMessage = () => {
    const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
    if (totalStock > 0) {
      return 'In Stock';
    }
    return 'Out of Stock';
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return 0;
  };

  const discount = getDiscountPercentage();
  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
  const inStock = totalStock > 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 flex-shrink-0 relative"
      style={{ width: '180px' }}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          {discount}% OFF
        </div>
      )}

      {/* Fixed Image Container */}
      <div className="relative bg-white" style={{ height: '160px', padding: '12px' }}>
        <div className="w-full h-full flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <FiShoppingCart className="text-gray-300" size={48} />
          )}
        </div>

        {/* Add to Cart Button - Bottom Right Corner */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10"
          aria-label="Add to cart"
        >
          <FiPlus size={16} strokeWidth={3} />
        </button>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 pt-2">
        {/* Product Name - Truncated to 2 lines */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 leading-tight" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.5rem'
        }}>
          {product.name}
        </h3>

        {/* Brand/Category - if available */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1 truncate">
            {product.brand.name}
          </p>
        )}

        {/* Price Section */}
        <div className="mb-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-600">KES</span>
          </div>
          {product.compareAtPrice && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 line-through">
                {product.compareAtPrice.toLocaleString()}
              </span>
              <span className="text-xs text-gray-600">KES</span>
            </div>
          )}
        </div>

        {/* Stock/Delivery Info */}
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-xs ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            ●
          </span>
          <p className={`text-xs ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            {getStockMessage()}
          </p>
        </div>

        {/* Rating - if available (placeholder for now) */}
        <div className="flex items-center gap-1 text-xs">
          <div className="flex items-center gap-0.5 text-yellow-400">
            <FiStar size={12} className="fill-yellow-400" />
            <FiStar size={12} className="fill-yellow-400" />
            <FiStar size={12} className="fill-yellow-400" />
            <FiStar size={12} className="fill-yellow-400" />
            <FiStar size={12} className="text-gray-300" />
          </div>
          <span className="text-gray-500">(4.0)</span>
        </div>
      </div>
    </Link>
  );
}
