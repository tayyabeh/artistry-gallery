import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Download } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';
import { formatPrice } from '../../utils/formatPrice';
import { Artwork } from '../../types';

interface ArtworkCardProps {
  artwork: Artwork;
  /**
   * Optional callback executed when the artwork card is clicked.
   * NOTE: this callback is executed before navigation to allow parents
   * to track analytics, open modals, etc.
   */
  onArtworkClick?: (artwork: Artwork) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onArtworkClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    // fire optional callback first
    if (onArtworkClick) {
      onArtworkClick(artwork);
    }

    // then navigate to the artwork detail route
    navigate(`/artwork/${artwork.id}`, { state: { artwork } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay that appears on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 flex flex-col justify-end"
        >
          <h3 className="text-white font-medium text-lg mb-1">{artwork.title}</h3>
          <Link to={`/profile/${artwork.creator.username}`} className="flex items-center space-x-1 hover:underline">
            <img 
              src={getAvatarUrl(artwork.creator)} 
              alt={artwork.creator.displayName || artwork.creator.username} 
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-white text-sm">{artwork.creator.displayName || artwork.creator.username || 'Artist'}</span>
          </Link>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button className="flex items-center text-white hover:text-primary-300 transition-colors">
                <Heart size={18} className={artwork.isFavorited ? "fill-primary-500 text-primary-500" : ""} />
                <span className="ml-1 text-xs">{artwork.likes}</span>
              </button>
              <button className="flex items-center text-white hover:text-primary-300 transition-colors">
                <MessageCircle size={18} />
                <span className="ml-1 text-xs">{artwork.comments}</span>
              </button>
              <button className="flex items-center text-white hover:text-primary-300 transition-colors">
                <Download size={18} />
                <span className="ml-1 text-xs">{artwork.downloads}</span>
              </button>
            </div>
          </div>
          {artwork.price && (
            <div className="flex items-center justify-between mt-2">
              <span className="font-medium">
                {formatPrice(artwork.price, artwork.currency)}
              </span>
              {artwork.isSold && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Sold Out
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArtworkCard;