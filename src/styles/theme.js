/**
 * Design System - בהשראת Surfline
 * צבעים, טיפוגרפיה, ו-spacing מרכזיים
 */

export const colors = {
  // Primary colors - כחול/ירוק בסגנון Surfline
  primary: {
    main: '#2B7A78',      // ירוק-כחול עמוק
    light: '#3AAFA9',     // ירוק-כחול בהיר
    dark: '#17252A',      // כמעט שחור
  },
  
  // Wave quality colors
  quality: {
    excellent: '#00C853',  // ירוק בהיר - EPIC
    good: '#64DD17',       // ירוק-צהוב - GOOD
    fair: '#FFD600',       // צהוב - FAIR
    poor: '#FF6D00',       // כתום - POOR TO FAIR
    flat: '#9E9E9E',       // אפור - FLAT
  },
  
  // UI colors
  background: {
    primary: '#FEFFFF',    // לבן מעט כחול
    secondary: '#F5F9FA',  // אפור בהיר מאוד
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  text: {
    primary: '#1A1A1A',
    secondary: '#5F6368',
    light: '#9AA0A6',
    white: '#FFFFFF',
  },
  
  // Accent colors
  accent: {
    blue: '#1E88E5',
    orange: '#FF9800',
    red: '#F44336',
    yellow: '#FDD835',
  },
  
  // Borders & dividers
  border: {
    light: '#E8EAED',
    medium: '#DADCE0',
    dark: '#BDC1C6',
  },
};

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    huge: '4rem',       // 64px - לגלים
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
};

// Helper function - קבלת צבע לפי איכות גלים
export const getQualityColor = (height) => {
  if (height >= 6) return colors.quality.excellent;
  if (height >= 4) return colors.quality.good;
  if (height >= 2) return colors.quality.fair;
  if (height >= 1) return colors.quality.poor;
  return colors.quality.flat;
};

// Helper function - קבלת טקסט איכות לפי גובה גלים
export const getQualityText = (height) => {
  if (height >= 6) return 'EPIC';
  if (height >= 4) return 'GOOD TO EPIC';
  if (height >= 2) return 'FAIR TO GOOD';
  if (height >= 1) return 'POOR TO FAIR';
  return 'FLAT';
};

