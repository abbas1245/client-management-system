import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../lib';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL;

  // Set axios default headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get(`/auth/profile`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, API]);

  const login = async (email, password) => {
    try {
      const response = await api.post(`/auth/login`, { email, password });
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password, confirmPassword) => {
    try {
      const response = await api.post(`/auth/signup`, { 
        name, 
        email, 
        password, 
        confirmPassword 
      });
      
      const { user: userData, token: userToken } = response.data;
      
      // Set user and token immediately
      setUser(userData);
      setToken(userToken);
      
      // Ensure axios headers are set
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post(`/auth/forgot-password`, { email });
      return { success: true, token: response.data.token };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset link';
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      await api.post(`/auth/reset-password`, { token, password, confirmPassword });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to reset password';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
