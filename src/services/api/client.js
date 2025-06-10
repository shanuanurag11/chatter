import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

const BASE_URL = 'https://sakooneqalb.com'; // Updated with actual API URL

// Helper function to extract error message from any type of error
const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  // Handle axios error response
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data) {
      if (typeof error.response.data === 'string') return error.response.data;
      if (error.response.data.message) return error.response.data.message;
      if (error.response.data.error) return error.response.data.error;
    }
    return `Server error: ${error.response.status}`;
  }
  
  // Handle axios request error
  if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your internet connection.';
  }
  
  // Handle other errors
  if (error.message) return error.message;
  
  return 'An unexpected error occurred';
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await EncryptedStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle multipart form data
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }

      console.log('Request Config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });

      return config;
    } catch (error) {
      return Promise.reject(getErrorMessage(error));
    }
  },
  (error) => {
    return Promise.reject(getErrorMessage(error));
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    // If the response indicates an error through status property
    if (response.data && response.data.status === false) {
      return Promise.reject(response.data.message || 'Operation failed');
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await EncryptedStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.post('/api/v1/token/refresh/', {
          refresh: refreshToken
        });

        if (response.data.access) {
          await EncryptedStorage.setItem('user_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        await EncryptedStorage.clear();
        return Promise.reject(getErrorMessage(refreshError));
      }
    }

    // Extract and return error message
    console.log("error-1291->",error);
    const errorMessage = getErrorMessage(error);
    console.error('API Error:', errorMessage);
    return Promise.reject(errorMessage);
  }
);

export default apiClient; 