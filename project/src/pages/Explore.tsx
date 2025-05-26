import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import { Artwork } from '../types';
import { Camera, Palette, Heart, HomeIcon, Shirt, Utensils, Plane, Music, Tv, MessageCircle, Search, PanelRight, Sparkles, Zap, Compass, TrendingUp, X, Bookmark, BookmarkPlus, Share2, Plus } from 'lucide-react';
import { mockArtworkData } from '../data/mockData';

// Explore page theme options
enum ExploreTheme {
  LIGHT = 'light',
  DARK = 'dark',
  COLORFUL = 'colorful',
  MINIMAL = 'minimal'
}

const Explore: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworkData);
  const [newArtworks, setNewArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [theme, setTheme] = useState<ExploreTheme>(ExploreTheme.LIGHT);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredArtwork, setHoveredArtwork] = useState<string | null>(null);
  const [inspirationalQuote, setInspirationalQuote] = useState<string>('Art is not what you see, but what you make others see.');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'portraits', label: 'Portraits', icon: <Camera size={20} />, bgColor: 'bg-pink-100', darkBgColor: 'dark:bg-pink-900/30', color: 'text-pink-700', darkColor: 'dark:text-pink-300' },
    { id: 'art', label: 'Art', icon: <Palette size={20} />, bgColor: 'bg-blue-100', darkBgColor: 'dark:bg-blue-900/30', color: 'text-blue-700', darkColor: 'dark:text-blue-300' },
    { id: 'beauty', label: 'Beauty', icon: <Camera size={20} />, bgColor: 'bg-orange-100', darkBgColor: 'dark:bg-orange-900/30', color: 'text-orange-700', darkColor: 'dark:text-orange-300' },
    { id: 'design', label: 'Design', icon: <Palette size={20} />, bgColor: 'bg-green-100', darkBgColor: 'dark:bg-green-900/30', color: 'text-green-700', darkColor: 'dark:text-green-300' },
    { id: 'digital-painting', label: 'Digital Painting', icon: <Palette size={20} />, bgColor: 'bg-purple-100', darkBgColor: 'dark:bg-purple-900/30', color: 'text-purple-700', darkColor: 'dark:text-purple-300' },
    { id: 'food', label: 'Food & Drink', icon: <Utensils size={20} />, bgColor: 'bg-yellow-100', darkBgColor: 'dark:bg-yellow-900/30', color: 'text-yellow-700', darkColor: 'dark:text-yellow-300' },
    { id: 'home', label: 'Home Decor', icon: <HomeIcon size={20} />, bgColor: 'bg-indigo-100', darkBgColor: 'dark:bg-indigo-900/30', color: 'text-indigo-700', darkColor: 'dark:text-indigo-300' },
    { id: 'mens', label: "Men's Fashion", icon: <Shirt size={20} />, bgColor: 'bg-amber-100', darkBgColor: 'dark:bg-amber-900/30', color: 'text-amber-700', darkColor: 'dark:text-amber-300' },
    { id: 'womens', label: "Women's Fashion", icon: <Shirt size={20} />, bgColor: 'bg-rose-100', darkBgColor: 'dark:bg-rose-900/30', color: 'text-rose-700', darkColor: 'dark:text-rose-300' },
    { id: 'travel', label: 'Travel', icon: <Plane size={20} />, bgColor: 'bg-teal-100', darkBgColor: 'dark:bg-teal-900/30', color: 'text-teal-700', darkColor: 'dark:text-teal-300' },
    { id: 'music', label: 'Music', icon: <Music size={20} />, bgColor: 'bg-green-100', darkBgColor: 'dark:bg-green-900/30', color: 'text-green-700', darkColor: 'dark:text-green-300' },
    { id: 'entertainment', label: 'Entertainment', icon: <Tv size={20} />, bgColor: 'bg-cyan-100', darkBgColor: 'dark:bg-cyan-900/30', color: 'text-cyan-700', darkColor: 'dark:text-cyan-300' },
  ];

  const themeOptions = [
    { id: ExploreTheme.LIGHT, label: 'Light' },
    { id: ExploreTheme.DARK, label: 'Dark' },
    { id: ExploreTheme.COLORFUL, label: 'Colorful' },
    { id: ExploreTheme.MINIMAL, label: 'Minimal' },
  ];

  const inspirationalQuotes = [
    'Art is not what you see, but what you make others see.',
    'Creativity takes courage.',
    'Every artist was first an amateur.',
    'Art enables us to find ourselves and lose ourselves at the same time.',
    'Art is the lie that enables us to realize the truth.',
    'Art should comfort the disturbed and disturb the comfortable.',
    'The purpose of art is washing the dust of daily life off our souls.',
    'To be an artist is to believe in life.',
    'The painter has the Universe in his mind and hands.',
    'Great art picks up where nature ends.'
  ];

  useEffect(() => {
    // Sort recent artworks by creation date
    const sorted = [...mockArtworkData].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNewArtworks(sorted.slice(0, 8));

    // Select a random inspirational quote
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    setInspirationalQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Filter artworks based on selected category
      const filtered = mockArtworkData.filter(artwork => 
        artwork.category.toLowerCase().includes(selectedCategory)
      );
      setArtworks(filtered);
    } else {
      setArtworks(mockArtworkData);
    }
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = mockArtworkData.filter(artwork => 
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.creator.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setArtworks(filtered);
    } else {
      setArtworks(mockArtworkData);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setArtworks(mockArtworkData);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getThemeClass = () => {
    switch(theme) {
      case ExploreTheme.DARK:
        return 'bg-slate-900 text-white';
      case ExploreTheme.COLORFUL:
        return 'bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900/20 dark:to-blue-900/20';
      case ExploreTheme.MINIMAL:
        return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  return (
    <Layout>
      <div className={`relative ${getThemeClass()} transition-colors duration-300`}>
        {/* Inspirational quote banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-3 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-1/4 top-0 w-12 h-12 rotate-45 bg-white"></div>
            <div className="absolute right-1/3 bottom-0 w-8 h-8 rotate-12 bg-white"></div>
            <div className="absolute left-2/3 top-1/2 w-6 h-6 -rotate-12 bg-white"></div>
          </div>
          <p className="text-sm md:text-base font-medium italic relative z-10">{inspirationalQuote}</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Search and theme options */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <form onSubmit={handleSearch} className="relative w-full md:w-auto md:flex-1 max-w-xl">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for artwork, artists, or styles..."
                className="input pl-10 pr-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={18} />
                </button>
              )}
            </form>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {themeOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      theme === option.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                aria-label="Toggle sidebar"
              >
                <PanelRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:flex-1">
              <h1 className="text-3xl font-bold mb-6">Explore the best of Artistry</h1>
              
              {/* Categories Section */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Browse by category</h2>
                  {selectedCategory && (
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      Clear filter <X size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map((category) => (
                    <button 
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${category.bgColor} ${category.darkBgColor} hover:bg-opacity-80 transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center h-28 ${
                        selectedCategory === category.id ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                      }`}
                    >
                      <div className={`mb-2 ${category.color} ${category.darkColor}`}>{category.icon}</div>
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* What's New Section */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">What's new on Artistry</h2>
                  <Link 
                    to="/new" 
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    View all <Sparkles size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newArtworks.map((artwork) => (
                    <div
                      key={artwork.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredArtwork(artwork.id)}
                      onMouseLeave={() => setHoveredArtwork(null)}
                    >
                      <Link 
                        to={`/artwork/${artwork.id}`} 
                        className="block overflow-hidden rounded-xl"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <motion.img
                            src={artwork.image}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <h3 className="text-white font-medium text-sm">{artwork.title}</h3>
                            <div className="flex items-center space-x-1 mt-1">
                              <img 
                                src={artwork.creator.avatar} 
                                alt={artwork.creator.username} 
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-white text-xs">{artwork.creator.username}</span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Quick action buttons that appear on hover */}
                      <AnimatePresence>
                        {hoveredArtwork === artwork.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-2 right-2 flex flex-col gap-2"
                          >
                            <button 
                              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                              aria-label="Save to collection"
                            >
                              <BookmarkPlus size={16} />
                            </button>
                            <button 
                              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                              aria-label="Share artwork"
                            >
                              <Share2 size={16} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Featured Collections */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Featured Collections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-5 flex items-center group hover:shadow-md transition-shadow">
                    <div className="mr-4">
                      <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <Heart size={32} className="text-pink-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Most Loved</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Discover the artwork that everyone's falling in love with</p>
                      <Link to="/collection/most-loved" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                        View collection →
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-5 flex items-center group hover:shadow-md transition-shadow">
                    <div className="mr-4">
                      <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <MessageCircle size={32} className="text-orange-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Most Discussed</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Join the conversation around these trending pieces</p>
                      <Link to="/collection/most-discussed" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                        View collection →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Popular Artists */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Popular Artists to Follow</h2>
                  <Link 
                    to="/artists" 
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    Discover more <TrendingUp size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mockArtworkData.slice(0, 6).map((artwork) => (
                    <Link 
                      key={artwork.id}
                      to={`/profile/${artwork.creator.username}`} 
                      className="flex flex-col items-center text-center group"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg mb-2 group-hover:scale-105 transition-transform">
                        <img 
                          src={artwork.creator.avatar} 
                          alt={artwork.creator.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-sm font-medium">{artwork.creator.username}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Artist</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:block border-l border-slate-200 dark:border-slate-700 pl-6 space-y-8 overflow-hidden"
                >
                  <div>
                    <h3 className="font-semibold mb-4">Discover</h3>
                    <div className="space-y-2">
                      {['Trending', 'New Artists', 'Popular This Week', 'Editor\'s Choice', 'Most Discussed'].map((item) => (
                        <Link 
                          key={item} 
                          to={`/discover/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 group"
                        >
                          <div className="w-1 h-1 rounded-full bg-slate-400 mr-2 group-hover:bg-primary-500 transition-colors"></div>
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Your Collections</h3>
                    <div className="space-y-3">
                      {['Favorites', 'Inspiration', 'Design Ideas', 'Photography', 'To Buy'].map((item, index) => (
                        <Link 
                          key={item} 
                          to={`/collections/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <Bookmark size={16} className="mr-2" />
                          {item}
                          <span className="ml-auto text-xs text-slate-500">{(20 - index * 3)}</span>
                        </Link>
                      ))}
                    </div>
                    <button className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      Create new collection <Plus size={14} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Theme</h3>
                    <div className="space-y-2">
                      {themeOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id)}
                          className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                            theme === option.id
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-primary-500 mr-2"></span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Need inspiration?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Discover today's creative prompts to spark your imagination.</p>
                    <Link 
                      to="/inspire-me" 
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <Zap size={14} className="mr-1" />
                      Get inspired
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Explore;