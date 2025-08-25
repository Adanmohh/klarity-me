// Design System Tokens for TODO App
// Consistent design system following accessibility and modern UI patterns

export const colors = {
  // Primary palette
  primary: {
    gold: '#FFD700',
    goldDark: '#E6C200',
    goldLight: '#FFED4E',
    black: '#0A0A0A',
    white: '#FFFFFF',
  },
  
  // Semantic colors
  semantic: {
    error: '#DC2626',
    errorLight: '#FEE2E2',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#EA580C',
    warningLight: '#FED7AA',
    info: '#2563EB',
    infoLight: '#DBEAFE',
  },
  
  // Text colors (WCAG AA compliant)
  text: {
    primary: '#1F2937',     // gray-800 - high contrast
    secondary: '#4B5563',   // gray-600 - medium contrast
    disabled: '#9CA3AF',    // gray-400 - disabled state
    inverse: '#FFFFFF',     // white text on dark
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Border colors
  border: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
    focus: '#FFD700',
  },
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
    xl: { size: '1.25rem', lineHeight: '1.875rem' },  // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px
    '5xl': { size: '3rem', lineHeight: '1' },          // 48px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Text styles for consistent usage
  styles: {
    h1: 'text-5xl font-bold text-gray-900',
    h2: 'text-3xl font-semibold text-gray-900',
    h3: 'text-xl font-medium text-gray-800',
    h4: 'text-lg font-medium text-gray-800',
    body: 'text-base text-gray-700',
    bodySmall: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
  },
} as const;

export const spacing = {
  0: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  gold: '0 4px 16px 0 rgba(255, 215, 0, 0.3)',
  glow: '0 0 20px rgba(255, 215, 0, 0.5)',
} as const;

export const animation = {
  // Transitions
  transition: {
    none: 'none',
    all: 'all 150ms ease',
    colors: 'colors 150ms ease',
    opacity: 'opacity 150ms ease',
    shadow: 'box-shadow 150ms ease',
    transform: 'transform 150ms ease',
  },
  
  // Durations
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Easings
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
  },
} as const;

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
} as const;

// Interaction states
export const states = {
  hover: {
    scale: 1.02,
    shadow: shadows.lg,
    transition: animation.transition.all,
  },
  active: {
    scale: 0.98,
    transition: animation.transition.transform,
  },
  focus: {
    outline: 'none',
    ring: `2px solid ${colors.primary.gold}`,
    ringOffset: '2px',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
} as const;

// Component-specific tokens
export const components = {
  button: {
    minHeight: '44px', // Touch target minimum
    padding: {
      sm: `${spacing.xs} ${spacing.sm}`,
      base: `${spacing.sm} ${spacing.md}`,
      lg: `${spacing.md} ${spacing.lg}`,
    },
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    background: colors.background.glass,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border.light}`,
  },
  input: {
    minHeight: '44px',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border.light}`,
    focusBorder: `2px solid ${colors.primary.gold}`,
  },
  modal: {
    maxWidth: '600px',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    background: colors.background.primary,
    overlay: colors.background.overlay,
  },
} as const;

// Accessibility helpers
export const a11y = {
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  focusRing: `focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2`,
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: '0',
    background: colors.primary.black,
    color: colors.primary.white,
    padding: spacing.sm,
    zIndex: zIndex.tooltip,
    '&:focus': {
      top: '0',
    },
  },
} as const;

// Utility function for creating consistent class names
export const getComponentClasses = (
  component: keyof typeof components,
  variant?: string,
  size?: string
) => {
  const baseClasses = [];
  const comp = components[component] as any;
  
  // Add base styles
  if (comp.padding) {
    baseClasses.push(`p-[${comp.padding}]`);
  }
  if (comp.borderRadius) {
    baseClasses.push(`rounded-[${comp.borderRadius}]`);
  }
  
  return baseClasses.join(' ');
};

// Export all as a single design system object
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  states,
  components,
  a11y,
} as const;

export default designSystem;