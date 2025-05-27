import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const WishlistPanel: React.FC = () => {
  const [showWishlist, setShowWishlist] = useState(false);
  const { items, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  // Toggle wishlist panel visibility
  const toggleWishlist = () => {
    setShowWishlist(!showWishlist);
  };

  return (
    <>
      {/* Wishlist Button */}
      <button
        className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-30"
        onClick={toggleWishlist}
        aria-label="Open wishlist"
      >
        <Heart className="h-6 w-6" />
        {wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showWishlist && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowWishlist(false)}
            />

            {/* Wishlist Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-medium flex items-center">
                  <Heart size={20} className="mr-2" />
                  Your Wishlist
                </h2>
                <button
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => setShowWishlist(false)}
                  aria-label="Close wishlist"
                >
                  <X size={20} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Heart size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Looks like you haven't added any artwork to your wishlist yet.
                  </p>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => setShowWishlist(false)}
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-grow overflow-y-auto p-4">
                    {items.map((artwork) => (
                      <div
                        key={artwork.id}
                        className="flex border-b border-slate-200 dark:border-slate-700 py-4"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {artwork.title}
                            </h3>
                            <button
                              className="text-slate-400 hover:text-red-500"
                              onClick={() => removeFromWishlist(artwork.id)}
                              aria-label={`Remove ${artwork.title} from wishlist`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            by {artwork.creator.username}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">
                              {artwork.price ? `$${artwork.price.toFixed(2)}` : 'Price on request'}
                            </span>
                            <button
                              className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
                              onClick={() => {
                                addToCart(artwork);
                                removeFromWishlist(artwork.id);
                              }}
                              disabled={artwork.isSoldOut}
                            >
                              <ShoppingCart size={14} className="mr-1" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <Link
                      to="/marketplace"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full block text-center"
                      onClick={() => setShowWishlist(false)}
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WishlistPanel;
