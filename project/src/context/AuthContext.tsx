import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthStatus, AuthContextType } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch current user data from API
      const fetchUser = async () => {
        try {
          const res = await authAPI.getCurrentUser();
          setUser(res.data);
          setStatus(AuthStatus.AUTHENTICATED);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
          setStatus(AuthStatus.UNAUTHENTICATED);
        }
      };
      fetchUser();
    } else {
      setStatus(AuthStatus.UNAUTHENTICATED);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      
      // Get user data after login
      const userRes = await authAPI.getCurrentUser();
      setUser(userRes.data);
      setStatus(AuthStatus.AUTHENTICATED);
      return userRes.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      // Extract and throw the error message from the response if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const signup = async (email: string, username: string, password: string, displayName: string) => {
    try {
      const res = await authAPI.register({
        email,
        username,
        password,
        displayName: displayName || username
      });
      
      localStorage.setItem('token', res.data.token);
      
      // Get user data after signup
      const userRes = await authAPI.getCurrentUser();
      setUser(userRes.data);
      setStatus(AuthStatus.AUTHENTICATED);
      return userRes.data;
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Extract and throw the error message from the response if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Signup failed. Please try again with different credentials.');
    }
  };

  const logout = () => {
    setUser(null);
    setStatus(AuthStatus.UNAUTHENTICATED);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the problematic export - changing to a named function export instead
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}