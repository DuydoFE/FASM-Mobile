import { AuthUser } from '@/types/api.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Auth State Interface
 * Defines the shape of authentication state in Redux store
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Initial state for authentication
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
};

/**
 * Auth Slice
 * Manages authentication state including user data and tokens
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user data and tokens after successful login
     */
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    /**
     * Update tokens (e.g., after token refresh)
     */
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (state.user) {
        state.user.accessToken = action.payload.accessToken;
        state.user.refreshToken = action.payload.refreshToken;
      }
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Clear all authentication data (logout)
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

// Export actions
export const { setCredentials, updateTokens, setLoading, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;