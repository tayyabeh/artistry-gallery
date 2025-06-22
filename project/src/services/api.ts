import axios from 'axios';
import { User, Artwork, Comment, Order, Purchase } from '../types';

// Check if API_URL is properly set from environment
console.log('Current API base URL:', import.meta.env.VITE_API_BASE_URL);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ArtworkFormData {
  title: string;
  description?: string;
  tags: string[];
  category: string;
  image: File;
}

// Create axios instance with base URL
const api = axios.create({
  // Use VITE_API_BASE_URL if set, otherwise fall back to localhost:5000
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const authAPI = {
  register: async (userData: RegisterData) => {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userData.username)) {
      throw new Error('Username can only contain letters, numbers and underscores');
    }

    try {
      const res = await api.post<AuthResponse>('/users/register', {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        displayName: userData.displayName || userData.username,
        phone: userData.phone
      });
      return res;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/users/login', credentials),
  getCurrentUser: () => api.get<User>('/users/me'),
  updateProfile: (data: Partial<User>) => api.put<User>('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post<User>('/users/me/cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteAvatar: () => api.delete<User>('/users/me/avatar'),
  deleteCover: () => api.delete<User>('/users/me/cover'),
  searchUsers: (q: string) => api.get<User[]>(`/users/search`, { params: { q } })
};

export const chatAPI = {
  getConversations: () => api.get('/conversations'),
  createConversation: (participantId: string) => api.post('/conversations', { participantId }),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (payload: { conversationId: string; content?: string; mediaUrl?: string; mediaType?: string }) => api.post('/messages', payload),
};

export const artworkAPI = {
  getAllArtworks: (params: Record<string, any> = {}) => api.get<Artwork[]>('/artworks', { params }),
  getArtworkById: (id: string) => api.get<{ artwork: Artwork, message?: string }>(`/artworks/${id}`),
  getRelatedArtworks: (id: string) => api.get<{ artworks: Artwork[] }>(`/artworks/${id}/related`),
  createArtwork: (artworkData: ArtworkFormData | FormData) => 
    api.post<{ artwork: Artwork }>('/artworks', artworkData),
  updateArtwork: (id: string, artworkData: Partial<Artwork>) => 
    api.put<{ artwork: Artwork }>(`/artworks/${id}`, artworkData),
  deleteArtwork: (id: string) => api.delete(`/artworks/${id}`),
  likeArtwork: (id: string) => api.put<{ artwork: Artwork }>(`/artworks/like/${id}`),
  unlikeArtwork: (id: string) => api.put<{ artwork: Artwork }>(`/artworks/unlike/${id}`)
};


export const commentAPI = {
  getArtworkComments: (artworkId: string) => api.get<Comment[]>(`/comments/artwork/${artworkId}`),
  addComment: (commentData: { content: string, artworkId: string }) => 
    api.post<Comment>('/comments', commentData),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  likeComment: (id: string) => api.put<Comment>(`/comments/like/${id}`)
};

// Order API
export const orderAPI = {
  createOrder: async (purchase: Purchase) => {
    return api.post<Order>('/orders', purchase);
  },
  getUserOrders: async () => {
    return api.get<Order[]>('/orders/me');
  },
  downloadArtwork: async (orderId: string) => {
    return api.get(`/orders/${orderId}/download`, {
      responseType: 'blob'
    });
  }
};


// User / social APIs
export const userAPI = {
  searchUsers: (query: string) => api.get<User[]>('/users/search', { params: { q: query } }),
  getPublicProfile: (username: string) => api.get<{ user: User; artworks: Artwork[] }>(`/users/profile/${encodeURIComponent(username)}`),
  follow: (id: string) => api.put(`/users/follow/${id}`),
  unfollow: (id: string) => api.put(`/users/unfollow/${id}`)
};

export default api;
