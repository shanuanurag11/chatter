import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      return { user, token };
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  
  logout: async () => {
    try {
      // Call logout endpoint if needed
      await apiClient.post('/auth/logout');
      
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.log('Logout error:', error);
      // Still clear tokens even if API call fails
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
    }
  },
  
  checkAuthStatus: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return { isAuthenticated: false };
      
      // Verify token with backend
      const response = await apiClient.get('/auth/me');
      return { 
        isAuthenticated: true, 
        user: response.data.user 
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }
}; 