import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { FiShoppingCart, FiHeart, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product.images || [];
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

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
        image: images[currentIndex]?.url || null,
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
        image: images[currentIndex]?.url || null,
      });
    }
  };

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const totalStock = (product as any).inventory?.reduce((sum: number, inv: any) => sum + inv.quantity, 0) ?? 1;
  const inStock = totalStock > 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 relative overflow-hidden"
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
          -{discount}%
        </div>
      )}

      {/* Image Container — white bg, object-contain, padded to match home page */}
      <div
        className="relative bg-gray-50 overflow-hidden flex items-center justify-center"
        style={{ height: '120px' }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {images.length > 0 ? (
            <img
              src={images[currentIndex]?.url}
              alt={product.name}
              loading="lazy"
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <FiShoppingCart className="text-gray-300" size={40} />
          )}
        </div>

        {/* Image navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 rounded-full p-1.5 shadow hover:bg-gray-50 transition z-10 border border-gray-200"
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 rounded-full p-1.5 shadow hover:bg-gray-50 transition z-10 border border-gray-200"
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? 'bg-[#10B982] w-4' : 'bg-gray-300 w-1.5'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Out of Stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="text-white text-xs font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="px-2 pb-2 pt-1.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-[9px] text-gray-500 mb-0.5 truncate">{product.brand.name}</p>
        )}

        {/* Name */}
        <h3
          className="text-xs font-medium text-gray-900 mb-0.5 leading-tight text-center group-hover:text-accent transition-colors"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '1.6rem',
          }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div className="flex items-center gap-0.5 text-yellow-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <FiStar
                  key={i}
                  size={10}
                  className={i <= Math.round(product.avgRating ?? 0) ? 'fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-0.5">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xs font-bold text-gray-900">
              KES {product.price.toLocaleString()}
            </span>
          </div>
          {product.compareAtPrice && (
            <span className="text-[9px] text-gray-400 line-through">
              KES {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-[9px] ${inStock ? 'text-green-600' : 'text-red-500'}`}>●</span>
          <p className={`text-[9px] ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 btn-accent text-[11px] py-1.5 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1"
          >
            <FiShoppingCart size={11} />
            Add to Cart
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-lg border-2 transition flex items-center justify-center ${
              wishlistStore.isInWishlist(product.id)
                ? 'border-red-500 bg-red-50 text-red-500'
                : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
            }`}
          >
            <FiHeart size={12} fill={wishlistStore.isInWishlist(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </Link>
  );
}
