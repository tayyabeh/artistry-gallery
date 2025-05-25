import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Layout from '../components/layout/Layout';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import { mockUserData, mockArtworkData } from '../data/mockData';
import { Heart, MessageCircle, Download, Users } from 'lucide-react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('created');
  const user = mockUserData[0]; // Using first mock user for demo

  const userArtworks = mockArtworkData.filter(art => art.creator.id === user.id);
  const favoriteArtworks = mockArtworkData.filter(art => art.isFavorited);

  const stats = [
    { label: 'Likes', value: userArtworks.reduce((sum, art) => sum + art.likes, 0), icon: Heart },
    { label: 'Comments', value: userArtworks.reduce((sum, art) => sum + art.comments, 0), icon: MessageCircle },
    { label: 'Downloads', value: userArtworks.reduce((sum, art) => sum + art.downloads, 0), icon: Download },
    { label: 'Followers', value: user.followers, icon: Users },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="text-center pt-20">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            {user.bio}
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <stat.icon className="w-5 h-5 text-primary-500" />
                  <span className="text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Artwork Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 max-w-[400px] mx-auto">
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-8">
            <ArtworkGrid artworks={userArtworks} />
          </TabsContent>

          <TabsContent value="favorites" className="mt-8">
            <ArtworkGrid artworks={favoriteArtworks} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default Profile;