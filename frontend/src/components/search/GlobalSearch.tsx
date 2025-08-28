import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../ui/SearchBar';
import { Icons } from '../icons/LucideIcons';
import { useCardStore } from '../../store/cardStore';
import { useDailyTaskStore } from '../../store/dailyTaskStore';
import { CardWithTasks, FocusTask, TaskStatus, DailyTaskStatus } from '../../types';
import { cn } from '../../utils/cn';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  id: string;
  type: 'card' | 'focus-task' | 'daily-task';
  title: string;
  description?: string;
  status: string;
  cardId?: string;
  cardTitle?: string;
  tags?: string[];
  matchScore: number;
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cards } = useCardStore();
  const { tasks: dailyTasks } = useDailyTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Calculate search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    
    // Search cards
    cards.forEach(card => {
      const titleMatch = card.title.toLowerCase().includes(query);
      const descMatch = card.description?.toLowerCase().includes(query);
      
      if (titleMatch || descMatch) {
        results.push({
          id: card.id,
          type: 'card',
          title: card.title,
          description: card.description,
          status: card.status,
          matchScore: titleMatch ? 10 : 5,
        });
      }
      
      // Note: Focus tasks search removed as cards don't have focus_tasks in base Card type
      // This would need to be fetched separately from the API if needed
    });
    
    // Search daily tasks
    dailyTasks.forEach(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      
      if (titleMatch) {
        results.push({
          id: task.id,
          type: 'daily-task',
          title: task.title,
          status: task.status,
          matchScore: 7,
        });
      }
    });
    
    // Sort by match score
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }, [searchQuery, cards, dailyTasks]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleSelectResult(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, onClose]);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  const handleSelectResult = (result: SearchResult) => {
    switch (result.type) {
      case 'card':
        navigate(`/card/${result.id}`);
        break;
      case 'focus-task':
        navigate(`/card/${result.cardId}`);
        break;
      case 'daily-task':
        navigate('/daily');
        break;
    }
    onClose();
  };
  
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'card':
        return <Icons.Layers className="w-4 h-4" />;
      case 'focus-task':
        return <Icons.Focus className="w-4 h-4" />;
      case 'daily-task':
        return <Icons.Daily className="w-4 h-4" />;
    }
  };
  
  const getStatusBadge = (status: string, type: SearchResult['type']) => {
    const isCompleted = status === TaskStatus.COMPLETED || status === DailyTaskStatus.COMPLETED;
    const isArchived = status === TaskStatus.ARCHIVED || status === DailyTaskStatus.ARCHIVED;
    const isActive = status === 'active' || status === TaskStatus.ACTIVE;
    
    return (
      <span className={cn(
        'px-2 py-0.5 text-xs font-semibold rounded-full',
        isCompleted && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
        isArchived && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        isActive && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
        !isCompleted && !isArchived && !isActive && 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      )}>
        {status}
      </span>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <SearchBar
                  placeholder="Search cards, tasks, tags..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  autoFocus
                  showShortcut={false}
                />
              </div>
              
              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length === 0 && searchQuery && (
                  <div className="p-8 text-center">
                    <Icons.Search className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}
                
                {searchResults.length === 0 && !searchQuery && (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                      Start typing to search across all your cards and tasks
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                        Try: "Project"
                      </span>
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                        Try: "Meeting"
                      </span>
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                        Try: "Important"
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <motion.button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelectResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full px-4 py-3 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left',
                        selectedIndex === index && 'bg-neutral-50 dark:bg-neutral-800'
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex-shrink-0 mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {result.title}
                          </span>
                          {getStatusBadge(result.status, result.type)}
                        </div>
                        
                        {result.description && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            {result.description}
                          </p>
                        )}
                        
                        {result.cardTitle && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                            in {result.cardTitle}
                          </p>
                        )}
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {result.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {selectedIndex === index && (
                        <div className="flex-shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                          Press Enter
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">Enter</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">Esc</kbd>
                    Close
                  </span>
                </div>
                {searchResults.length > 0 && (
                  <span>{searchResults.length} results</span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};