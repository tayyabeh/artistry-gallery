import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signin = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const storeAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};
