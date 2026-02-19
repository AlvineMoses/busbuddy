/**
 * Redux Store Configuration
 *
 * SMART DATA-FLOW: Single Source of Truth
 * ─────────────────────────────────────────
 * All application state managed through Redux Toolkit with:
 * - Auth state (user, session, authentication)
 * - Entity data (schools, drivers, routes, trips, students, etc.)
 * - Settings (application configuration)
 * - UI state (toasts, active page, selected school, sidebar)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import entitiesReducer from './slices/entitiesSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entities: entitiesReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for File objects
        ignoredActions: ['settings/uploadImage/pending', 'settings/uploadImage/fulfilled'],
        // Ignore these field paths in state
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['settings.uploadProgress'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer root state and dispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectEntities = (state: RootState) => state.entities;
export const selectSettings = (state: RootState) => state.settings;
export const selectUI = (state: RootState) => state.ui;
export const selectToasts = (state: RootState) => state.ui.toasts;

export default store;
