import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../types';

type CartItem = {
  artwork: Artwork;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork, quantity?: number) => void;
  removeFromCart: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
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

  const addToCart = (artwork: Artwork, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.artwork.id === artwork.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { artwork, quantity }];
      }
    });
    
    // Show cart when adding items
    setShowCart(true);
    
    // Hide cart after 3 seconds
    setTimeout(() => {
      setShowCart(false);
    }, 3000);
  };

  const removeFromCart = (artworkId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.artwork.id !== artworkId));
  };

  const updateQuantity = (artworkId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.artwork.id === artworkId ? { ...item, quantity } : item
      )
    );
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
    updateQuantity,
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
