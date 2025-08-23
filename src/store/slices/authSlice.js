import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import apiClient from '../../services/api/client';
import userService from '../../services/userService';
import zegoService from '../../services/zegoService';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authApi.login(email, password);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async ({ countryCode, mobileNumber, hasConsent }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/v1/send_otp/', {
        country_code: countryCode,
        mobile_number: mobileNumber,
        consent: hasConsent
      });
      console.log("response-121->",response);
      return response.data;
    } catch (error) {
      console.log("error-121->",error);
      return rejectWithValue(error);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    console.log("111response-1verifyotp1->phone, otp",phone, otp);
    try {
      const response = await apiClient.post('/api/v1/verify_otp/', {
        mobile_number: phone.toString(),
        otp_code: otp,
        country_code: '+91'
      });

      console.log("response.data1verifyotp1->",response.data);
      if (response.data.status) {
        if (response.data.data.is_signed_in) {
          // Store the tokens securely only if user is signed in
          await EncryptedStorage.setItem('user_token', response.data.data.access);
          await EncryptedStorage.setItem('refresh_token', response.data.data.refresh);
          const userData = response.data.data;
          await userService.saveUserData(userData);
          
          // Initialize ZEGOCLOUD call service after successful login
          try {
            const userID = userData.id?.toString() || userData.user_id?.toString() || phone;
            const userName = userData.name || userData.username || `User_${phone}`;
            const duration = userData.total_seconds;
            await zegoService.initialize(userID, userName, duration);
            console.log('[Auth] ZEGOCLOUD initialized successfully11111111');
          } catch (zegoError) {
            console.error('[Auth] ZEGOCLOUD initialization failed:', zegoError);
            // Don't fail the login if ZEGOCLOUD fails to initialize
          }
        }
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || response.data.errors?.mobile_number || 'Login failed');
      }
    } catch (error) {
      console.log("Login error:", error);
      return rejectWithValue(error?.response?.data?.message || error?.response?.data?.errors?.mobile_number || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);
      if (userData.googleId) {
        return response;
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (googleUser, { rejectWithValue }) => {
    try {
      return await authApi.googleSignIn(googleUser);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      return await authApi.forgotPassword(email);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Try to get the stored tokens
      console.log("**checkAuthStatus**")
      const userToken = await EncryptedStorage.getItem('user_token');
      const refreshToken = await EncryptedStorage.getItem('refresh_token');

      if (userToken && refreshToken) {
        // Get user data from storage
        const userData = await userService.getUserData();
        console.log("userData**userData--->",userData)
        // Initialize ZEGOCLOUD call service if user is authenticated
        if (userData) {
          try {
            console.log("****checkStatus****")
            const userID = userData.id?.toString() || userData.user_id?.toString();
            const userName = userData.name || userData.username || `User_${userID}`;
            const duration = userData.total_seconds;
            await zegoService.initialize(userID, userName, duration);
            console.log('[Auth] ZEGOCLOUD initialized successfully on app start2222');
          } catch (zegoError) {
            console.error('[Auth] ZEGOCLOUD initialization failed on app start:', zegoError);
            // Don't fail the auth check if ZEGOCLOUD fails to initialize
          }
        }
        
        // Validate token with backend if needed
        // For now, just return the tokens
        return {
          isAuthenticated: true,
          access: userToken,
          refresh: refreshToken
        };
      }

      return {
        isAuthenticated: false
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.post('/api/v1/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.status) {
        // Store the tokens
        await EncryptedStorage.setItem('user_token', response.data.data.access);
        await EncryptedStorage.setItem('refresh_token', response.data.data.refresh);
        
        const userData = response.data.data;
        await userService.saveUserData(userData);
        const duration = userData.total_seconds;
        await zegoService.initialize(userID, userName, duration);
        return userData;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.log("error-->",error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Add a new thunk to handle logout and clear storage
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Uninitialize ZEGOCLOUD call service before logout
      try {
        await zegoService.uninitialize();
        console.log('[Auth] ZEGOCLOUD uninitialized successfully');
      } catch (zegoError) {
        console.error('[Auth] ZEGOCLOUD uninitialization failed:', zegoError);
        // Don't fail the logout if ZEGOCLOUD fails to uninitialize
      }
      
      // Clear stored tokens
      await EncryptedStorage.removeItem('user_token');
      await EncryptedStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('authToken');
      
      return true;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    otpSent: false,
    otpVerified: false,
    error: null,
    userId: null,
    userProfile: null,
    phoneNumber: '',
    countryCode: '+91'
  },
  reducers: {
    logoutAction: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.userProfile = null;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.userProfile = { ...state.userProfile, ...action.payload };
    },
    resetOTPStatus: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder


      // Request OTP
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.error = null;
        state.phoneNumber = action.meta.arg.mobileNumber;
        state.countryCode = action.meta.arg.countryCode;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.otpSent = false;
        state.error = action.payload?.message || 'Failed to send OTP';
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpVerified = true;
        if (action.payload && action.payload.is_signed_in === true) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.token = action.payload.access;
          state.refreshToken = action.payload.refresh;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
  
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Signup failed';
      })
      
      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Google sign in failed';
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.otpVerified = false;
      })
      
      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.isAuthenticated) {
          state.token = action.payload.access;
          state.refreshToken = action.payload.refresh;
        }
      })
      
      // Registration
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.access;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { clearAuthError, updateUserProfile, resetOTPStatus, logoutAction } = authSlice.actions;
export default authSlice.reducer; 