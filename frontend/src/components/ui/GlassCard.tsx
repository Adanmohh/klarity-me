import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'dark' | 'gold' | 'solid';
  onClick?: () => void;
  animate?: boolean;
  hoverable?: boolean;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
}

const variantClasses = {
  default: {
    background: 'bg-glass-whiteHeavy dark:bg-glass-darkHeavy',
    border: 'border-neutral-200 dark:border-neutral-700',
    blur: 'backdrop-blur-md',
    shadow: 'shadow-elevation-2',
    hover: 'hover:bg-white hover:shadow-elevation-3 dark:hover:bg-neutral-900',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
  elevated: {
    background: 'bg-white dark:bg-neutral-900',
    border: 'border-neutral-300 dark:border-neutral-700',
    blur: 'backdrop-blur-lg',
    shadow: 'shadow-elevation-3',
    hover: 'hover:shadow-elevation-4',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
  subtle: {
    background: 'bg-glass-whiteLight dark:bg-glass-darkLight',
    border: 'border-neutral-200/50 dark:border-neutral-700/50',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-elevation-1',
    hover: 'hover:bg-glass-white hover:shadow-elevation-2 dark:hover:bg-glass-dark',
    text: 'text-neutral-800 dark:text-neutral-200',
  },
  dark: {
    background: 'bg-neutral-900 dark:bg-neutral-950',
    border: 'border-neutral-800 dark:border-neutral-800',
    blur: '',
    shadow: 'shadow-elevation-3 shadow-black/30',
    hover: 'hover:bg-neutral-800 dark:hover:bg-neutral-900',
    text: 'text-white',
  },
  gold: {
    background: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    border: 'border-primary-300 dark:border-primary-700',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-gold-sm',
    hover: 'hover:from-primary-100 hover:to-primary-200 hover:shadow-gold dark:hover:from-primary-800/30 dark:hover:to-primary-700/30',
    text: 'text-neutral-900 dark:text-primary-100',
  },
  solid: {
    background: 'bg-white dark:bg-neutral-800',
    border: 'border-neutral-200 dark:border-neutral-700',
    blur: '',
    shadow: 'shadow-elevation-1',
    hover: 'hover:shadow-elevation-2',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
  animate = true,
  hoverable = false,
  as: Component = 'div',
  ariaLabel,
  role,
  tabIndex,
}) => {
  const isInteractive = onClick || hoverable;
  const variantStyle = variantClasses[variant];
  
  const MotionComponent = animate ? (motion[Component as keyof typeof motion] as any) : Component;
  
  const animationProps = animate && isInteractive ? {
    whileHover: { 
      scale: 1.02, 
      y: -2,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    whileTap: { scale: 0.98 },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <MotionComponent
      className={cn(
        // Base styles
        'rounded-xl p-6 transition-all duration-250 ease-out',
        
        // Variant styles
        variantStyle.background,
        variantStyle.blur,
        variantStyle.border,
        variantStyle.shadow,
        variantStyle.text,
        'border',
        
        // Interactive states
        isInteractive && [
          'cursor-pointer',
          variantStyle.hover,
        ],
        
        // Focus states for accessibility (WCAG compliant)
        isInteractive && [
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary-500',
          'focus-visible:ring-offset-2',
          'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
        ],
        
        // Active state
        isInteractive && 'active:scale-[0.98] active:transition-transform',
        
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      role={role || (isInteractive ? 'button' : undefined)}
      aria-label={ariaLabel}
      {...animationProps}
    >
      {children}
    </MotionComponent>
  );
};