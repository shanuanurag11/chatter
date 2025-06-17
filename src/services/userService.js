import EncryptedStorage from 'react-native-encrypted-storage';
import apiClient from './api/client';

class UserService {
  constructor() {
    this.userData = null;
  }

  // Save user data to storage
  async saveUserData(userData) {
    try {
      console.log('Saving user data:', JSON.stringify(userData, null, 2));
      

      // Save user data
      await EncryptedStorage.setItem(
        'user_data',
        JSON.stringify(userData)
      );
      console.log('User data saved to storage');

      this.userData = userData;
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  // Get user data from storage
  async getUserData() {
    try {
      console.log('Getting user data from storage...');
      
      const userDataString = await EncryptedStorage.getItem('user_data');
      console.log('Raw user data from storage:', userDataString);
      
      if (userDataString) {
        const parsedData = JSON.parse(userDataString);
        console.log('Parsed user data:', JSON.stringify(parsedData, null, 2));
        return parsedData;
      }
      
      console.log('No user data found in storage');
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Get user token
  async getToken() {
    try {
      return await EncryptedStorage.getItem('user_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Get refresh token
  async getRefreshToken() {
    try {
      return await EncryptedStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Clear user data (logout)
  async clearUserData() {
    try {
      await EncryptedStorage.removeItem('user_data');
      await EncryptedStorage.removeItem('user_token');
      await EncryptedStorage.removeItem('refresh_token');
      this.userData = null;
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Get current user profile from API
  async getCurrentUser() {
    try {
      console.log('Fetching current user from API...');
      const response = await apiClient.get('/api/v1/user/profile/');
      console.log('API response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.status) {
        // Save updated user data
        const saved = await this.saveUserData(response.data.data);
        console.log('User data saved after API fetch:', saved);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user ID
  async getUserId() {
    try {
      const userData = await this.getUserData();
      return userData?.user_id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }
}

export default new UserService();