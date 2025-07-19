import apiClient from './api/client';
import userService from './userService';

class ProfileService {
  // Get user profile
  async getUserProfile() {
    try {
      const response = await apiClient.get('/api/v1/user/profile/');
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/api/v1/user/profile/', profileData);
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Edit user profile using POST request to /api/v1/user/profile/${userId}/
  async editProfile(profileData) {
    try {
      console.log('=== editProfile called ===');
      console.log('Input profileData:', JSON.stringify(profileData, null, 2));
      
      // Get user ID from userService
      const userId = await userService.getUserIdConsistent();
      console.log('Retrieved userId:', userId);
      
      if (!userId) {
        console.error('User ID not found');
        throw new Error('User ID not found');
      }

      console.log('Editing profile for user ID:', userId);
      console.log('Profile data to update:', JSON.stringify(profileData, null, 2));

      const response = await apiClient.post(`/api/v1/user/profile/${userId}/`, profileData);
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.status) {
        console.log('Profile updated successfully:', response.data.data);
        return response.data.data;
      }
      
      console.error('API returned error status:', response.data);
      throw new Error(response.data.message || 'Failed to update profile');
    } catch (error) {
      console.error('Error editing profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}

export default new ProfileService(); 