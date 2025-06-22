import { Link } from 'react-router-dom';

interface ArtworkCardProps {
  id: string;
  title: string;
  image: string;
  creator: {
    username: string;
    avatar?: string;
  };
  price?: number;
  inStock?: boolean;
}

export default function ArtworkCard({
  id,
  title,
  image,
  creator,
  price,
  inStock
}: ArtworkCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/marketplace/artwork/${id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/marketplace/artwork/${id}`} className="block">
          <h3 className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {title}
          </h3>
        </Link>
        
        <Link 
          to={`/artist/${creator.username}`} 
          className="flex items-center mt-1 mb-3 hover:text-indigo-600"
        >
          {creator.avatar && (
            <img
              src={creator.avatar}
              alt={creator.username}
              className="w-5 h-5 rounded-full mr-2"
            />
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {creator.username}
          </span>
        </Link>
        
        {price !== undefined && (
          <div className="flex justify-between items-center">
            <div className="font-bold text-slate-900 dark:text-white">
              ${price.toFixed(2)}
            </div>
            {inStock ? (
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Add to Cart
              </button>
            ) : (
              <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">
                Sold Out
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
