import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { mockCommentData } from '../data/mockData';
import { artworkAPI, orderAPI } from '../services/api';
import { Artwork, Comment, Purchase } from '../types';
import { 
  Heart, MessageCircle, Download, Share2, Pencil, 
  Clock, Tag, User, ArrowLeft, AlertCircle, Home as HomeIcon, RefreshCw
} from 'lucide-react';
import ArtworkGrid from '../components/artwork/ArtworkGrid';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error boundary intentionally left empty for production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We couldn't load the artwork details. Please try again later.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <HomeIcon size={16} />
                <span>Go Home</span>
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-left text-sm text-red-700 dark:text-red-300">
                <p className="font-mono">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ArtworkDetail: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [related, setRelated] = useState<Artwork[]>([]);
  const [liked, setLiked] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!id) {
          setError('No artwork ID provided');
          return;
        }

        const res = await artworkAPI.getArtworkById(id);
        if (!res.data?.artwork) {
          setError(res.data?.message ?? 'Artwork not found');
          return;
        }
        
        setArtwork(res.data.artwork);
        setLiked(res.data.artwork.isFavorited || false);
        
        const relatedRes = await artworkAPI.getRelatedArtworks(id);
        if (relatedRes.data?.artworks) {
          setRelated(relatedRes.data.artworks);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load artwork';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLike = () => {
    setLiked(!liked);
    if (artwork) {
      setArtwork({
        ...artwork,
        likes: liked ? artwork.likes - 1 : artwork.likes + 1,
        isFavorited: !liked
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // In a real app, this would be an API call to save the comment
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      user: mockCommentData[0].user, // Use the first mock user for this example
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  const handlePurchase = async () => {
    if (!artwork) return;
    
    setPurchaseLoading(true);
    setPurchaseError(null);
    
    try {
      const purchase: Purchase = {
        artworkId: artwork.id,
        quantity: 1,
        paymentMethod: 'stripe',
        billingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        }
      };
      
      const response = await orderAPI.createOrder(purchase);
      
      setPurchaseError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      setPurchaseError(errorMessage);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!artwork) return;
    
    setDownloadLoading(true);
    setDownloadError(null);
    
    try {
      const response = await orderAPI.downloadArtwork(artwork.id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${artwork.title}.jpg`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Go Home
          </Link>
        </div>
      </Layout>
    );
  }

  if (!artwork) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Artwork not found</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            The artwork you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to gallery
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Artwork Image */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <img 
                src={artwork.image} 
                alt={artwork.title} 
                className="w-full h-auto"
              />
              
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center hover:text-primary-600 transition-colors ${
                      liked ? 'text-primary-600' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Heart size={20} className={liked ? "fill-primary-500" : ""} />
                    <span className="ml-1">{artwork.likes}</span>
                  </button>
                  
                  <button className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <MessageCircle size={20} />
                    <span className="ml-1">{comments.length}</span>
                  </button>
                  
                  {downloadError && (
                    <div className="text-red-500 text-sm mb-2">{downloadError}</div>
                  )}
                  
                  <button 
                    onClick={handleDownload}
                    className={`flex items-center ${downloadLoading ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'} transition-colors`}
                    disabled={downloadLoading}
                  >
                    <Download size={20} />
                    <span className="ml-1">
                      {downloadLoading ? 'Downloading...' : artwork.downloads}
                    </span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handlePurchase}
                    className={`btn-primary ${purchaseLoading ? 'loading' : ''}`}
                    disabled={purchaseLoading}
                  >
                    {purchaseLoading ? 'Processing...' : 'Purchase'}
                  </button>
                  
                  {purchaseError && (
                    <div className="text-red-500 text-sm">{purchaseError}</div>
                  )}
                  
                  <button className="btn-outline">
                    <Share2 size={18} className="mr-1" />
                    <span>Share</span>
                  </button>
                  
                  <Link to="/editor" className="btn-primary">
                    <Pencil size={18} className="mr-1" />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="mb-4">Comments ({comments.length})</h3>
              
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input flex-1 rounded-r-none"
                  />
                  <button 
                    type="submit" 
                    className="btn-primary rounded-l-none"
                    disabled={!newComment.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
              
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => {
                    // Ensure comment and its properties exist
                    const commentUser = comment?.user || {};
                    const username = commentUser?.username || 'Unknown User';
                    const avatar = commentUser?.avatar || 'https://via.placeholder.com/40';
                    const content = comment?.content || '';
                    const commentDate = comment?.createdAt ? new Date(comment.createdAt) : new Date();
                    
                    return (
                      <div key={comment.id || Math.random().toString(36).substr(2, 9)} className="card p-4">
                        <div className="flex items-start">
                          <img 
                            src={avatar}
                            alt={username}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium">{username}</h4>
                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(commentDate.toString())}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-700 dark:text-slate-300 break-words">
                              {content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Artwork Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {artwork.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <img 
                    src={artwork.creator.avatar} 
                    alt={artwork.creator.username} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <Link to={`/profile/${artwork.creator.id}`} className="font-medium hover:text-primary-600 transition-colors">
                      {artwork.creator.username}
                    </Link>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {(artwork.creator.followers || 0).toLocaleString()} followers
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="mr-2" />
                    <span>Created on {formatDate(artwork.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Tag size={16} className="mr-2" />
                    <span>Category: {artwork.category}</span>
                  </div>
                  
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <User size={16} className="mr-2" />
                    <span>{artwork.views.toLocaleString()} views</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {artwork.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="mb-4">More from this artist</h3>
                <div className="grid grid-cols-2 gap-2">
                  {related.length > 0 ? (
                    related.slice(0, 4).map((art) => (
                      <Link key={art.id} to={`/artwork/${art.id}`}>
                        <div className="rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                          <img 
                            src={art.image} 
                            alt={art.title} 
                            className="w-full h-auto aspect-square object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/300';
                            }}
                          />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 py-4">
                      No other artworks found from this artist
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Artworks */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6">You might also like</h2>
            <ArtworkGrid artworks={related} />
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

// Wrap the component with ErrorBoundary
export default function ArtworkDetailWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ArtworkDetail />
    </ErrorBoundary>
  );
}