import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/api/client';
import EncryptedStorage from 'react-native-encrypted-storage';

// Initial state
const initialState = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  error: null,
  userId: null,
  userProfile: null
};

// Async Thunks
export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithPhone(phone, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      // First verify the OTP
      await dummyAuthApi.verifyOTP(phone, otp);
      
      // Then login the user (in a real app, we would get a token from the verify endpoint)
      // For demo purposes, we'll just find a user with that phone number
      const response = await dummyAuthApi.loginWithPhone(phone, 'password123');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithGoogle(googleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (facebookData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithFacebook(facebookData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Facebook login failed');
    }
  }
);

export const loginWithApple = createAsyncThunk(
  'auth/loginWithApple',
  async (appleData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithApple(appleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Apple login failed');
    }
  }
);

export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.requestOTP(phone);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      console.log('Sending registration request with data:', formData);

      const response = await apiClient.post('/api/v1/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration API Response:', response.data);

      if (response?.data?.status) {
        // Store the tokens securely
        await EncryptedStorage.setItem('user_token', response.data.data.access);
        await EncryptedStorage.setItem('refresh_token', response.data.data.refresh);
        
        return response.data.data;
      }
      
      // If we get here, it means the response indicated failure
      return rejectWithValue(response.data.message || 'Registration failed');
      
    } catch (error) {
      console.log('Registration error:', error);
      
      // The error will be a string because of our apiClient interceptor
      return rejectWithValue(typeof error === 'string' ? error : 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...initialState,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.userProfile = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.userProfile = { ...state.userProfile, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Registration
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
        
        // Update state with API response data
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.userId = action.payload.user_id;
        
        // Store user profile data
        state.userProfile = {
          id: action.payload.id,
          email: action.payload.user_email,
          username: action.payload.username,
          mobileNumber: action.payload.mobile_number,
          countryCode: action.payload.country_code,
          isVerified: action.payload.is_verified,
          profilePicture: action.payload.profile_picture,
          bio: action.payload.bio,
          dateOfBirth: action.payload.date_of_birth,
          address: action.payload.address,
          city: action.payload.city,
          selectedAge: action.payload.selected_age,
          gender: action.payload.gender,
          images: action.payload.images,
          videos: action.payload.videos,
          createdAt: action.payload.created_at,
          updatedAt: action.payload.updated_at
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        state.error = typeof action.payload === 'string' ? action.payload : 'Registration failed';
      });
  },
});

// Export actions and reducer
export const { logout, clearAuthError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer; 