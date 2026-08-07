import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { FiChevronLeft, FiChevronRight, FiHeart, FiTruck, FiShield, FiCheck, FiStar } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

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
      toast.success('Wishlist updated');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
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
    ? false
    : guestWishlist.isInWishlist(product?.id || '');

  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;

  const images = product.images || [];
  const goNext = () => { if (images.length > 1) setCurrentImage((prev) => (prev + 1) % images.length); };
  const goPrev = () => { if (images.length > 1) setCurrentImage((prev) => (prev - 1 + images.length) % images.length); };
  const inStock = product.inventory?.reduce((sum: number, i: any) => sum + i.quantity, 0) > 0;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative bg-white rounded-2xl h-96 flex items-center justify-center overflow-hidden border border-gray-200 group">
              {images.length > 0 ? (
                <img src={images[currentImage]?.url} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
              ) : (
                <div className="text-gray-400 text-xl">No image available</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition shadow-lg">
                    <FiChevronLeft size={24} />
                  </button>
                  <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition shadow-lg">
                    <FiChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_: any, i: number) => (
                      <button key={i} onClick={() => setCurrentImage(i)} className={`w-3 h-3 rounded-full transition ${i === currentImage ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button key={img.id} onClick={() => setCurrentImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${i === currentImage ? 'border-blue-600' : 'border-gray-200 opacity-70 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">{product.brand?.name}</p>
              <h1 className="text-3xl md:text-4xl font-product-name text-gray-900 mt-1">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-price text-blue-600">KES {product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                  <Badge variant="success">Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%</Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Badge variant={inStock ? 'success' : 'danger'}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {product.featured && <Badge variant="primary">Featured</Badge>}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            {product.categories?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-2">Categories:</p>
                <div className="flex gap-2 flex-wrap">
                  {product.categories.map((cat: any) => (
                    <Link key={cat.id} to={`/products?category=${cat.slug}`} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-800 transition">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 transition">-</button>
                  <span className="px-4 py-2 border-x border-gray-300 font-medium min-w-[60px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 transition">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1"
                  size="lg"
                >
                  {addedToCart ? '✓ Added!' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className={isWishlisted ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
                >
                  <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </Button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-gray-600 mt-3">
                  You can add items to cart and wishlist without an account. You'll sign in at checkout.
                </p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiTruck className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Fast Delivery</p>
                  <p className="text-xs text-gray-600">24-48 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiShield className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Warranty</p>
                  <p className="text-xs text-gray-600">1 year</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiCheck className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Genuine</p>
                  <p className="text-xs text-gray-600">Authentic</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-section-title text-gray-900 mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">
                            {review.user.firstName[0]}{review.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.user.firstName} {review.user.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar key={star} className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} size={16} />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="font-medium text-gray-900 mb-2">{review.title}</p>}
                    {review.body && <p className="text-gray-700">{review.body}</p>}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}