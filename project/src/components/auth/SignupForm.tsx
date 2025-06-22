import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);

  // Field specific error states
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [policyError, setPolicyError] = useState('');

  const { signup } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Please enter a valid email';
    return '';
  };

  const validateUsername = (username: string) => {
    const re = /^[a-zA-Z0-9_]+$/;
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username cannot exceed 30 characters';
    if (!re.test(username)) return 'Username can only contain letters, numbers and underscores';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return ''; // Optional
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!re.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPolicyError('');

    // Validate fields
    const emailErr = validateEmail(email);
    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);
    const phoneErr = validatePhone(phone);

    setEmailError(emailErr);
    setUsernameError(usernameErr);
    setPasswordError(passwordErr);
    setPhoneError(phoneErr);

    if (emailErr || usernameErr || passwordErr || phoneErr) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToPolicy) {
      setPolicyError('You must accept the terms and conditions.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, username, password, username, phone);
      setSuccess(true); 
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPolicy = () => {
    setAgreedToPolicy(true);
    setPolicyModalOpen(false);
    setPolicyError('');
  };

  const handleOpenPolicy = (e: React.MouseEvent) => {
    e.preventDefault();
    setPolicyModalOpen(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      {success ? (
        <div className="p-8 bg-gradient-to-br from-primary-600/90 to-accent-500/90 rounded-2xl shadow-2xl flex flex-col items-center text-white">
          <CheckCircle className="w-12 h-12 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-center mb-6 text-sm opacity-90">Your account has been created successfully.</p>
          <button 
            onClick={() => onSwitchToLogin()} 
            className="w-full py-2 px-4 rounded-md bg-white text-primary-700 font-semibold hover:bg-gray-100 transition"
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <> 
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            placeholder="your@email.com"
            required
          />
          {emailError && (
            <div className="mt-1 text-error-700">{emailError}</div>
          )}
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input w-full"
            placeholder="coolartist"
            required
          />
          {usernameError && (
            <div className="mt-1 text-error-700">{usernameError}</div>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <div className="mt-1 text-error-700">{passwordError}</div>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input w-full pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input w-full"
            placeholder="+1234567890"
          />
          {phoneError && (
            <div className="mt-1 text-error-700">{phoneError}</div>
          )}
        </div>

        <div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => {
                  setAgreedToPolicy(e.target.checked);
                  if (e.target.checked) setPolicyError('');
                }}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-light text-gray-500">
                I accept the{' '}
                <a 
                  href="#" 
                  onClick={handleOpenPolicy}
                  className="font-medium text-primary-600 hover:underline cursor-pointer"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
          </div>
          {policyError && (
            <div className="mt-1 text-sm text-error-700">{policyError}</div>
          )}
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full flex justify-center"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
      </> 
      )}
      <PrivacyPolicyModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setPolicyModalOpen(false)} 
        onAccept={handleAcceptPolicy} 
      />
    </motion.div>
  );
};

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose, onAccept }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Privacy Policy & Terms of Service</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="font-bold text-gray-900 text-lg">1. Introduction</h4>
              <p className="text-sm text-gray-700 leading-relaxed">Welcome to Artistry Gallery. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
              
              <h4 className="font-bold text-gray-900 text-lg">2. Information We Collect</h4>
              <p className="text-sm text-gray-700 leading-relaxed">We may collect personal information from you such as your name, email address, and phone number when you register on our site.</p>

              <h4 className="font-bold text-gray-900 text-lg">3. User Agreement</h4>
              <p className="text-sm text-gray-700 leading-relaxed">By creating an account, you agree to our terms of service. You agree not to upload content that is illegal, offensive, or infringes on the intellectual property rights of others. We reserve the right to remove any content and terminate accounts that violate these terms.</p>

              <h4 className="font-bold text-gray-900 text-lg">4. Cookies</h4>
              <p className="text-sm text-gray-700 leading-relaxed">We use cookies to enhance your experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of the site.</p>
            </div>
            <div className="p-4 border-t flex justify-end space-x-4 bg-gray-50 rounded-b-lg">
              <button onClick={onClose} className="btn-secondary">
                Decline
              </button>
              <button onClick={onAccept} className="btn-primary">
                Accept and Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupForm;