import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks, CardStatus } from '../../types';
import { Button } from '../ui/Button';
import { cardsAPI } from '../../services/api';

interface CardControlsProps {
  card: CardWithTasks;
}

export const CardControls: React.FC<CardControlsProps> = ({ card }) => {
  const [isPaused, setIsPaused] = useState(card.status === CardStatus.PAUSED);
  const [pauseDuration, setPauseDuration] = useState('1');
  const [pauseUnit, setPauseUnit] = useState<'hours' | 'days'>('hours');
  const [loading, setLoading] = useState(false);

  const handlePause = async () => {
    setLoading(true);
    try {
      const hours = pauseUnit === 'hours' ? parseInt(pauseDuration) : parseInt(pauseDuration) * 24;
      const pauseUntil = new Date();
      pauseUntil.setHours(pauseUntil.getHours() + hours);

      await cardsAPI.updateCard(card.id, {
        status: CardStatus.PAUSED,
        pause_until: pauseUntil.toISOString()
      });
      
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await cardsAPI.updateCard(card.id, {
        status: CardStatus.ACTIVE,
        pause_until: undefined
      });
      
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 glass-effect rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPaused 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isPaused ? 'Paused' : 'Active'}
        </div>
        
        {card.pause_until && isPaused && (
          <span className="text-sm text-gray-600">
            Until: {new Date(card.pause_until).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {!isPaused ? (
          <>
            <div className="flex items-center space-x-2">
              <select
                value={pauseDuration}
                onChange={(e) => setPauseDuration(e.target.value)}
                className="px-2 py-1 rounded glass-effect border border-white/20 text-sm"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              
              <select
                value={pauseUnit}
                onChange={(e) => setPauseUnit(e.target.value as 'hours' | 'days')}
                className="px-2 py-1 rounded glass-effect border border-white/20 text-sm"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePause}
              disabled={loading}
            >
              {loading ? 'Pausing...' : 'Pause'}
            </Button>
          </>
        ) : (
          <Button
            variant="gold"
            size="sm"
            onClick={handleResume}
            disabled={loading}
          >
            {loading ? 'Resuming...' : 'Resume'}
          </Button>
        )}
      </div>
    </div>
  );
};