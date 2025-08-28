import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        'relative p-2.5 rounded-xl',
        'bg-white dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700',
        'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        'transition-all duration-200',
        'shadow-sm hover:shadow-md'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDarkMode ? (
          <Icons.Daily className="w-5 h-5 text-yellow-500" />
        ) : (
          <Icons.Dreams className="w-5 h-5 text-blue-600" />
        )}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          opacity: isDarkMode ? 0 : 1,
          scale: isDarkMode ? 0.8 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </motion.button>
  );
};