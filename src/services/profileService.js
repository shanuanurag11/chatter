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

  // Edit user profile with image upload using FormData
  async editProfileWithImage(profileData, imageData) {
    try {
      console.log('=== editProfileWithImage called ===');
      console.log('Input profileData:', JSON.stringify(profileData, null, 2));
      console.log('Input imageData:', imageData);
      
      // Get user ID from userService
      const userId = await userService.getUserIdConsistent();
      console.log('Retrieved userId:', userId);
      
      if (!userId) {
        console.error('User ID not found');
        throw new Error('User ID not found');
      }

      // Create FormData object
      const formData = new FormData();
      
      // Add all profile data fields to FormData
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          if (Array.isArray(profileData[key])) {
            // Handle arrays (like tags)
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key].toString());
          }
        }
      });
      
      // Add image file to FormData if provided
      if (imageData && imageData.uri) {
        // Extract file extension from fileName or type
        const getFileExtension = () => {
          if (imageData.fileName) {
            const extension = imageData.fileName.split('.').pop();
            return extension ? `.${extension}` : '.jpg';
          }
          if (imageData.type) {
            return imageData.type === 'image/jpeg' ? '.jpg' : 
                   imageData.type === 'image/png' ? '.png' : '.jpg';
          }
          return '.jpg';
        };
        
        const fileObject = {
          uri: imageData.uri,
          type: imageData.type || 'image/jpeg',
          name: imageData.fileName || `profile_${Date.now()}${getFileExtension()}`,
        };
        
        formData.append('profile_picture', fileObject);
        console.log('Added profile_picture to FormData:', fileObject);
      }

      console.log('Editing profile with image for user ID:', userId);

      // Make API call with FormData
      const response = await apiClient.post(`/api/v1/user/profile/${userId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.status) {
        console.log('Profile with image updated successfully:', response.data.data);
        return response.data.data;
      }
      
      console.error('API returned error status:', response.data);
      throw new Error(response.data.message || 'Failed to update profile with image');
    } catch (error) {
      console.error('Error editing profile with image:', error);
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