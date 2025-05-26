import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const MiniCart: React.FC = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    showCart, 
    setShowCart 
  } = useCart();

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      {showCart && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-medium flex items-center">
                <ShoppingBag size={20} className="mr-2" />
                Your Cart
              </h2>
              <button
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Looks like you haven't added any artwork to your cart yet.
                </p>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto p-4">
                  {items.map((item) => (
                    <div
                      key={item.artwork.id}
                      className="flex border-b border-slate-200 dark:border-slate-700 py-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.artwork.image}
                          alt={item.artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {item.artwork.title}
                          </h3>
                          <button
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => removeFromCart(item.artwork.id)}
                            aria-label={`Remove ${item.artwork.title} from cart`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          by {item.artwork.creator.username}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                            <button
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                              onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 py-1 text-sm">{item.quantity}</span>
                            <button
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                              onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold">
                            {formatPrice((item.artwork.price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                    <span className="font-bold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                    <span className="font-bold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
                  </div>
                  <Link
                    to="/checkout"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full block text-center"
                  >
                    Checkout <ArrowRight size={16} className="inline ml-1" />
                  </Link>
                  <button
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm w-full"
                    onClick={() => setShowCart(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;
