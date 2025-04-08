import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.example.com'; // Replace with your API URL

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If token is expired (401), try to refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Implement refresh token logic here if needed
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Call your refresh token endpoint
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          
          // Save new token
          await AsyncStorage.setItem('token', token);
          
          // Update the header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh error (e.g., logout user)
        console.log('Error refreshing token:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 