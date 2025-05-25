import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import { mockArtworkData } from '../data/mockData';
import { Artwork } from '../types';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'digital-painting', label: 'Digital Painting' },
  { id: '3d-art', label: '3D Art' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'anime', label: 'Anime' },
  { id: 'photography', label: 'Photography' },
];

const Explore: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworkData);
  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get category from URL if present
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setActiveCategory(categoryParam);
    }

    // Sort recent artworks by creation date
    const sorted = [...mockArtworkData].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentArtworks(sorted.slice(0, 6));
  }, []);

  useEffect(() => {
    // Filter artworks based on selected category
    const filtered = mockArtworkData.filter(artwork => 
      activeCategory === 'all' || artwork.category.toLowerCase().replace(/\s+/g, '-') === activeCategory
    );
    setArtworks(filtered);

    // Update URL with selected category
    const newUrl = activeCategory === 'all' 
      ? window.location.pathname 
      : `${window.location.pathname}?category=${activeCategory}`;
    window.history.pushState({}, '', newUrl);
  }, [activeCategory]);

  const scroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Category Filter */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-2 px-8 py-2 -mx-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Main Artwork Grid */}
        <div>
          <ArtworkGrid artworks={artworks} />
        </div>

        {/* Recently Added Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recently Added</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentArtworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-2 py-1 text-xs font-medium bg-accent-500 text-white rounded-full shadow-lg">
                    New ✨
                  </span>
                </div>
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg p-4 flex flex-col justify-end"
                >
                  <h3 className="text-white font-medium text-sm">{artwork.title}</h3>
                  <p className="text-white/80 text-xs">{artwork.creator.username}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Explore;