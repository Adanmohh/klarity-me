import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={clsx(
        'bg-neutral-200 dark:bg-neutral-700',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="text" width="100%" height={16} className="mb-2" />
      <Skeleton variant="text" width="80%" height={16} className="mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton variant="rounded" width={80} height={28} />
        <Skeleton variant="rounded" width={60} height={28} />
      </div>
    </div>
  );
}

// Task Skeleton
export function TaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-lg">
      <Skeleton variant="circular" width={20} height={20} />
      <div className="flex-1">
        <Skeleton variant="text" width="70%" height={16} />
      </div>
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <TaskSkeleton key={index} />
      ))}
    </div>
  );
}

// Grid Skeleton
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

// Sidebar Skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-64 h-full bg-white dark:bg-neutral-900 p-4">
      <Skeleton variant="rectangular" width="100%" height={48} className="mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width="100%"
            height={40}
            className="mb-2"
          />
        ))}
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div>
        <Skeleton variant="text" width={120} height={16} className="mb-1" />
        <Skeleton variant="text" width={80} height={14} />
      </div>
    </div>
  );
}

// Content Skeleton
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" width="40%" height={32} className="mb-6" />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="75%" height={16} />
      <div className="mt-6">
        <GridSkeleton count={3} />
      </div>
    </div>
  );
}