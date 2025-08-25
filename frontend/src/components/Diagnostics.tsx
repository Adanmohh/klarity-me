import React from 'react';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { 
  Skeleton, 
  CardSkeleton, 
  TaskSkeleton, 
  StatsSkeleton 
} from './ui/SkeletonLoader';

export const Diagnostics: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">UI Components Diagnostic Test</h1>
      
      {/* Test Buttons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Components</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </div>

      {/* Test Glass Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">GlassCard Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="default">
            <h3 className="font-semibold mb-2 text-gray-900">Default Glass</h3>
            <p className="text-sm text-gray-700">Standard glass effect</p>
          </GlassCard>
          <GlassCard variant="elevated">
            <h3 className="font-semibold mb-2 text-gray-900">Elevated Glass</h3>
            <p className="text-sm text-gray-700">More prominent effect</p>
          </GlassCard>
          <GlassCard variant="subtle">
            <h3 className="font-semibold mb-2 text-gray-900">Subtle Glass</h3>
            <p className="text-sm text-gray-700">Minimal glass effect</p>
          </GlassCard>
          <GlassCard variant="gold">
            <h3 className="font-semibold mb-2 text-gray-900">Gold Glass</h3>
            <p className="text-sm text-gray-700">Gold themed glass</p>
          </GlassCard>
          <GlassCard variant="dark">
            <h3 className="font-semibold mb-2 text-gray-100">Dark Glass</h3>
            <p className="text-sm text-gray-300">Dark themed glass</p>
          </GlassCard>
        </div>
      </div>

      {/* Test Loading Spinners */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Spinners</h2>
        <div className="flex items-center gap-8 p-4 bg-white rounded-lg">
          <LoadingSpinner size="xs" />
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <LoadingSpinner size="xl" />
        </div>
      </div>

      {/* Test Skeletons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skeleton Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Card Skeleton</h3>
            <CardSkeleton />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Stats Skeleton</h3>
            <StatsSkeleton />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Task Skeleton</h3>
            <TaskSkeleton />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Basic Skeleton</h3>
            <Skeleton variant="text" count={3} />
          </div>
        </div>
      </div>

      {/* Accessibility Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Accessibility Features</h2>
        <GlassCard variant="default" hoverable onClick={() => alert('Card clicked!')}>
          <p>Click me or press Enter/Space when focused</p>
          <p className="text-sm text-gray-500 mt-2">
            This card has keyboard navigation and ARIA labels
          </p>
        </GlassCard>
      </div>

      {/* Responsive Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Responsive Design</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <GlassCard key={i} variant="subtle">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm font-medium">Stat {i}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Resize your browser to see responsive grid changes
        </p>
      </div>
    </div>
  );
};