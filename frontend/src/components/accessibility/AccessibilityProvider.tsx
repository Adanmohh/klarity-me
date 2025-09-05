import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  keyboardNavigationEnabled: boolean;
  setKeyboardNavigationEnabled: (enabled: boolean) => void;
  reducedMotion: boolean;
  highContrast: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Detect user preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    setReducedMotion(motionQuery.matches);
    setHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Enable keyboard navigation when Tab is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigationEnabled(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigationEnabled(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Screen reader announcements
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Apply classes based on preferences
  useEffect(() => {
    const root = document.documentElement;
    
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (keyboardNavigationEnabled) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  }, [reducedMotion, highContrast, keyboardNavigationEnabled]);

  return (
    <AccessibilityContext.Provider
      value={{
        announceMessage,
        keyboardNavigationEnabled,
        setKeyboardNavigationEnabled,
        reducedMotion,
        highContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// Skip Links Component
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="absolute top-0 left-0 z-[100] bg-white p-2 shadow-lg">
        <a
          href="#main-content"
          className="inline-block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="inline-block ml-2 px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        >
          Skip to navigation
        </a>
        <a
          href="#footer"
          className="inline-block ml-2 px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        >
          Skip to footer
        </a>
      </div>
    </div>
  );
}

// Keyboard Shortcuts Help Dialog
interface KeyboardShortcut {
  key: string;
  description: string;
  category?: string;
}

export function KeyboardShortcutsDialog({ 
  shortcuts,
  isOpen,
  onClose 
}: {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categorizedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 rounded-md dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-neutral-100 border border-neutral-200 rounded dark:bg-neutral-800 dark:border-neutral-700">?</kbd> at any time to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}