import { User, Artwork, Comment, MarketplaceItem } from '../types';

export const artCategories = [
  { id: 'digital-painting', label: 'Digital Painting' },
  { id: '3d-art', label: '3D Art' },
  { id: 'pixel-art', label: 'Pixel Art' },
  { id: 'concept-art', label: 'Concept Art' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'character-design', label: 'Character Design' },
  { id: 'environment-art', label: 'Environment Art' },
  { id: 'animation', label: 'Animation' },
  { id: 'fantasy-art', label: 'Fantasy Art' },
  { id: 'sci-fi-art', label: 'Sci-fi Art' },
  { id: 'vector-art', label: 'Vector Art' },
  { id: 'traditional-art', label: 'Traditional Art' },
  { id: 'photography', label: 'Photography' },
  { id: 'mixed-media', label: 'Mixed Media' },
  { id: 'other', label: 'Other' }
];

// Mock user data
export const mockUserData: User[] = [
  {
    id: 'user1',
    username: 'artcreator',
    email: 'artcreator@example.com',
    displayName: 'Art Creator',
    bio: 'Digital artist specializing in fantasy and concept art',
    profileImage: '/images/default-avatar.png',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true,
    socialLinks: {
      twitter: 'https://twitter.com/artcreator',
      instagram: 'https://instagram.com/artcreator',
      website: 'https://artcreator.com'
    }
  },
  {
    id: 'user2',
    username: 'artlover',
    email: 'artlover@example.com',
    displayName: 'Art Lover',
    bio: 'Art enthusiast and collector',
    profileImage: '/images/default-avatar.png',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true,
    socialLinks: {
      twitter: 'https://twitter.com/artlover',
      instagram: 'https://instagram.com/artlover',
      website: 'https://artlover.com'
    }
  }
];

// Mock comment data
export const mockCommentData: Comment[] = [
  {
    id: 'comment1',
    artworkId: 'art1',
    userId: 'user1',
    content: 'Amazing artwork! The colors are so vibrant!',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    likes: 15
  },
  {
    id: 'comment2',
    artworkId: 'art1',
    userId: 'user2',
    content: 'Love the composition and attention to detail!',
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString(),
    likes: 8
  }
];

// Updated mock artwork data with new categories and recent timestamps
export const mockArtworkData: Artwork[] = [
  {
    id: 'art1',
    title: 'Cyberpunk City',
    image: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
    creator: mockUserData[0],
    description: 'A futuristic cityscape with neon lights',
    tags: ['cyberpunk', 'city', 'neon'],
    category: 'Digital Painting',
    likes: 342,
    views: 1205,
    comments: 28,
    downloads: 54,
    createdAt: new Date().toISOString(), // Today
    isFavorited: true,
  },
  {
    id: 'art2',
    title: 'Forest Spirit',
    image: 'https://images.pexels.com/photos/3024711/pexels-photo-3024711.jpeg',
    creator: mockUserData[1],
    description: 'Mystical forest guardian',
    tags: ['fantasy', 'spirit', 'nature'],
    category: 'Concept Art',
    likes: 289,
    views: 876,
    comments: 15,
    downloads: 32,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    isFavorited: false,
  },
  // ... rest of the existing mockArtworkData
];

// ... rest of the existing mock data