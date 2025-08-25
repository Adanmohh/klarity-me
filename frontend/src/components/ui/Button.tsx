import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variantStyles = {
  primary: {
    base: 'bg-primary-gold text-primary-black border-2 border-primary-gold',
    hover: 'hover:bg-primary-gold/90 hover:shadow-lg hover:shadow-primary-gold/30',
    focus: 'focus-visible:ring-primary-gold',
    disabled: 'disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500',
  },
  secondary: {
    base: 'bg-white text-gray-900 border-2 border-gray-300',
    hover: 'hover:bg-gray-50 hover:border-gray-400',
    focus: 'focus-visible:ring-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400',
  },
  ghost: {
    base: 'bg-transparent text-gray-700 border-2 border-transparent',
    hover: 'hover:bg-gray-100 hover:text-gray-900',
    focus: 'focus-visible:ring-gray-400',
    disabled: 'disabled:text-gray-400',
  },
  danger: {
    base: 'bg-red-600 text-white border-2 border-red-600',
    hover: 'hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:shadow-red-600/30',
    focus: 'focus-visible:ring-red-600',
    disabled: 'disabled:bg-red-300 disabled:border-red-300',
  },
  success: {
    base: 'bg-green-600 text-white border-2 border-green-600',
    hover: 'hover:bg-green-700 hover:border-green-700 hover:shadow-lg hover:shadow-green-600/30',
    focus: 'focus-visible:ring-green-600',
    disabled: 'disabled:bg-green-300 disabled:border-green-300',
  },
};

const sizeStyles = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    icon: 'w-4 h-4',
    minHeight: 'min-h-[36px]',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    icon: 'w-5 h-5',
    minHeight: 'min-h-[44px]', // WCAG touch target
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-lg',
    icon: 'w-6 h-6',
    minHeight: 'min-h-[52px]',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className,
    children,
    ...props
  }, ref) => {
    const variantStyle = variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary;
    const sizeStyle = sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md;
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'font-medium rounded-xl',
          'transition-all duration-200 ease-out',
          
          // Size styles
          sizeStyle.padding,
          sizeStyle.text,
          sizeStyle.minHeight,
          
          // Variant styles
          variantStyle.base,
          !isDisabled && variantStyle.hover,
          
          // Focus styles (WCAG compliant)
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-offset-2',
          'focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
          variantStyle.focus,
          
          // Disabled styles
          isDisabled && [
            'cursor-not-allowed opacity-60',
            variantStyle.disabled,
          ],
          
          // Full width
          fullWidth && 'w-full',
          
          className
        )}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {/* Button content */}
        <span className={cn(
          'inline-flex items-center gap-2',
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && (
            <span className={cn('flex-shrink-0', sizeStyle.icon)}>
              {icon}
            </span>
          )}
          
          {children}
          
          {icon && iconPosition === 'right' && (
            <span className={cn('flex-shrink-0', sizeStyle.icon)}>
              {icon}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant for icon-only buttons
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  ariaLabel: string;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', ariaLabel, children, className, ...props }, ref) => {
    const sizeStyle = sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md;
    
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'aspect-square p-0',
          size === 'sm' && 'w-9 h-9',
          size === 'md' && 'w-11 h-11',
          size === 'lg' && 'w-13 h-13',
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        <span className={cn('flex items-center justify-center', sizeStyle.icon)}>
          {children}
        </span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';