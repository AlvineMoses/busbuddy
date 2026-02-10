/**
 * UI Slice - Redux Toolkit
 *
 * Manages UI-related state including:
 * - Toast notifications
 * - Active page
 * - Selected school
 * - Sidebar state
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ============================================
// TYPES
// ============================================

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}

interface AddToastPayload {
  message: string;
  type?: Toast['type'];
  duration?: number;
}

interface OpenModalPayload {
  modal: string;
  data?: unknown;
}

export interface UIState {
  toasts: Toast[];
  activePage: string;
  selectedSchoolId: string;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: unknown;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: UIState = {
  // Toast notifications
  toasts: [],

  // Page state
  activePage: 'dashboard',
  selectedSchoolId: '',
  sidebarCollapsed: true,

  // Modal state
  activeModal: null,
  modalData: null,
};

// ============================================
// SLICE
// ============================================

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toast actions
    addToast: (state, action: PayloadAction<AddToastPayload>) => {
      const { message, type = 'info', duration = 5000 } = action.payload;
      state.toasts.push({
        id: ++toastId,
        message,
        type,
        duration,
        timestamp: Date.now(),
      });
    },

    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // Page navigation
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePage = action.payload;
    },

    setSelectedSchool: (state, action: PayloadAction<string>) => {
      state.selectedSchoolId = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      const { modal, data } = action.payload;
      state.activeModal = modal;
      state.modalData = data;
    },

    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

// ============================================
// EXPORTS
// ============================================

export const {
  addToast,
  removeToast,
  clearToasts,
  setActivePage,
  setSelectedSchool,
  toggleSidebar,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
