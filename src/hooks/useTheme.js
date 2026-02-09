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

export const useTheme = () => {
  const settings = useSelector((state) => state.settings);
  
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
      statusCompleted: settings.colors?.statusCompleted || '#FF6106'
    },
    
    // Logos
    logoUrls: {
      light: settings.logoUrls?.light || '',
      dark: settings.logoUrls?.dark || '',
      platform: settings.logoUrls?.platform || ''
    },
    
    // Hero image
    loginHeroImage: settings.loginHeroImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
    
    // Testimonials
    testimonials: settings.testimonials || [],
    
    // Full settings object (for advanced use)
    settings
  };
};

/**
 * Helper function to get status color by status name
 * @param {string} status - 'active', 'scheduled', 'warning', 'completed'
 * @param {object} colors - colors object from useTheme
 */
export const getStatusColor = (status, colors) => {
  const statusMap = {
    'active': colors.statusActive,
    'in_progress': colors.statusActive,
    'scheduled': colors.statusScheduled,
    'pending': colors.statusScheduled,
    'delayed': colors.statusWarning,
    'warning': colors.statusWarning,
    'completed': colors.statusCompleted,
    'cancelled': colors.statusCompleted
  };
  
  return statusMap[status?.toLowerCase()] || colors.primary;
};

export default useTheme;
