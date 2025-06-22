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
  profileImage?: string;
  coverImage?: string;
  cover?: string;
  _id?: string;
  bio?: string;
  location?: string;
  socialLinks?: SocialLinks;
  following?: string[] | number;
  followers?: string[] | number;
  views?: number;
  downloads?: number;
  createdAt: string;
}

export interface Artwork {
  id: string;
  _id?: string;
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
  price?: number;
  currency?: 'PKR' | 'USD';
  isSold?: boolean;
  likedBy?: string[];
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
    phone?: string,
    autoLogin?: boolean
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface MarketplaceItem extends Artwork {
  price: number;
  currency: 'PKR' | 'USD';
  inStock: boolean;
}

export interface CartItem {
  item: MarketplaceItem;
  quantity: number;
}

export interface Order {
  id: string;
  artworkId: string;
  userId: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  artworkId: string;
  quantity: number;
  paymentMethod: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// ---------------------------- Chat Types ----------------------------
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: User;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'file';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  updatedAt: string;
}