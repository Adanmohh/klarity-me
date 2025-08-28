import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';
import { theme } from '../../styles/theme';

interface MainLayoutStyledProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCreateCard: () => void;
  onCreateTask: () => void;
  isCommandPaletteOpen?: boolean;
  onCloseCommandPalette?: () => void;
}

export const MainLayoutStyled: React.FC<MainLayoutStyledProps> = ({
  children,
  currentRoute,
  onNavigate,
  onCreateCard,
  onCreateTask,
  isCommandPaletteOpen: isCommandPaletteOpenProp = false,
  onCloseCommandPalette,
}) => {
  const [localCommandPaletteOpen, setLocalCommandPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isCommandPaletteOpen = isCommandPaletteOpenProp || localCommandPaletteOpen;

  const handleCloseCommandPalette = () => {
    setLocalCommandPaletteOpen(false);
    onCloseCommandPalette?.();
  };
  
  const handleOpenCommandPalette = () => {
    setLocalCommandPaletteOpen(true);
  };

  // Navigation items with deep work focus
  const navItems = [
    {
      id: 'focus',
      label: 'Deep Focus',
      icon: Icons.Focus,
      path: '/',
      color: 'indigo',
      description: 'Enter flow state',
    },
    {
      id: 'daily',
      label: 'Daily Tasks',
      icon: Icons.Daily,
      path: '/daily',
      color: 'amber',
      description: 'Today\'s priorities',
    },
    {
      id: 'journal',
      label: 'Mind Journal',
      icon: Icons.Dreams,
      path: '/journal',
      color: 'purple',
      description: 'Capture thoughts',
    },
    {
      id: 'analytics',
      label: 'Progress',
      icon: Icons.Analytics,
      path: '/analytics',
      color: 'emerald',
      description: 'Track growth',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Icons.Archive,
      path: '/archive',
      color: 'gray',
      description: 'Past work',
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
        ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
        : 'text-gray-700 hover:bg-indigo-50 hover:border-indigo-200',
      amber: isActive
        ? 'bg-amber-100 border-amber-300 text-amber-700'
        : 'text-gray-700 hover:bg-amber-50 hover:border-amber-200',
      purple: isActive
        ? 'bg-purple-100 border-purple-300 text-purple-700'
        : 'text-gray-700 hover:bg-purple-50 hover:border-purple-200',
      emerald: isActive
        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
        : 'text-gray-700 hover:bg-emerald-50 hover:border-emerald-200',
      gray: isActive
        ? 'bg-gray-100 border-gray-300 text-gray-700'
        : 'text-gray-700 hover:bg-gray-50 hover:border-gray-200',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Top Navigation Bar */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b-2 border-gray-200 z-40"
        style={{ boxShadow: theme.shadows.md }}
      >
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <Icons.Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">DeepWork</h1>
                <p className="text-xs text-gray-600">Focus System</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.path || 
                (item.path === '/' && currentRoute === '/focus');
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200",
                    getColorClasses(item.color, isActive),
                    isActive ? '' : 'border-transparent hover:border-opacity-50'
                  )}
                  style={{
                    boxShadow: isActive ? theme.shadows.md : 'none',
                  }}
                >
                  <Icon className="w-4 h-4 inline-block mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCommandPalette}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Icons.Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">⌘K</span>
            </button>
            
            <ThemeToggle />
            
            <button
              onClick={onCreateCard}
              className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ boxShadow: theme.shadows.primary }}
            >
              <Icons.Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white border-r-2 border-gray-200 z-50 lg:hidden"
              style={{ boxShadow: theme.shadows['2xl'] }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.path || 
                      (item.path === '/' && currentRoute === '/focus');
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border-2 text-left transition-all duration-200",
                          getColorClasses(item.color, isActive),
                          isActive ? '' : 'border-transparent'
                        )}
                        style={{
                          boxShadow: isActive ? theme.shadows.sm : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <motion.button
          onClick={onCreateTask}
          className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 group"
          style={{ boxShadow: theme.shadows.accent }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icons.Daily className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Quick Task (T)
          </span>
        </motion.button>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={handleCloseCommandPalette}
        commands={commands}
      />

      {/* Focus Mode Indicator */}
      {currentRoute === '/' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Deep Focus Mode Active
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MainLayoutStyled;