import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { FiShoppingCart, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Card, { CardBody } from './ui/Card';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

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
    },
  });

  const addToWishlistApi = useMutation({
    mutationFn: async () => {
      await api.post('/wishlist', { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
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

  return (
    <Link to={`/products/${product.slug}`} className="group h-full">
      <Card hover className="h-full flex flex-col">
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-56 flex items-center justify-center rounded-t-xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentIndex]?.url}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-108"
                style={{ transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            ) : (
              <FiShoppingCart className="text-gray-400" size={48} />
            )}
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-1.5 shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                aria-label="Previous image"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-1.5 shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                aria-label="Next image"
              >
                <FiChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        <CardBody className="pt-5 flex-1 flex flex-col">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand?.name || 'Brand'}</p>
          <h3 className="font-product-name text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition min-h-[3.5rem]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-price text-blue-600">KES {product.price.toLocaleString()}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Action Buttons at Bottom */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-lg border-2 transition flex items-center justify-center ${
                wishlistStore.isInWishlist(product.id)
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <FiHeart size={18} fill={wishlistStore.isInWishlist(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
