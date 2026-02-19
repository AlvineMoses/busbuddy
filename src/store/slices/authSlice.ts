/**
 * Auth Slice - Redux Toolkit
 *
 * Manages authentication state including:
 * - User session
 * - Authentication status
 * - Login/logout actions
 * - Integration with AuthService singleton
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/AuthService';
import type { LoginCredentials } from '../../services/AuthService';
import type { User } from '../../../types';

// ============================================
// TYPES
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: authService.user,
  token: authService.token,
  isAuthenticated: authService.isAuthenticated,
  isLoading: false,
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      if (res.status === 'success') {
        return { user: res.user, token: res.token };
      }
      return rejectWithValue('OTP verification required');
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      const user = action.payload;
      if (user) {
        authService.loginDirect(user);
      }
      state.user = user;
      state.isAuthenticated = !!user;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { setUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
