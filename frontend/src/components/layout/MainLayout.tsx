import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloatingActionButton } from './FloatingActionButton';
import { CommandPalette } from './CommandPalette';
import { NavigationMenu } from './NavigationMenu';
import { Dock } from '../ui/Dock';
import { Icons } from '../icons/LucideIcons';

interface MainLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCreateCard: () => void;
  onCreateTask: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  onCreateCard,
  onCreateTask,
}) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Icons.Home />,
      onClick: () => onNavigate('/'),
      isActive: currentRoute === '/',
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: <Icons.Focus />,
      onClick: () => onNavigate('/focus'),
      isActive: currentRoute === '/focus' || currentRoute.startsWith('/card/'),
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
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      shortcut: 'G D',
      category: 'Navigation',
      action: () => onNavigate('/'),
    },
    {
      id: 'nav-focus',
      label: 'Go to Focus Area',
      shortcut: 'G F',
      category: 'Navigation',
      action: () => onNavigate('/focus'),
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
    <div className="h-screen bg-gray-50 font-sans">
      {/* Main Content Area */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-primary-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-black">
                {getPageTitle(currentRoute)}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {getPageDescription(currentRoute)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Navigation Menu */}
              <NavigationMenu 
                currentRoute={currentRoute}
                onCreateCard={onCreateCard}
                onCreateTask={onCreateTask}
              />
              
              {/* Command Palette Trigger */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Icons.Search />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Quick actions</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                    <Icons.Command className="inline w-3 h-3" />
                  </kbd>
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                    K
                  </kbd>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content with padding for dock */}
        <main className="flex-1 overflow-auto pb-24" role="main">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton actions={fabActions} />
      
      {/* Bottom Dock Navigation with proper spacing */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50" role="navigation" aria-label="Main navigation">
        <Dock items={dockItems} />
      </div>

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};

// Helper functions
const getPageTitle = (route: string): string => {
  // Handle dynamic routes
  if (route.startsWith('/card/')) {
    return 'Card Details';
  }
  
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/focus': 'Focus Area',
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
    '/': 'Your productivity overview at a glance',
    '/focus': 'Manage your focus cards and deep work',
    '/daily': 'Quick tasks organized by time',
    '/journal': 'Transform your morning thoughts into actionable tasks',
    '/analytics': 'Track your progress and productivity',
    '/archive': 'View completed cards and tasks',
    '/settings': 'Customize your experience',
  };
  return descriptions[route] || '';
};

