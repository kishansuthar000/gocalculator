import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authAPI.verify();
          setUser(response.data.user);
        } catch (error) {
          console.log('Token verification failed');
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { user: userData, token: newToken, sessionId } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('sessionId', sessionId);
      setToken(newToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      // Handle "already logged in" error
      if (error.response?.status === 409) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId && token) {
        await authAPI.logout({ sessionId });
      }
    } catch (error) {
      console.log('Logout error:', error.message);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('sessionId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
