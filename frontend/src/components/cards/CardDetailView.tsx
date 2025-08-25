import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeftIcon } from '../icons/Icons';

interface CardDetailViewProps {
  card: Card;
  onBack: () => void;
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({ card, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-primary-black transition-colors"
          whileHover={{ x: -4 }}
        >
          <ChevronLeftIcon />
          <span className="font-medium">Back to Cards</span>
        </motion.button>

        {/* Card Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-primary-black mb-2">
                  {card.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {card.description || 'No description available'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                card.status === 'active' ? 'bg-green-100 text-green-800' :
                card.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {card.status}
              </span>
            </div>

            {/* Two-Lane Task System */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div>
                <h2 className="text-xl font-bold text-primary-black mb-4">Controller Lane</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-center">No tasks yet</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-black mb-4">Main Lane</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-center">No tasks yet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button variant="primary">Add Task</Button>
              <Button variant="ghost">Edit Card</Button>
              <Button variant="ghost">Archive</Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};