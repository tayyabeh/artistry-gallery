import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, StarHalf, Eye, Share2, X } from 'lucide-react';
import { Artwork } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  artwork: Artwork;
  featured?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ artwork, featured = false }) => {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const formatPrice = (price?: number) => {
    if (price === undefined) return 'Price on request';
    return `$${price.toFixed(2)}`;
  };

  const toggleWishlist = () => {
    if (isInWishlist(artwork.id)) {
      removeFromWishlist(artwork.id);
    } else {
      addToWishlist(artwork);
    }
  };

  const handleAddToCart = () => {
    addToCart(artwork);
  };

  return (
    <div 
      className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <motion.img 
          src={artwork.image} 
          alt={artwork.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Hover Action Buttons */}
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex space-x-2">
            <button 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors"
              onClick={() => setShowQuickView(true)}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>
            <button 
              className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-colors ${
                isInWishlist(artwork.id) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-slate-700 hover:text-red-500'
              }`}
              onClick={toggleWishlist}
              aria-label={isInWishlist(artwork.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={isInWishlist(artwork.id) ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors"
              onClick={() => {
                // Share functionality
                if (navigator.share) {
                  navigator.share({
                    title: artwork.title,
                    text: `Check out this amazing artwork: ${artwork.title} by ${artwork.creator.username}`,
                    url: window.location.origin + `/artwork/${artwork.id}`,
                  });
                }
              }}
              aria-label="Share artwork"
            >
              <Share2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <div className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              Featured
            </div>
          )}
          {artwork.isOnSale && (
            <div className="bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded">
              Sale
            </div>
          )}
          {artwork.isLimited && (
            <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
              Limited Edition
            </div>
          )}
          {artwork.isSoldOut && (
            <div className="bg-slate-700 text-white text-xs font-medium px-2 py-1 rounded">
              Sold Out
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <Link to={`/artwork/${artwork.id}`} className="block">
          <h3 className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {artwork.title}
          </h3>
          <div className="flex items-center mt-1 mb-2">
            <img
              src={artwork.creator.avatar}
              alt={artwork.creator.username}
              className="w-5 h-5 rounded-full mr-2"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {artwork.creator.username}
            </span>
          </div>
          
          {/* Ratings */}
          {(artwork.rating !== undefined) && (
            <div className="flex items-center mb-3">
              <div className="flex text-amber-400 mr-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= Math.floor(artwork.rating || 0) ? (
                      <Star size={14} />
                    ) : star - 0.5 <= (artwork.rating || 0) ? (
                      <StarHalf size={14} />
                    ) : (
                      <Star size={14} className="text-slate-300 dark:text-slate-600" />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                ({artwork.reviewCount || 0})
              </span>
            </div>
          )}
        </Link>

        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              {formatPrice(artwork.price)}
            </div>
            {artwork.originalPrice && (
              <div className="text-xs text-slate-500 dark:text-slate-400 line-through">
                ${artwork.originalPrice.toFixed(2)}
              </div>
            )}
          </div>
          {!artwork.isSoldOut && (
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
              onClick={handleAddToCart}
              disabled={isInCart(artwork.id)}
            >
              <ShoppingCart size={14} className="mr-1" />
              {isInCart(artwork.id) ? 'Added' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {/* Quick View Modal - Could be implemented with a modal component */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowQuickView(false)}
          ></div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <button 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowQuickView(false)}
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{artwork.title}</h2>
                <div className="flex items-center mb-4">
                  <img
                    src={artwork.creator.avatar}
                    alt={artwork.creator.username}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    by {artwork.creator.username}
                  </span>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {artwork.description}
                </p>
                
                <div className="mb-6">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(artwork.price)}
                  </div>
                  {artwork.originalPrice && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 line-through">
                      ${artwork.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 mb-6">
                  {!artwork.isSoldOut && (
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-grow flex items-center justify-center"
                      onClick={() => {
                        handleAddToCart();
                        setShowQuickView(false);
                      }}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </button>
                  )}
                  <button
                    className={`border px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      isInWishlist(artwork.id)
                        ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                    onClick={toggleWishlist}
                  >
                    <Heart
                      size={18}
                      className="mr-2"
                      fill={isInWishlist(artwork.id) ? 'currentColor' : 'none'}
                    />
                    {isInWishlist(artwork.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
                
                <Link
                  to={`/artwork/${artwork.id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline block text-center"
                  onClick={() => setShowQuickView(false)}
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
