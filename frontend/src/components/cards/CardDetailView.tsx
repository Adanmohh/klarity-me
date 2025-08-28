import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardWithTasks } from '../../types';
import { FocusArea } from '../workspace/FocusArea';
import { ArrowLeft } from 'lucide-react';
import { cardsAPI, focusTasksAPI } from '../../services/api';

interface CardDetailViewProps {
  card: Card;
  onBack: () => void;
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({ card, onBack }) => {
  const [cardWithTasks, setCardWithTasks] = useState<CardWithTasks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch card with tasks
    const loadCardWithTasks = async () => {
      try {
        // Use cardsAPI.getCard which returns the card with tasks included
        const cardData = await cardsAPI.getCard(card.id);
        setCardWithTasks(cardData);
      } catch (error) {
        console.error('Failed to load card with tasks:', error);
        // Even on error, set the card with empty tasks
        setCardWithTasks({
          ...card,
          focus_tasks: []
        });
      } finally {
        setLoading(false);
      }
    };
    loadCardWithTasks();
  }, [card]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!cardWithTasks) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Unable to load card details</p>
        <button onClick={onBack} className="mt-4 text-primary-500 hover:text-primary-600">
          Back to Focus Area
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Focus Area</span>
        </motion.button>

        {/* Card Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {card.title}
              </h1>
              {card.description && (
                <p className="text-lg text-gray-600">
                  {card.description}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              card.status === 'active' ? 'bg-green-100 text-green-800' :
              card.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {card.status}
            </span>
          </div>
        </div>

        {/* Focus Area with Task Management */}
        <FocusArea card={cardWithTasks} />
      </div>
    </div>
  );
};