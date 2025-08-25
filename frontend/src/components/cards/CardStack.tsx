import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { FlippableCard } from './FlippableCard';
import { cn } from '../../utils/cn';

interface CardStackProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  arrangeMode: boolean;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onCardClick,
  arrangeMode
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Number keys to jump to specific cards
      if (key >= '1' && key <= '9') {
        const cardIndex = parseInt(key) - 1;
        if (cardIndex < cards.length) {
          setActiveCardIndex(cardIndex);
        }
      }
      
      // Arrow keys for navigation
      if (key === 'arrowleft' && activeCardIndex > 0) {
        setActiveCardIndex(activeCardIndex - 1);
      }
      if (key === 'arrowright' && activeCardIndex < cards.length - 1) {
        setActiveCardIndex(activeCardIndex + 1);
      }
      
      // Enter to open active card
      if (key === 'enter' && cards[activeCardIndex]) {
        onCardClick(cards[activeCardIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeCardIndex, cards, onCardClick]);

  if (arrangeMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              drag
              dragElastic={0.2}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileDrag={{ scale: 1.05, zIndex: 100 }}
            >
              <GlassCard
                variant={activeCardIndex === index ? "gold" : "default"}
                className={cn(
                  "p-4 h-40 flex flex-col justify-between cursor-move",
                  activeCardIndex === index && "ring-2 ring-primary-gold"
                )}
                onClick={() => {
                  setActiveCardIndex(index);
                  onCardClick(card);
                }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-primary-black mb-1">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {card.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    card.status === 'active' ? 'bg-green-100 text-green-800' :
                    card.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {card.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    #{index + 1}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      {/* Instructions */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-gray-500">
          Use arrow keys or number keys (1-9) to navigate • Enter to open
        </p>
      </motion.div>

      {/* Card Fan Display */}
      <div className="relative" style={{ width: '600px', height: '400px' }}>
        {cards.map((card, index) => (
          <FlippableCard
            key={card.id}
            card={card}
            isActive={index === activeCardIndex}
            index={index}
            totalCards={cards.length}
            onClick={onCardClick}
            onCardSelect={setActiveCardIndex}
          />
        ))}
      </div>
      
      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4">
            <span className="text-6xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Focus Cards Yet
          </h3>
          <p className="text-gray-500">
            Create your first focus card to get started
          </p>
        </motion.div>
      )}

      {/* Card Navigation Dots */}
      {cards.length > 0 && (
        <motion.div 
          className="mt-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCardIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === activeCardIndex 
                  ? "w-8 bg-primary-gold" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};