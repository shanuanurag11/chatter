import apiClient from '../services/api/client';
import axios from 'axios';

/**
 * Fetch ZEGO credentials from API
 * @returns {Promise<Object>} ZEGO credentials object
 */
export const fetchZegoCredentialsFromAPI = async () => {
  try {
    console.log('*****Fetching ZEGO credentials from API****');
    const response = await apiClient.get('/api/v1/zego/');
    console.log('ZEGO credentials full response:', JSON.stringify(response, null, 2));
    
    // Check if response exists and has data
    if (response && response.data) {
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      // Check if response follows expected format
      if (response.data.status && response.data.data) {
        const { app_id, app_sign, server_secret, callback_secret } = response.data.data;
        
        return {
          appId: parseInt(app_id), // Convert to number as required by ZEGO
          appSign: app_sign,
          serverSecret: server_secret,
          callbackSecret: callback_secret,
        };
      } else {
        console.error('API response does not have expected structure:', response.data);
        throw new Error('API response missing status or data fields');
      }
    } else {
      console.error('No response data received from API');
      throw new Error('No response data received from API');
    }
  } catch (error) {
    console.error('Error fetching ZEGO credentials from API:', error);
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
      console.error('API Error Status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Get ZEGO credentials from API (fetches fresh data every time)
 * @returns {Promise<Object>} ZEGO credentials object
 */
export const getZegoCredentials = async () => {
  try {
    console.log('Fetching fresh ZEGO credentials from API');
    const credentials = await fetchZegoCredentialsFromAPI();
    return credentials;
  } catch (error) {
    console.error('Error getting ZEGO credentials:', error);
    throw new Error('Unable to get ZEGO credentials: ' + error.message);
  }
};

/**
 * Initialize ZEGO credentials (call this during app initialization)
 * Fetches fresh credentials from API every time
 */
export const initializeZegoCredentials = async () => {
  try {
    await getZegoCredentials();
    console.log('ZEGO credentials initialized successfully');
  } catch (error) {
    console.error('Error initializing ZEGO credentials:', error);
    throw error;
  }
};
