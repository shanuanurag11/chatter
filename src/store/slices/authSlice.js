import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import dummyAuthApi from '../../api/dummyAuthApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      return await dummyAuthApi.loginWithPhone(phone, password);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithGoogle(googleData);
      
      // Store auth tokens in secure storage
      await AsyncStorage.setItem('authToken', response.token);
      
      // Return user data to be stored in Redux state
      return {
        user: response.user,
        token: response.token
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to login with Google');
    }
  }
);

export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (facebookData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithFacebook(facebookData);
      
      // Store auth tokens in secure storage
      await AsyncStorage.setItem('authToken', response.token);
      
      // Return user data to be stored in Redux state
      return {
        user: response.user,
        token: response.token
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to login with Facebook');
    }
  }
);

export const loginWithApple = createAsyncThunk(
  'auth/loginWithApple',
  async (appleData, { rejectWithValue }) => {
    try {
      const response = await dummyAuthApi.loginWithApple(appleData);
      
      // Store auth tokens in secure storage
      await AsyncStorage.setItem('authToken', response.token);
      
      // Return user data to be stored in Redux state
      return {
        user: response.user,
        token: response.token
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to login with Apple');
    }
  }
);

export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone, { rejectWithValue }) => {
    try {
      return await dummyAuthApi.requestOTP(phone);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      return await dummyAuthApi.verifyOTP(phone, otp);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);
      // If it's Google signup, we'll get back user and token
      if (userData.googleId) {
        return response;
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const registerWithPhone = createAsyncThunk(
  'auth/registerWithPhone',
  async (userData, { rejectWithValue }) => {
    try {
      return await dummyAuthApi.registerWithPhone(userData);
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
      return await authApi.checkAuthStatus();
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
    isAuthenticated: false,
    isLoading: false,
    otpSent: false,
    otpVerified: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOTPStatus: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with Phone
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to login with Google';
      })
      
      // Login with Facebook
      .addCase(loginWithFacebook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to login with Facebook';
      })
      
      // Login with Apple
      .addCase(loginWithApple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithApple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithApple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to login with Apple';
      })
      
      // Request OTP
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to send OTP';
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'OTP verification failed';
      })
      
      // Register with Phone
      .addCase(registerWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithPhone.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
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
        // If it's Google signup, set the user and token
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
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.otpVerified = false;
      })
      
      // Check Auth Status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
        }
      });
  },
});

export const { clearError, resetOTPStatus } = authSlice.actions;
export default authSlice.reducer; 