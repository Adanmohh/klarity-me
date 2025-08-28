import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface KeyboardShortcutsOptions {
  onCreateCard?: () => void;
  onCreateTask?: () => void;
  onOpenCommandPalette?: () => void;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Command/Ctrl combinations
      if (e.metaKey || e.ctrlKey) {
        // Navigation shortcuts with Shift
        if (e.shiftKey) {
          switch(e.key.toLowerCase()) {
            case 'd':
              e.preventDefault();
              navigate('/');
              break;
            case 'f':
              e.preventDefault();
              navigate('/focus');
              break;
            case 't':
              e.preventDefault();
              navigate('/daily');
              break;
            case 'j':
              e.preventDefault();
              navigate('/journal');
              break;
            case 'a':
              e.preventDefault();
              navigate('/analytics');
              break;
          }
          return;
        }
        
        // Theme toggle
        if (e.altKey && e.key.toLowerCase() === 't') {
          e.preventDefault();
          toggleTheme();
          return;
        }
        
        // Command palette
        if (e.key === 'k') {
          e.preventDefault();
          options.onOpenCommandPalette?.();
          return;
        }
      }
      
      // Alt combinations for quick actions
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            options.onCreateCard?.();
            break;
          case 'n':
            e.preventDefault();
            options.onCreateTask?.();
            break;
        }
        return;
      }

      // Help shortcut
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        showShortcutsHelp();
      }
    }, [navigate, toggleTheme, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

function showShortcutsHelp() {
  const shortcuts = `
    ⌨️ Keyboard Shortcuts:
    
    Navigation:
    • Ctrl+Shift+D - Dashboard
    • Ctrl+Shift+F - Focus Area
    • Ctrl+Shift+T - Daily Tasks
    • Ctrl+Shift+J - Dream Journal
    • Ctrl+Shift+A - Analytics
    
    Quick Actions:
    • Alt+C - Create Card
    • Alt+N - Create Task
    • Ctrl+K - Command Palette
    • Ctrl+Alt+T - Toggle Theme
    
    • Shift+? - Show this help
  `;
  alert(shortcuts);
}

// Export shortcut definitions for display in UI
export const shortcuts = {
  navigation: [
    { key: 'Ctrl+Shift+D', description: 'Go to Dashboard' },
    { key: 'Ctrl+Shift+F', description: 'Go to Focus Area' },
    { key: 'Ctrl+Shift+T', description: 'Go to Daily Tasks' },
    { key: 'Ctrl+Shift+J', description: 'Go to Dream Journal' },
    { key: 'Ctrl+Shift+A', description: 'Go to Analytics' },
  ],
  actions: [
    { key: 'Alt+C', description: 'Create New Card' },
    { key: 'Alt+N', description: 'Create New Task' },
    { key: 'Ctrl+K', description: 'Open Command Palette' },
    { key: 'Ctrl+Alt+T', description: 'Toggle Dark/Light Theme' },
    { key: 'Shift+?', description: 'Show Keyboard Shortcuts' },
  ],
};