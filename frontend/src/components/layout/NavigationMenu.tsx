import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface NavigationMenuProps {
  currentRoute: string;
  onCreateCard: () => void;
  onCreateTask: () => void;
}

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  route?: string;
  action?: () => void;
  description: string;
  badge?: string | null;
  shortcut?: string | null;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  currentRoute,
  onCreateCard,
  onCreateTask,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuSections: Array<{ id: string; title: string; items: MenuItem[] }> = [
    {
      id: 'navigation',
      title: 'Navigation',
      items: [
        { 
          icon: <Icons.Home className="w-4 h-4" />, 
          label: 'Dashboard', 
          route: '/',
          description: 'Overview and stats',
          badge: null
        },
        { 
          icon: <Icons.Target className="w-4 h-4" />, 
          label: 'Focus Area', 
          route: '/focus',
          description: 'Manage your cards',
          badge: '2 active'
        },
        { 
          icon: <Icons.Check className="w-4 h-4" />, 
          label: 'Daily Tasks', 
          route: '/daily',
          description: 'Today\'s activities',
          badge: null
        },
        { 
          icon: <Icons.Book className="w-4 h-4" />, 
          label: 'Dream Journal', 
          route: '/journal',
          description: 'Track your dreams',
          badge: null
        },
        { 
          icon: <Icons.TrendingUp className="w-4 h-4" />, 
          label: 'Analytics', 
          route: '/analytics',
          description: 'Performance insights',
          badge: null
        },
      ]
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      items: [
        { 
          icon: <Icons.Add className="w-4 h-4" />, 
          label: 'New Card', 
          action: onCreateCard,
          description: 'Create focus card',
          shortcut: 'Ctrl+N'
        },
        { 
          icon: <Icons.Check className="w-4 h-4" />, 
          label: 'New Task', 
          action: onCreateTask,
          description: 'Add daily task',
          shortcut: 'Ctrl+T'
        },
        { 
          icon: <Icons.Archive className="w-4 h-4" />, 
          label: 'View Archive', 
          route: '/archive',
          description: 'Archived items',
          shortcut: null
        },
      ]
    },
    {
      id: 'user',
      title: 'Account',
      items: [
        { 
          icon: <Icons.User className="w-4 h-4" />, 
          label: 'Profile', 
          route: '/profile',
          description: 'Your account',
          badge: null
        },
        { 
          icon: <Icons.Settings className="w-4 h-4" />, 
          label: 'Settings', 
          route: '/settings',
          description: 'Preferences',
          badge: null
        },
        { 
          icon: <Icons.Help className="w-4 h-4" />, 
          label: 'Help & Support', 
          route: '/help',
          description: 'Get assistance',
          badge: null
        },
        { 
          icon: <Icons.LogOut className="w-4 h-4" />, 
          label: 'Sign Out', 
          action: () => console.log('Sign out'),
          description: 'Logout',
          badge: null
        },
      ]
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.route) {
      navigate(item.route);
    } else if (item.action) {
      item.action();
    }
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Trigger Button */}
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-white dark:bg-neutral-900",
          "border border-neutral-200 dark:border-neutral-700",
          "hover:bg-neutral-50 dark:hover:bg-neutral-800",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md",
          isMenuOpen && "ring-2 ring-primary-gold ring-opacity-50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icons.Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        <span className="font-medium text-neutral-900 dark:text-white hidden sm:inline">
          Menu
        </span>
        <motion.div
          animate={{ rotate: isMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icons.ChevronDown className="w-4 h-4 text-neutral-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.2, bounce: 0.3 }}
            className={cn(
              "absolute right-0 mt-2 w-80",
              "bg-white dark:bg-neutral-900",
              "rounded-xl shadow-elevation-3",
              "border border-neutral-200 dark:border-neutral-700",
              "overflow-hidden z-50"
            )}
          >
            {/* Menu Header */}
            <div className="p-4 bg-gradient-to-r from-primary-gold/10 to-yellow-500/10 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Navigation Menu
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  ESC to close
                </span>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="max-h-[480px] overflow-y-auto">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.id}>
                  {/* Section Title */}
                  <div className="px-4 pt-3 pb-2">
                    <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {section.title}
                    </h4>
                  </div>

                  {/* Section Items */}
                  <div className="px-2 pb-2">
                    {section.items.map((item, itemIndex) => {
                      const isActive = item.route === currentRoute;
                      
                      return (
                        <motion.button
                          key={`${section.id}-${itemIndex}`}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setActiveSection(`${section.id}-${itemIndex}`)}
                          onMouseLeave={() => setActiveSection(null)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                            "transition-all duration-150",
                            "group relative",
                            isActive
                              ? "bg-primary-gold/10 text-primary-gold"
                              : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            activeSection === `${section.id}-${itemIndex}` && 
                            "bg-neutral-50 dark:bg-neutral-800"
                          )}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeMenuItem"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-gold rounded-r-full"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30
                              }}
                            />
                          )}

                          {/* Icon */}
                          <div className={cn(
                            "flex-shrink-0 p-2 rounded-lg",
                            "bg-neutral-100 dark:bg-neutral-800",
                            "group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700",
                            isActive && "bg-primary-gold/20"
                          )}>
                            {React.cloneElement(item.icon, {
                              className: cn(
                                "w-4 h-4",
                                isActive
                                  ? "text-primary-gold"
                                  : "text-neutral-600 dark:text-neutral-400"
                              )
                            })}
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-medium text-sm",
                                isActive
                                  ? "text-primary-gold"
                                  : "text-neutral-900 dark:text-white"
                              )}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-gold/20 text-primary-gold">
                                  {item.badge}
                                </span>
                              )}
                              {item.shortcut && (
                                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                  {item.shortcut}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.description}
                            </span>
                          </div>

                          {/* Arrow for navigation items */}
                          {item.route && (
                            <Icons.ChevronRight className={cn(
                              "w-4 h-4 opacity-0 -translate-x-2",
                              "group-hover:opacity-100 group-hover:translate-x-0",
                              "transition-all duration-200",
                              "text-neutral-400"
                            )} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Section Divider */}
                  {sectionIndex < menuSections.length - 1 && (
                    <div className="mx-4 my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  )}
                </div>
              ))}
            </div>

            {/* Menu Footer */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-gold to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">U</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">
                      User Name
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Free Plan
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <Icons.Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};