import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.log('Error decoding token:', error);
    return false;
  }
};

export const getTokenFromStorage = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.log('Error getting token from storage:', error);
    return null;
  }
};

export const clearAuthStorage = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'refreshToken']);
    return true;
  } catch (error) {
    console.log('Error clearing auth storage:', error);
    return false;
  }
};

export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    const decodedToken = jwt_decode(token);
    // Assuming the user data is stored in the token payload
    return decodedToken.user || null;
  } catch (error) {
    console.log('Error decoding user from token:', error);
    return null;
  }
}; 