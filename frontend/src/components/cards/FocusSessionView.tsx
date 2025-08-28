import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardWithTasks } from '../../types';
import { FocusArea } from '../workspace/FocusArea';
import { Icons } from '../icons/LucideIcons';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { cardsAPI, focusTasksAPI } from '../../services/api';

type SessionState = 'active' | 'paused' | 'ended';

interface FocusSessionViewProps {
  card: Card;
  onEndSession: (whereLeftOff?: string) => void;
  onCompleteCard: () => void;
}

export const FocusSessionView: React.FC<FocusSessionViewProps> = ({ 
  card, 
  onEndSession,
  onCompleteCard 
}) => {
  const [cardWithTasks, setCardWithTasks] = useState<CardWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('active');
  const [whereLeftOff, setWhereLeftOff] = useState('');
  const [sessionStartTime] = useState(new Date());
  
  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Use cardsAPI.getCard which returns the card with tasks included
        const cardData = await cardsAPI.getCard(card.id);
        setCardWithTasks(cardData);
      } catch (error) {
        console.error('Failed to load card with tasks:', error);
        // Even on error, set the card with empty tasks
        setCardWithTasks({
          ...card,
          focus_tasks: [],
          daily_tasks: []
        });
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [card]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && sessionState === 'active' && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Timer finished
      if (isOnBreak) {
        // Break finished, start new pomodoro
        setSeconds(25 * 60);
        setIsOnBreak(false);
        setTimerActive(false);
      } else {
        // Pomodoro finished
        setPomodoroCount(count => count + 1);
        // Auto start break
        const isLongBreak = (pomodoroCount + 1) % 4 === 0;
        setSeconds(isLongBreak ? 15 * 60 : 5 * 60);
        setIsOnBreak(true);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, seconds, sessionState, isOnBreak, pomodoroCount]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60);
      setSessionMinutes(elapsed);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Navigation lock warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionState === 'active') {
        e.preventDefault();
        e.returnValue = 'You have an active focus session. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionState]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSessionClick = () => {
    const leftOff = prompt('What were you working on? (optional)');
    setSessionState('ended');
    onEndSession(leftOff || undefined);
  };

  const handleSessionPause = () => {
    setSessionState('paused');
    setTimerActive(false);
  };

  const handleResume = () => {
    setSessionState('active');
  };

  // Minimal timer display component
  const TimerBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Card title and session info */}
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {card.title}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Session #{card.sessions_count + 1}
            </span>
            {sessionState === 'paused' && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                PAUSED
              </span>
            )}
          </div>

          {/* Right: Timer and controls */}
          <div className="flex items-center gap-3">
            {/* Pomodoro dots */}
            {pomodoroCount > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(Math.min(pomodoroCount, 4))].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary-500" />
                ))}
                {pomodoroCount > 4 && (
                  <span className="text-xs text-gray-500 ml-1">+{pomodoroCount - 4}</span>
                )}
              </div>
            )}

            {/* Timer display */}
            <div className={`text-2xl font-mono font-bold ${isOnBreak ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(seconds)}
            </div>
            
            {/* Timer control */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimerActive(!timerActive)}
              disabled={sessionState === 'paused'}
            >
              {timerActive ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
            </Button>

            {/* Session controls */}
            <div className="flex items-center gap-1 pl-3 border-l border-gray-300 dark:border-gray-700">
              {sessionState === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSessionPause}
                  title="Pause Session"
                >
                  <Icons.Pause className="w-4 h-4" />
                </Button>
              )}
              {sessionState === 'paused' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResume}
                >
                  Resume
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndSessionClick}
                title="End Session"
              >
                <Icons.Close className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCompleteCard}
                title="Complete Card"
              >
                <Icons.Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Minimal timer bar at top */}
      <TimerBar />
      
      {/* Main focus area - TASKS are the primary focus */}
      <div className="pt-16 h-screen">
        {cardWithTasks ? (
          <FocusArea card={cardWithTasks} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GlassCard className="text-center p-8">
              <Icons.Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Tasks Yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add tasks to start working on this card
              </p>
              <Button variant="primary" onClick={() => {/* TODO: Add task */}}>
                Add Your First Task
              </Button>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Break overlay - appears on top of tasks */}
      {isOnBreak && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <Icons.Coffee className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Break Time!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {seconds > 5 * 60 ? 'Long break' : 'Short break'} - {formatTime(seconds)}
            </p>
            <Button variant="ghost" onClick={() => setIsOnBreak(false)}>
              Skip Break
            </Button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};