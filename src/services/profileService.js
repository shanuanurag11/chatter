import apiClient from './api/client';

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
}

export default new ProfileService(); 