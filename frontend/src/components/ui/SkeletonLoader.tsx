import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-300';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  const skeletonStyle = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };
  
  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        variant === 'circular' && !width && !height && 'w-10 h-10',
        variant === 'rectangular' && !width && !height && 'w-full h-20',
        variant === 'card' && !width && !height && 'w-full h-32',
        className
      )}
      style={skeletonStyle}
    />
  ));
  
  return count > 1 ? (
    <div className="space-y-2">
      {elements}
    </div>
  ) : (
    elements[0]
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6', className)}>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="75%" />
      </div>
    </div>
  </div>
);

// Task Skeleton
export const TaskSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn('bg-white/5 rounded-lg p-4 border border-white/10', className)}
  >
    <div className="flex items-start space-x-3">
      <Skeleton variant="circular" width={24} height={24} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" height={12} />
      </div>
      <Skeleton variant="rectangular" width={60} height={24} />
    </div>
  </motion.div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ 
  items?: number;
  className?: string;
}> = ({ items = 5, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }, (_, i) => (
      <TaskSkeleton key={i} />
    ))}
  </div>
);

// Dashboard Stats Skeleton
export const StatsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6', className)}>
    <div className="space-y-3">
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="60%" height={32} />
      <div className="flex items-center space-x-2">
        <Skeleton variant="text" width={50} height={12} />
        <Skeleton variant="text" width={30} height={12} />
      </div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('w-full', className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={20} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b border-gray-100 dark:border-gray-800">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={`${100 / columns}%`} 
            height={16}
          />
        ))}
      </div>
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ fields = 3, className }) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="rectangular" height={44} />
      </div>
    ))}
    <div className="flex space-x-4 pt-4">
      <Skeleton variant="rectangular" width={100} height={44} />
      <Skeleton variant="rectangular" width={100} height={44} />
    </div>
  </div>
);

// Content Block Skeleton
export const ContentSkeleton: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ lines = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton variant="text" width="80%" height={24} />
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  </div>
);

export { Skeleton };