import React, { useState } from 'react';
import { AuthStatus } from '../../types';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  initiallyFollowing?: boolean;
  onToggle?: (following: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, initiallyFollowing = false, onToggle }) => {
  const { user, status, refreshUser } = useAuth();
  const [following, setFollowing] = useState<boolean>(initiallyFollowing);
  const [loading, setLoading] = useState(false);

  // Keep local state in sync when prop changes
  React.useEffect(() => {
    setFollowing(initiallyFollowing);
  }, [initiallyFollowing]);

  const isOwnProfile = user?.id === targetUserId;

  const handleClick = async () => {
    if (status !== AuthStatus.AUTHENTICATED || isOwnProfile) return;
    try {
      setLoading(true);
      if (following) {
        await userAPI.unfollow(targetUserId);
      } else {
        await userAPI.follow(targetUserId);
      }
      setFollowing(!following);
      onToggle?.(!following);
      refreshUser();
    } catch (err: any) {
      const status = err?.response?.status;
      const message: string | undefined = err?.response?.data?.message;
      // Treat duplicate follow/unfollow as success for UI consistency
      if (status === 400 && message && (message.includes('Already following') || message.includes('Not following'))) {
        setFollowing(!following);
        onToggle?.(!following);
      } else {
        console.error('Follow toggle failed', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isOwnProfile) return null;

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm ${
        following
          ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
          : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
