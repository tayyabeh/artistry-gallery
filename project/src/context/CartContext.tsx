import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../types';

export type CartItem = {
  artwork: Artwork;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  isInCart: (artworkId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('artistry_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('artistry_cart', JSON.stringify(items));
    
    // Update cart count and total
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    const total = items.reduce((sum, item) => {
      return sum + (item.artwork.price || 0) * item.quantity;
    }, 0);
    setCartTotal(total);
  }, [items]);

  const addToCart = async (artwork: Artwork) => {
    if (artwork.isSold) {
      alert('This artwork is already sold out!');
      return;
    }
    
    try {
      // Update backend first
      const response = await fetch(`/api/artworks/${artwork.id}/sold`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to mark artwork as sold');
      
      // Then update local state
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.artwork.id === artwork.id);
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.artwork.id === artwork.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        const updatedArtwork = { ...artwork, isSold: true };
        return [...prevItems, { artwork: updatedArtwork, quantity: 1 }];
      });
    } catch (error) {
      console.error('Error marking artwork as sold:', error);
      alert('Failed to complete purchase. Please try again.');
    }
  };

  const removeFromCart = (artworkId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.artwork.id !== artworkId));
  };



  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (artworkId: string) => {
    return items.some((item) => item.artwork.id === artworkId);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    cartCount,
    cartTotal,
    showCart,
    setShowCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
