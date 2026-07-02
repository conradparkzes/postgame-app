// PostGame — dark theme with Honey accent.
// All semantic tokens reference these primitives; update here to retheme.

export const Colors = {
  // Backgrounds
  background: '#0a0a0a',
  surface: '#141414',
  surfaceRaised: '#1e1e1e',
  surfaceBorder: '#2a2a2a',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textTertiary: '#606060',
  textInverse: '#000000',

  // Brand
  accent: '#EC9706',        // Honey
  accentDim: '#BD7905',     // darker press state
  accentSubtle: '#2E1E02',  // tinted surface (e.g. selected chip bg)

  // Utility
  border: '#2a2a2a',
  borderFocus: '#EC9706',
  error: '#ff453a',
  success: '#30d158',
  warning: '#ffd60a',
  tabBar: '#0a0a0a',
  tabBarBorder: '#1e1e1e',
} as const;
