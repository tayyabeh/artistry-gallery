import { createContext, useState, useEffect } from 'react';
import { getAuthToken } from '../services/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = getAuthToken();
    if (token) {
      // You would typically verify the token with your backend here
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login: (userData) => {
      setUser(userData);
    },
    logout: () => {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
