import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface ModeSwitcherProps {
  currentMode: 'focus' | 'daily';
  onModeChange: (mode: 'focus' | 'daily') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="inline-flex glass-effect rounded-full p-1.5">
        <button
          onClick={() => onModeChange('focus')}
          className={cn(
            "px-8 py-3 rounded-full font-medium transition-all duration-300",
            "relative overflow-hidden",
            currentMode === 'focus' 
              ? "bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black shadow-lg" 
              : "text-gray-600 hover:text-primary-black"
          )}
        >
          {currentMode === 'focus' && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 bg-gradient-to-r from-primary-gold to-yellow-500 rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Focus Area</span>
          </span>
        </button>
        
        <button
          onClick={() => onModeChange('daily')}
          className={cn(
            "px-8 py-3 rounded-full font-medium transition-all duration-300",
            "relative overflow-hidden",
            currentMode === 'daily' 
              ? "bg-gradient-to-r from-primary-gold to-yellow-500 text-primary-black shadow-lg" 
              : "text-gray-600 hover:text-primary-black"
          )}
        >
          {currentMode === 'daily' && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 bg-gradient-to-r from-primary-gold to-yellow-500 rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Daily Tasks</span>
          </span>
        </button>
      </div>
    </div>
  );
};