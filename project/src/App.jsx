import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Home from './components/Home';

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/signup" 
        element={!user ? <Signup /> : <Navigate to="/" />} 
      />
      <Route 
        path="/signin" 
        element={!user ? <Signin /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
