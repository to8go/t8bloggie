import { User } from '../types';

// In a real app, use a proper password hashing library
const hashPassword = (password: string): string => {
  return btoa(password); // This is just for demo purposes! Use bcrypt in production
};

const DEMO_USER: User = {
  username: 'admin',
  passwordHash: hashPassword('admin123'), // Default credentials: admin/admin123
};

export const validateCredentials = (username: string, password: string): boolean => {
  if (username !== DEMO_USER.username) return false;
  return hashPassword(password) === DEMO_USER.passwordHash;
};