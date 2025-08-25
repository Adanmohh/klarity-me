import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks } from '../../types';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { FocusArea } from './FocusArea';
import { DailyTasksArea } from './DailyTasksArea';
import { CardControls } from './CardControls';

interface CardWorkspaceProps {
  card: CardWithTasks;
  onClose: () => void;
}

export const CardWorkspace: React.FC<CardWorkspaceProps> = ({
  card,
  onClose
}) => {
  const [currentArea, setCurrentArea] = useState<'focus' | 'daily'>('focus');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Card Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-black mb-2">
              {card.title}
            </h1>
            {card.description && (
              <p className="text-gray-600">
                {card.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-primary-black"
          >
            ← Back to Cards
          </Button>
        </div>

        <CardControls card={card} />
      </GlassCard>

      {/* Area Toggle */}
      <div className="flex justify-center">
        <div className="glass-effect rounded-lg p-1 inline-flex">
          <Button
            variant={currentArea === 'focus' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCurrentArea('focus')}
            className="rounded-md"
          >
            Focus Area
          </Button>
          <Button
            variant={currentArea === 'daily' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCurrentArea('daily')}
            className="rounded-md"
          >
            Daily Tasks
          </Button>
        </div>
      </div>

      {/* Current Area */}
      <motion.div
        key={currentArea}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentArea === 'focus' ? (
          <FocusArea card={card} />
        ) : (
          <DailyTasksArea card={card} />
        )}
      </motion.div>
    </motion.div>
  );
};