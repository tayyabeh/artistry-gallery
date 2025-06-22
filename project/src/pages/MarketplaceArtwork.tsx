import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Artwork, MarketplaceItem } from '../types';
import { mockArtworkData } from '../data/mockData';
import { useCart, CartItem } from '../context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const MarketplaceArtworkPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, isInCart, items } = useCart();

  useEffect(() => {
    const allMarketplaceItems = () => {
      const mockItems: MarketplaceItem[] = mockArtworkData.map((art: Artwork) => ({
        ...art,
        price: Math.floor(Math.random() * 1000) + 20,
        currency: 'USD',
        inStock: Math.random() > 0.2,
        rating: 3 + Math.random() * 2,
        reviewCount: Math.floor(Math.random() * 50),
        isOnSale: Math.random() > 0.7,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 10 : 0,
      }));

      const stored = localStorage.getItem('user_marketplace_items');
      let userItems: MarketplaceItem[] = [];
      if (stored) {
        try {
          userItems = JSON.parse(stored);
        } catch (err) {
          console.error('Failed to parse user marketplace items', err);
        }
      }
      return [...userItems, ...mockItems];
    };

    const items = allMarketplaceItems();
    const foundArtwork = items.find(item => item.id === id);

    if (foundArtwork) {
      setArtwork(foundArtwork);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    // Check if the current artwork in the cart has been sold
            if (artwork && items.find((i: CartItem) => i.artwork.id === artwork.id)) {
      const stored = localStorage.getItem('user_marketplace_items');
      if (stored) {
        const userItems: MarketplaceItem[] = JSON.parse(stored);
        const updatedItem = userItems.find(i => i.id === artwork.id);
        if (updatedItem && !updatedItem.inStock) {
          setArtwork(updatedItem);
        }
      }
    }
  }, [items, artwork]);

  if (isLoading) {
    return <Layout><div className="text-center p-10">Loading...</div></Layout>;
  }

  if (!artwork) {
    return <Layout><div className="text-center p-10">Artwork not found.</div></Layout>;
  }

  const { title, image, price, description, creator, inStock, category, tags } = artwork;

  const handleAddToCart = () => {
    if (artwork) {
      addToCart(artwork, 1);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/marketplace" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          Back to Marketplace
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <img src={image} alt={title} className="w-full h-full object-contain" />
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
            <div className="mb-4">
              <span className="text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2.5 py-1 rounded-full">{category}</span>
            </div>

            <div className="flex items-center mb-6">
              <Link to={`/profile/${creator.username}`} className="flex items-center">
                <img src={creator.avatar} alt={creator.username} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600">{creator.displayName || creator.username}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">View Profile</p>
                </div>
              </Link>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6">
              <p>{description || 'No description available.'}</p>
            </div>
            
            {tags && tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${price?.toFixed(2)}</p>
              </div>
              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-lg text-lg font-semibold flex items-center justify-center transition-colors ${
                    isInCart(artwork.id)
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {isInCart(artwork.id) ? 'Added to Cart' : 'Add to Cart'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-lg text-lg font-semibold flex items-center justify-center bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed">
                  Sold Out
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceArtworkPage;
