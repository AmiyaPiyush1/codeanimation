import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

// Constants
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_PREFERENCES_KEY = 'userPreferences';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem(USER_PREFERENCES_KEY);
    return saved ? JSON.parse(saved) : { theme: 'light', notifications: true };
  });
  
  const fetchLockRef = useRef(false);
  const sessionTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Utility function to handle API errors
  const handleApiError = (error, customMessage = 'An error occurred') => {
    console.error(customMessage, error);
    setAuthError({
      message: error.message || customMessage,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    });
    return null;
  };

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  }, []);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    logout('Your session has expired. Please log in again.');
  }, []);

  // Save user preferences
  const saveUserPreferences = useCallback((preferences) => {
    const newPreferences = { ...userPreferences, ...preferences };
    setUserPreferences(newPreferences);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(newPreferences));
  }, [userPreferences]);

  const fetchUser = async (token) => {
    if (fetchLockRef.current) return;
    
    try {
      fetchLockRef.current = true;
      setAuthError(null);
      
      const response = await axiosInstance.get('/api/auth/me');
      
      if (response.data.success) {
        setUser(response.data.data.user);
        resetSessionTimeout();
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      handleApiError(error, 'Error fetching user data');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      navigate('/login');
      return null;
    } finally {
      setLoading(false);
      fetchLockRef.current = false;
    }
  };

  const refreshToken = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/api/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        await fetchUser(token);
        return true;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      handleApiError(error, 'Error refreshing token');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && mounted && !fetchLockRef.current) {
        await fetchUser(token);
      } else if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const tokenData = JSON.parse(atob(tokenParts[1]));
            const expirationTime = tokenData.exp * 1000;
            const currentTime = Date.now();
            
            if (expirationTime - currentTime < TOKEN_REFRESH_THRESHOLD) {
              await refreshToken();
            }
          } else {
            // Invalid token format, try to refresh
            await refreshToken();
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          // If token is invalid, try to refresh
          await refreshToken();
        }
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  const handleGoogleCallback = async (token, refreshToken) => {
    try {
      setAuthError(null);
      localStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      
      setLoading(true);
      const userData = await fetchUser(token);
      
      if (userData) {
        // Add a small delay before navigation to prevent rapid navigation attempts
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } catch (error) {
      handleApiError(error, 'Error in Google authentication');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const logout = (message = 'You have been logged out') => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setAuthError(null);
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    navigate('/login', { 
      state: { message }
    });
  };

  const updateUserProfile = async (updates) => {
    try {
      setAuthError(null);
      
      const response = await axiosInstance.put('/api/auth/me', updates);

      if (response.data.success) {
        setUser(response.data.data.user);
        return response.data.data.user;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      handleApiError(error, 'Error updating profile');
      return null;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    authError,
    isRefreshing,
    userPreferences,
    handleGoogleCallback,
    logout,
    updateUserProfile,
    saveUserPreferences,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    user: context.user,
    setUser: context.setUser,
    loading: context.loading,
    error: context.authError,
    logout: context.logout,
    handleGoogleCallback: context.handleGoogleCallback,
    saveUserPreferences: context.saveUserPreferences,
    userPreferences: context.userPreferences,
    updateUserProfile: context.updateUserProfile
  };
}; 