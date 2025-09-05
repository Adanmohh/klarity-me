import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  showOnClick?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  showOnClick = false,
  showIcon = false,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = containerRect.width / 2 - tooltipRect.width / 2;
        y = -tooltipRect.height - spacing;
        break;
      case 'bottom':
        x = containerRect.width / 2 - tooltipRect.width / 2;
        y = containerRect.height + spacing;
        break;
      case 'left':
        x = -tooltipRect.width - spacing;
        y = containerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = containerRect.width + spacing;
        y = containerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Adjust if tooltip goes off screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const absoluteX = containerRect.left + x;
    const absoluteY = containerRect.top + y;

    if (absoluteX < 0) x = -containerRect.left + spacing;
    if (absoluteX + tooltipRect.width > viewportWidth) {
      x = viewportWidth - containerRect.left - tooltipRect.width - spacing;
    }
    if (absoluteY < 0) y = -containerRect.top + spacing;
    if (absoluteY + tooltipRect.height > viewportHeight) {
      y = viewportHeight - containerRect.top - tooltipRect.height - spacing;
    }

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (showOnClick) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showOnClick) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (showOnClick) {
      setIsVisible(!isVisible);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const getMotionProps = () => {
    const baseProps = {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.15 }
    };

    switch (position) {
      case 'top':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: 5 },
          animate: { ...baseProps.animate, y: 0 }
        };
      case 'bottom':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: -5 },
          animate: { ...baseProps.animate, y: 0 }
        };
      case 'left':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: 5 },
          animate: { ...baseProps.animate, x: 0 }
        };
      case 'right':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: -5 },
          animate: { ...baseProps.animate, x: 0 }
        };
      default:
        return baseProps;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {showIcon && (
        <HelpCircle className="w-4 h-4 ml-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-help" />
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            {...getMotionProps()}
            style={{
              position: 'absolute',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 1000
            }}
            className="pointer-events-none"
          >
            <div className="bg-neutral-900 dark:bg-neutral-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl max-w-xs">
              {typeof content === 'string' ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : (
                content
              )}
              
              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-solid ${
                  position === 'top'
                    ? 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-8 border-t-neutral-900 dark:border-t-neutral-800 border-x-8 border-x-transparent'
                    : position === 'bottom'
                    ? 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b-8 border-b-neutral-900 dark:border-b-neutral-800 border-x-8 border-x-transparent'
                    : position === 'left'
                    ? 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l-8 border-l-neutral-900 dark:border-l-neutral-800 border-y-8 border-y-transparent'
                    : 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r-8 border-r-neutral-900 dark:border-r-neutral-800 border-y-8 border-y-transparent'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Context Tooltips for common UI elements
export const contextualTooltips = {
  focusCard: "Click to expand, drag to reorder, swipe right to complete",
  dailyTask: "Quick tasks for today. Press Enter to add a new task",
  archive: "Completed and archived items are stored here",
  journal: "Capture your thoughts and ideas. Supports markdown",
  search: "Press Ctrl+/ to quickly search across all content",
  createCard: "Create a new focus card (shortcut: C)",
  keyboard: "Press ? to see all keyboard shortcuts",
  theme: "Toggle between light and dark mode",
  notification: "View recent activity and updates",
  settings: "Customize your experience",
  priorityHigh: "High priority - work on this first",
  priorityMedium: "Medium priority - important but not urgent",
  priorityLow: "Low priority - can be done later",
  statusActive: "Currently working on this task",
  statusPending: "Waiting to be started",
  statusCompleted: "Task has been completed",
  dragHandle: "Click and drag to reorder",
  expandCollapse: "Click to expand or collapse details",
  filter: "Filter items by status, priority, or date",
  sort: "Sort items by different criteria",
  export: "Export your data in various formats",
  share: "Share this item with others",
  duplicate: "Create a copy of this item",
  delete: "Move to trash (can be restored later)",
  permanentDelete: "Permanently delete (cannot be undone)",
  restore: "Restore this item from trash",
  refresh: "Refresh to see latest updates",
  sync: "Sync your data across devices",
  offline: "You're currently offline. Changes will sync when connected",
  autosave: "Changes are automatically saved",
  undo: "Undo last action (Ctrl+Z)",
  redo: "Redo last action (Ctrl+Y)",
  help: "Get help and documentation"
};

// Wrapper component with predefined tooltips
interface QuickTooltipProps {
  type: keyof typeof contextualTooltips;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
  className?: string;
}

export function QuickTooltip({
  type,
  children,
  position = 'top',
  showIcon = false,
  className = ''
}: QuickTooltipProps) {
  return (
    <Tooltip
      content={contextualTooltips[type]}
      position={position}
      showIcon={showIcon}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

// Tooltip provider for tutorial mode
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tutorialMode, setTutorialMode] = useState(false);

  useEffect(() => {
    const isTutorial = localStorage.getItem('tutorial_mode') === 'true';
    setTutorialMode(isTutorial);
  }, []);

  return (
    <div className={tutorialMode ? 'tutorial-mode' : ''}>
      {children}
    </div>
  );
}