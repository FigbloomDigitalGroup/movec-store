import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useProductActions } from '../hooks/useProductActions';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiTruck,
  FiShield,
  FiCheck,
  FiStar,
  FiEdit3,
  FiLock,
  FiCheckCircle,
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHero from '../components/ui/SectionHero';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import type { Review, Inventory, ProductImage, Category } from '../types';

/* ─── Star Picker Component ─────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="transition-transform hover:scale-125 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          >
            <FiStar
              size={28}
              className={`transition-colors ${
                star <= (hovered || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-sm font-semibold text-yellow-600">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Review Form Component ─────────────────────────────────── */
function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/reviews', { productId, rating, title: title.trim(), body: body.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
      setSubmitted(true);
    },
    onError: (error) => {
      const msg = getErrorMessage(error);
      if (msg.toLowerCase().includes('already reviewed')) {
        toast.error('You have already submitted a review for this product.');
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating before submitting.');
      return;
    }
    if (!body.trim()) {
      toast.error('Please write a review message.');
      return;
    }
    submitMutation.mutate();
  };

  /* Not logged in */
  if (!isAuthenticated) {
    return (
      <div className="mt-10 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-section-title text-gray-900 mb-6 flex items-center gap-2">
          <FiEdit3 className="text-accent" /> Write a Review
        </h2>
        <div className="bg-accent-100 border border-accent rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-accent" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sign in to leave a review</h3>
          <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
            Share your experience with <span className="font-semibold">{productName}</span>. Your
            review helps other customers make informed decisions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="btn-accent text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* After successful submission */
  if (submitted) {
    return (
      <div className="mt-10 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-section-title text-gray-900 mb-6 flex items-center gap-2">
          <FiEdit3 className="text-accent" /> Write a Review
        </h2>
        <div className="bg-accent-100 border border-accent rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-accent" size={26} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Review submitted! Thank you.</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Your review is now live on this product's page.
          </p>
        </div>
      </div>
    );
  }

  /* Review form */
  return (
    <div className="mt-10 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-section-title text-gray-900 mb-6 flex items-center gap-2">
            <FiEdit3 className="text-accent" /> Write a Review
      </h2>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Review Title <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Great product, very easy to set up"'
              maxLength={120}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:bg-white transition"
            />
          </div>

          {/* Review Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details about your experience — what you liked, how it performed, tips for other buyers..."
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:bg-white transition resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{body.length}/2000</p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto btn-accent disabled:opacity-50 text-white font-semibold px-8 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FiEdit3 size={15} />
              {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Reviews Display Component ─────────────────────────────── */
function ReviewsDisplay({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="mt-10 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-section-title text-gray-900 mb-8 flex items-center gap-2">
        <FiStar className="text-yellow-400 fill-yellow-400" /> Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        {/* Big Average */}
        <div className="text-center flex-shrink-0">
          <p className="text-6xl font-black text-gray-900 leading-none">{avg}</p>
          <div className="flex items-center justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar
                key={s}
                size={16}
                className={s <= Math.round(Number(avg)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Bar chart */}
        <div className="flex-1 w-full space-y-2">
          {counts.map(({ star, count }) => {
            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-right text-gray-600 font-medium flex items-center justify-end gap-0.5">
                  {star}<FiStar size={11} className="text-yellow-400 fill-yellow-400" />
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">
                    {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.user?.firstName} {review.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={14}
                    className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            {review.title && (
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">{review.title}</h4>
            )}
            {review.body && (
              <p className="text-gray-700 text-sm leading-relaxed">{review.body}</p>
            )}

            {/* Verified badge */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
              <FiCheck size={13} className="text-accent" />
              <span className="text-xs text-accent font-medium">Verified Review</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ProductDetail Page ────────────────────────────────── */
export default function ProductDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
  });

  const {
    isWishlisted,
    addToCart,
    toggleWishlist,
    isAddingToCart,
    isTogglingWishlist,
  } = useProductActions(product?.id || '');

  const handleAddToCart = () => {
    addToCart(product, quantity, product.images?.[0]?.url || null);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    toggleWishlist(product, product.images?.[0]?.url || null);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );

  if (isError || !product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Product not found</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          This product may have been removed, or the link may be incorrect.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-accent hover:text-accent-dark"
          >
            Retry
          </button>
          <Link to="/products" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            ← Back to Products
          </Link>
        </div>
      </div>
    );

  const images = product.images || [];
  const goNext = () => {
    if (images.length > 1) setCurrentImage((prev) => (prev + 1) % images.length);
  };
  const goPrev = () => {
    if (images.length > 1) setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };
  const inStock = product.inventory?.reduce((sum: number, i: Inventory) => sum + i.quantity, 0) > 0;
  const approvedReviews: Review[] = (product.reviews || []).filter((r: Review) => r.isApproved);

  const primaryCategory = product.categories?.[0];

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-4">
          <Breadcrumbs
            items={[
              { label: 'Products', to: '/products' },
              ...(primaryCategory ? [{ label: primaryCategory.name, to: `/products?category=${primaryCategory.slug}` }] : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <SectionHero title={product.name} subtitle={product.brand?.name} />
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto mt-8">
          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative bg-white rounded-2xl h-96 flex items-center justify-center overflow-hidden border border-gray-200 group">
              {images.length > 0 ? (
                <img
                  src={images[currentImage]?.url}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-500 text-xl">No image available</div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition shadow-lg"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition shadow-lg"
                  >
                    <FiChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_: ProductImage, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-3 h-3 rounded-full transition ${
                          i === currentImage ? 'bg-accent scale-125' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img: ProductImage, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                      i === currentImage 
                        ? 'border-accent'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
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
              <h1 className="text-3xl md:text-4xl font-product-name text-gray-900 mt-1">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

              {/* Inline avg rating from approved reviews */}
              {approvedReviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
                      return (
                        <FiStar
                          key={s}
                          size={14}
                          className={s <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm text-gray-600">
                    {(approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length).toFixed(1)} ({approvedReviews.length} review{approvedReviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-price text-accent">
                KES {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    KES {product.compareAtPrice.toLocaleString()}
                  </span>
                  <Badge variant="success">
                    Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                  </Badge>
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
                  {product.categories.map((cat: Category) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-800 transition"
                    >
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
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddToCart} disabled={!inStock || isAddingToCart} className="flex-1" size="lg">
                  {addedToCart ? '✓ Added!' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  disabled={isTogglingWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={isWishlisted}
                  className={isWishlisted ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
                >
                  <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </Button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-gray-600 mt-3">
                  You can add items to cart and wishlist without an account. You'll sign in at
                  checkout.
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <FiTruck className="text-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Fast Delivery</p>
                  <p className="text-xs text-gray-600">24-48 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <FiShield className="text-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Warranty</p>
                  <p className="text-xs text-gray-600">1 year</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <FiCheck className="text-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Genuine</p>
                  <p className="text-xs text-gray-600">Authentic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ── Reviews Section ───────────────────────────────────── */}
        <ReviewsDisplay reviews={approvedReviews} />

        {/* ── Review Submission Form ────────────────────────────── */}
        <ReviewForm productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}