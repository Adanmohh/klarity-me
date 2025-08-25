import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon } from '../icons/Icons';
import { cn } from '../../utils/cn';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
  category?: string;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  commands, 
  isOpen, 
  onClose 
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-primary-white rounded-2xl shadow-2xl overflow-hidden z-[101]"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 text-lg font-medium text-primary-black placeholder-gray-400 outline-none bg-transparent"
                />
                <kbd className="px-2 py-1 text-xs font-bold text-gray-500 bg-gray-100 rounded">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-4">
                  <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {category}
                  </div>
                  {cmds.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <motion.button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isSelected 
                            ? "bg-primary-black text-primary-white" 
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                        whileHover={{ x: 4 }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        {cmd.icon && (
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-primary-gold text-primary-black" : "bg-gray-100"
                          )}>
                            {cmd.icon}
                          </div>
                        )}
                        <span className="flex-1 text-left font-medium">
                          {cmd.label}
                        </span>
                        {cmd.shortcut && (
                          <kbd className={cn(
                            "px-2 py-1 text-xs font-bold rounded",
                            isSelected 
                              ? "bg-primary-gold text-primary-black" 
                              : "bg-gray-100 text-gray-500"
                          )}>
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No commands found</p>
                  <p className="text-sm text-gray-300 mt-2">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
                  to select
                </span>
              </div>
              <span className="font-medium">
                {filteredCommands.length} results
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};