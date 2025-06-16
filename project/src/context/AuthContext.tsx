import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthStatus, AuthContextType } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);

  // Refresh token and user data
  const refreshAuthState = async () => {
    try {
      const userRes = await authAPI.getCurrentUser();
      setUser(userRes.data);
      setStatus(AuthStatus.AUTHENTICATED);
    } catch (error) {
      console.error('Failed to refresh auth state:', error);
      localStorage.removeItem('token');
      setUser(null);
      setStatus(AuthStatus.UNAUTHENTICATED);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshAuthState();
    } else {
      setStatus(AuthStatus.UNAUTHENTICATED);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      await refreshAuthState();
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const signup = async (
    email: string,
    username: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const res = await authAPI.register({
        email,
        username,
        password,
        displayName: displayName || username
      });
      localStorage.setItem('token', res.data.token);
      await refreshAuthState();
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw error.response?.data?.message || 'Signup failed. Please try again with different credentials.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setStatus(AuthStatus.UNAUTHENTICATED);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        status, 
        login, 
        signup, 
        logout,
        refreshUser: refreshAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}