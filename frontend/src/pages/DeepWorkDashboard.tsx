import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/cardStore';
import { Card, FocusTask, TaskLane, TaskStatus } from '../types';
import { Icons } from '../components/icons/LucideIcons';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { focusTasksAPI } from '../services/api';

// Interface for tracking paused cards
interface PausedCardInfo {
  card: Card;
  pausedAt: Date;
  resumeAt: Date;
  pauseDuration: '30min' | '1hr' | 'custom';
}

const DeepWorkDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cards, fetchCards } = useCardStore();
  
  // Focus session state
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeCardTasks, setActiveCardTasks] = useState<FocusTask[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60); // 25 min pomodoro
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  // Card queues with enhanced pause tracking
  const [pausedCards, setPausedCards] = useState<PausedCardInfo[]>([]);
  const [completedCards, setCompletedCards] = useState<Card[]>([]);
  
  // Load cards on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);
  
  // Timer effect
  useEffect(() => {
    if (timerActive && seconds > 0) {
      const interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (seconds === 0) {
      // Pomodoro complete
      setTimerActive(false);
      if (!isOnBreak) {
        // Start break
        setPomodoroCount(p => p + 1);
        const breakTime = pomodoroCount % 4 === 3 ? 15 * 60 : 5 * 60; // Long break every 4 pomodoros
        setSeconds(breakTime);
        setIsOnBreak(true);
        // Play sound or show notification
      } else {
        // Break complete, back to work
        setIsOnBreak(false);
        setSeconds(25 * 60);
      }
    }
  }, [timerActive, seconds, isOnBreak, pomodoroCount]);
  
  // Get queued cards (non-active, non-completed)
  const queuedCards = cards.filter(c => c.status !== 'active' && c.status !== 'completed');
  
  // Format timer display
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartFocus = async (card: Card) => {
    setActiveCard(card);
    setTimerActive(true);
    setSeconds(25 * 60);
    setIsOnBreak(false);
    
    // Load tasks for this card
    try {
      const tasks = await focusTasksAPI.getTasksByCard(card.id);
      setActiveCardTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setActiveCardTasks([]);
    }
  };
  
  const handlePauseCard = (duration: '30min' | '1hr' | 'custom', customMinutes?: number) => {
    if (!activeCard) return;
    
    const now = new Date();
    const minutes = duration === '30min' ? 30 : duration === '1hr' ? 60 : (customMinutes || 120);
    const resumeAt = new Date(now.getTime() + minutes * 60000);
    
    setPausedCards([...pausedCards, {
      card: activeCard,
      pausedAt: now,
      resumeAt: resumeAt,
      pauseDuration: duration
    }]);
    setActiveCard(null);
    setActiveCardTasks([]);
    setTimerActive(false);
    
    // Auto-advance to next card
    if (queuedCards.length > 0) {
      handleStartFocus(queuedCards[0]);
    }
  };
  
  const handleCompleteCard = () => {
    if (!activeCard) return;
    
    setCompletedCards([...completedCards, activeCard]);
    setActiveCard(null);
    setTimerActive(false);
    
    // Auto-advance to next card
    if (queuedCards.length > 0) {
      handleStartFocus(queuedCards[0]);
    }
  };
  
  const handleQuickSwitch = (pausedCardInfo: PausedCardInfo) => {
    if (activeCard) {
      // Pause current card
      const now = new Date();
      setPausedCards([...pausedCards, {
        card: activeCard,
        pausedAt: now,
        resumeAt: new Date(now.getTime() + 30 * 60000), // Default 30min pause
        pauseDuration: '30min'
      }]);
    }
    
    // Remove the card from paused list and start focusing
    setPausedCards(pausedCards.filter(p => p.card.id !== pausedCardInfo.card.id));
    handleStartFocus(pausedCardInfo.card);
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Focus Session Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <GlassCard className="p-8 bg-gradient-to-br from-primary-50 to-yellow-50 dark:from-neutral-900 dark:to-neutral-800">
          {activeCard ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeCard.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeCard.description}
                </p>
                {isOnBreak && (
                  <div className="mt-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg inline-block">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      {pomodoroCount % 4 === 0 ? 'Long Break' : 'Short Break'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-primary-200 dark:border-neutral-700 my-6" />
              
              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                  {formatTime(seconds)}
                </div>
                
                {/* Timer controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant={timerActive ? "secondary" : "primary"}
                    size="lg"
                    onClick={() => setTimerActive(!timerActive)}
                  >
                    {timerActive ? <Icons.Pause /> : <Icons.Play />}
                    {timerActive ? 'Pause' : isOnBreak ? 'Start Break' : 'Start Focus'}
                  </Button>
                  
                  {!isOnBreak && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleCompleteCard}
                    >
                      <Icons.Check />
                      Complete Card
                    </Button>
                  )}
                  
                  {isOnBreak && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        setIsOnBreak(false);
                        setSeconds(25 * 60);
                        setTimerActive(false);
                      }}
                    >
                      Skip Break
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Session Progress</span>
                  <span className="text-gray-900 dark:text-white">
                    Pomodoro {pomodoroCount}/4
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-yellow-500"
                    style={{ width: `${((25 * 60 - seconds) / (25 * 60)) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Task Display with Move Functionality */}
              {!isOnBreak && (
                <div className="mt-6 pt-6 border-t border-primary-200 dark:border-neutral-700">
                  {activeCardTasks.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Lane */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">Main Focus</h4>
                        <div className="space-y-2">
                      {activeCardTasks
                        .filter(t => t.lane === TaskLane.MAIN && t.status !== TaskStatus.COMPLETED)
                        .slice(0, 3)
                        .map(task => (
                          <motion.div 
                            key={task.id} 
                            className="group text-sm text-gray-700 dark:text-gray-300 flex items-start justify-between gap-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800/20"
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{task.title}</span>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  await focusTasksAPI.updateTask(task.id, { lane: TaskLane.CONTROLLER });
                                  setActiveCardTasks(tasks => 
                                    tasks.map(t => t.id === task.id ? {...t, lane: TaskLane.CONTROLLER} : t)
                                  );
                                } catch (error) {
                                  console.error('Failed to move task:', error);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              → Controller
                            </button>
                          </motion.div>
                        ))}
                          {activeCardTasks.filter(t => t.lane === TaskLane.MAIN && t.status !== TaskStatus.COMPLETED).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No main tasks</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Controller Lane */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3">Controller</h4>
                        <div className="space-y-2">
                          {activeCardTasks
                            .filter(t => t.lane === TaskLane.CONTROLLER && t.status !== TaskStatus.COMPLETED)
                            .slice(0, 3)
                            .map(task => (
                              <motion.div 
                                key={task.id} 
                                className="group text-sm text-gray-700 dark:text-gray-300 flex items-start justify-between gap-2 p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-800/20"
                                whileHover={{ x: -2 }}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{task.title}</span>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  await focusTasksAPI.updateTask(task.id, { lane: TaskLane.MAIN });
                                  setActiveCardTasks(tasks => 
                                    tasks.map(t => t.id === task.id ? {...t, lane: TaskLane.MAIN} : t)
                                  );
                                } catch (error) {
                                  console.error('Failed to move task:', error);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                            >
                              Main ←
                            </button>
                          </motion.div>
                            ))}
                          {activeCardTasks.filter(t => t.lane === TaskLane.CONTROLLER && t.status !== TaskStatus.COMPLETED).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No controller tasks</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        This card has no tasks yet. Create tasks in the Focus area first.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/card/${activeCard.id}`)}
                      >
                        Go to Card Details
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Icons.Focus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Active Focus Session
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {queuedCards.length > 0 
                  ? 'Select a card from the queue to start focusing'
                  : 'No cards available. Create cards and tasks in the Focus area first.'}
              </p>
              {queuedCards.length > 0 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleStartFocus(queuedCards[0])}
                >
                  Start with "{queuedCards[0].title}"
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/focus')}
                >
                  Go to Focus Area
                </Button>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
      
      {/* Quick Actions */}
      {activeCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <GlassCard className="p-4">
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => handlePauseCard('30min')}>
                Pause 30min
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handlePauseCard('1hr')}>
                Pause 1hr
              </Button>
              <Button variant="danger" size="sm" onClick={handleCompleteCard}>
                End Session
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
      
      {/* Three columns: Paused, Queue, Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paused Cards */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.Pause className="w-5 h-5 text-orange-500" />
            Paused Cards
          </h3>
          <div className="space-y-3">
            {pausedCards.length > 0 ? (
              pausedCards.map(pausedInfo => {
                const timeRemaining = Math.max(0, Math.floor((pausedInfo.resumeAt.getTime() - new Date().getTime()) / 60000));
                const isReady = timeRemaining <= 0;
                
                return (
                  <motion.div
                    key={pausedInfo.card.id}
                    whileHover={{ scale: isReady ? 1.02 : 1 }}
                    className={`p-3 rounded-lg border ${
                      isReady 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 cursor-pointer' 
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 opacity-75'
                    }`}
                    onClick={() => isReady && handleQuickSwitch(pausedInfo)}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">{pausedInfo.card.title}</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {isReady ? 'Ready to resume' : `Resume in ${timeRemaining} min`}
                    </p>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No paused cards</p>
            )}
          </div>
        </GlassCard>
        
        {/* Card Queue */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.Queue className="w-5 h-5 text-blue-500" />
            Up Next ({queuedCards.length})
          </h3>
          <div className="space-y-3">
            {queuedCards.length > 0 ? (
              queuedCards.slice(0, 5).map((card, index) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer"
                  onClick={() => handleStartFocus(card)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {index + 1}.
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{card.title}</h4>
                        {card.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Start →
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No cards in queue</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/focus')}
                >
                  Browse Cards
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
        
        {/* Completed Cards */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icons.Check className="w-5 h-5 text-green-500" />
            Completed Today
          </h3>
          <div className="space-y-3">
            {completedCards.length > 0 ? (
              completedCards.map(card => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white line-through">
                    {card.title}
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Completed
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No completions yet</p>
            )}
          </div>
          
          {completedCards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Today: {completedCards.length} cards completed
              </p>
            </div>
          )}
        </GlassCard>
      </div>
      
      {/* Focus Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <GlassCard className="p-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedCards.length > 0 
                  ? Math.round((pomodoroCount / (pomodoroCount + pausedCards.length)) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Focus Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedCards.length > 0 
                  ? `↑${Math.round((completedCards.length / (completedCards.length + queuedCards.length)) * 100)}%`
                  : '0%'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Velocity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {pomodoroCount > 0 ? `${Math.floor(pomodoroCount / 4)}` : '0'} days
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pomodoroCount > 0 
                  ? `${Math.round((pomodoroCount * 25) / completedCards.length || 25)} min`
                  : '0 min'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export { DeepWorkDashboard };