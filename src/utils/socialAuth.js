/**
 * Social Authentication Utilities
 * 
 * This file contains helper functions for social media authentication.
 * In a real app, you would integrate with actual SDKs like Google Sign-In, Facebook Login, etc.
 * For this demo, we're simulating successful responses.
 */

import { Alert } from 'react-native';

/**
 * Google authentication helper
 * @returns {Promise<Object>} - User data from Google
 */
export const googleAuth = async () => {
  try {
    // Simulate a successful Google Sign-In
    // In a real app, this would be the result from Google Sign-In SDK
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    return {
      id: `google-${Date.now()}`,
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      photo: 'https://randomuser.me/api/portraits/men/1.jpg'
    };
  } catch (error) {
    console.error('Google Auth Error:', error);
    throw new Error('Google authentication failed');
  }
};

/**
 * Facebook authentication helper
 * @returns {Promise<Object>} - User data from Facebook
 */
export const facebookAuth = async () => {
  try {
    // Simulate a successful Facebook Login
    // In a real app, this would be the result from Facebook Login SDK
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    return {
      id: `facebook-${Date.now()}`,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      photo: 'https://randomuser.me/api/portraits/women/1.jpg'
    };
  } catch (error) {
    console.error('Facebook Auth Error:', error);
    throw new Error('Facebook authentication failed');
  }
};

/**
 * Apple authentication helper
 * @returns {Promise<Object>} - User data from Apple
 */
export const appleAuth = async () => {
  try {
    // Simulate a successful Apple Sign In
    // In a real app, this would be the result from Apple Authentication SDK
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    return {
      id: `apple-${Date.now()}`,
      name: 'Apple User',
      email: 'user@icloud.com',
      // Apple doesn't provide photo URLs
      photo: null
    };
  } catch (error) {
    console.error('Apple Auth Error:', error);
    throw new Error('Apple authentication failed');
  }
};

/**
 * Generic social login handler with error management
 * @param {Function} authMethod - Authentication method to call (googleAuth, facebookAuth, etc.)
 * @param {Function} onSuccess - Callback when auth is successful
 */
export const handleSocialLogin = async (authMethod, onSuccess) => {
  try {
    const userData = await authMethod();
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(userData);
    }
    return userData;
  } catch (error) {
    Alert.alert(
      'Authentication Failed',
      error.message || 'Failed to authenticate. Please try again.',
      [{ text: 'OK' }]
    );
    return null;
  }
}; 