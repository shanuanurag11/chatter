import axios from 'axios';
import { dummyPeople, bannerData } from '../data/dummyPeople';

// Base API URL - Replace with your actual API URL when ready
const API_BASE_URL = 'https://api.example.com';

// This class handles all API requests related to people/users
class PeopleService {
  // Get a list of people (users) based on filter
  async getPeople(filter = 'popular', page = 1, limit = 20) {
    try {
      // In development, return dummy data
      if (process.env.NODE_ENV === 'development' || !API_BASE_URL.includes('example.com')) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return different subsets based on the filter
        if (filter === 'new') {
          // For 'new' tab, shuffle and return a subset
          return [...dummyPeople].sort(() => 0.5 - Math.random());
        }
        
        // For 'popular' tab, return as is
        return dummyPeople;
      }
      
      // In production, make actual API call
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: { filter, page, limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching people:', error);
      throw error;
    }
  }
  
  // Get current promotional banner
  async getPromoBanner() {
    try {
      // In development, return dummy data
      if (process.env.NODE_ENV === 'development' || !API_BASE_URL.includes('example.com')) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return bannerData;
      }
      
      // In production, make actual API call
      const response = await axios.get(`${API_BASE_URL}/promo/banner`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promo banner:', error);
      throw error;
    }
  }
  
  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      // In development, return dummy data
      if (process.env.NODE_ENV === 'development' || !API_BASE_URL.includes('example.com')) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Find user in dummy data
        const user = dummyPeople.find(p => p.id === userId);
        
        if (user) {
          return {
            ...user,
            // Add more detailed profile info here
            age: Math.floor(Math.random() * 10) + 20, // Random age between 20-29
            interests: ['Music', 'Travel', 'Photography'],
            location: 'Mumbai, India',
            about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          };
        }
        
        throw new Error('User not found');
      }
      
      // In production, make actual API call
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user profile for ID ${userId}:`, error);
      throw error;
    }
  }
  
  // Initialize a video call with a user
  async initiateVideoCall(userId) {
    try {
      // In development, return dummy data
      if (process.env.NODE_ENV === 'development' || !API_BASE_URL.includes('example.com')) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          callId: `call-${Math.random().toString(36).substring(2, 9)}`,
          userId,
          status: 'initiated',
          timestamp: new Date().toISOString(),
        };
      }
      
      // In production, make actual API call
      const response = await axios.post(`${API_BASE_URL}/calls`, { userId, type: 'video' });
      return response.data;
    } catch (error) {
      console.error(`Error initiating video call with user ${userId}:`, error);
      throw error;
    }
  }
}

export default new PeopleService(); 