import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { FiPlus, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
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
  const wishlistStore = useWishlistStore();

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

  const addToWishlistApi = useMutation({
    mutationFn: async () => {
      await api.post('/wishlist', { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(`Added ${product.name} to wishlist`);
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      addToWishlistApi.mutate();
    } else {
      wishlistStore.toggleItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: mainImage || null,
      });
    }
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
      className="block flex-shrink-0 relative group"
      style={{ width: '200px' }}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-10">
          -{discount}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative bg-gray-50 mb-3">
        <div className="w-full h-48 flex items-center justify-center p-4">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <FiShoppingCart className="text-gray-300" size={32} />
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10 ${
            wishlistStore.isInWishlist(product.id)
              ? 'bg-red-50 text-red-500'
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          aria-label="Add to wishlist"
        >
          <FiHeart size={14} fill={wishlistStore.isInWishlist(product.id) ? 'currentColor' : 'none'} />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 w-8 h-8 bg-[#10B982] hover:bg-[#0d9b6f] text-white rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10"
          aria-label="Add to cart"
        >
          <FiPlus size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Product Info */}
      <div className="text-center">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 leading-tight group-hover:text-accent transition-colors" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.5rem'
        }}>
          {product.name}
        </h3>

        {/* Rating — falls back to a placeholder until the product has real reviews */}
        {(() => {
          const displayRating = product.avgRating ?? 4;
          return (
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="flex items-center gap-0.5 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar
                    key={i}
                    size={12}
                    className={i <= Math.round(displayRating) ? 'fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              {product.reviewCount > 0 && (
                <span className="text-xs text-gray-500">({product.reviewCount})</span>
              )}
            </div>
          );
        })()}

        {/* Price */}
        <div className="mb-1">
          <span className="text-sm font-semibold text-gray-900">
            KES {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through ml-1">
              KES {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <p className={`text-xs ${inStock ? 'text-green-600' : 'text-red-500'}`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>
    </Link>
  );
}
