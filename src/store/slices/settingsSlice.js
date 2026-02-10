/**
 * Settings Slice - Redux Toolkit
 * 
 * Manages platform settings including:
 * - Branding (platform name, colors, logos)
 * - Login experience (hero image)
 * - Testimonials
 * - Permissions
 * - Feature flags
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService } from '../../services/UnifiedApiService';
import { uploadFile, validateFile, deleteUploadedFile } from '../../services/fileUploadService';

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Fetch settings from backend
 */
export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { settings } = await settingsService.get();
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update settings
 */
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (updates, { rejectWithValue }) => {
    try {
      const { settings } = await settingsService.update(updates);
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Upload image (hero or logo) with validation and optimization
 */
export const uploadImage = createAsyncThunk(
  'settings/uploadImage',
  async ({ file, type }, { rejectWithValue }) => {
    try {
      // Validate before uploading (throws on failure)
      const validation = validateFile(file, type);
      if (!validation.valid) {
        return rejectWithValue(validation.error);
      }

      // Upload (validates, optimizes, stores in localStorage)
      const publicPath = await uploadFile(file, type);
      return { type, url: publicPath, fileName: file.name };
    } catch (error) {
      return rejectWithValue(error.message || 'Upload failed');
    }
  }
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  // Data
  platformName: 'Bus Buddy',
  colors: {
    primary: '#ff3600',
    secondary: '#1fd701',
    surface: '#f8fafc'
  },
  loginHeroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
  heroMode: 'url', // 'url' or 'upload'
  uploadedHeroImage: null,
  
  logoMode: 'url', // 'url' or 'upload'
  logoUrls: {
    light: '',
    dark: '',
    platform: ''
  },
  uploadedLogos: {
    light: null,
    dark: null,
    platform: null
  },
  
  testimonials: [
    {
      id: '1',
      name: 'Riaot Escanor',
      role: 'Project Manager at Google',
      text: 'I Landed Multiple Projects Within A Couple Of Days - With This Tool. Definitely My Go To Freelance Platform Now!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop'
    }
  ],
  
  permissionGroups: [],
  
  // Meta
  loading: false,
  error: null,
  uploadProgress: {},
  lastSaved: null
};

// ============================================
// SLICE
// ============================================

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Synchronous actions for local state updates
    setPlatformName: (state, action) => {
      state.platformName = action.payload;
    },
    
    setColors: (state, action) => {
      state.colors = { ...state.colors, ...action.payload };
    },
    
    setLoginHeroImage: (state, action) => {
      state.loginHeroImage = action.payload;
    },
    
    setHeroMode: (state, action) => {
      state.heroMode = action.payload;
    },
    
    setLogoMode: (state, action) => {
      state.logoMode = action.payload;
    },
    
    setLogoUrls: (state, action) => {
      state.logoUrls = { ...state.logoUrls, ...action.payload };
    },
    
    setTestimonials: (state, action) => {
      state.testimonials = action.payload;
    },
    
    addTestimonial: (state) => {
      state.testimonials.push({
        id: String(Date.now()),
        name: '',
        role: '',
        text: '',
        avatar: 'https://ui-avatars.com/api/?name=New&background=random'
      });
    },
    
    updateTestimonial: (state, action) => {
      const { id, field, value } = action.payload;
      const testimonial = state.testimonials.find(t => t.id === id);
      if (testimonial) {
        testimonial[field] = value;
      }
    },
    
    removeTestimonial: (state, action) => {
      state.testimonials = state.testimonials.filter(t => t.id !== action.payload);
    },
    
    setPermissionGroups: (state, action) => {
      state.permissionGroups = action.payload;
    },
    
    togglePermission: (state, action) => {
      const { groupIdx, permId, role } = action.payload;
      const permission = state.permissionGroups[groupIdx].permissions.find(p => p.id === permId);
      if (permission) {
        permission[role] = !permission[role];
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset logo to default (remove uploaded file)
    resetLogo: (state, action) => {
      const mode = action.payload; // 'light' | 'dark' | 'platform'
      const uploadedPath = state.uploadedLogos[mode];
      if (uploadedPath) {
        deleteUploadedFile(uploadedPath);
      }
      state.uploadedLogos[mode] = null;
      state.logoUrls[mode] = '';
    },
    
    // Reset hero image to default
    resetHeroImage: (state) => {
      if (state.uploadedHeroImage) {
        deleteUploadedFile(state.uploadedHeroImage);
      }
      state.uploadedHeroImage = null;
      state.loginHeroImage = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop';
      state.heroMode = 'url';
    }
  },
  
  extraReducers: (builder) => {
    // Fetch Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        // Merge fetched settings with state
        Object.assign(state, action.payload);
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Update Settings
    builder
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSaved = new Date().toISOString();
        // Merge updated settings
        Object.assign(state, action.payload);
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Upload Image
    builder
      .addCase(uploadImage.pending, (state, action) => {
        const { type } = action.meta.arg;
        state.uploadProgress[type] = true;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        const { type, url } = action.payload;
        state.uploadProgress[type] = false;
        
        if (type === 'hero') {
          state.uploadedHeroImage = url;
          state.loginHeroImage = url;
        } else if (type === 'logo-light') {
          state.uploadedLogos.light = url;
          state.logoUrls.light = url;
        } else if (type === 'logo-dark') {
          state.uploadedLogos.dark = url;
          state.logoUrls.dark = url;
        } else if (type === 'logo-platform') {
          state.uploadedLogos.platform = url;
          state.logoUrls.platform = url;
        }
      })
      .addCase(uploadImage.rejected, (state, action) => {
        const { type } = action.meta.arg;
        state.uploadProgress[type] = false;
        state.error = action.payload;
      });
  }
});

// ============================================
// EXPORTS
// ============================================

export const {
  setPlatformName,
  setColors,
  setLoginHeroImage,
  setHeroMode,
  setLogoMode,
  setLogoUrls,
  setTestimonials,
  addTestimonial,
  updateTestimonial,
  removeTestimonial,
  setPermissionGroups,
  togglePermission,
  clearError,
  resetLogo,
  resetHeroImage
} = settingsSlice.actions;

export default settingsSlice.reducer;
