// Design Tokens System for TODO App
// WCAG AA compliant color system with improved contrast

export const designTokens = {
  colors: {
    // Primary palette - Gold with better contrast
    primary: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107', // Main gold
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
      DEFAULT: '#FFB300', // Better contrast than #FFD700
    },
    
    // Neutral palette - Sophisticated grays
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E8E8E8',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0A0A0A',
    },
    
    // Semantic colors
    success: {
      light: '#4ADE80',
      DEFAULT: '#22C55E',
      dark: '#16A34A',
    },
    
    warning: {
      light: '#FCD34D',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
    },
    
    error: {
      light: '#F87171',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
    },
    
    info: {
      light: '#60A5FA',
      DEFAULT: '#3B82F6',
      dark: '#2563EB',
    },
    
    // Surface colors for glassmorphism
    surface: {
      glass: {
        light: 'rgba(255, 255, 255, 0.85)',
        DEFAULT: 'rgba(255, 255, 255, 0.75)',
        dark: 'rgba(255, 255, 255, 0.65)',
      },
      overlay: {
        light: 'rgba(0, 0, 0, 0.05)',
        DEFAULT: 'rgba(0, 0, 0, 0.1)',
        dark: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
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
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Custom glass shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.4)',
    
    // Colored shadows
    gold: '0 10px 30px -10px rgba(255, 179, 0, 0.4)',
    'gold-lg': '0 20px 40px -15px rgba(255, 179, 0, 0.5)',
  },
  
  animation: {
    timing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      moderate: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
  },
  
  blur: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
  
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    60: '60',
    70: '70',
    80: '80',
    90: '90',
    100: '100',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
    notification: '1070',
  },
  
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Helper functions for using design tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (size: number | string) => {
  return designTokens.spacing[size as keyof typeof designTokens.spacing];
};

export const getShadow = (type: string) => {
  return designTokens.boxShadow[type as keyof typeof designTokens.boxShadow];
};

export const getFont = (type: 'sans' | 'mono') => {
  return designTokens.typography.fontFamily[type];
};