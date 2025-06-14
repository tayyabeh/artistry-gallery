import { Link } from 'react-router-dom';
import { getAuthToken } from '../services/auth';

export default function Home() {
  const isLoggedIn = !!getAuthToken();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Artistry Gallery</h1>
      
      {isLoggedIn ? (
        <div>
          <p className="mb-4">You are logged in!</p>
          <button 
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            onClick={() => {
              localStorage.removeItem('authToken');
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <Link 
            to="/signup" 
            className="bg-blue-500 text-white p-2 rounded text-center hover:bg-blue-600"
          >
            Sign Up
          </Link>
          <Link 
            to="/signin" 
            className="bg-green-500 text-white p-2 rounded text-center hover:bg-green-600"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
