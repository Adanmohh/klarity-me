import React from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks } from '../../types';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { FocusArea } from './FocusArea';
import { CardControls } from './CardControls';

interface ProjectWorkspaceProps {
  card: CardWithTasks;
  onClose: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
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
      {/* Project Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Project</span>
              <span className="px-3 py-1 bg-primary-gold/20 text-primary-gold rounded-full text-xs font-medium">
                Focus Mode
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary-black mb-2">
              {card.title}
            </h1>
            {card.description && (
              <p className="text-gray-600 text-lg">
                {card.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-primary-black"
          >
            ← Back to Stack
          </Button>
        </div>

        <CardControls card={card} />
      </GlassCard>

      {/* Project Tasks (Two-Lane System) */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-black mb-2">
            Project Task Management
          </h2>
          <p className="text-gray-600">
            Organize and track all tasks for this project
          </p>
        </div>
        
        <FocusArea card={card} />
      </div>
    </motion.div>
  );
};