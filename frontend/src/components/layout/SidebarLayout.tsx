import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';
import { theme } from '../../styles/theme';

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCreateCard: () => void;
  onCreateTask: () => void;
  isCommandPaletteOpen?: boolean;
  onCloseCommandPalette?: () => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  currentRoute,
  onNavigate,
  onCreateCard,
  onCreateTask,
  isCommandPaletteOpen: isCommandPaletteOpenProp = false,
  onCloseCommandPalette,
}) => {
  const [localCommandPaletteOpen, setLocalCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isCommandPaletteOpen = isCommandPaletteOpenProp || localCommandPaletteOpen;

  const handleCloseCommandPalette = () => {
    setLocalCommandPaletteOpen(false);
    onCloseCommandPalette?.();
  };
  
  const handleOpenCommandPalette = () => {
    setLocalCommandPaletteOpen(true);
  };

  // Navigation items for Klarity
  const navItems = [
    {
      id: 'focus',
      label: 'Deep Focus',
      icon: Icons.Focus,
      path: '/',
      color: 'indigo',
    },
    {
      id: 'daily',
      label: 'Daily Tasks',
      icon: Icons.Daily,
      path: '/daily',
      color: 'amber',
    },
    {
      id: 'journal',
      label: 'Mind Journal',
      icon: Icons.Dreams,
      path: '/journal',
      color: 'purple',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Icons.Analytics,
      path: '/analytics',
      color: 'emerald',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Icons.Archive,
      path: '/archive',
      color: 'slate',
    },
  ];

  // Bottom navigation items
  const bottomNavItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Icons.Settings,
      path: '/settings',
      color: 'gray',
    },
  ];

  // Command palette commands
  const commands = [
    {
      id: 'nav-focus',
      label: 'Go to Deep Focus',
      shortcut: 'G F',
      category: 'Navigation',
      action: () => onNavigate('/'),
    },
    {
      id: 'nav-daily',
      label: 'Go to Daily Tasks',
      shortcut: 'G D',
      category: 'Navigation',
      action: () => onNavigate('/daily'),
    },
    {
      id: 'create-card',
      label: 'Create New Card',
      shortcut: 'C',
      category: 'Actions',
      action: onCreateCard,
    },
    {
      id: 'create-task',
      label: 'Create New Task',
      shortcut: 'T',
      category: 'Actions',
      action: onCreateTask,
    },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      indigo: isActive 
        ? 'bg-indigo-100/10 text-indigo-400 border-indigo-500' 
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-indigo-300',
      amber: isActive
        ? 'bg-amber-100/10 text-amber-400 border-amber-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-amber-300',
      purple: isActive
        ? 'bg-purple-100/10 text-purple-400 border-purple-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-purple-300',
      emerald: isActive
        ? 'bg-emerald-100/10 text-emerald-400 border-emerald-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-emerald-300',
      slate: isActive
        ? 'bg-slate-100/10 text-slate-400 border-slate-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-slate-300',
      gray: isActive
        ? 'bg-gray-100/10 text-gray-400 border-gray-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-slate-900",
          "border-r-2 border-gray-200 dark:border-slate-800",
          "z-40 flex flex-col overflow-hidden"
        )}
        style={{ 
          boxShadow: theme.shadows.xl,
        }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <Icons.Zap className="w-6 h-6 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Klarity</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deep Work System</p>
                </div>
              )}
            </motion.div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800",
                isSidebarCollapsed && "ml-auto"
              )}
            >
              {isSidebarCollapsed ? (
                <Icons.ChevronRight className="w-5 h-5" />
              ) : (
                <Icons.Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className={cn(
            "flex gap-2",
            isSidebarCollapsed ? "flex-col" : "flex-row"
          )}>
            <button
              onClick={onCreateCard}
              className={cn(
                "flex-1 p-2.5 rounded-xl transition-all duration-200",
                "bg-gradient-to-r from-indigo-500 to-indigo-600",
                "text-white hover:from-indigo-600 hover:to-indigo-700",
                "shadow-lg hover:shadow-xl flex items-center justify-center gap-2",
                isSidebarCollapsed && "w-full"
              )}
              style={{ boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25)' }}
              title={isSidebarCollapsed ? "New Card" : undefined}
            >
              <Icons.Plus className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">New Card</span>}
            </button>
            
            {!isSidebarCollapsed && (
              <button
                onClick={onCreateTask}
                className="flex-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icons.Daily className="w-4 h-4" />
                <span className="text-sm font-medium">Quick Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.path || 
              (item.path === '/' && currentRoute === '/focus');
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "w-full px-3 py-2.5 rounded-xl transition-all duration-200",
                  "flex items-center gap-3 relative",
                  "border-l-4",
                  getColorClasses(item.color, isActive),
                  isActive ? '' : 'border-transparent'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(to right, transparent, ${
                        item.color === 'indigo' ? 'rgba(99, 102, 241, 0.05)' :
                        item.color === 'amber' ? 'rgba(245, 158, 11, 0.05)' :
                        item.color === 'purple' ? 'rgba(168, 85, 247, 0.05)' :
                        item.color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' :
                        'rgba(148, 163, 184, 0.05)'
                      })`,
                    }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
          {/* Search/Command Palette */}
          <button
            onClick={handleOpenCommandPalette}
            className={cn(
              "w-full px-3 py-2.5 rounded-xl transition-all duration-200",
              "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700",
              "flex items-center gap-3 text-gray-600 dark:text-gray-300"
            )}
            title={isSidebarCollapsed ? "Search (⌘K)" : undefined}
          >
            <Icons.Search className="w-4 h-4" />
            {!isSidebarCollapsed && (
              <>
                <span className="text-sm flex-1 text-left">Search...</span>
                <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded">
                  ⌘K
                </kbd>
              </>
            )}
          </button>

          {/* Bottom Nav Items */}
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "w-full px-3 py-2.5 rounded-xl transition-all duration-200",
                  "flex items-center gap-3",
                  getColorClasses(item.color, isActive)
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isSidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Theme Toggle */}
          <div className={cn(
            "pt-2 border-t border-gray-200 dark:border-slate-800",
            "flex items-center",
            isSidebarCollapsed ? "justify-center" : "justify-between px-3"
          )}>
            {!isSidebarCollapsed && (
              <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getPageTitle(currentRoute)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getPageDescription(currentRoute)}
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              {currentRoute === '/' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Focus Mode Active
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={handleCloseCommandPalette}
        commands={commands}
      />

      {/* Floating Quick Task Button (Mobile) */}
      <motion.button
        onClick={onCreateTask}
        className="fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 lg:hidden"
        style={{ boxShadow: theme.shadows.accent }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icons.Daily className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

// Helper functions
const getPageTitle = (route: string): string => {
  if (route.startsWith('/card/')) {
    return 'Card Details';
  }
  
  const titles: Record<string, string> = {
    '/': 'Deep Focus Zone',
    '/focus': 'Deep Focus Zone',
    '/daily': 'Daily Tasks',
    '/journal': 'Mind Journal',
    '/analytics': 'Analytics Dashboard',
    '/archive': 'Archive',
    '/settings': 'Settings',
  };
  return titles[route] || 'Klarity';
};

const getPageDescription = (route: string): string => {
  if (route.startsWith('/card/')) {
    return 'Manage and track your progress';
  }
  
  const descriptions: Record<string, string> = {
    '/': 'Enter flow state - one task at a time',
    '/focus': 'Enter flow state - one task at a time',
    '/daily': 'Quick wins and daily priorities',
    '/journal': 'Capture thoughts and transform them into action',
    '/analytics': 'Visualize your productivity patterns',
    '/archive': 'Review completed work and achievements',
    '/settings': 'Customize your Klarity experience',
  };
  return descriptions[route] || '';
};

export default SidebarLayout;