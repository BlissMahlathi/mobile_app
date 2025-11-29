// Color Palette
export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  secondary: '#2196F3',
  secondaryDark: '#1976D2',
  secondaryLight: '#64B5F6',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  
  background: '#f5f5f5',
  surface: '#ffffff',
  
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  
  border: '#e0e0e0',
  divider: '#f0f0f0',
  
  income: '#4CAF50',
  expense: '#f44336',
};

// Typography
export const FONTS = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: 'bold' },
  h3: { fontSize: 24, fontWeight: 'bold' },
  h4: { fontSize: 20, fontWeight: 'bold' },
  h5: { fontSize: 18, fontWeight: 'bold' },
  h6: { fontSize: 16, fontWeight: 'bold' },
  
  body: { fontSize: 16, fontWeight: 'normal' },
  bodySmall: { fontSize: 14, fontWeight: 'normal' },
  
  caption: { fontSize: 12, fontWeight: 'normal' },
  
  button: { fontSize: 16, fontWeight: 'bold' },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
};
