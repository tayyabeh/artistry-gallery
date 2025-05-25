import React from 'react';
import Masonry from 'react-masonry-css';
import { Artwork } from '../../types';
import ArtworkCard from './ArtworkCard';

interface ArtworkGridProps {
  artworks: Artwork[];
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ artworks }) => {
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
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </Masonry>
  );
};

export default ArtworkGrid;