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
      // Handle both 'id' and 'user_id' field names
      return userData?.id || userData?.user_id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  // Get user ID consistently (helper method)
  async getUserIdConsistent() {
    try {
      const userData = await this.getUserData();
      if (!userData) {
        console.error('No user data available');
        return null;
      }
      
      // Check for both possible field names
      const userId = userData.id || userData.user_id;
      if (!userId) {
        console.error('User ID not found in user data:', userData);
        return null;
      }
      
      return userId.toString();
    } catch (error) {
      console.error('Error getting user ID consistently:', error);
      return null;
    }
  }

  // Validate user data structure
  validateUserData(userData) {
    if (!userData) {
      console.error('User data is null or undefined');
      return false;
    }
    
    const userId = userData.id || userData.user_id;
    if (!userId) {
      console.error('User ID not found in user data:', userData);
      return false;
    }
    
    return true;
  }

  // Get user profile by ID
  async getUserProfileById(userId) {
    try {
      console.log('Fetching user profile for ID:', userId);
      const response = await apiClient.get(`/api/v1/user/profile/${userId}/`);
      console.log('User profile API response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.status) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile by ID:', error);
      throw error;
    }
  }

  // Update total_seconds by deducting used seconds
  async updateTotalSeconds(usedSeconds) {
    try {
      console.log('[UserService] Updating total_seconds, deducting:', usedSeconds);
      
      // Get current user data from storage
      const currentUserData = await this.getUserData();
      
      if (!currentUserData) {
        console.error('[UserService] No user data found in storage');
        return false;
      }

      // Get current total_seconds
      const currentTotalSeconds = currentUserData.total_Seconds || 0;
      console.log('[UserService] Current total_seconds:', currentTotalSeconds);

      // Calculate new total_seconds (ensure it doesn't go below 0)
      const newTotalSeconds = Math.max(0, currentTotalSeconds - usedSeconds);
      console.log('[UserService] New total_seconds after deduction:', newTotalSeconds);

      // Update the user data with new total_seconds
      const updatedUserData = {
        ...currentUserData,
        total_Seconds: newTotalSeconds
      };

      // Save updated user data to storage
      const saved = await this.saveUserData(updatedUserData);
      
      if (saved) {
        console.log('[UserService] Total seconds updated successfully');
        return true;
      } else {
        console.error('[UserService] Failed to save updated user data');
        return false;
      }
    } catch (error) {
      console.error('[UserService] Error updating total_seconds:', error);
      return false;
    }
  }

  // Get current total_seconds
  async getTotalSeconds() {
    try {
      const userData = await this.getUserData();
      return userData?.total_Seconds || 0;
    } catch (error) {
      console.error('[UserService] Error getting total_seconds:', error);
      return 0;
    }
  }
}

export default new UserService();