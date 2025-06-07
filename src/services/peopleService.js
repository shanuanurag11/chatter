import axios from 'axios';
import callService from './callService';
import { dummyPeople } from '../data/dummyPeople';
import apiClient from './api/client';

// Remove unused API_BASE_URL since we're using apiClient
// const API_BASE_URL = 'https://api.example.com/v1';

// Environment detection
const isDev = process.env.NODE_ENV === 'development' || __DEV__;

/**
 * Get people list with optional filter
 * @param {string} filter - Filter criteria ('popular' or 'new')
 * @returns {Promise<Object>} - People data object
 */
const getPeople = async (filter = 'popular') => {
  try {
    const response = await apiClient.get('/api/v1/get_all_customers/', {
      params: { filter }
    });
   console.log("response-12921->",response);
    return {
      success: true,
      data: response.data.data.active_users || []
    };
  } catch (error) {
    console.error('Error fetching people:', error);
    throw new Error(error.response?.data?.message || 'Failed to load people');
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile data
 */
const getUserProfile = async (userId) => {
  try {
    if (isDev) {
      // Simulate network delay in development
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock user data
      return {
        success: true,
        data: {
          id: userId,
          name: `User ${userId.split('_')[1]}`,
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultrices.',
          location: 'New York',
          age: Math.floor(Math.random() * 20) + 20,
          interests: ['Music', 'Travel', 'Movies', 'Books', 'Gaming'].slice(0, Math.floor(Math.random() * 5) + 1),
          online: Math.random() > 0.3,
          verified: Math.random() > 0.7,
          coins: Math.floor(Math.random() * 1000) + 100,
          callRate: Math.floor(Math.random() * 50) + 1,
        }
      };
    }
    
    // Make actual API call in production
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to load user profile');
  }
};

/**
 * Initiate a video call with a user
 * @param {string} userId - ID of the user to call
 * @returns {Promise<Object>} - Call data object
 */
const initiateVideoCall = async (userId) => {
  try {
    // Get user profile to ensure they exist and are available
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile.success) {
      throw new Error('Failed to get user profile');
    }
    
    if (!userProfile.data.online) {
      throw new Error('User is offline and not available for calls');
    }
    
    // Use the callService to initiate the call
    const callData = await callService.requestCallId(userId, 'video');
    
    return {
      success: true,
      callId: callData.callId,
      recipientId: userId,
      recipientName: userProfile.data.name,
      callType: 'video',
      token: callData.token
    };
  } catch (error) {
    console.error(`Error initiating video call with ${userId}:`, error);
    throw new Error(error.message || 'Failed to initiate video call');
  }
};

export default {
  getPeople,
  getUserProfile,
  initiateVideoCall
}; 