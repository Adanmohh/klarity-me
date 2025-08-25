import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../types';
import { cn } from '../../utils/cn';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

interface CardCarouselProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ cards, onCardClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const goToCard = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Enter' && cards[currentIndex]) {
        onCardClick(cards[currentIndex]);
      }
      // Number keys
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= cards.length) {
        goToCard(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, cards]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(goToNext, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, currentIndex]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <span className="text-6xl opacity-50">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-primary-black mb-2">No Cards Yet</h3>
          <p className="text-gray-500">Create your first focus card to get started</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4">
      {/* Main Carousel Container */}
      <div className="relative h-[500px] overflow-hidden" ref={containerRef}>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={card.id}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: `${offset * 320}px`,
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.6,
                    zIndex: isActive ? 10 : 5 - Math.abs(offset),
                    rotateY: offset * -5,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{
                    perspective: "1000px",
                  }}
                >
                  <motion.div
                    className={cn(
                      "w-[320px] h-[420px] rounded-2xl p-8",
                      "bg-primary-white border-2 transition-all duration-300",
                      isActive 
                        ? "border-primary-gold shadow-2xl cursor-pointer" 
                        : "border-gray-200 shadow-lg"
                    )}
                    onClick={() => isActive ? onCardClick(card) : goToCard(index)}
                    whileHover={isActive ? { 
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                    } : {}}
                    onHoverStart={() => setIsAutoPlaying(false)}
                    onHoverEnd={() => setIsAutoPlaying(true)}
                  >
                    {/* Card Number Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary-gold to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-primary-black font-bold text-lg">{index + 1}</span>
                    </div>

                    {/* Card Content */}
                    <div className="h-full flex flex-col">
                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={cn(
                          "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          card.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : card.status === 'paused' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        )}>
                          {card.status}
                        </span>
                      </div>

                      {/* Title with Typewriter Effect */}
                      <motion.h2 
                        className="text-3xl font-bold text-primary-black mb-4 leading-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {card.title}
                      </motion.h2>

                      {/* Description */}
                      {card.description && (
                        <p className="text-gray-600 mb-6 flex-1 line-clamp-4">
                          {card.description}
                        </p>
                      )}

                      {/* Progress Indicator */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-bold text-primary-black">75%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary-gold to-yellow-500"
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Action Text */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-6 text-center"
                        >
                          <p className="text-sm font-medium text-primary-gold">
                            Click to open • Press Enter
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-white border-2 border-primary-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-white border-2 border-primary-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {cards.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToCard(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "w-8 bg-primary-gold" 
                : "w-2 bg-gray-300 hover:bg-gray-400"
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-gray-400">
          Use ← → arrow keys to navigate • Press 1-9 to jump to card
        </p>
      </motion.div>
    </div>
  );
};