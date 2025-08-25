import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { FloatingActionButton } from './FloatingActionButton';
import { CommandPalette } from './CommandPalette';
import { Dock } from '../ui/Dock';
import { PlusIcon, CardsIcon, TasksIcon } from '../icons/Icons';

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
      icon: <CardsIcon />,
      onClick: onCreateCard,
    },
    {
      id: 'new-task',
      label: 'New Task',
      icon: <TasksIcon />,
      onClick: onCreateTask,
    },
  ];

  // Dock navigation items
  const dockItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      onClick: () => onNavigate('/'),
      isActive: currentRoute === '/',
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      onClick: () => onNavigate('/focus'),
      isActive: currentRoute === '/focus',
    },
    {
      id: 'daily',
      label: 'Daily',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      onClick: () => onNavigate('/daily'),
      isActive: currentRoute === '/daily',
    },
    {
      id: 'journal',
      label: 'Dreams',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onClick: () => onNavigate('/journal'),
      isActive: currentRoute === '/journal',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
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
      icon: <CardsIcon />,
      category: 'Actions',
      action: onCreateCard,
    },
    {
      id: 'create-task',
      label: 'Create New Task',
      shortcut: 'T',
      icon: <TasksIcon />,
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
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
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

            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <SearchIcon />
              <span className="text-sm font-medium text-gray-700">Quick actions</span>
              <kbd className="px-2 py-1 text-xs font-bold text-gray-500 bg-primary-white rounded">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
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
      
      {/* Bottom Dock Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);