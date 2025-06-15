export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  following: number;
  followers: number;
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