import { User } from '../types';

/**
 * Safely returns the best avatar URL for a user.
 * 1. Prefer `user.avatar`
 * 2. Fallback to `user.profileImage`
 * 3. Generate a UI-Avatars placeholder using the display name / username
 * 4. Ultimately fallback to a basic placeholder if everything else fails
 *
 * @param user   User object (can be partial)
 * @param size   Optional size (in px) for the generated placeholder. Defaults to 40.
 */
export const getAvatarUrl = (
  user: Partial<User> | undefined | null,
  size: number = 40,
): string => {
  if (!user) return `/default-avatar.png`;

  const { avatar, profileImage } = user;

  // Helper to prefix relative paths with the API base URL
  const withBaseUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url; // already absolute
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    // Ensure no double slashes when concatenating
    return `${base.replace(/\/?$/, '')}/${url.replace(/^\//, '')}`;
  };

  if (avatar && avatar.trim() !== '') return withBaseUrl(avatar.trim());
  if (profileImage && profileImage.trim() !== '') return withBaseUrl(profileImage.trim());

  // Fallback to generic placeholder (non-text) if user hasn't uploaded anything
  return `/default-avatar.png`;
};
