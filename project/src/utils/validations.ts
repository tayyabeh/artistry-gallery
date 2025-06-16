// Shared validation functions for the entire application
export const validateEmail = (email: string): string => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Please enter a valid email';
  return '';
};

export const validateUsername = (username: string): string => {
  const re = /^[a-zA-Z0-9_]+$/;
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username cannot exceed 30 characters';
  if (!re.test(username)) return 'Username can only contain letters, numbers and underscores';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone) return ''; // Optional
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\.\s]?[0-9]{4,6}$/;
  if (!re.test(phone)) return 'Please enter a valid phone number';
  return '';
};

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value) return `${fieldName} is required`;
  return '';
};

export const validateMaxLength = (value: string, max: number, fieldName: string): string => {
  if (value.length > max) return `${fieldName} cannot exceed ${max} characters`;
  return '';
};
