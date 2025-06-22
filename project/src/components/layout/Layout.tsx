import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MiniCart from '../cart/MiniCart';
import WishlistPanel from '../wishlist/WishlistPanel';

interface LayoutProps {
  children: React.ReactNode;
  disablePadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, disablePadding = false }) => {
  const location = useLocation();
  
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -10,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={disablePadding ? 'w-full h-full flex flex-col overflow-hidden' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Cart and Wishlist Panels */}
      <MiniCart />
      <WishlistPanel />
    </div>
  );
};

export default Layout;