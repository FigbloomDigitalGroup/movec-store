import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { FiPlus, FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useProductActions } from '../hooks/useProductActions';

interface CompactProductCardProps {
  product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
  const images = product.images || [];
  const mainImage = images[0]?.url;
  const { isWishlisted, addToCart, toggleWishlist, isAddingToCart, isTogglingWishlist } =
    useProductActions(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, mainImage || null);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product, mainImage || null);
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
          disabled={isTogglingWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10 disabled:opacity-40 disabled:cursor-not-allowed ${
            isWishlisted
              ? 'bg-red-50 text-red-500'
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <FiHeart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="absolute bottom-2 right-2 w-8 h-8 btn-accent rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 z-10 disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* Rating — only shown once the product has at least one real review */}
        {product.avgRating != null && product.reviewCount > 0 && (
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="flex items-center gap-0.5 text-yellow-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <FiStar
                  key={i}
                  size={12}
                  className={i <= Math.round(product.avgRating!) ? 'fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}

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
