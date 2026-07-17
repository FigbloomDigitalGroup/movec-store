import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function ProductDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      await api.post('/cart/items', { productId: product.id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      alert('Added to cart!');
    },
  });

  const addToWishlist = useMutation({
    mutationFn: async () => {
      await api.post('/wishlist', { productId: product.id });
    },
    onSuccess: () => alert('Added to wishlist!'),
  });

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 h-96 rounded-xl flex items-center justify-center">
          {product.images?.[0] ? (
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <span className="text-gray-400 text-xl">No image</span>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500">{product.brand?.name}</p>
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-4 text-gray-700">{product.description}</p>

          {product.categories?.length > 0 && (
            <div className="mt-4 flex gap-2">
              {product.categories.map((cat: any) => (
                <span key={cat.id} className="bg-gray-200 px-3 py-1 rounded-full text-sm">{cat.name}</span>
              ))}
            </div>
          )}

          <p className="mt-4 text-sm">
            {product.inventory?.reduce((sum: number, i: any) => sum + i.quantity, 0) > 0 ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          {isAuthenticated && (
            <div className="mt-6 flex gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">-</button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2">+</button>
              </div>
              <button
                onClick={() => addToCart.mutate()}
                disabled={addToCart.isPending}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => addToWishlist.mutate()}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                ♡
              </button>
            </div>
          )}
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {product.reviews.map((review: any) => (
            <div key={review.id} className="border-b py-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.user.firstName} {review.user.lastName}</span>
                <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
              </div>
              {review.title && <p className="font-medium mt-1">{review.title}</p>}
              {review.body && <p className="text-gray-600 mt-1">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}