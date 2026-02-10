/**
 * Themed UI Components
 * 
 * ONE WAY TO DO EVERYTHING, EVERYWHERE - Constitution Compliance
 * 
 * SINGLE SOURCE OF TRUTH: All styling comes from Redux theme/settings
 * REUSABILITY: Each component is used everywhere with variants, not duplicated
 * 
 * Components:
 * - ThemedButton: ONE button for all use cases (primary/secondary/ghost/icon variants)
 * - ThemedCard: ONE card for all layouts
 * - ThemedTab: ONE tab component for all tabbed interfaces
 * - ThemedInput: ONE input with theme integration
 * - ThemedLogo: Dynamic logo from settings
 * - ThemedBadge: Status badges with theme colors
 */

import React, { InputHTMLAttributes, ButtonHTMLAttributes, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { getUploadedFileUrl } from '../services/fileUploadService';
import { LucideIcon } from 'lucide-react';

// ============================================
// ONE BUTTON - ALL USE CASES
// ============================================

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'cancel';
  icon?: LucideIcon;
  iconSize?: number;
  fullWidth?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  children, 
  className = '', 
  style = {}, 
  variant = 'primary',
  icon: Icon,
  iconSize = 18,
  fullWidth = false,
  ...props 
}) => {
  const { colors } = useTheme();
  
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: 'white',
          boxShadow: `0 10px 25px ${colors.primary}20`,
          padding: '1rem 1.5rem',
          borderRadius: '9999px',
          fontWeight: 'bold'
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: 'white',
          boxShadow: `0 10px 25px ${colors.secondary}20`,
          padding: '1rem 1.5rem',
          borderRadius: '9999px',
          fontWeight: 'bold'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          border: `2px solid ${colors.primary}`,
          padding: '1rem 1.5rem',
          borderRadius: '9999px',
          fontWeight: 'bold'
        };
      case 'icon':
        return {
          backgroundColor: '#f9fafb',
          color: '#9ca3af',
          padding: '0.5rem',
          borderRadius: '9999px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        };
      case 'cancel':
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '1rem 1.5rem',
          borderRadius: '9999px',
          fontWeight: 'bold'
        };
      default:
        return {};
    }
  };
  
  return (
    <button
      className={`transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        ...getStyles(),
        ...style
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary' || variant === 'secondary') {
          e.currentTarget.style.filter = 'brightness(0.9)';
        } else if (variant === 'icon') {
          e.currentTarget.style.backgroundColor = '#e5e7eb';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(1)';
        if (variant === 'icon') {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }
      }}
      {...props}
    >
      {Icon && <Icon size={iconSize} />}
      {children}
    </button>
  );
};

// ============================================
// ONE CARD - ALL LAYOUTS
// ============================================

interface ThemedCardProps {
  children:React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  className = '',
  padding = 'lg',
  onClick,
  hoverable = false
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return '1rem';
      case 'md': return '1.5rem';
      case 'lg': return '2rem';
      default: return '2rem';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 ${hoverable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      style={{ padding: getPadding() }}
    >
      {children}
    </div>
  );
};

// ============================================
// ONE TAB - ALL TABBED INTERFACES
// ============================================

interface ThemedTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  className?: string;
}

export const ThemedTab: React.FC<ThemedTabProps> = ({
  label,
  active,
  onClick,
  icon: Icon,
  className = ''
}) => {
  const { colors } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: active ? colors.primary : 'transparent',
        color: active ? 'white' : '#9ca3af',
        boxShadow: active ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
};

// ============================================
// THEMED INPUT
// ============================================

export const ThemedInput: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', style = {}, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <input
      className={`w-full px-6 py-4 bg-white border border-gray-200 rounded-full outline-none transition-all font-medium placeholder:text-gray-300 ${className}`}
      style={{
        ...style,
        '--focus-ring-color': colors.primary
      } as React.CSSProperties}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.primary;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
};

// ============================================
// THEMED LOGO - DYNAMIC FROM SETTINGS
// ============================================

export const ThemedLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 32, 
  className = '' 
}) => {
  const { colors, logoUrls, platformName } = useTheme();
  
  // Force component to re-render when logoUrls changes
  useEffect(() => {
    console.log('🔄 ThemedLogo - useEffect triggered, logoUrls changed:', logoUrls);
  }, [logoUrls, logoUrls.platform]);
  
  console.log('🖼️ ThemedLogo RENDER - logoUrls.platform:', logoUrls.platform);
  
  // Resolve the actual file URL (handles /uploads/ paths and data URLs)
  const logoSrc = logoUrls.platform ? getUploadedFileUrl(logoUrls.platform) : null;
  
  console.log('🎨 ThemedLogo - Resolved logoSrc:', logoSrc);
  
  if (logoSrc) {
    console.log('✅ ThemedLogo - Using platform logo:', logoSrc);
    return (
      <img 
        key={logoSrc} // Force re-render when URL changes
        src={logoSrc} 
        alt={`${platformName} Logo`} 
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          console.error('❌ ThemedLogo - Image load error:', logoSrc);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  // Default: Circle with initials
  console.log('⚪ ThemedLogo - Using default circle logo');
  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white text-xs font-bold ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: colors.primary 
      }}
    >
      {platformName.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)}
    </div>
  );
};

// ============================================
// THEMED LINK
// ============================================

export const ThemedLink: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({
  children, 
  onClick, 
  className = '' 
}) => {
  const { colors } = useTheme();
  
  return (
    <span
      onClick={onClick}
      className={`font-bold cursor-pointer hover:underline ${className}`}
      style={{ color: colors.primary }}
    >
      {children}
    </span>
  );
};

// ============================================
// THEMED BADGE - STATUS INDICATORS
// ============================================

export const ThemedBadge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}> = ({ children, variant = 'primary', className = '' }) => {
  const { colors } = useTheme();
  
  const getColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'success': return colors.statusActive;
      case 'warning': return colors.statusWarning;
      case 'error': return colors.statusCompleted;
      default: return colors.primary;
    }
  };
  
  const color = getColor();
  
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${className}`}
      style={{
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}30`
      }}
    >
      {children}
    </span>
  );
};

// ============================================
// THEMED PLATFORM NAME
// ============================================

export const ThemedPlatformName: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { platformName } = useTheme();
  return <span className={className}>{platformName}</span>;
};
