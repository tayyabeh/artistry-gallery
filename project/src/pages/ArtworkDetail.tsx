import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { mockArtworkData, mockCommentData } from '../data/mockData';
import { Artwork, Comment } from '../types';
import { 
  Heart, MessageCircle, Download, Share2, Pencil, 
  Clock, Tag, User, ArrowLeft 
} from 'lucide-react';
import ArtworkGrid from '../components/artwork/ArtworkGrid';

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [related, setRelated] = useState<Artwork[]>([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      const foundArtwork = mockArtworkData.find(art => art.id === id);
      if (foundArtwork) {
        setArtwork(foundArtwork);
        setLiked(foundArtwork.isFavorited || false);
        
        // Find related artworks (same category or tags)
        const relatedWorks = mockArtworkData.filter(art => 
          art.id !== id && 
          (art.category === foundArtwork.category || 
           art.tags.some(tag => foundArtwork.tags.includes(tag)))
        ).slice(0, 4);
        
        setRelated(relatedWorks);
        setComments(mockCommentData);
      }
      setIsLoading(false);
    }, 500);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
                  
                  <button className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Download size={20} />
                    <span className="ml-1">{artwork.downloads}</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
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
                {comments.map((comment) => (
                  <div key={comment.id} className="card p-4">
                    <div className="flex items-start">
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.username} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium">{comment.user.username}</h4>
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                      {artwork.creator.followers.toLocaleString()} followers
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
                  {mockArtworkData
                    .filter(art => art.creator.id === artwork.creator.id && art.id !== artwork.id)
                    .slice(0, 4)
                    .map(art => (
                      <Link key={art.id} to={`/artwork/${art.id}`}>
                        <div className="rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                          <img 
                            src={art.image} 
                            alt={art.title} 
                            className="w-full h-auto aspect-square object-cover"
                          />
                        </div>
                      </Link>
                    ))
                  }
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

export default ArtworkDetail;