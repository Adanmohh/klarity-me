import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

interface TaskFiltersProps {
  availableTags: string[];
  activeFilters: {
    tags: string[];
    dateRange: { start: Date; end: Date } | null;
  };
  onFiltersChange: (filters: TaskFiltersProps['activeFilters']) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  availableTags,
  activeFilters,
  onFiltersChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toggleTag = (tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter(t => t !== tag)
      : [...activeFilters.tags, tag];
    
    onFiltersChange({
      ...activeFilters,
      tags: newTags
    });
  };

  const applyDateRange = () => {
    if (startDate && endDate) {
      onFiltersChange({
        ...activeFilters,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        }
      });
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    onFiltersChange({
      ...activeFilters,
      dateRange: null
    });
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    onFiltersChange({
      tags: [],
      dateRange: null
    });
  };

  const hasActiveFilters = activeFilters.tags.length > 0 || activeFilters.dateRange !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-primary-gold rounded-full"></span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-4 space-y-4">
              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-primary-black mb-2">
                    Filter by Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          activeFilters.tags.includes(tag)
                            ? 'bg-primary-gold text-primary-black'
                            : 'glass-effect text-gray-600 hover:text-primary-black'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-primary-black mb-2">
                  Filter by Date Range
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1 rounded glass-effect border border-white/20 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1 rounded glass-effect border border-white/20 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={applyDateRange}
                    disabled={!startDate || !endDate}
                  >
                    Apply
                  </Button>
                  {activeFilters.dateRange && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearDateRange}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};