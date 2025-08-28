import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  showShortcut?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search tasks...',
  value: controlledValue,
  onChange,
  onFocus,
  onBlur,
  className,
  showShortcut = true,
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(controlledValue || '');
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  return (
    <motion.div
      className={cn(
        'relative flex items-center',
        className
      )}
      initial={false}
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn(
        'relative w-full flex items-center',
        'bg-white dark:bg-neutral-900',
        'border-2 rounded-xl',
        'transition-all duration-200',
        isFocused 
          ? 'border-primary-500 shadow-gold-sm' 
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
      )}>
        <Icons.Search className="absolute left-3 w-5 h-5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
        
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-24 py-2.5',
            'bg-transparent',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
            'focus:outline-none',
            'text-sm font-medium'
          )}
        />
        
        {localValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-14 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            type="button"
          >
            <Icons.Close className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </motion.button>
        )}
        
        {showShortcut && (
          <div className="absolute right-3 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded">
              /
            </kbd>
          </div>
        )}
      </div>
    </motion.div>
  );
};