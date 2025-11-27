/**
 * A modern, professional design system for FASM.
 * Focuses on clarity, accessibility, and a clean aesthetic.
 */

import { Platform } from 'react-native';

const palette = {
  primary: '#4F46E5', // Indigo 600
  primaryDark: '#4338ca', // Indigo 700
  primaryLight: '#818cf8', // Indigo 400
  
  secondary: '#0EA5E9', // Sky 500
  accent: '#F59E0B', // Amber 500
  success: '#10B981', // Emerald 500
  error: '#EF4444', // Red 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6', // Blue 500

  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  white: '#FFFFFF',
  black: '#000000',
};

export const Colors = {
  light: {
    text: palette.neutral[900],
    textSecondary: palette.neutral[500],
    textTertiary: palette.neutral[400],
    
    background: palette.neutral[50],
    backgroundSecondary: palette.white,
    backgroundTertiary: palette.neutral[100],
    
    tint: palette.primary,
    
    icon: palette.neutral[500],
    tabIconDefault: palette.neutral[400],
    tabIconSelected: palette.primary,
    
    border: palette.neutral[200],
    
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    accent: palette.accent,
  },
  dark: {
    text: palette.neutral[50],
    textSecondary: palette.neutral[400],
    textTertiary: palette.neutral[500],
    
    background: palette.neutral[900],
    backgroundSecondary: palette.neutral[800],
    backgroundTertiary: palette.neutral[700],
    
    tint: palette.primaryLight,
    
    icon: palette.neutral[400],
    tabIconDefault: palette.neutral[600],
    tabIconSelected: palette.primaryLight,
    
    border: palette.neutral[700],
    
    primary: palette.primaryLight,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    accent: palette.accent,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  light: {
    sm: {
      shadowColor: palette.neutral[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: palette.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: palette.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
});
