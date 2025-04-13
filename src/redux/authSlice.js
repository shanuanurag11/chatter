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

// Builder cases for the new login methods
// ... existing code ...
    // Handle Login with Google
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Google login failed';
      });
    
    // Handle Login with Facebook
    builder
      .addCase(loginWithFacebook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Facebook login failed';
      });
    
    // Handle Login with Apple
    builder
      .addCase(loginWithApple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithApple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginWithApple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Apple login failed';
      });
// ... existing code ...

// Export actions and reducer
export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer; 