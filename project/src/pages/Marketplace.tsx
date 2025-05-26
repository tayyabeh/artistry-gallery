import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Artwork, MarketplaceItem } from '../types';
import { mockArtworkData } from '../data/mockData';
import { Search, Filter, ShoppingCart, Heart, Tag, X, ChevronDown, ChevronsUpDown, Star, StarHalf, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Marketplace: React.FC = () => {
  const { items: cartItems, addToCart, isInCart, cartCount, setShowCart } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All', 'Paintings', 'Digital Art', 'Photography', 
    'Sculptures', 'Illustrations', 'Prints', 'Other'
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  // Convert artwork data to marketplace items
  useEffect(() => {
    setIsLoading(true);
    // Transform mockArtworkData to include price, currency, and inStock status
    const transformedData: MarketplaceItem[] = mockArtworkData.map(artwork => ({
      ...artwork,
      price: Math.floor(Math.random() * 1000) + 20, // Random price between $20 and $1020
      currency: 'USD',
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      // Add additional marketplace properties
      isOnSale: Math.random() > 0.7,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 10 : 0, // 10-50% discount
      rating: 3 + Math.random() * 2, // Rating between 3-5
      reviewCount: Math.floor(Math.random() * 50),
    }));

    setMarketplaceItems(transformedData);
    setFilteredItems(transformedData);
    setIsLoading(false);
  }, []);

  // Filter and sort items
  useEffect(() => {
    if (marketplaceItems.length === 0) return;

    let filtered = [...marketplaceItems];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(item => {
      return item.price >= priceRange[0] && item.price <= priceRange[1];
    });
    
    // Sort the filtered items
    switch (sortOption) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    setFilteredItems(filtered);
  }, [marketplaceItems, searchTerm, selectedCategory, priceRange, sortOption]);

  const handleAddToCart = (item: MarketplaceItem) => {
    addToCart(item);
  };

  const toggleWishlist = (item: MarketplaceItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const calculateDiscountedPrice = (item: MarketplaceItem) => {
    if (item.discount && item.discount > 0) {
      return item.price - (item.price * (item.discount / 100));
    }
    return item.price;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-slate-900 min-h-screen">
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-1/4 top-0 w-24 h-24 rotate-45 bg-white"></div>
            <div className="absolute right-1/3 bottom-0 w-16 h-16 rotate-12 bg-white"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover and Buy Original Artwork</h1>
                <p className="text-lg text-indigo-100 mb-6 max-w-2xl">
                  Buy directly from artists around the world. Each purchase supports independent creators.
                </p>
                <div className="flex space-x-4">
                  <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                    Start Browsing
                  </button>
                  <button className="bg-transparent border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors">
                    Sell Your Art
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:w-1/3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{marketplaceItems.length}</p>
                  <p className="text-indigo-100 text-sm">Artworks</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold">{Array.from(new Set(marketplaceItems.map(item => item.creator.id))).length}</p>
                  <p className="text-indigo-100 text-sm">Artists</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart & Wishlist Indicators */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">Marketplace</h2>
              <div className="flex items-center gap-4">
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Heart size={16} className="text-red-500" />
                  Wishlist 
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingBag size={16} />
                  Cart 
                  {cartCount > 0 && (
                    <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="relative w-full md:w-auto md:flex-1 max-w-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for artwork, artists, or styles..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <Filter size={16} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-full"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          (category === 'All' && !selectedCategory) || category === selectedCategory
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="px-2">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPriceRange([0, 1000]);
                      setSearchTerm('');
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Featured Products */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Featured Artwork</h2>
              <Link to="/featured" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {marketplaceItems.slice(0, 4).map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <button 
                        className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center ${
                          isInWishlist(item.id) 
                            ? 'text-red-500' 
                            : 'text-slate-400 hover:text-red-500'
                        } transition-colors`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(item);
                        }}
                      >
                        <Heart size={16} fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    {item.isOnSale && (
                      <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded">
                        {item.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/artwork/${item.id}`} className="block">
                      <h3 className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center mt-1 mb-2">
                        <img
                          src={item.creator.avatar}
                          alt={item.creator.username}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {item.creator.username}
                        </span>
                      </div>
                      {item.rating && (
                        <div className="flex items-center mb-2">
                          <div className="flex text-amber-400 mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star}>
                                {star <= Math.floor(item.rating) ? (
                                  <Star size={14} />
                                ) : star - 0.5 <= item.rating ? (
                                  <StarHalf size={14} />
                                ) : (
                                  <Star size={14} className="text-slate-300 dark:text-slate-600" />
                                )}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            ({item.reviewCount})
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatPrice(calculateDiscountedPrice(item))}
                        </div>
                        {item.isOnSale && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-through">
                            {formatPrice(item.price)}
                          </div>
                        )}
                      </div>
                      <button
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                          isInCart(item.id)
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                      >
                        <ShoppingCart size={14} className="mr-1" />
                        {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Listing */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Artwork ({filteredItems.length})</h2>
            </div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">No artworks match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    setPriceRange([0, 1000]);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <button 
                          className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center ${
                            isInWishlist(item.id) 
                              ? 'text-red-500' 
                              : 'text-slate-400 hover:text-red-500'
                          } transition-colors`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(item);
                          }}
                        >
                          <Heart size={16} fill={isInWishlist(item.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      {item.isOnSale && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded">
                          {item.discount}% OFF
                        </div>
                      )}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">
                            Sold Out
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Link to={`/artwork/${item.id}`} className="block">
                        <h3 className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center mt-1 mb-3">
                          <img
                            src={item.creator.avatar}
                            alt={item.creator.username}
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {item.creator.username}
                          </span>
                        </div>
                      </Link>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatPrice(calculateDiscountedPrice(item))}
                        </div>
                        {item.inStock ? (
                          <button
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                              isInCart(item.id)
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart size={14} className="mr-1" />
                            {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            disabled
                          >
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredItems.length > 0 && (
            <div className="mt-10 text-center">
              <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
