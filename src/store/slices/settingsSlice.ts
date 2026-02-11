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

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { settingsService } from '../../services/UnifiedApiService';
import { uploadFile, validateFile, deleteUploadedFile } from '../../services/fileUploadService';
import type { UploadType } from '../../services/fileUploadService';

// ============================================
// TYPES
// ============================================

interface Colors {
  primary: string;
  secondary: string;
  surface: string;
  [key: string]: string;
}

interface LogoUrls {
  light: string;
  dark: string;
  platform: string;
}

interface UploadedLogos {
  light: string | null;
  dark: string | null;
  platform: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

interface Permission {
  id: string;
  [key: string]: boolean | string;
}

interface PermissionGroup {
  permissions: Permission[];
  [key: string]: unknown;
}

export interface FeatureFlags {
  socialSignIn: boolean;
  whiteLabelling: boolean;
  betaPaymentGateway: boolean;
  demoMode: boolean;
}

export interface SettingsState {
  // Data
  platformName: string;
  colors: Colors;
  loginHeroImage: string;
  heroMode: 'url' | 'upload';
  uploadedHeroImage: string | null;

  logoMode: 'url' | 'upload';
  logoUrls: LogoUrls;
  uploadedLogos: UploadedLogos;

  testimonials: Testimonial[];
  permissionGroups: PermissionGroup[];
  featureFlags: FeatureFlags;
  operatingDays: string[];

  // Meta
  loading: boolean;
  error: string | null;
  uploadProgress: Record<string, boolean>;
  lastSaved: string | null;
}

interface UploadImagePayload {
  file: File;
  type: UploadType;
}

interface UpdateTestimonialPayload {
  id: string;
  field: string;
  value: string;
}

interface TogglePermissionPayload {
  groupIdx: number;
  permId: string;
  role: string;
}

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
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Update settings
 */
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (updates: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      const { settings } = await settingsService.update(updates);
      return settings;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Upload image (hero or logo) with validation and optimization
 */
export const uploadImage = createAsyncThunk(
  'settings/uploadImage',
  async ({ file, type }: UploadImagePayload, { rejectWithValue }) => {
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
      return rejectWithValue((error as Error).message || 'Upload failed');
    }
  }
);

// ============================================
// INITIAL STATE
// ============================================

const initialState: SettingsState = {
  // Data
  platformName: 'Bus Buddy',
  colors: {
    primary: '#ff3600',
    secondary: '#1fd701',
    surface: '#f8fafc',
  },
  loginHeroImage: '/uploads/busbuddy.jpg',
  heroMode: 'url',
  uploadedHeroImage: null,

  logoMode: 'url',
  logoUrls: {
    light: '',
    dark: '/uploads/logo-dark.svg',
    platform: '/uploads/logo-dark.svg',
  },
  uploadedLogos: {
    light: null,
    dark: null,
    platform: null,
  },

  testimonials: [
    {
      id: '1',
      name: 'Samuel Okoye',
      role: 'Bus Driver at Little School',
      text: 'The students anf parents both love it! Boarding and dropping off students has never been easier.',
      avatar: 'https://plus.unsplash.com/premium_photo-1661498011647-983403f1643c?q=80&w=800&auto=format&fit=crop',
    },
  ],

  permissionGroups: [],
  featureFlags: {
    socialSignIn: false,
    whiteLabelling: false,
    betaPaymentGateway: false,
    demoMode: true,
  },
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

  // Meta
  loading: false,
  error: null,
  uploadProgress: {},
  lastSaved: null,
};

// ============================================
// SLICE
// ============================================

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Synchronous actions for local state updates
    setPlatformName: (state, action: PayloadAction<string>) => {
      state.platformName = action.payload;
    },

    setColors: (state, action: PayloadAction<Partial<Colors>>) => {
      Object.assign(state.colors, action.payload);
    },

    setLoginHeroImage: (state, action: PayloadAction<string>) => {
      state.loginHeroImage = action.payload;
    },

    setHeroMode: (state, action: PayloadAction<'url' | 'upload'>) => {
      state.heroMode = action.payload;
    },

    setLogoMode: (state, action: PayloadAction<'url' | 'upload'>) => {
      state.logoMode = action.payload;
    },

    setLogoUrls: (state, action: PayloadAction<Partial<LogoUrls>>) => {
      state.logoUrls = { ...state.logoUrls, ...action.payload };
    },

    setTestimonials: (state, action: PayloadAction<Testimonial[]>) => {
      state.testimonials = action.payload;
    },

    addTestimonial: (state) => {
      state.testimonials.push({
        id: String(Date.now()),
        name: '',
        role: '',
        text: '',
        avatar: 'https://ui-avatars.com/api/?name=New&background=random',
      });
    },

    updateTestimonial: (state, action: PayloadAction<UpdateTestimonialPayload>) => {
      const { id, field, value } = action.payload;
      const testimonial = state.testimonials.find(t => t.id === id);
      if (testimonial) {
        (testimonial as Record<string, unknown>)[field] = value;
      }
    },

    removeTestimonial: (state, action: PayloadAction<string>) => {
      state.testimonials = state.testimonials.filter(t => t.id !== action.payload);
    },

    setPermissionGroups: (state, action: PayloadAction<PermissionGroup[]>) => {
      state.permissionGroups = action.payload;
    },

    togglePermission: (state, action: PayloadAction<TogglePermissionPayload>) => {
      const { groupIdx, permId, role } = action.payload;
      const permission = state.permissionGroups[groupIdx].permissions.find(p => p.id === permId);
      if (permission) {
        permission[role] = !permission[role];
      }
    },

    setFeatureFlag: (state, action: PayloadAction<{ flag: keyof FeatureFlags; value: boolean }>) => {
      state.featureFlags[action.payload.flag] = action.payload.value;
    },

    setOperatingDays: (state, action: PayloadAction<string[]>) => {
      state.operatingDays = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset logo to default (remove uploaded file)
    resetLogo: (state, action: PayloadAction<keyof UploadedLogos>) => {
      const mode = action.payload;
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
      state.loginHeroImage = '/uploads/busbuddy.jpg';
      state.heroMode = 'url';
    },
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      });
  },
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
  setFeatureFlag,
  setOperatingDays,
  clearError,
  resetLogo,
  resetHeroImage,
} = settingsSlice.actions;

export default settingsSlice.reducer;
