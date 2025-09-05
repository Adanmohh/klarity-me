import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  Archive, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Calendar,
  Target,
  Trash2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { AccessibleButton } from '../ui/AccessibleButton';

// Simple time ago function
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';
  if (interval === 1) return '1 year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';
  if (interval === 1) return '1 month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';
  if (interval === 1) return '1 day ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';
  if (interval === 1) return '1 hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';
  if (interval === 1) return '1 minute ago';
  
  return 'just now';
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'task' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDelete
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['today']));
  const panelRef = useRef<HTMLDivElement>(null);

  // Group notifications by time period
  const groupNotifications = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    };

    const filteredNotifications = filter === 'unread' 
      ? notifications.filter(n => !n.read)
      : notifications;

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      if (date >= today) {
        groups.today.push(notification);
      } else if (date >= yesterday) {
        groups.yesterday.push(notification);
      } else if (date >= lastWeek) {
        groups.lastWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'task':
        return <Target className="w-5 h-5 text-primary-500" />;
      case 'achievement':
        return <Check className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const groups = groupNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-16 right-4 w-96 max-h-[80vh] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex gap-2">
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Mark all as read
              </button>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <button
                onClick={onClearAll}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Notifications list */}
          <div className="overflow-y-auto max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No notifications yet
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {Object.entries(groups).map(([groupName, items]) => {
                  if (items.length === 0) return null;

                  const isExpanded = expandedGroups.has(groupName);
                  const groupLabel = groupName === 'today' ? 'Today' :
                                    groupName === 'yesterday' ? 'Yesterday' :
                                    groupName === 'lastWeek' ? 'This Week' : 'Older';

                  return (
                    <div key={groupName}>
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="w-full px-4 py-2 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
                      >
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {groupLabel} ({items.length})
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-500 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {items.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                                icon={getNotificationIcon(notification)}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  icon: React.ReactNode;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  icon
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
        !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium text-neutral-900 dark:text-neutral-100 ${
                !notification.read ? 'font-semibold' : ''
              }`}>
                {notification.title}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.action!.onClick();
                  }}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              aria-label="Delete notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {timeAgo(notification.timestamp)}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Notification Bell Icon with badge
interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </button>
  );
}