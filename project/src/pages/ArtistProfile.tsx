import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';

type Artwork = {
  id: string;
  title: string;
  image: string;
  price?: number;
  createdAt: string;
  creator?: {
    username: string;
  };
};

type TabType = 'artworks' | 'followers' | 'following' | 'forSale';

interface ArtistProfileProps {
  // Add props if needed
}

const ArtistProfile: React.FC<ArtistProfileProps> = () => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('artworks');
  
  // Mock data - replace with actual API calls
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [forSale, setForSale] = useState<Artwork[]>([]);

  useEffect(() => {
    // Load artworks for sale from localStorage
    const stored = localStorage.getItem('user_marketplace_items');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const userArtworks = Array.isArray(parsed) 
          ? parsed.filter(art => art.creator?.username === username)
          : [];
        
        setArtworks(userArtworks);
        setForSale(userArtworks.filter(art => art.price));
      } catch (err) {
        console.error('Failed to parse artworks', err);
      }
    }
  }, [username]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
            {/* Profile image */}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{username}</h1>
            <div className="flex gap-4 mt-2">
              <span>0 Followers</span>
              <span>0 Following</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {['artworks', 'followers', 'following', 'forSale'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.split(/(?=[A-Z])/).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'artworks' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
            </div>
          )}

          {activeTab === 'forSale' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {forSale.map((art) => (
                <ArtworkCard key={art.id} artwork={art} showPrice />
              ))}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>{/* Followers list */}</div>
          )}

          {activeTab === 'following' && (
            <div>{/* Following list */}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ArtworkCard({ artwork, showPrice = false }: { artwork: Artwork; showPrice?: boolean }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow">
      <img 
        src={artwork.image} 
        alt={artwork.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium">{artwork.title}</h3>
        {showPrice && artwork.price && (
          <div className="mt-2 font-bold">${artwork.price}</div>
        )}
      </div>
    </div>
  );
}

export default ArtistProfile;
