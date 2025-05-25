import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import { Artwork } from '../types';
import { TrendingUp, Siren as Fire, Clock, Filter } from 'lucide-react';
import { artworkAPI } from '../services/api';

const Home: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('trending');

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
      setArtworks(response.data);
      handleFilterChange(activeFilter, response.data);
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
      >
        <div className="mb-8">
          <h1 className="mb-2">Discover Inspiring Artwork</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Explore the latest digital art from creators around the world. Find inspiration, connect with artists, and share your own creations.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-8">
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
          
          <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Filter size={16} />
            <span className="ml-2">Filters</span>
          </button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ArtworkGrid artworks={artworks} />
        )}
      </motion.div>
    </Layout>
  );
};

export default Home;