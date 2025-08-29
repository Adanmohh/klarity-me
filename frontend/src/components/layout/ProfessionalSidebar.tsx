import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';

interface ProfessionalSidebarProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCreateCard: () => void;
  onCreateTask: () => void;
  isCommandPaletteOpen?: boolean;
  onCloseCommandPalette?: () => void;
}

export const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: true,
    identity: true,
    tools: false,
  });
  const isCommandPaletteOpen = isCommandPaletteOpenProp || localCommandPaletteOpen;

  const handleCloseCommandPalette = () => {
    setLocalCommandPaletteOpen(false);
    onCloseCommandPalette?.();
  };
  
  const handleOpenCommandPalette = () => {
    setLocalCommandPaletteOpen(true);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Main navigation sections with better organization
  const navigationSections = [
    {
      id: 'main',
      title: 'Workspace',
      items: [
        {
          id: 'focus',
          label: 'Deep Focus',
          icon: Icons.Focus,
          path: '/',
          badge: null,
          description: 'Enter flow state',
        },
        {
          id: 'daily',
          label: 'Daily Tasks',
          icon: Icons.Daily,
          path: '/daily',
          badge: '3',
          description: 'Today\'s priorities',
        },
      ],
    },
    {
      id: 'identity',
      title: 'Identity',
      items: [
        {
          id: 'journal',
          label: 'Mind Journal',
          icon: Icons.Dreams,
          path: '/journal',
          badge: null,
          description: 'Capture thoughts & reflections',
        },
        {
          id: 'habits',
          label: 'Habits',
          icon: Icons.Target,
          path: '/habits',
          badge: null,
          description: 'Build new habits',
        },
        {
          id: 'identity',
          label: 'Identity Settings',
          icon: Icons.User,
          path: '/identity',
          badge: null,
          description: 'Define who you are',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: Icons.Analytics,
          path: '/analytics',
          badge: null,
          description: 'Track progress',
        },
        {
          id: 'archive',
          label: 'Archive',
          icon: Icons.Archive,
          path: '/archive',
          badge: null,
          description: 'Past work',
        },
      ],
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

  // Smooth width transition
  const sidebarWidth = isSidebarCollapsed ? 68 : 260;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Professional Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full",
          "bg-white dark:bg-gray-900",
          "border-r border-gray-200 dark:border-gray-800",
          "z-40 flex flex-col",
          "shadow-sm" // Subtle shadow instead of harsh one
        )}
      >
        {/* Header with Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <motion.div 
            className="flex items-center gap-3 overflow-hidden"
            animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {!isSidebarCollapsed && (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Icons.Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900 dark:text-white">Klarity</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deep Work</p>
                </div>
              </>
            )}
          </motion.div>
          
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icons.ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>
        </div>

        {/* Quick Actions Bar */}
        {!isSidebarCollapsed && (
          <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <button
                onClick={onCreateCard}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg",
                  "bg-indigo-50 dark:bg-indigo-950",
                  "text-indigo-600 dark:text-indigo-400",
                  "hover:bg-indigo-100 dark:hover:bg-indigo-900",
                  "text-sm font-medium transition-colors",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Icons.Plus className="w-4 h-4" />
                New Card
              </button>
              
              <button
                onClick={onCreateTask}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg",
                  "bg-gray-100 dark:bg-gray-800",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                  "text-sm font-medium transition-colors",
                  "flex items-center justify-center gap-2"
                )}
              >
                <Icons.Daily className="w-4 h-4" />
                Quick Task
              </button>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigationSections.map((section) => (
            <div key={section.id} className="mb-6">
              {!isSidebarCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full px-2 py-1 mb-1",
                    "flex items-center justify-between",
                    "text-xs font-semibold uppercase tracking-wider",
                    "text-gray-500 dark:text-gray-400",
                    "hover:text-gray-700 dark:hover:text-gray-200",
                    "transition-colors"
                  )}
                >
                  <span>{section.title}</span>
                  <motion.div
                    animate={{ rotate: expandedSections[section.id] ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icons.ChevronRight className="w-3 h-3" />
                  </motion.div>
                </button>
              )}
              
              <AnimatePresence>
                {(isSidebarCollapsed || expandedSections[section.id]) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.path || 
                        (item.path === '/' && currentRoute === '/focus');
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.path)}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg",
                            "flex items-center gap-3",
                            "transition-all duration-150",
                            "group relative",
                            isActive ? [
                              "bg-indigo-50 dark:bg-indigo-950",
                              "text-indigo-600 dark:text-indigo-400",
                              "font-medium"
                            ] : [
                              "text-gray-700 dark:text-gray-300",
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                              "hover:text-gray-900 dark:hover:text-white"
                            ]
                          )}
                          title={isSidebarCollapsed ? item.label : undefined}
                        >
                          {/* Active indicator bar */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"
                              transition={{ type: "spring", duration: 0.3 }}
                            />
                          )}
                          
                          <Icon className={cn(
                            "w-5 h-5 flex-shrink-0",
                            isSidebarCollapsed ? "mx-auto" : "ml-1"
                          )} />
                          
                          {!isSidebarCollapsed && (
                            <>
                              <span className="flex-1 text-left text-sm">{item.label}</span>
                              {item.badge && (
                                <span className={cn(
                                  "px-2 py-0.5 text-xs rounded-full",
                                  "bg-indigo-100 dark:bg-indigo-900",
                                  "text-indigo-600 dark:text-indigo-400"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
          {/* Search */}
          <button
            onClick={handleOpenCommandPalette}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-gray-100 dark:bg-gray-800",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              "text-gray-700 dark:text-gray-300",
              "transition-colors",
              "flex items-center gap-3"
            )}
            title={isSidebarCollapsed ? "Search (⌘K)" : undefined}
          >
            <Icons.Search className={cn("w-4 h-4", isSidebarCollapsed && "mx-auto")} />
            {!isSidebarCollapsed && (
              <>
                <span className="text-sm flex-1 text-left">Search...</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                  ⌘K
                </kbd>
              </>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('/settings')}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-colors",
              "flex items-center gap-3"
            )}
            title={isSidebarCollapsed ? "Settings" : undefined}
          >
            <Icons.Settings className={cn("w-4 h-4", isSidebarCollapsed && "mx-auto")} />
            {!isSidebarCollapsed && <span className="text-sm">Settings</span>}
          </button>

          {/* User Profile */}
          {!isSidebarCollapsed && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Icons.User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPageTitle(currentRoute)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getPageDescription(currentRoute)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Icons.Bell className="w-5 h-5" />
            </button>
            
            {/* Focus Mode Indicator */}
            {currentRoute === '/' && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Focus Mode
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
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
    '/': 'One task at a time, maximum focus',
    '/focus': 'One task at a time, maximum focus',
    '/daily': 'Quick wins and daily priorities',
    '/journal': 'Capture thoughts and transform them',
    '/analytics': 'Visualize your productivity patterns',
    '/archive': 'Review completed work',
    '/settings': 'Customize your experience',
  };
  return descriptions[route] || '';
};

export default ProfessionalSidebar;