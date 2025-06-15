import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
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
  register: (userData: any) => api.post('/users/register', userData),
  login: (credentials: any) => api.post('/users/login', credentials),
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post('/users/me/cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteAvatar: () => api.delete('/users/me/avatar'),
  deleteCover: () => api.delete('/users/me/cover')
};

export const artworkAPI = {
  getAllArtworks: () => api.get('/artworks'),
  getArtworkById: (id: string) => api.get(`/artworks/${id}`),
  createArtwork: (artworkData: any) => {
    if (artworkData instanceof FormData) {
      return api.post('/artworks', artworkData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.post('/artworks', artworkData);
  },
  updateArtwork: (id: string, artworkData: any) => api.put(`/artworks/${id}`, artworkData),
  deleteArtwork: (id: string) => api.delete(`/artworks/${id}`)
};

export const commentAPI = {
  getArtworkComments: (artworkId: string) => api.get(`/comments/artwork/${artworkId}`),
  addComment: (commentData: any) => api.post('/comments', commentData),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  likeComment: (id: string) => api.put(`/comments/like/${id}`)
};

export default api;
