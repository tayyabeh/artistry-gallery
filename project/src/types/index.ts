export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  displayName?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  socialLinks?: SocialLinks;
  following?: number;
  followers?: number;
  views?: number;
  downloads?: number;
  createdAt: string;
}

export interface Artwork {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  creator: User;
  description?: string;
  tags: string[];
  category: string;
  likes: number;
  views: number;
  comments: number;
  downloads: number;
  createdAt: string;
  isFavorited?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
}

export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    username: string,
    password: string,
    displayName?: string,
    autoLogin?: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface MarketplaceItem extends Artwork {
  price: number;
  currency: string;
  inStock: boolean;
}

export interface CartItem {
  item: MarketplaceItem;
  quantity: number;
}