import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';
import { buttonScale } from '../../utils/animations';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        'relative p-2.5 rounded-xl overflow-hidden',
        'bg-white dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700',
        'hover:bg-neutral-50 dark:hover:bg-neutral-700',
        'transition-all duration-200',
        'shadow-sm hover:shadow-md'
      )}
      variants={buttonScale}
      whileHover="hover"
      whileTap="tap"
      initial={{ opacity: 0, rotate: -180 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: 'anticipate' }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDarkMode ? 'dark' : 'light'}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'backInOut' }}
        >
          {isDarkMode ? (
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Icons.Daily className="w-5 h-5 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <Icons.Dreams className="w-5 h-5 text-blue-600" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          opacity: isDarkMode ? [0, 0.5, 0] : [0, 1, 0.3],
          scale: isDarkMode ? [0.8, 1.2, 1] : [1, 1.5, 1.2],
        }}
        transition={{ 
          duration: isDarkMode ? 2 : 3,
          repeat: Infinity,
          repeatDelay: 4
        }}
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Sparkle effect on toggle */}
      <AnimatePresence>
        {isDarkMode && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  scale: 0 
                }}
                animate={{ 
                  x: `${50 + (i - 1) * 30}%`,
                  y: `${50 + (i - 1) * 20}%`,
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};