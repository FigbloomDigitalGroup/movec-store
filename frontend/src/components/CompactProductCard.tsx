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
      style={{ width: '140px' }}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
          -{discount}%
        </div>
      )}

      {/* Fixed Image Container */}
      <div className="relative bg-white" style={{ height: '120px', padding: '8px' }}>
        <div className="w-full h-full flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          ) : (
            <FiShoppingCart className="text-gray-300" size={32} />
          )}
        </div>

        {/* Add to Cart Button - Bottom Right Corner */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10"
          aria-label="Add to cart"
        >
          <FiPlus size={12} strokeWidth={3} />
        </button>
      </div>

      {/* Product Info */}
      <div className="px-2 pb-2 pt-1.5">
        {/* Product Name - Truncated to 2 lines */}
        <h3 className="text-xs font-medium text-gray-900 mb-0.5 leading-tight" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2rem'
        }}>
          {product.name}
        </h3>

        {/* Brand/Category - if available */}
        {product.brand && (
          <p className="text-[10px] text-gray-500 mb-0.5 truncate">
            {product.brand.name}
          </p>
        )}

        {/* Price Section */}
        <div className="mb-0.5">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              KES {product.price.toLocaleString()}
            </span>
          </div>
          {product.compareAtPrice && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 line-through">
                KES {product.compareAtPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Stock/Delivery Info */}
        <div className="flex items-center gap-0.5 mb-0.5">
          <span className={`text-[10px] ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            ●
          </span>
          <p className={`text-[10px] ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            {getStockMessage()}
          </p>
        </div>

        {/* Rating - if available (placeholder for now) */}
        <div className="flex items-center gap-0.5 text-[10px]">
          <div className="flex items-center gap-0.5 text-yellow-400">
            <FiStar size={10} className="fill-yellow-400" />
            <FiStar size={10} className="fill-yellow-400" />
            <FiStar size={10} className="fill-yellow-400" />
            <FiStar size={10} className="fill-yellow-400" />
            <FiStar size={10} className="text-gray-300" />
          </div>
          <span className="text-gray-500">(4.0)</span>
        </div>
      </div>
    </Link>
  );
}
