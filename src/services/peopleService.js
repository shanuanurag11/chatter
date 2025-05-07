import axios from 'axios';
import callService from './callService';
import { dummyPeople, bannerData } from '../data/dummyPeople';

// API base URL - replace with your actual API in production
const API_BASE_URL = 'https://api.example.com/v1';

// Environment detection
const isDev = process.env.NODE_ENV === 'development' || __DEV__;

/**
 * Get people list with optional filter
 * @param {string} filter - Filter criteria
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} - People data object
 */
const getPeople = async (filter = '', page = 1, limit = 20) => {
  try {
    if (isDev) {
      // Simulate network delay in development
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for development
      const mockUsers = Array(limit).fill().map((_, i) => ({
        id: `user_${(page - 1) * limit + i + 1}`,
        name: `User ${(page - 1) * limit + i + 1}`,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
        online: Math.random() > 0.3,
        location: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][Math.floor(Math.random() * 5)],
        distance: Math.floor(Math.random() * 50) + ' km away',
        lastActive: Math.random() > 0.5 ? 'Online now' : `${Math.floor(Math.random() * 60)} mins ago`,
        coins: Math.floor(Math.random() * 1000) + 100,
      }));
      
      return {
        success: true,
        data: mockUsers,
        pagination: {
          total: 100,
          page,
          limit,
          hasMore: page * limit < 100
        }
      };
    }
    
    // Make actual API call in production
    const response = await axios.get(`${API_BASE_URL}/people`, {
      params: { filter, page, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching people:', error);
    throw new Error(error.response?.data?.message || 'Failed to load people');
  }
};

/**
 * Get current promo banner
 * @returns {Promise<Object>} - Promo banner data
 */
const getPromoBanner = async () => {
  try {
    if (isDev) {
      // Simulate network delay in development
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock promo data
      return {
        success: true,
        data: {
          id: 'promo_1',
          title: 'Summer Special',
          discount: '60% OFF',
          timeLeft: 1800, // 30 minutes in seconds
          imageUrl: 'https://example.com/promos/summer.jpg',
          actionUrl: '/promo/summer',
          isActive: true
        }
      };
    }
    
    // Make actual API call in production
    const response = await axios.get(`${API_BASE_URL}/promos/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promo banner:', error);
    throw new Error(error.response?.data?.message || 'Failed to load promo banner');
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
  getPromoBanner,
  getUserProfile,
  initiateVideoCall
}; 