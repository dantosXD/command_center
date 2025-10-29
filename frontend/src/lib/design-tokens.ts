/**
 * Design Tokens
 * Centralized design system values for colors, spacing, typography, and more
 * Enables consistency across the application and makes future theme changes easier
 *
 * Part of Phase 2 Sprint 3c: Design system maturity
 */

// Color Palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    900: '#15803d'
  },

  warning: {
    50: '#fffbeb',
    500: '#eab308',
    600: '#ca8a04',
    900: '#92400e'
  },

  danger: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    900: '#7f1d1d'
  },

  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563', // Not used directly
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Spacing Scale
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem' // 64px
};

// Typography Scale
export const typography = {
  h1: {
    fontSize: '2.25rem', // 36px
    lineHeight: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '1.875rem', // 30px
    lineHeight: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.5rem', // 24px
    lineHeight: '2rem',
    fontWeight: 600,
    letterSpacing: '0'
  },
  h4: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.75rem',
    fontWeight: 600,
    letterSpacing: '0'
  },
  body: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem',
    fontWeight: 400,
    letterSpacing: '0'
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem',
    fontWeight: 400,
    letterSpacing: '0'
  },
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem',
    fontWeight: 400,
    letterSpacing: '0'
  }
};

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px'
};

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060'
};

// Animation/Transition Timing
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)'
};

// Button Styles (for reference)
export const buttonStyles = {
  primary: {
    bg: colors.primary[600],
    bgHover: colors.primary[700],
    bgActive: colors.primary[800],
    text: '#ffffff',
    border: 'none'
  },
  secondary: {
    bg: colors.gray[100],
    bgHover: colors.gray[200],
    bgActive: colors.gray[300],
    text: colors.gray[700],
    border: `1px solid ${colors.gray[200]}`
  },
  danger: {
    bg: colors.danger[600],
    bgHover: colors.danger[600],
    bgActive: colors.danger[900],
    text: '#ffffff',
    border: 'none'
  },
  ghost: {
    bg: 'transparent',
    bgHover: colors.gray[100],
    bgActive: colors.gray[200],
    text: colors.gray[700],
    border: 'none'
  }
};

// Component-specific tokens
export const components = {
  input: {
    height: '2.5rem', // 40px
    padding: '0.625rem 0.875rem', // 10px 14px
    borderColor: colors.gray[300],
    borderColorFocus: colors.primary[500],
    borderRadius: borderRadius.md,
    fontSize: typography.body.fontSize,
    transition: transitions.normal
  },
  card: {
    padding: spacing.md,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
    backgroundColor: '#ffffff'
  },
  badge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.full,
    fontSize: typography.caption.fontSize,
    fontWeight: 600
  }
};

// Dark Mode Colors (for future implementation)
export const darkModeColors = {
  bg: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700]
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400]
  }
};

export default {
  colors,
  spacing,
  typography,
  breakpoints,
  shadows,
  borderRadius,
  zIndex,
  transitions,
  buttonStyles,
  components,
  darkModeColors
};
