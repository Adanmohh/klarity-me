import React from 'react';
import { clsx } from 'clsx';
import { 
  Play, 
  Pause, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Archive,
  Loader2
} from 'lucide-react';

export type CardStatus = 'active' | 'on-hold' | 'queued' | 'completed' | 'archived' | 'error' | 'loading';

interface StatusConfig {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

const STATUS_CONFIG: Record<CardStatus, StatusConfig> = {
  active: {
    icon: Play,
    label: 'Active',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    description: 'Currently in progress'
  },
  'on-hold': {
    icon: Pause,
    label: 'On Hold',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    description: 'Temporarily paused'
  },
  queued: {
    icon: Clock,
    label: 'Queued',
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
    textColor: 'text-neutral-900',
    description: 'Waiting to start'
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    description: 'Successfully finished'
  },
  archived: {
    icon: Archive,
    label: 'Archived',
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-300',
    textColor: 'text-neutral-700',
    description: 'Stored for reference'
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    description: 'Requires attention'
  },
  loading: {
    icon: Loader2,
    label: 'Loading',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    textColor: 'text-primary-900',
    description: 'Processing...'
  }
};

interface StatusIndicatorProps {
  status: CardStatus;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'dot' | 'icon' | 'full';
  showLabel?: boolean;
  showDescription?: boolean;
  className?: string;
  animated?: boolean;
}

export function StatusIndicator({
  status,
  size = 'md',
  variant = 'badge',
  showLabel = true,
  showDescription = false,
  className,
  animated = false
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
      padding: 'px-2 py-0.5',
      dot: 'w-2 h-2',
      gap: 'gap-1'
    },
    md: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      padding: 'px-3 py-1',
      dot: 'w-2.5 h-2.5',
      gap: 'gap-1.5'
    },
    lg: {
      icon: 'w-5 h-5',
      text: 'text-base',
      padding: 'px-4 py-1.5',
      dot: 'w-3 h-3',
      gap: 'gap-2'
    }
  };

  const sizes = sizeClasses[size];

  // Dot variant - minimal indicator
  if (variant === 'dot') {
    return (
      <div className={clsx('flex items-center', sizes.gap, className)}>
        <div 
          className={clsx(
            'rounded-full',
            sizes.dot,
            config.bgColor,
            'ring-2 ring-offset-1',
            config.borderColor.replace('border-', 'ring-'),
            animated && status === 'active' && 'animate-pulse',
            animated && status === 'loading' && 'animate-spin'
          )}
          aria-label={config.label}
          role="status"
        />
        {showLabel && (
          <span className={clsx(sizes.text, config.textColor, 'font-medium')}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div 
        className={clsx('flex items-center', className)}
        role="status"
        aria-label={config.label}
        title={config.description}
      >
        <Icon 
          className={clsx(
            sizes.icon,
            config.color,
            animated && status === 'loading' && 'animate-spin',
            animated && status === 'active' && 'animate-pulse'
          )}
        />
      </div>
    );
  }

  // Full variant with description
  if (variant === 'full') {
    return (
      <div 
        className={clsx(
          'flex items-start p-3 rounded-lg border',
          config.bgColor,
          config.borderColor,
          className
        )}
        role="status"
      >
        <Icon 
          className={clsx(
            'flex-shrink-0 mt-0.5',
            sizes.icon,
            config.color,
            animated && status === 'loading' && 'animate-spin'
          )}
        />
        <div className="ml-3 flex-1">
          <p className={clsx(sizes.text, config.textColor, 'font-semibold')}>
            {config.label}
          </p>
          {showDescription && (
            <p className={clsx('text-xs mt-0.5', config.color)}>
              {config.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Badge variant (default)
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-full border',
        sizes.padding,
        sizes.gap,
        config.bgColor,
        config.borderColor,
        className
      )}
      role="status"
    >
      <Icon 
        className={clsx(
          sizes.icon,
          config.color,
          animated && status === 'loading' && 'animate-spin',
          animated && status === 'active' && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className={clsx(sizes.text, config.textColor, 'font-medium')}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Priority indicator component
interface PriorityIndicatorProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({
  priority,
  size = 'md',
  showLabel = false,
  className
}: PriorityIndicatorProps) {
  const priorityConfig = {
    low: {
      color: 'bg-neutral-400',
      label: 'Low Priority',
      bars: 1
    },
    medium: {
      color: 'bg-blue-500',
      label: 'Medium Priority',
      bars: 2
    },
    high: {
      color: 'bg-orange-500',
      label: 'High Priority',
      bars: 3
    },
    urgent: {
      color: 'bg-red-500',
      label: 'Urgent',
      bars: 4
    }
  };

  const config = priorityConfig[priority];
  const barHeight = size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4';
  const barWidth = 'w-1';

  return (
    <div className={clsx('flex items-end gap-0.5', className)} aria-label={config.label}>
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className={clsx(
            barWidth,
            barHeight,
            'rounded-full transition-all',
            index < config.bars
              ? config.color
              : 'bg-neutral-200 dark:bg-neutral-700'
          )}
          style={{ height: `${(index + 1) * (size === 'sm' ? 4 : size === 'md' ? 5 : 6)}px` }}
        />
      ))}
      {showLabel && (
        <span className={clsx('ml-2 text-xs text-neutral-600 dark:text-neutral-400')}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Progress indicator for active cards
interface ProgressIndicatorProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  size = 'md',
  showPercentage = false,
  className
}: ProgressIndicatorProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  return (
    <div className={clsx('w-full', className)}>
      {showPercentage && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Progress</span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={clsx(
        'w-full rounded-full overflow-hidden',
        heightClasses[size],
        'bg-neutral-200 dark:bg-neutral-700'
      )}>
        <div 
          className={clsx(
            'h-full transition-all duration-300 ease-out',
            'bg-gradient-to-r from-primary-500 to-primary-600',
            'rounded-full'
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}