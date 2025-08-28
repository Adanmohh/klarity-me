export const theme = {
  colors: {
    // Primary Colors - Deep grays for focus (60% of UI)
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Secondary Colors - Deep indigo for clarity (30% of UI)
    secondary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    
    // Accent Colors - Amber for achievement (10% of UI)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    
    // Semantic Colors
    success: {
      light: '#86efac',
      main: '#22c55e',
      dark: '#16a34a',
      contrast: '#ffffff',
    },
    
    error: {
      light: '#fca5a5',
      main: '#ef4444',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    
    warning: {
      light: '#fde047',
      main: '#eab308',
      dark: '#ca8a04',
      contrast: '#000000',
    },
    
    info: {
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#2563eb',
      contrast: '#ffffff',
    },
    
    // Background colors
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
      elevated: '#ffffff',
      dark: '#0f172a',
    },
    
    // Text colors
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      disabled: '#94a3b8',
      hint: '#cbd5e1',
      inverse: '#f8fafc',
    },
    
    // Border colors
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
  },
  
  shadows: {
    none: 'none',
    
    // Subtle shadows for minimal depth
    sm: `
      0 1px 2px 0 rgba(15, 23, 42, 0.05)
    `,
    
    // Standard shadows for cards and panels
    md: `
      0 4px 6px -1px rgba(15, 23, 42, 0.08),
      0 2px 4px -2px rgba(15, 23, 42, 0.04)
    `,
    
    // Good depth for buttons and interactive elements
    lg: `
      0 10px 15px -3px rgba(15, 23, 42, 0.08),
      0 4px 6px -4px rgba(15, 23, 42, 0.04)
    `,
    
    // Strong depth for dropdowns and tooltips
    xl: `
      0 20px 25px -5px rgba(15, 23, 42, 0.08),
      0 8px 10px -6px rgba(15, 23, 42, 0.04)
    `,
    
    // Maximum depth for modals and overlays
    '2xl': `
      0 25px 50px -12px rgba(15, 23, 42, 0.15)
    `,
    
    // Inner shadow for pressed states
    inner: `
      inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)
    `,
    
    // Colored shadows for special elements
    primary: `
      0 10px 15px -3px rgba(99, 102, 241, 0.2),
      0 4px 6px -4px rgba(99, 102, 241, 0.1)
    `,
    
    accent: `
      0 10px 15px -3px rgba(245, 158, 11, 0.2),
      0 4px 6px -4px rgba(245, 158, 11, 0.1)
    `,
    
    // Focus ring shadow
    focus: `
      0 0 0 3px rgba(99, 102, 241, 0.15),
      0 0 0 1px rgba(99, 102, 241, 0.4)
    `,
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
};

// Dark theme overrides
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      default: '#0f172a',
      paper: '#1e293b',
      elevated: '#334155',
      dark: '#020617',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
      hint: '#475569',
      inverse: '#1e293b',
    },
    border: {
      light: '#334155',
      main: '#475569',
      dark: '#64748b',
    },
  },
  shadows: {
    ...theme.shadows,
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.24)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.24)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.24)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
  },
};

export type Theme = typeof theme;
export type DarkTheme = typeof darkTheme;