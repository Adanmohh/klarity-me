import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'dark' | 'gold';
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
    background: 'bg-white/80',
    border: 'border-gray-200',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-md',
    hover: 'hover:bg-white/90 hover:border-gray-300 hover:shadow-lg',
  },
  elevated: {
    background: 'bg-white/90',
    border: 'border-gray-300',
    blur: 'backdrop-blur-md',
    shadow: 'shadow-xl',
    hover: 'hover:bg-white/95 hover:border-gray-400 hover:shadow-2xl',
  },
  subtle: {
    background: 'bg-white/60',
    border: 'border-gray-100',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-sm',
    hover: 'hover:bg-white/70 hover:border-gray-200 hover:shadow-md',
  },
  dark: {
    background: 'bg-gray-800/95',
    border: 'border-gray-700',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-xl shadow-black/30',
    hover: 'hover:bg-gray-800 hover:border-gray-600',
  },
  gold: {
    background: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-yellow-400/40',
    blur: 'backdrop-blur-sm',
    shadow: 'shadow-lg shadow-yellow-400/20',
    hover: 'hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-400/60',
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
        'rounded-2xl p-6 transition-all duration-300 ease-out',
        
        // Variant styles
        variantStyle.background,
        variantStyle.blur,
        variantStyle.border,
        variantStyle.shadow,
        'border',
        
        // Interactive states
        isInteractive && [
          'cursor-pointer',
          variantStyle.hover,
          'hover:shadow-2xl',
        ],
        
        // Focus states for accessibility (WCAG compliant)
        isInteractive && [
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary-gold',
          'focus-visible:ring-offset-2',
          'focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
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