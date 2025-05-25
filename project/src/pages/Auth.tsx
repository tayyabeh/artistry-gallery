import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { Palette } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToSignup = () => setIsLogin(false);

  return (
    <div className="flex min-h-screen">
      {/* Left: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-accent-500/90 mix-blend-multiply"></div>
        <img
          className="w-full h-full object-cover"
          src="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Digital art"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md"
          >
            <div className="flex items-center mb-8">
              <Palette className="h-10 w-10" />
              <h1 className="ml-2 text-4xl font-display font-bold">Artistry</h1>
            </div>
            <h2 className="text-3xl font-bold mb-6">Discover and Share Digital Art</h2>
            <p className="text-lg mb-8">
              Join our community of digital artists, share your creations, and explore beautiful artwork from around the world.
            </p>
            <div className="flex space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  >
                    <img
                      src={`https://images.pexels.com/photos/214${i}959/pexels-photo-214${i}959.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-white/90">
                Join over 10,000 artists showcasing their work
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm key="login" onSwitchToSignup={switchToSignup} />
          ) : (
            <SignupForm key="signup" onSwitchToLogin={switchToLogin} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;