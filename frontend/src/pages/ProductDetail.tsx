import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';

export default function ProductDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const guestCart = useCartStore();
  const guestWishlist = useWishlistStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
  });

  const addToCartApi = useMutation({
    mutationFn: async () => {
      await api.post('/cart/items', { productId: product.id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    },
  });

  const addToWishlistApi = useMutation({
    mutationFn: async () => {
      await api.post('/wishlist', { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      alert('Added to wishlist!');
    },
  });

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addToCartApi.mutate();
    } else {
      guestCart.addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0]?.url || null,
        quantity,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWishlist = () => {
    if (isAuthenticated) {
      addToWishlistApi.mutate();
    } else {
      guestWishlist.toggleItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0]?.url || null,
      });
    }
  };

  const isWishlisted = isAuthenticated
    ? false // API doesn't return this easily, could check later
    : guestWishlist.isInWishlist(product?.id || '');

  if (!product) return <p className="text-white text-center py-16">Loading...</p>;

  const images = product.images || [];
  const goNext = () => { if (images.length > 1) setCurrentImage((prev) => (prev + 1) % images.length); };
  const goPrev = () => { if (images.length > 1) setCurrentImage((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl h-96 flex items-center justify-center overflow-hidden group">
            {images.length > 0 ? (
              <img src={images[currentImage]?.url} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <span className="text-gray-400 text-xl">No image available</span>
            )}
            {images.length > 1 && (
              <>
                <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"><FiChevronLeft size={24} /></button>
                <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"><FiChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`w-3 h-3 rounded-full transition ${i === currentImage ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img: any, i: number) => (
                <button key={img.id} onClick={() => setCurrentImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${i === currentImage ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-sm text-gray-500">{product.brand?.name}</p>
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
            {product.compareAtPrice && <span className="text-lg text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>}
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

          {product.categories?.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {product.categories.map((cat: any) => <span key={cat.id} className="bg-gray-200 px-3 py-1 rounded-full text-sm">{cat.name}</span>)}
            </div>
          )}

          <p className="mt-4 text-sm">
            {product.inventory?.reduce((sum: number, i: any) => sum + i.quantity, 0) > 0
              ? <span className="text-green-600 font-medium">✓ In Stock</span>
              : <span className="text-red-600 font-medium">✕ Out of Stock</span>}
          </p>

          <div className="mt-6 flex gap-4">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 border-x font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex-1"
            >
              {addedToCart ? '✓ Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`border px-4 py-2 rounded-lg transition text-xl ${isWishlisted ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-gray-500 mt-2">You can add items to cart and wishlist without an account. You'll sign in at checkout.</p>
          )}
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.user.firstName} {review.user.lastName}</span>
                  <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                {review.title && <p className="font-medium mt-1">{review.title}</p>}
                {review.body && <p className="text-gray-600 mt-1">{review.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}