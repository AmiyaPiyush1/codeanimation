import axios from 'axios';

// Configuration constants
const CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  MAX_CONCURRENT_REQUESTS: 10,
  REQUEST_QUEUE_TIMEOUT: 5000, // 5 seconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  OFFLINE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  PROGRESS_UPDATE_INTERVAL: 100, // 100ms
};

// Request queue for rate limiting
let requestQueue = [];
let activeRequests = 0;

// Response cache
const responseCache = new Map();

// Offline queue for failed requests
const offlineQueue = [];

// Analytics data
const analytics = {
  requests: new Map(),
  errors: new Map(),
  performance: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  }
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: CONFIG.TIMEOUT,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Enable upload progress tracking
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    const requestId = progressEvent.target?._requestId;
    if (requestId && analytics.requests.has(requestId)) {
      analytics.requests.get(requestId).uploadProgress = percentCompleted;
    }
  },
  // Enable download progress tracking
  onDownloadProgress: (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    const requestId = progressEvent.target?._requestId;
    if (requestId && analytics.requests.has(requestId)) {
      analytics.requests.get(requestId).downloadProgress = percentCompleted;
    }
  },
});

// Request queue processor
const processQueue = async () => {
  if (requestQueue.length === 0 || activeRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
    return;
  }

  const { config, resolve, reject } = requestQueue.shift();
  activeRequests++;

  try {
    const response = await axiosInstance(config);
    resolve(response);
  } catch (error) {
    reject(error);
  } finally {
    activeRequests--;
    processQueue();
  }
};

// Cache management
const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;
};

const getCachedResponse = (config) => {
  const cacheKey = getCacheKey(config);
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    return cached.data;
  }
  
  responseCache.delete(cacheKey);
  return null;
};

const setCachedResponse = (config, response) => {
  const cacheKey = getCacheKey(config);
  responseCache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });
};

// Offline support
const isOnline = () => navigator.onLine;

const addToOfflineQueue = (config) => {
  offlineQueue.push({
    config,
    timestamp: Date.now()
  });
  localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
};

const processOfflineQueue = async () => {
  if (!isOnline() || offlineQueue.length === 0) return;

  const queue = [...offlineQueue];
  offlineQueue.length = 0;
  localStorage.removeItem('offlineQueue');

  for (const item of queue) {
    if (Date.now() - item.timestamp > CONFIG.OFFLINE_CACHE_DURATION) continue;
    try {
      await axiosInstance(item.config);
    } catch (error) {
      if (!isOnline()) {
        offlineQueue.push(item);
      }
    }
  }
};

// Analytics tracking
const trackRequest = (config) => {
  const requestId = Date.now().toString();
  config._requestId = requestId;
  
  analytics.requests.set(requestId, {
    url: config.url,
    method: config.method,
    startTime: Date.now(),
    uploadProgress: 0,
    downloadProgress: 0
  });
  
  analytics.performance.totalRequests++;
  return requestId;
};

const trackResponse = (response) => {
  const requestId = response.config._requestId;
  if (!requestId) return;

  const requestData = analytics.requests.get(requestId);
  if (requestData) {
    const duration = Date.now() - requestData.startTime;
    analytics.performance.successfulRequests++;
    analytics.performance.averageResponseTime = 
      (analytics.performance.averageResponseTime * (analytics.performance.successfulRequests - 1) + duration) 
      / analytics.performance.successfulRequests;
  }
};

const trackError = (error) => {
  const requestId = error.config?._requestId;
  if (!requestId) return;

  analytics.performance.failedRequests++;
  const errorType = error.response?.status || 'network';
  analytics.errors.set(errorType, (analytics.errors.get(errorType) || 0) + 1);
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Track request
    trackRequest(config);

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set request metadata
    config.metadata = {
      startTime: Date.now()
    };

    // Check cache for GET requests
    if (config.method === 'get') {
      const cachedResponse = getCachedResponse(config);
      if (cachedResponse) {
        return Promise.reject({
          __CACHE_HIT__: true,
          data: cachedResponse
        });
      }
    }

    // Queue request if too many concurrent requests
    if (activeRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ config, resolve, reject });
        setTimeout(() => {
          const index = requestQueue.findIndex(item => item.config === config);
          if (index !== -1) {
            requestQueue.splice(index, 1);
            reject(new Error('Request queue timeout'));
          }
        }, CONFIG.REQUEST_QUEUE_TIMEOUT);
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Track successful response
    trackResponse(response);

    // Cache successful GET responses
    if (response.config.method === 'get') {
      setCachedResponse(response.config, response.data);
    }

    // Add response time to metadata
    const startTime = response.config.metadata?.startTime || Date.now();
    const duration = Date.now() - startTime;
    response.metadata = {
      ...response.config.metadata,
      duration
    };

    return response;
  },
  async (error) => {
    // Track error
    trackError(error);

    // Handle cache hits
    if (error.__CACHE_HIT__) {
      return Promise.resolve(error);
    }

    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt token refresh for login requests
      if (originalRequest.url === '/api/auth/login') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${CONFIG.BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Retry logic for network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 1;
      } else if (originalRequest._retryCount < CONFIG.RETRY_ATTEMPTS) {
        originalRequest._retryCount++;
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Error handler
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data, headers } = error.response;
    
    switch (status) {
      case 400:
        return Promise.reject(new Error(data.message || 'Bad request'));
      case 401:
        return Promise.reject(new Error('Unauthorized access'));
      case 403:
        return Promise.reject(new Error('Access forbidden'));
      case 404:
        return Promise.reject(new Error('Resource not found'));
      case 429:
        const retryAfter = headers['retry-after'] || 60;
        const error = new Error(`Too many requests. Please try again after ${retryAfter} seconds.`);
        error.retryAfter = retryAfter;
        return Promise.reject(error);
      case 500:
        return Promise.reject(new Error('Internal server error'));
      default:
        return Promise.reject(new Error(data.message || 'An error occurred'));
    }
  } else if (error.request) {
    // Request made but no response
    return Promise.reject(new Error('No response from server'));
  } else {
    // Request setup error
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
};

// Add error handler to instance
axiosInstance.interceptors.response.use(
  response => response,
  error => handleError(error)
);

// Setup offline/online event listeners
window.addEventListener('online', processOfflineQueue);
window.addEventListener('offline', () => {
  console.log('You are offline. Some features may be limited.');
});

// Export enhanced instance and analytics
export { analytics };
export default axiosInstance; 