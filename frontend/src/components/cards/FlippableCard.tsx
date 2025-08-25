import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '../../utils/cn';

interface FlippableCardProps {
  card: Card;
  isActive: boolean;
  index: number;
  totalCards: number;
  onClick: (card: Card) => void;
  onCardSelect: (index: number) => void;
}

export const FlippableCard: React.FC<FlippableCardProps> = ({
  card,
  isActive,
  index,
  totalCards,
  onClick,
  onCardSelect
}) => {
  // Calculate position in the fan
  const fanSpread = Math.min(400, totalCards * 60); // Dynamic spread based on card count
  const angleSpread = Math.min(30, totalCards * 3); // Total rotation in degrees
  const centerIndex = (totalCards - 1) / 2;
  const offsetFromCenter = index - centerIndex;
  
  // Position calculations
  const xOffset = offsetFromCenter * (fanSpread / totalCards);
  const rotation = offsetFromCenter * (angleSpread / totalCards);
  const yOffset = Math.abs(offsetFromCenter) * 15; // Cards further from center are lower
  const scale = isActive ? 1.1 : 0.9 - (Math.abs(offsetFromCenter) * 0.03);
  const zIndex = isActive ? 100 : 50 - Math.abs(offsetFromCenter);

  const handleClick = () => {
    if (isActive) {
      // Play click sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      onClick(card);
    } else {
      // Allow clicking on non-active cards to select them
      onCardSelect(index);
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        zIndex,
      }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: 1,
        x: xOffset,
        y: isActive ? -30 : yOffset,
        rotateZ: rotation,
        scale,
      }}
      whileHover={isActive ? { scale: 1.15, y: -40 } : { scale: scale + 0.05 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      onClick={handleClick}
    >
      <div className="relative w-80 h-48">
        <GlassCard 
          variant={isActive ? "gold" : "default"}
          className={cn(
            "w-full h-full p-6 flex flex-col transition-all duration-300",
            isActive 
              ? "cursor-pointer shadow-2xl border-2 border-primary-gold" 
              : "cursor-pointer opacity-70 hover:opacity-85",
          )}
        >
          {/* Glow effect for active card */}
          {isActive && (
            <motion.div 
              className="absolute -inset-6 bg-gradient-to-r from-primary-gold to-yellow-400 opacity-30 blur-2xl rounded-xl"
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
          
          <div className="flex-1 relative z-10">
            <div className="flex items-start justify-between mb-2">
              <h3 className={cn(
                "text-xl font-bold",
                isActive ? "text-primary-black" : "text-gray-600"
              )}>
                {card.title}
              </h3>
              {isActive && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl"
                >
                  ⭐
                </motion.div>
              )}
            </div>
            {card.description && (
              <p className={cn(
                "text-sm line-clamp-2",
                isActive ? "text-gray-600" : "text-gray-500"
              )}>
                {card.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                !isActive && "opacity-70",
                card.status === 'active' ? 'bg-green-100 text-green-800' :
                card.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {card.status}
              </span>
              <span className={cn(
                "text-xs",
                isActive ? "text-gray-500" : "text-gray-400"
              )}>
                Card {index + 1} of {totalCards}
              </span>
            </div>
            
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-xs text-primary-gold font-medium">
                  Click to open • Press {index + 1} to jump here
                </p>
              </motion.div>
            )}
            
            {!isActive && (
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Click to select • Press {index + 1} to jump
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};