import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingActionButton } from './FloatingActionButton';
import { CommandPalette } from './CommandPalette';
import { NavigationMenu } from './NavigationMenu';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Dock } from '../ui/Dock';
import { Icons } from '../icons/LucideIcons';
import { fadeInUp, buttonScale } from '../../utils/animations';

interface MainLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCreateCard: () => void;
  onCreateTask: () => void;
  isCommandPaletteOpen?: boolean;
  onCloseCommandPalette?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  onCreateCard,
  onCreateTask,
  isCommandPaletteOpen: isCommandPaletteOpenProp = false,
  onCloseCommandPalette,
}) => {
  const [localCommandPaletteOpen, setLocalCommandPaletteOpen] = useState(false);
  const isCommandPaletteOpen = isCommandPaletteOpenProp || localCommandPaletteOpen;

  const handleCloseCommandPalette = () => {
    setLocalCommandPaletteOpen(false);
    onCloseCommandPalette?.();
  };
  
  const handleOpenCommandPalette = () => {
    setLocalCommandPaletteOpen(true);
  };

  // FAB actions
  const fabActions = [
    {
      id: 'new-card',
      label: 'New Card',
      icon: <Icons.Layers />,
      onClick: onCreateCard,
    },
    {
      id: 'new-task',
      label: 'New Task',
      icon: <Icons.Daily />,
      onClick: onCreateTask,
    },
  ];

  // Dock navigation items
  const dockItems = [
    {
      id: 'focus',
      label: 'Focus',
      icon: <Icons.Focus />,
      onClick: () => onNavigate('/'),
      isActive: currentRoute === '/' || currentRoute === '/focus',
    },
    {
      id: 'daily',
      label: 'Daily',
      icon: <Icons.Daily />,
      onClick: () => onNavigate('/daily'),
      isActive: currentRoute === '/daily',
    },
    {
      id: 'journal',
      label: 'Dreams',
      icon: <Icons.Dreams />,
      onClick: () => onNavigate('/journal'),
      isActive: currentRoute === '/journal',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <Icons.Analytics />,
      onClick: () => onNavigate('/analytics'),
      isActive: currentRoute === '/analytics',
    },
  ];

  // Command palette commands
  const commands = [
    // Navigation
    {
      id: 'nav-focus',
      label: 'Go to Focus Queue',
      shortcut: 'G F',
      category: 'Navigation',
      action: () => onNavigate('/'),
    },
    {
      id: 'nav-daily',
      label: 'Go to Daily Tasks',
      shortcut: 'G T',
      category: 'Navigation',
      action: () => onNavigate('/daily'),
    },
    {
      id: 'nav-journal',
      label: 'Go to Dream Journal',
      shortcut: 'G J',
      category: 'Navigation',
      action: () => onNavigate('/journal'),
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      shortcut: 'G A',
      category: 'Navigation',
      action: () => onNavigate('/analytics'),
    },
    // Actions
    {
      id: 'create-card',
      label: 'Create New Card',
      shortcut: 'C',
      icon: <Icons.Layers />,
      category: 'Actions',
      action: onCreateCard,
    },
    {
      id: 'create-task',
      label: 'Create New Task',
      shortcut: 'T',
      icon: <Icons.Daily />,
      category: 'Actions',
      action: onCreateTask,
    },
    // Settings
    {
      id: 'settings',
      label: 'Open Settings',
      shortcut: ',',
      category: 'Settings',
      action: () => onNavigate('/settings'),
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-gray-50 dark:bg-neutral-950 font-sans">
      {/* Main Content Area */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-primary-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-primary-black dark:text-white">
                {getPageTitle(currentRoute)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getPageDescription(currentRoute)}
              </p>
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Navigation Menu */}
              <NavigationMenu 
                currentRoute={currentRoute}
                onCreateCard={onCreateCard}
                onCreateTask={onCreateTask}
              />
              
              {/* Command Palette Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenCommandPalette}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <Icons.Search />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Quick actions</span>
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.1 }}
                >
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                    <Icons.Command className="inline w-3 h-3" />
                  </kbd>
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                    K
                  </kbd>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Page Content with padding for dock */}
        <main className="flex-1 overflow-auto pb-24" role="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton actions={fabActions} />
      
      {/* Bottom Dock Navigation with proper spacing */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50" 
        role="navigation" 
        aria-label="Main navigation">
        <Dock items={dockItems} />
      </motion.div>

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={isCommandPaletteOpen}
        onClose={handleCloseCommandPalette}
      />
    </motion.div>
  );
};

// Helper functions
const getPageTitle = (route: string): string => {
  // Handle dynamic routes
  if (route.startsWith('/card/')) {
    return 'Card Details';
  }
  
  const titles: Record<string, string> = {
    '/': 'Focus Queue',
    '/focus': 'Focus Queue',
    '/daily': 'Daily Tasks',
    '/journal': 'Dream Journal',
    '/analytics': 'Analytics',
    '/archive': 'Archive',
    '/settings': 'Settings',
  };
  return titles[route] || 'Page';
};

const getPageDescription = (route: string): string => {
  // Handle dynamic routes
  if (route.startsWith('/card/')) {
    return 'Manage tasks and track progress';
  }
  
  const descriptions: Record<string, string> = {
    '/': 'One card at a time, progress over completion',
    '/focus': 'One card at a time, progress over completion',
    '/daily': 'Quick tasks organized by time',
    '/journal': 'Transform your morning thoughts into actionable tasks',
    '/analytics': 'Track your progress and productivity',
    '/archive': 'View completed cards and tasks',
    '/settings': 'Customize your experience',
  };
  return descriptions[route] || '';
};

