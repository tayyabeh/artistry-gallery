import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { userAPI } from '../services/api';
import { Artwork, User } from '../types';
import ArtworkGrid from '../components/artwork/ArtworkGrid';
import FollowButton from '../components/user/FollowButton';
import { useAuth } from '../context/AuthContext';

interface ApiResponse {
  user: User;
  artworks: Artwork[];
}

const PublicProfile: React.FC = () => {
  const { username = '' } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Update follower counts optimistically when follow/unfollow toggles
  const handleFollowToggle = (followState: boolean) => {
    setIsFollowing(followState);
    setProfileUser((prev) => {
      if (!prev) return prev;
      const currUserId = currentUser?.id;
      if (!currUserId) return prev;
      if (Array.isArray(prev.followers)) {
        let updatedFollowers: string[];
        if (followState) {
          // Add if not already there
          updatedFollowers = prev.followers.includes(currUserId)
            ? prev.followers
            : [...prev.followers, currUserId];
        } else {
          updatedFollowers = prev.followers.filter((id) => id !== currUserId);
        }
        return { ...prev, followers: updatedFollowers } as User;
      } else {
        const count = typeof prev.followers === 'number' ? prev.followers : 0;
        return { ...prev, followers: followState ? count + 1 : Math.max(0, count - 1) } as User;
      }
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await userAPI.getPublicProfile(username);
        const { user, artworks }: ApiResponse = data;
        setProfileUser(user);
        setArtworks(artworks);
        if (currentUser) {
          const followerIds = Array.isArray(user.followers) ? (user.followers as string[]) : [];
          setIsFollowing(followerIds.includes(currentUser.id));
        }
      } catch (err) {
        console.error('Public profile fetch error', err);
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username, currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center">Loading...</div>
      </Layout>
    );
  }

  if (error || !profileUser) {
    return (
      <Layout>
        <div className="py-20 text-center text-red-500">{error || 'User not found'}</div>
      </Layout>
    );
  }

  const banner = profileUser.coverImage || profileUser.cover || 'https://via.placeholder.com/1200x300';
  const avatar = profileUser.avatar || profileUser.profileImage || 'https://via.placeholder.com/120';

  return (
    <Layout>
      <div className="relative">
        {/* Banner */}
        <div className="h-56 md:h-72 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <img src={banner} alt="banner" className="object-cover w-full h-full" />
        </div>

        {/* Avatar and basic info */}
        <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center gap-6">
          <img
            src={avatar}
            alt={profileUser.displayName || profileUser.username}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 object-cover"
          />

          <div className="flex-1 mt-4 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {profileUser.displayName || profileUser.username}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">@{profileUser.username}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {Array.isArray(profileUser.followers) ? profileUser.followers.length : profileUser.followers ?? 0} Followers
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {Array.isArray(profileUser.following) ? profileUser.following.length : profileUser.following ?? 0} Following
              </span>
              <FollowButton
                targetUserId={(profileUser.id || profileUser._id) as string}
                initiallyFollowing={isFollowing}
                onToggle={handleFollowToggle}
              />
            </div>
          </div>
        </div>

        {/* Biography */}
        {profileUser.bio && (
          <div className="max-w-5xl mx-auto px-4 mt-6">
            <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">
              {profileUser.bio}
            </p>
          </div>
        )}

        {/* Artworks */}
        <div className="max-w-5xl mx-auto px-4 mt-10">
          <h2 className="text-xl font-semibold mb-4">Artworks</h2>
          {artworks && artworks.length > 0 ? (
            <ArtworkGrid artworks={artworks} />
          ) : (
            <p className="text-slate-500">No artworks yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfile;
