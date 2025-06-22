import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../utils/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import { Artwork } from '../types';
import { TrendingUp, Siren as Fire, Clock, Filter, Plus, ArrowRight } from 'lucide-react';
import { artworkAPI } from '../services/api';

const Home: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { id: 'popular', label: 'Popular', icon: <Fire size={16} /> },
    { id: 'recent', label: 'Recent', icon: <Clock size={16} /> },
  ];

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await artworkAPI.getAllArtworks();
      const allArtworks = response.data.map((art: any) => ({ ...art, id: art._id || art.id }));
      
      // Set a featured artwork (typically this would come from the backend)
      if (allArtworks.length > 0) {
        setFeaturedArtwork(allArtworks[0]);
      }
      
      setArtworks(allArtworks);
      handleFilterChange(activeFilter, allArtworks);
      setError(null);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError('Failed to load artworks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string, artworksToFilter = artworks) => {
    setActiveFilter(filterId);
    
    // Filter the artworks based on the selected filter
    let filteredArtworks = [...artworksToFilter];
    
    if (filterId === 'popular') {
      filteredArtworks.sort((a, b) => b.likes - a.likes);
    } else if (filterId === 'recent') {
      filteredArtworks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      // trending - we'll use a mix of likes and views for this
      filteredArtworks.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
    }
    
    setArtworks(filteredArtworks);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-10"
      >
        {/* Hero Section with Featured Artwork */}
        {featuredArtwork && (
          <section className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
            <img 
              src={featuredArtwork.image} 
              alt={featuredArtwork.title} 
              className="w-full h-[450px] object-cover object-center"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="max-w-3xl">
                <span className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full mb-3 inline-block">
                  Featured Artwork
                </span>
                <h1 className="text-3xl font-bold text-white mb-3">{featuredArtwork.title}</h1>
                <p className="text-white/90 mb-6 line-clamp-2">{featuredArtwork.description}</p>
                <div className="flex items-center gap-4">
                  <Link 
                    to={`/artwork/${featuredArtwork.id}`}
                    className="px-6 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-white/90 transition-colors"
                  >
                    View Artwork
                  </Link>
                  <Link 
                    to={`/profile/${featuredArtwork.creator.username}`}
                    className="px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors flex items-center"
                  >
                    <img 
                      src={getAvatarUrl(featuredArtwork.creator)} 
                      alt={featuredArtwork.creator.displayName || featuredArtwork.creator.username} 
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                    {featuredArtwork.creator.username}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Welcome Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Discover Inspiring Artwork</h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                Explore the latest digital art from creators around the world. Find inspiration, connect with artists, and share your own creations.
              </p>
            </div>
            <Link 
              to="/upload"
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Create New Pin
            </Link>
          </div>
        </section>
        
        {/* Main Gallery Section with Enhanced Filters */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Featured Gallery</h2>
            
            <div className="flex items-center gap-2">
              <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-1 flex">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange(option.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeFilter === option.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Filter size={16} />
                <span className="ml-2">Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Medium</label>
                      <select className="input w-full">
                        <option>All Mediums</option>
                        <option>Digital Painting</option>
                        <option>3D Rendering</option>
                        <option>Pixel Art</option>
                        <option>Photography</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Style</label>
                      <select className="input w-full">
                        <option>All Styles</option>
                        <option>Abstract</option>
                        <option>Realistic</option>
                        <option>Surrealism</option>
                        <option>Anime/Manga</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <select className="input w-full">
                        <option>All Colors</option>
                        <option>Red</option>
                        <option>Blue</option>
                        <option>Green</option>
                        <option>Monochrome</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Search</label>
                      <input 
                        type="text" 
                        placeholder="Search artwork..." 
                        className="input w-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Artwork Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 p-4 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={fetchArtworks}
                className="mt-2 text-sm font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <ArtworkGrid artworks={artworks} />
          )}
          
          <div className="flex justify-center mt-8">
            <button className="btn-outline flex items-center gap-2">
              Load More Artworks
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-900/90 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=1470" 
            alt="Create your own art" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-3xl font-bold text-white mb-3">Ready to showcase your creativity?</h2>
            <p className="text-white/90 mb-6 max-w-xl">
              Join our growing community of artists and share your work with the world. Get feedback, connect with fans, and discover new opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/upload"
                className="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Pin
              </Link>
              <Link 
                to="/explore"
                className="px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
              >
                Explore Artwork
              </Link>
            </div>
          </div>
        </section>
      </motion.div>
    </Layout>
  );
};

export default Home;