import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Login attempted with:', email, password);
      return {
        user: { 
          id: '123', 
          name: 'Test User', 
          email: email
        },
        token: 'dummy-token'
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      return await authApi.signup(userData);
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
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = { 
          id: '123', 
          name: 'Test User', 
          email: 'test@example.com' 
        };
        state.token = 'dummy-token';
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
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
        // Note: signup doesn't log user in automatically
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Signup failed';
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

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 