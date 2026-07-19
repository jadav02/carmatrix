// ==========================================
// Auth Context & Provider
// ==========================================
// Global state management for user authentication:
//   - Persists JWT token & user profile in localStorage.
//   - Exposes login, register, logout, and auth state.
// ==========================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('car_dealership_token');
      const storedUser = localStorage.getItem('car_dealership_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      localStorage.removeItem('car_dealership_token');
      localStorage.removeItem('car_dealership_user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in user with email and password
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await loginUser({ email, password });
      
      const { access_token, user: userProfile } = response;

      setToken(access_token);
      setUser(userProfile);

      localStorage.setItem('car_dealership_token', access_token);
      localStorage.setItem('car_dealership_user', JSON.stringify(userProfile));

      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Register a new user and automatically log them in
   */
  const register = async (userData) => {
    setError(null);
    try {
      // 1. Call backend register API
      await registerUser(userData);

      // 2. Automatically log in after successful registration
      return await login(userData.email, userData.password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Log out user and clear stored credentials
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('car_dealership_token');
    localStorage.removeItem('car_dealership_user');
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
