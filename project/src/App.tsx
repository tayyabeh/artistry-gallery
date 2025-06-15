import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ArtworkDetail from './pages/ArtworkDetail';
import Upload from './pages/Upload';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import ProfileEdit from './components/profile/ProfileEdit';
import Message from './pages/Message';
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
      
      <Route path="/upload" element={
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      } />
      
      <Route path="/marketplace" element={
        <ProtectedRoute>
          <Marketplace />
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <Message />
        </ProtectedRoute>
      } />
      
      <Route path="/artwork/:id" element={
        <ProtectedRoute>
          <ArtworkDetail />
        </ProtectedRoute>
      } />
      
      {/* Profile Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <ProfileEdit />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/settings" element={
        <ProtectedRoute>
          <ProfileEdit />  {/* Temporarily using ProfileEdit, should be replaced with a dedicated Settings component */}
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
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;