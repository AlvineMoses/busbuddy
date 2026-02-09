/**
 * Redux Store Configuration
 * 
 * Centralized state management using Redux Toolkit
 * with proper slice separation and middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for File objects
        ignoredActions: ['settings/uploadImage/pending', 'settings/uploadImage/fulfilled'],
        // Ignore these field paths in state
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['settings.uploadProgress']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Export types for TypeScript (if using TS)
export const selectSettings = (state) => state.settings;
export const selectUI = (state) => state.ui;
export const selectToasts = (state) => state.ui.toasts;

export default store;
