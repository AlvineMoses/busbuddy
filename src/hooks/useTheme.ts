/**
 * useTheme Hook - SMART DATA-FLOW
 *
 * Centralized access to theme/settings from Redux store.
 * All components should use this hook instead of hardcoding values.
 *
 * @example
 * const { colors, platformName, logoUrls } = useTheme();
 * <button style={{ backgroundColor: colors.primary }}>Click</button>
 */

import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { FeatureFlags } from '../store/slices/settingsSlice';

// ============================================
// TYPES
// ============================================

interface ThemeColors {
  primary: string;
  secondary: string;
  surface: string;
  statusActive: string;
  statusScheduled: string;
  statusWarning: string;
  statusCompleted: string;
}

interface ThemeLogoUrls {
  light: string;
  dark: string;
  platform: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export interface ThemeData {
  platformName: string;
  colors: ThemeColors;
  logoUrls: ThemeLogoUrls;
  loginHeroImage: string;
  testimonials: Testimonial[];
  featureFlags: FeatureFlags;
  settings: RootState['settings'];
}

// ============================================
// HOOK
// ============================================

export const useTheme = (): ThemeData => {
  const settings = useSelector((state: RootState) => state.settings);

  return {
    // Core settings
    platformName: settings.platformName || 'Bus Buddy',

    // Colors - all theme colors
    colors: {
      primary: settings.colors?.primary || '#ff3600',
      secondary: settings.colors?.secondary || '#1fd701',
      surface: settings.colors?.surface || '#f8fafc',
      statusActive: settings.colors?.statusActive || '#1fd701',
      statusScheduled: settings.colors?.statusScheduled || '#bda8ff',
      statusWarning: settings.colors?.statusWarning || '#ff9d00',
      statusCompleted: settings.colors?.statusCompleted || '#FF6106',
    },

    // Logos
    logoUrls: {
      light: settings.logoUrls?.light || '',
      dark: settings.logoUrls?.dark || '/uploads/logo-dark.svg',
      platform: settings.logoUrls?.platform || '/uploads/logo-dark.svg',
    },

    // Hero image
    loginHeroImage: settings.loginHeroImage || '/uploads/busbuddy.jpg',

    // Testimonials
    testimonials: settings.testimonials || [],

    // Feature flags
    featureFlags: settings.featureFlags || { socialSignIn: false, whiteLabelling: false, betaPaymentGateway: false, demoMode: true },

    // Full settings object (for advanced use)
    settings,
  };
};

/**
 * Helper function to get status color by status name
 */
export const getStatusColor = (status: string | undefined | null, colors: ThemeColors): string => {
  const statusMap: Record<string, string> = {
    'active': colors.statusActive,
    'in_progress': colors.statusActive,
    'scheduled': colors.statusScheduled,
    'pending': colors.statusScheduled,
    'delayed': colors.statusWarning,
    'warning': colors.statusWarning,
    'completed': colors.statusCompleted,
    'cancelled': colors.statusCompleted,
  };

  return statusMap[status?.toLowerCase() ?? ''] || colors.primary;
};

export default useTheme;
