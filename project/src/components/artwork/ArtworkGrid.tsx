import React from 'react';
import Masonry from 'react-masonry-css';
import { Artwork } from '../../types';
import ArtworkCard from './ArtworkCard';

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick?: (artwork: Artwork) => void;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ artworks, onArtworkClick }) => {
  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} onArtworkClick={onArtworkClick} />
      ))}
    </Masonry>
  );
};

export default ArtworkGrid;