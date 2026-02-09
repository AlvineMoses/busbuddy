/**
 * UI Slice - Redux Toolkit
 * 
 * Manages UI-related state including:
 * - Toast notifications
 * - Active page
 * - Selected school
 * - Sidebar state
 */

import { createSlice } from '@reduxjs/toolkit';

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  // Toast notifications
  toasts: [],
  
  // Page state
  activePage: 'dashboard',
  selectedSchoolId: '',
  sidebarCollapsed: true,
  
  // Modal state
  activeModal: null,
  modalData: null
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
    addToast: (state, action) => {
      const { message, type = 'info', duration = 5000 } = action.payload;
      state.toasts.push({
        id: ++toastId,
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration,
        timestamp: Date.now()
      });
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Page navigation
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
    
    setSelectedSchool: (state, action) => {
      state.selectedSchoolId = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload;
      state.activeModal = modal;
      state.modalData = data;
    },
    
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    }
  }
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
  closeModal
} = uiSlice.actions;

export default uiSlice.reducer;
