import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ArtworkDetail from './pages/ArtworkDetail';
import { AuthStatus } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  
  if (status === AuthStatus.LOADING) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (status === AuthStatus.UNAUTHENTICATED) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { status } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={
        status === AuthStatus.AUTHENTICATED 
          ? <Navigate to="/" replace /> 
          : <Auth />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      <Route path="/explore" element={
        <ProtectedRoute>
          <Explore />
        </ProtectedRoute>
      } />
      
      <Route path="/artwork/:id" element={
        <ProtectedRoute>
          <ArtworkDetail />
        </ProtectedRoute>
      } />
      
      {/* Redirect to home for any unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;