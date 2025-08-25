import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import {
  DashboardIcon,
  CardsIcon,
  TasksIcon,
  JournalIcon,
  ChartIcon,
  ArchiveIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
} from '../icons/Icons';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, route: '/' },
  { id: 'focus', label: 'Focus Area', icon: CardsIcon, route: '/focus' },
  { id: 'daily', label: 'Daily Tasks', icon: TasksIcon, route: '/daily' },
  { id: 'journal', label: 'Dream Journal', icon: JournalIcon, route: '/journal' },
  { id: 'analytics', label: 'Analytics', icon: ChartIcon, route: '/analytics' },
  { id: 'archive', label: 'Archive', icon: ArchiveIcon, route: '/archive' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, route: '/settings' },
  { id: 'diagnostics', label: '🔧 UI Test', icon: SettingsIcon, route: '/diagnostics' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-primary-white rounded-lg p-2 shadow-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ 
          width: isCollapsed ? 80 : 260,
          x: 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 h-full bg-primary-white border-r border-primary-black/10",
          "shadow-xl z-40 overflow-hidden",
          "md:relative md:shadow-none"
        )}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-primary-black/10">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-primary-black font-bold text-xl">F</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary-black">Focus</h1>
                <p className="text-xs text-gray-500">Task Management</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Collapse Toggle - Desktop Only */}
        <button
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-primary-black text-primary-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronIcon direction={isCollapsed ? 'right' : 'left'} />
        </button>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            const isHovered = hoveredItem === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  "relative overflow-hidden group",
                  isActive 
                    ? "bg-primary-black text-primary-white" 
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background animation for active item */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary-black rounded-xl"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}

                {/* Gold accent for active item */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-gold rounded-r-full"
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  />
                )}

                {/* Icon */}
                <div className={cn(
                  "relative z-10 flex-shrink-0",
                  isActive && "text-primary-white"
                )}>
                  <Icon />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "relative z-10 font-medium text-sm whitespace-nowrap",
                        isActive && "text-primary-white"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Hover effect */}
                {isHovered && !isActive && (
                  <motion.div
                    className="absolute right-2 w-1 h-4 bg-primary-gold rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-2 px-2 py-1 bg-primary-black text-primary-white text-sm rounded-lg whitespace-nowrap z-50"
                  >
                    {item.label}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-black/10">
          <motion.div
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-gold to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-black font-bold text-sm">U</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-black truncate">User</p>
                <p className="text-xs text-gray-500 truncate">user@example.com</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsCollapsed(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ChevronIcon: React.FC<{ direction: 'left' | 'right' }> = ({ direction }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    {direction === 'left' ? (
      <path d="M15 18l-6-6 6-6" />
    ) : (
      <path d="M9 18l6-6-6-6" />
    )}
  </svg>
);