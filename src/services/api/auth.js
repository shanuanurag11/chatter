import apiClient from './client';
import EncryptedStorage from 'react-native-encrypted-storage';
import userService from '../../services/userService';

export const authService = {
  // Login user
  async login(credentials) {
    try {
      console.log('Attempting login with credentials:', credentials);
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data) {
        // Save user data using userService
        const saved = await userService.saveUserData(response.data);
        console.log('User data saved after login:', saved);
        
        if (!saved) {
          throw new Error('Failed to save user data');
        }
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
      if (response.data) {
        // Save user data using userService
        const saved = await userService.saveUserData(response.data);
        if (!saved) {
          throw new Error('Failed to save user data');
        }
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
      // Clear user data using userService
      await userService.clearUserData();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the data even if the API call fails
      await userService.clearUserData();
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data) {
        // Save user data using userService
        await userService.saveUserData(response.data);
      }
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
      if (response.data) {
        // Save updated user data
        await userService.saveUserData(response.data);
      }
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
      const userData = await userService.getUserData();
      return !!userData;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
}; 