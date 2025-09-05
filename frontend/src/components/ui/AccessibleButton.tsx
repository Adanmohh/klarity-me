import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'touch'; // 'touch' ensures 44x44px minimum
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled = false,
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      'relative inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'rounded-xl', // Consistent border radius
      fullWidth && 'w-full'
    );

    const variantStyles = {
      primary: clsx(
        'bg-primary-500 text-white',
        'hover:bg-primary-600 active:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-md hover:shadow-lg'
      ),
      secondary: clsx(
        'bg-white text-neutral-700 border-2 border-neutral-300',
        'hover:bg-neutral-50 active:bg-neutral-100',
        'focus:ring-neutral-500',
        'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-600'
      ),
      ghost: clsx(
        'bg-transparent text-neutral-700',
        'hover:bg-neutral-100 active:bg-neutral-200',
        'focus:ring-neutral-500',
        'dark:text-neutral-300 dark:hover:bg-neutral-800'
      ),
      danger: clsx(
        'bg-error-DEFAULT text-white',
        'hover:bg-error-dark active:bg-red-700',
        'focus:ring-error-DEFAULT'
      ),
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-base gap-2 min-h-[40px]',
      lg: 'px-6 py-3 text-lg gap-2.5 min-h-[48px]',
      touch: 'px-4 py-2.5 text-base gap-2 min-h-[44px] min-w-[44px]', // Mobile-friendly
    };

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-busy={loading}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';