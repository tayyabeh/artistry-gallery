import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../types';

interface WishlistContextType {
  items: Artwork[];
  addToWishlist: (artwork: Artwork) => void;
  removeFromWishlist: (artworkId: string) => void;
  isInWishlist: (artworkId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Artwork[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('artistry_wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('artistry_wishlist', JSON.stringify(items));
    setWishlistCount(items.length);
  }, [items]);

  const addToWishlist = (artwork: Artwork) => {
    const savedWishlist = localStorage.getItem('artistry_wishlist');
    let wishlistItems: Artwork[] = [];
    if (savedWishlist) {
      try {
        wishlistItems = JSON.parse(savedWishlist);
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage', error);
      }
    }
    const exists = wishlistItems.some((item) => item.id === artwork.id);
    if (exists) return;
    wishlistItems.push(artwork);
    localStorage.setItem('artistry_wishlist', JSON.stringify(wishlistItems));
    setItems(wishlistItems);
  };

  const removeFromWishlist = (artworkId: string) => {
    const savedWishlist = localStorage.getItem('artistry_wishlist');
    let wishlistItems: Artwork[] = [];
    if (savedWishlist) {
      try {
        wishlistItems = JSON.parse(savedWishlist);
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage', error);
      }
    }
    const newWishlistItems = wishlistItems.filter((item) => item.id !== artworkId);
    localStorage.setItem('artistry_wishlist', JSON.stringify(newWishlistItems));
    setItems(newWishlistItems);
  };

  const isInWishlist = (artworkId: string) => {
    return items.some((item) => item.id === artworkId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export default WishlistContext;
