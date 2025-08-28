import React from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks } from '../../types';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { FocusArea } from './FocusArea';
import { CardControls } from './CardControls';

interface CardWorkspaceProps {
  card: CardWithTasks;
  onClose: () => void;
}

export const CardWorkspace: React.FC<CardWorkspaceProps> = ({
  card,
  onClose
}) => {
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

      {/* Focus Area with tasks */}
      <FocusArea card={card} />
    </motion.div>
  );
};