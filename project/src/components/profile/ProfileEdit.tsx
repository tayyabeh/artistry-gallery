import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, X, Save, Upload, Trash, Facebook, 
  Twitter, Instagram, Globe, AlertCircle, 
  User, Bell, BellOff, Lock, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';
// import { mockUserData } from '../../data/mockData';
import { authAPI } from '../../services/api';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>
      </Layout>
    );
  }

  const currentUser = user;
  
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName || currentUser.username,
    username: currentUser.username,
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    email: currentUser.email,
    phone: currentUser.phone || '',
    profileImage: currentUser.avatar,
    coverImage: currentUser.coverImage || '',
    socialLinks: {
      twitter: currentUser.socialLinks?.twitter || '',
      instagram: currentUser.socialLinks?.instagram || '',
      facebook: currentUser.socialLinks?.facebook || '',
      website: currentUser.socialLinks?.website || '',
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested social links
    if (name.startsWith('social.')) {
      const socialNetwork = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [socialNetwork]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Validate social links if provided
    if (formData.socialLinks.twitter && !formData.socialLinks.twitter.includes('twitter.com')) {
      newErrors['social.twitter'] = 'Must be a valid Twitter URL';
    }
    
    if (formData.socialLinks.instagram && !formData.socialLinks.instagram.includes('instagram.com')) {
      newErrors['social.instagram'] = 'Must be a valid Instagram URL';
    }
    
    if (formData.socialLinks.facebook && !formData.socialLinks.facebook.includes('facebook.com')) {
      newErrors['social.facebook'] = 'Must be a valid Facebook URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await authAPI.updateProfile({
          displayName: formData.displayName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          socialLinks: formData.socialLinks,
          avatar: formData.profileImage,
          coverImage: formData.coverImage
        });
        // On success navigate back
        await refreshUser();
        navigate('/profile');
      } catch (err) {
        console.error('Profile update failed', err);
        alert('Failed to update profile');
      }
      
      // Update profile image if changed
      if (profileImagePreview) {
        formData.profileImage = profileImagePreview;
      }
      
      // Update cover image if changed
      if (coverImagePreview) {
        formData.coverImage = coverImagePreview;
      }
      
      // Redirect back to profile
      navigate('/profile');
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <button
            onClick={() => navigate('/profile')}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden">
              {(coverImagePreview || formData.coverImage) && (
                <img
                  src={coverImagePreview || formData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <label className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-900 p-2 rounded-full cursor-pointer transition-colors">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCoverImageChange} 
                      className="hidden" 
                    />
                  </label>
                  {(formData.coverImage || coverImagePreview) && (
                    <button 
                      type="button"
                      className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                      onClick={() => {
                        setFormData({...formData, coverImage: ''});
                        setCoverImagePreview(null);
                      }}
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="flex justify-center -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 dark:bg-slate-700">
                {(profileImagePreview || formData.profileImage) && (
                  <img
                    src={profileImagePreview || formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer transition-colors">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfileImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.displayName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="e.g. New York, USA"
                />
              </div>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Social Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Twitter size={16} className="mr-2 text-blue-500" />
                  Twitter
                </label>
                <input
                  type="url"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="https://twitter.com/yourusername"
                />
                {errors['social.twitter'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors['social.twitter']}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Instagram size={16} className="mr-2 text-pink-500" />
                  Instagram
                </label>
                <input
                  type="url"
                  name="social.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="https://instagram.com/yourusername"
                />
                {errors['social.instagram'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors['social.instagram']}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Facebook size={16} className="mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  name="social.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="https://facebook.com/yourusername"
                />
                {errors['social.facebook'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors['social.facebook']}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <Globe size={16} className="mr-2 text-green-500" />
                  Website
                </label>
                <input
                  type="url"
                  name="social.website"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </Layout>
  );
};

export default ProfileEdit;
