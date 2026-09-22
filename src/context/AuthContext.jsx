import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stockify_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('stockify_auth_token') || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate active token with backend on initial load / page refresh
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('stockify_auth_token');

      if (!savedToken) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response && response.user) {
          setCurrentUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem('stockify_auth_user', JSON.stringify(response.user));
        } else {
          throw new Error('Invalid session');
        }
      } catch (error) {
        console.warn('Session verification failed, logging out:', error.message);
        localStorage.removeItem('stockify_auth_token');
        localStorage.removeItem('stockify_auth_user');
        setCurrentUser(null);
        setIsAuthenticated(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Real backend Login
  const login = async (role, credentials) => {
    try {
      const payload = {
        username: credentials.username || credentials.email,
        password: credentials.password,
        role,
      };

      const response = await api.post('/auth/login', payload);

      if (response && response.token && response.user) {
        localStorage.setItem('stockify_auth_token', response.token);
        localStorage.setItem('stockify_auth_user', JSON.stringify(response.user));
        setToken(response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      return {
        success: false,
        message: response.message || 'Invalid credentials',
      };
    } catch (error) {
      const message = error.data?.message || error.message || 'Invalid credentials';
      return { success: false, message };
    }
  };

  // Real backend Register
  const register = async (role, formData) => {
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: role || formData.role || 'MANAGER',
        storeId: formData.storeId || null,
        roleId: formData.roleId || null,
      };

      const response = await api.post('/auth/register', payload);

      if (response && response.token && response.user) {
        localStorage.setItem('stockify_auth_token', response.token);
        localStorage.setItem('stockify_auth_user', JSON.stringify(response.user));
        setToken(response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      return {
        success: false,
        message: response.message || 'Registration failed',
      };
    } catch (error) {
      const message = error.data?.message || error.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // OTP Sign-in fallback / helper
  const signInWithOtp = async (role, credentials) => {
    // Authenticate with user's mail or phone credentials
    return login(role, {
      username: credentials.mailId || credentials.staffId,
      password: credentials.password || 'password123',
    });
  };

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('stockify_auth_token');
    localStorage.removeItem('stockify_auth_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        signInWithOtp,
        logout,
      }}
    >
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

export default AuthContext;
