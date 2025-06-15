import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import CoverPhotoUpload from '../components/profile/CoverPhotoUpload';
// import { mockUserData, mockArtworkData } from '../data/mockData';
import { 
  Heart, Download, Users, Edit, Settings, 
  ShoppingBag, Clock, Pencil,
  Facebook, Twitter, Instagram, Globe, Bell,
  CheckCircle, User, Share2
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { artworkAPI } from '../services/api';
import { Artwork } from '../types';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ProfilePhotoUpload from '../components/profile/ProfilePhotoUpload';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('artwork');
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  
  const handleProfilePhotoChange = async (file: File | null) => {
    if (!file) {
      // Handle photo removal
      try {
        setIsUploading(true);
        setUploadError(null);
        await authAPI.deleteAvatar();
        // Refresh user data to get the latest state
        await refreshUser();
      } catch (error) {
        console.error('Failed to remove profile photo:', error);
        setUploadError('Failed to remove profile photo');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Handle new photo upload
    try {
      setIsUploading(true);
      setUploadError(null);
      
      console.log('Uploading file:', file.name, file.type, file.size);
      
      // Upload the avatar and refresh user data
      const response = await authAPI.uploadAvatar(file);
      console.log('Upload response:', response);
      
      await refreshUser();
      
    } catch (error: any) {
      console.error('Failed to upload profile photo:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setUploadError(`Upload failed: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setUploadError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        setUploadError(`Upload failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle cover photo upload
  const handleCoverPhotoChange = async (file: File | null) => {
    if (!file) {
      // Handle cover photo removal
      try {
        setIsUploadingCover(true);
        setCoverUploadError(null);
        await authAPI.deleteCover();
        await refreshUser();
      } catch (error) {
        console.error('Failed to remove cover photo:', error);
        setCoverUploadError('Failed to remove cover photo');
      } finally {
        setIsUploadingCover(false);
      }
      return;
    }

    // Handle new cover photo upload
    try {
      setIsUploadingCover(true);
      setCoverUploadError(null);
      
      console.log('Uploading cover file:', file.name, file.type, file.size);
      
      // Upload the cover and refresh user data
      const response = await authAPI.uploadCover(file);
      console.log('Cover upload response:', response);
      
      await refreshUser();
      
    } catch (error: any) {
      console.error('Failed to upload cover photo:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setCoverUploadError(`Upload failed: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setCoverUploadError('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setCoverUploadError(`Upload failed: ${error.message}`);
      }
    } finally {
      setIsUploadingCover(false);
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <span className="text-slate-500">Loading profile...</span>
        </div>
      </Layout>
    );
  }

  const currentUser = user;
  
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [favoriteArtworks] = useState<Artwork[]>([]);
  
  // Fetch artworks created by the current user
  useEffect(() => {
    const fetchUserArtworks = async () => {
      try {
        const res = await artworkAPI.getAllArtworks();
        const all: Artwork[] = res.data;
        // Match artworks where creator matches current user id or is an object containing that id
        const mine = all.filter((art: any) => {
          if (!art.creator) return false;
          if (typeof art.creator === 'string') return art.creator === currentUser.id;
          return art.creator === currentUser.id || art.creator._id === currentUser.id || art.creator.id === currentUser.id;
        });
        setUserArtworks(mine);
      } catch (err) {
        console.error('Failed to load user artworks', err);
      }
    };
    fetchUserArtworks();
  }, [currentUser.id]);
  
  // Followers/Following counts from user data (fallback to 0)
  const followersCount = currentUser.followers ?? 0;
  const followingCount = currentUser.following ?? 0;
  
  // Stats – replace placeholder numbers with user data when available
  const stats = [
    { label: 'Artworks', value: userArtworks.length, icon: ShoppingBag },
    { label: 'Likes', value: userArtworks.reduce((sum, art) => sum + (art.likes ?? 0), 0), icon: Heart },
    { label: 'Views', value: currentUser.views ?? 0, icon: Clock },
    { label: 'Downloads', value: currentUser.downloads ?? 0, icon: Download },
  ];
  
  // For shareable link functionality
  const shareProfileLink = () => {
    const profileUrl = `${window.location.origin}/profile/${currentUser.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Profile Header */}
        <div className="relative">
          <div className="relative h-64 rounded-xl overflow-hidden">
            <CoverPhotoUpload 
              currentImage={currentUser.coverImage || ''}
              onImageChange={handleCoverPhotoChange}
              disabled={isUploadingCover}
              className="h-full w-full"
            />
            {isUploadingCover && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            {coverUploadError && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {coverUploadError}
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative">
              <ProfilePhotoUpload
                currentImage={currentUser.avatar}
                onImageChange={handleProfilePhotoChange}
                size="md"
                className="border-4 border-white dark:border-slate-800"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              {uploadError && (
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pl-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{currentUser.displayName || currentUser.username}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">@{currentUser.username}</p>
              
              {/* Followers/Following Stats */}
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Users size={16} className="mr-1" />
                  <span className="font-medium">{followersCount.toLocaleString()}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">followers</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <User size={16} className="mr-1" />
                  <span className="font-medium">{followingCount.toLocaleString()}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">following</span>
                </div>
              </div>
              
              {currentUser.location && (
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  {currentUser.location}
                </p>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {/* Share Profile Button */}
              <button 
                onClick={shareProfileLink}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    Share Profile
                  </>
                )}
              </button>
              
              <RouterLink 
                to="/profile/edit" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </RouterLink>
              
              <RouterLink 
                to="/profile/settings" 
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Settings size={16} />
                Settings
              </RouterLink>
            </div>
          </div>
          
          <div className="mt-4 max-w-3xl">
            <p className="text-slate-600 dark:text-slate-400">
              {currentUser.bio || "No bio yet."}
            </p>
            
            {/* Social Links */}
            {currentUser.socialLinks && (
              <div className="flex gap-4 mt-4">
                {currentUser.socialLinks.twitter && (
                  <a href={currentUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 transition-colors">
                    <Twitter size={18} />
                  </a>
                )}
                {currentUser.socialLinks.instagram && (
                  <a href={currentUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-500 transition-colors">
                    <Instagram size={18} />
                  </a>
                )}
                {currentUser.socialLinks.facebook && (
                  <a href={currentUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                    <Facebook size={18} />
                  </a>
                )}
                {currentUser.socialLinks.website && (
                  <a href={currentUser.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-500 transition-colors">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center space-x-2">
                <stat.icon className="w-5 h-5 text-indigo-500" />
                <span className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('artwork')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'artwork'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Artworks</span>
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Favorites</span>
            </button>
            
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'followers'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Followers</span>
            </button>
            
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Following</span>
            </button>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'artwork' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Artworks</h2>
                <RouterLink 
                  to="/upload" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Upload New
                </RouterLink>
              </div>
              <ArtworkGrid artworks={userArtworks} />
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Favorite Artworks</h2>
              <ArtworkGrid artworks={favoriteArtworks} />
            </div>
          )}
          
          {activeTab === 'followers' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Followers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mock follower data */}
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <img 
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${(i % 70) + 1}.jpg`} 
                      alt="Follower" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium">User #{i+1}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@username{i+1}</p>
                    </div>
                    <button className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                      Following
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'following' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Following</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mock following data */}
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <img 
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${(i % 70) + 30}.jpg`} 
                      alt="Following" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium">Artist #{i+1}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@artist{i+1}</p>
                    </div>
                    <button className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                      Following
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Analytics Dashboard</h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Analytics dashboard will appear here with charts for views, downloads, and purchases.
                  <br />
                  <RouterLink 
                    to="/dashboard" 
                    className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Go to Full Dashboard
                  </RouterLink>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;