import apiClient from './client';
import EncryptedStorage from 'react-native-encrypted-storage';

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        await EncryptedStorage.setItem('user_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.token) {
        await EncryptedStorage.setItem('user_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if your API has one
      await apiClient.post('/auth/logout');
      await EncryptedStorage.removeItem('user_token');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the token even if the API call fails
      await EncryptedStorage.removeItem('user_token');
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Password reset request
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password with token
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await EncryptedStorage.getItem('user_token');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
}; 