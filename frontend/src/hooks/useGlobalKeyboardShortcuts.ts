import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { useDailyTaskStore } from '../store/dailyTaskStore';
import { DailyTaskLane } from '../types';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category?: string;
  action: () => void;
}

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const { createCard } = useCardStore();
  const { createTask } = useDailyTaskStore();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'g',
      description: 'Go to Focus Area',
      category: 'Navigation',
      action: () => navigate('/focus'),
    },
    {
      key: 'd',
      description: 'Go to Daily Tasks',
      category: 'Navigation',
      action: () => navigate('/daily'),
    },
    {
      key: 'j',
      description: 'Go to Journal',
      category: 'Navigation',
      action: () => navigate('/journal'),
    },
    {
      key: 'a',
      description: 'Go to Archive',
      category: 'Navigation',
      action: () => navigate('/archive'),
    },
    
    // Creation
    {
      key: 'c',
      description: 'Create new card',
      category: 'Creation',
      action: () => setIsCreateModalOpen(true),
    },
    {
      key: 't',
      description: 'Create new task',
      category: 'Creation',
      action: () => {
        navigate('/daily');
        // Trigger task creation modal
        setTimeout(() => {
          const event = new CustomEvent('open-create-task');
          window.dispatchEvent(event);
        }, 100);
      },
    },
    
    // Search & Help
    {
      key: '/',
      ctrl: true,
      description: 'Open search',
      category: 'Search',
      action: () => setIsSearchOpen(true),
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'Help',
      action: () => setIsHelpOpen(true),
    },
    {
      key: 'Escape',
      description: 'Close modals/dialogs',
      category: 'General',
      action: () => {
        setIsHelpOpen(false);
        setIsSearchOpen(false);
        setIsCreateModalOpen(false);
      },
    },
    
    // Quick Actions
    {
      key: 'n',
      alt: true,
      description: 'Focus on next card',
      category: 'Cards',
      action: () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        window.dispatchEvent(event);
      },
    },
    {
      key: 'p',
      alt: true,
      description: 'Focus on previous card',
      category: 'Cards',
      action: () => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(event);
      },
    },
    {
      key: 'Enter',
      ctrl: true,
      description: 'Activate focused card',
      category: 'Cards',
      action: () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
      },
    },
    
    // View Controls
    {
      key: 'v',
      shift: true,
      description: 'Toggle view mode',
      category: 'View',
      action: () => {
        const event = new CustomEvent('toggle-view-mode');
        window.dispatchEvent(event);
      },
    },
    {
      key: 'f',
      shift: true,
      description: 'Toggle fullscreen',
      category: 'View',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      },
    },
    {
      key: 'b',
      ctrl: true,
      description: 'Toggle sidebar',
      category: 'View',
      action: () => {
        const event = new CustomEvent('toggle-sidebar');
        window.dispatchEvent(event);
      },
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.contentEditable === 'true';
    
    // Special case for '?' - allow when Shift is pressed
    if (event.key === '?' && !isTyping) {
      event.preventDefault();
      setIsHelpOpen(true);
      return;
    }
    
    // Skip if typing in an input field (except for Escape and Ctrl+/)
    if (isTyping && event.key !== 'Escape' && !(event.ctrlKey && event.key === '/')) {
      return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = s.alt ? event.altKey : !event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isHelpOpen,
    setIsHelpOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
  };
}

// Format shortcut key combination for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');
  
  // Format special keys
  let key = shortcut.key;
  switch (key) {
    case ' ':
      key = 'Space';
      break;
    case 'ArrowUp':
      key = '↑';
      break;
    case 'ArrowDown':
      key = '↓';
      break;
    case 'ArrowLeft':
      key = '←';
      break;
    case 'ArrowRight':
      key = '→';
      break;
  }
  
  parts.push(key);
  
  return parts.join('+');
}