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
const NAVIGATION_DELAY = 300; // 300ms delay between navigations

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
  const navigationTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Navigation queue to prevent rapid navigation attempts
  const navigationQueue = useRef([]);
  const isNavigating = useRef(false);

  const processNavigationQueue = useCallback(() => {
    if (navigationQueue.current.length === 0 || isNavigating.current) return;

    isNavigating.current = true;
    const { path, options } = navigationQueue.current.shift();

    navigate(path, options);

    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Set a new timeout to process the next navigation
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigating.current = false;
      processNavigationQueue();
    }, NAVIGATION_DELAY);
  }, [navigate]);

  const safeNavigate = useCallback((path, options = {}) => {
    // Always use replace: true to prevent history stack buildup
    const navigationOptions = {
      ...options,
      replace: true
    };

    // Add to queue
    navigationQueue.current.push({ path, options: navigationOptions });
    processNavigationQueue();
  }, [processNavigationQueue]);

  // Cleanup function for navigation timeouts
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://code-backend-89a2.onrender.com";

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

  // Add request cancellation
  const freshDataControllerRef = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchUser = async (token) => {
    if (fetchLockRef.current) return;
    
    try {
      fetchLockRef.current = true;
      setAuthError(null);
      
      // Add cache check with timestamp
      const cachedUser = localStorage.getItem('cachedUser');
      const cacheTimestamp = localStorage.getItem('cachedUserTimestamp');
      const now = Date.now();
      
      if (cachedUser && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) { // 5 minutes cache
        const parsedUser = JSON.parse(cachedUser);
        // Use functional update to avoid dependency on user state
        setUser(prevUser => {
          if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser)) {
            return parsedUser;
          }
          return prevUser;
        });
        
        // Fetch fresh data in background only if cache is older than 1 minute
        if (now - parseInt(cacheTimestamp) > 60000) {
          fetchFreshUserData(token);
        }
        return parsedUser;
      }
      
      const response = await axiosInstance.get('/api/auth/me');
      
      if (response.data.success) {
        const userData = response.data.data.user;
        // Cache the user data with timestamp
        localStorage.setItem('cachedUser', JSON.stringify(userData));
        localStorage.setItem('cachedUserTimestamp', now.toString());
        // Use functional update
        setUser(prevUser => {
          if (JSON.stringify(prevUser) !== JSON.stringify(userData)) {
            return userData;
          }
          return prevUser;
        });
        resetSessionTimeout();
        return userData;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      handleApiError(error, 'Error fetching user data');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('cachedUserTimestamp');
      safeNavigate('/login', { 
        state: { error: 'Session expired' }
      });
      return null;
    } finally {
      setLoading(false);
      fetchLockRef.current = false;
    }
  };

  const fetchFreshUserData = async (token) => {
    // If already fetching, don't start a new request
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      
      // Cancel any existing request
      if (freshDataControllerRef.current) {
        freshDataControllerRef.current.abort();
      }
      
      // Create new AbortController
      freshDataControllerRef.current = new AbortController();
      
      const response = await axiosInstance.get('/api/auth/me', {
        signal: freshDataControllerRef.current.signal,
        headers: {
          'X-Request-Type': 'background-refresh'
        }
      });
      
      if (response.data.success) {
        const userData = response.data.data.user;
        localStorage.setItem('cachedUser', JSON.stringify(userData));
        localStorage.setItem('cachedUserTimestamp', Date.now().toString());
        // Use functional update
        setUser(prevUser => {
          if (JSON.stringify(prevUser) !== JSON.stringify(userData)) {
            return userData;
          }
          return prevUser;
        });
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        // Only log if it wasn't a deliberate cancellation
        if (freshDataControllerRef.current) {
          console.log('Fresh data fetch cancelled');
        }
        return;
      }
      console.error('Error fetching fresh user data:', error);
    } finally {
      isFetchingRef.current = false;
      freshDataControllerRef.current = null;
    }
  };

  // Memoize the fetchUser function
  const memoizedFetchUser = useCallback(fetchUser, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && mounted) {
        await memoizedFetchUser(token);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      // Only cancel if there's an active request
      if (freshDataControllerRef.current && isFetchingRef.current) {
        freshDataControllerRef.current.abort();
      }
    };
  }, [memoizedFetchUser]);

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
        // Wait for the user state to be updated
        await new Promise(resolve => {
          const checkUser = setInterval(() => {
            if (user) {
              clearInterval(checkUser);
              resolve();
            }
          }, 50);
          
          // Set a timeout to prevent infinite waiting
          setTimeout(() => {
            clearInterval(checkUser);
            resolve();
          }, 2000);
        });

        // Now navigate to the profile page
        safeNavigate('/', { 
          state: { from: 'google-login' }
        });
      }
    } catch (error) {
      let errorMessage = 'Google authentication failed';
      
      if (error.response) {
        // Handle rate limiting error
        if (error.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again in 60 seconds.';
          // Add retry after header if available
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            errorMessage = `Too many login attempts. Please try again in ${retryAfter} seconds.`;
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      handleApiError(error, 'Error in Google authentication');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      safeNavigate('/login', { 
        state: { error: errorMessage }
      });
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
    safeNavigate('/login', { 
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