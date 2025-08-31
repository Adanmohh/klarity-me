import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Circle, Flame, Clock, Plus, X, Settings, Bell, BellOff, 
  CheckCircle, AlertCircle, Zap, RotateCcw, Info
} from 'lucide-react';

// Import the new services
import NotificationService from '../../services/notificationService';
import AutoCheckService, { AutoCheckEvent } from '../../services/autoCheckService';
import DailyResetService, { ResetEvent } from '../../services/dailyResetService';
import HabitSettings from './HabitSettings';

interface Habit {
  id: number;
  name: string;
  scheduled_time: string;
  quality_name: string;
  completed: boolean;
  streak: number;
  notificationEnabled?: boolean;
  reminderOffset?: number;
  autoCheckEnabled?: boolean;
  autoCheckWindowMinutes?: number;
  completedAt?: string;
  lastAutoCheck?: AutoCheckEvent;
}

interface HabitTrackerProps {
  userId: string;
  onHabitComplete: (habitId: number, qualityName: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ userId, onHabitComplete }) => {
  // State
  const [habits, setHabits] = useState<Habit[]>([
    { 
      id: 1, 
      name: 'Morning Power Statement', 
      scheduled_time: '06:00', 
      quality_name: 'Mental Power', 
      completed: false, 
      streak: 0,
      notificationEnabled: true,
      reminderOffset: 5,
      autoCheckEnabled: false,
      autoCheckWindowMinutes: 30,
    },
    { 
      id: 2, 
      name: 'Success Visualization', 
      scheduled_time: '06:30', 
      quality_name: 'Success Mindset', 
      completed: false, 
      streak: 0,
      notificationEnabled: true,
      reminderOffset: 10,
      autoCheckEnabled: false,
      autoCheckWindowMinutes: 45,
    },
    { 
      id: 3, 
      name: 'Midday Affirmation', 
      scheduled_time: '12:00', 
      quality_name: 'Confidence', 
      completed: false, 
      streak: 0,
      notificationEnabled: true,
      autoCheckEnabled: true,
      autoCheckWindowMinutes: 60,
    },
    { 
      id: 4, 
      name: 'Evening Gratitude', 
      scheduled_time: '21:00', 
      quality_name: 'Abundance', 
      completed: false, 
      streak: 0,
      notificationEnabled: true,
      autoCheckEnabled: false,
    },
    { 
      id: 5, 
      name: 'Sleep Programming', 
      scheduled_time: '22:30', 
      quality_name: 'Subconscious Power', 
      completed: false, 
      streak: 0,
      notificationEnabled: false,
      autoCheckEnabled: false,
    },
  ]);
  
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', time: '', quality: '' });
  const [pendingAutoChecks, setPendingAutoChecks] = useState<Map<number, AutoCheckEvent>>(new Map());
  const [showAutoCheckAlert, setShowAutoCheckAlert] = useState(false);
  const [lastResetInfo, setLastResetInfo] = useState<ResetEvent | null>(null);

  // Service instances
  const notificationService = NotificationService.getInstance();
  const autoCheckService = AutoCheckService.getInstance();
  const dailyResetService = DailyResetService.getInstance();

  // Initialize services and event listeners
  useEffect(() => {
    const initializeServices = async () => {
      // Schedule notifications for existing habits
      await notificationService.scheduleHabitNotifications(habits);
      
      // Set up event listeners
      const handleNotificationClicked = (event: CustomEvent) => {
        const { habitId } = event.detail;
        // Focus on the clicked habit or show a highlight animation
        highlightHabit(habitId);
      };

      const handleAutoCheckComplete = (event: CustomEvent) => {
        const { habitId } = event.detail;
        completeHabitFromAutoCheck(habitId);
      };

      const handleDailyReset = (event: CustomEvent) => {
        performDailyReset();
      };

      const handleAutoCheck = (event: CustomEvent) => {
        const { habitId } = event.detail;
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          showAutoCheckConfirmation(habit);
        }
      };

      // Add event listeners with type casting
      window.addEventListener('habitNotificationClicked', handleNotificationClicked as EventListener);
      window.addEventListener('autoCheckHabit', handleAutoCheckComplete as EventListener);
      window.addEventListener('dailyResetTime', handleDailyReset as EventListener);
      window.addEventListener('habitAutoCheck', handleAutoCheck as EventListener);

      // Cleanup function
      return () => {
        window.removeEventListener('habitNotificationClicked', handleNotificationClicked as EventListener);
        window.removeEventListener('autoCheckHabit', handleAutoCheckComplete as EventListener);
        window.removeEventListener('dailyResetTime', handleDailyReset as EventListener);
        window.removeEventListener('habitAutoCheck', handleAutoCheck as EventListener);
      };
    };

    initializeServices();

    // Check for pending auto-checks periodically
    const autoCheckInterval = setInterval(() => {
      checkForAutoChecks();
    }, 60000); // Check every minute

    // Check if daily reset is needed
    if (dailyResetService.needsReset(habits)) {
      performDailyReset();
    }

    return () => {
      clearInterval(autoCheckInterval);
    };
  }, [habits]);

  const highlightHabit = (habitId: number) => {
    // Add a visual highlight effect to the habit
    const element = document.getElementById(`habit-${habitId}`);
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        element.classList.remove('animate-pulse');
      }, 2000);
    }
  };

  const checkForAutoChecks = async () => {
    for (const habit of habits) {
      if (habit.completed || !habit.autoCheckEnabled) continue;

      try {
        const autoCheckEvent = await autoCheckService.evaluateHabitForAutoCheck(habit);
        if (autoCheckEvent) {
          if (autoCheckService.getSettings().requireUserConsent) {
            setPendingAutoChecks(prev => new Map(prev.set(habit.id, autoCheckEvent)));
            setShowAutoCheckAlert(true);
          } else {
            // Auto-complete without confirmation
            completeHabitFromAutoCheck(habit.id, autoCheckEvent);
          }
        }
      } catch (error) {
        console.error(`Error checking auto-check for habit ${habit.id}:`, error);
      }
    }
  };

  const showAutoCheckConfirmation = (habit: Habit) => {
    if (window.confirm(`Auto-check detected for "${habit.name}". Mark as completed?`)) {
      completeHabitFromAutoCheck(habit.id);
    }
  };

  const completeHabitFromAutoCheck = async (habitId: number, event?: AutoCheckEvent) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.completed) return;

    // Complete the habit
    toggleHabit(habitId, 'auto');
    
    // Record auto-check event
    if (event) {
      await autoCheckService.processAutoCheck(event);
    }
    
    // Record completion for learning
    autoCheckService.recordHabitCompletion(habit, new Date(), false);
    
    // Remove from pending auto-checks
    setPendingAutoChecks(prev => {
      const newPending = new Map(prev);
      newPending.delete(habitId);
      return newPending;
    });
  };

  const performDailyReset = async () => {
    try {
      const resetEvent = await dailyResetService.performDailyReset(habits);
      setLastResetInfo(resetEvent);
      
      // Reset habit states
      setHabits(prev => prev.map(habit => ({
        ...habit,
        completed: false,
        completedAt: undefined,
      })));

      // Reschedule notifications
      await notificationService.scheduleHabitNotifications(habits);
      
      console.log('Daily reset completed:', resetEvent);
    } catch (error) {
      console.error('Failed to perform daily reset:', error);
    }
  };

  const toggleHabit = (habitId: number, source: 'manual' | 'auto' = 'manual') => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completed;
        const completedAt = newCompleted ? new Date().toISOString() : undefined;
        
        if (newCompleted) {
          onHabitComplete(habitId, habit.quality_name);
          
          // Record completion for learning (if manual)
          if (source === 'manual') {
            autoCheckService.recordHabitCompletion(habit, new Date(), true);
          }
        }
        
        return { 
          ...habit, 
          completed: newCompleted,
          completedAt,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    }));
  };

  const updateHabit = (habitId: number, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId ? { ...habit, ...updates } : habit
    ));
    
    // Reschedule notifications if notification settings changed
    if (updates.notificationEnabled !== undefined || updates.reminderOffset !== undefined) {
      notificationService.scheduleHabitNotifications(habits);
    }
  };

  const addNewHabit = async () => {
    if (newHabit.name && newHabit.time && newHabit.quality) {
      const habit: Habit = {
        id: Date.now(),
        name: newHabit.name,
        scheduled_time: newHabit.time,
        quality_name: newHabit.quality,
        completed: false,
        streak: 0,
        notificationEnabled: true,
        reminderOffset: 5,
        autoCheckEnabled: false,
        autoCheckWindowMinutes: 30,
      };
      
      const newHabits = [...habits, habit];
      setHabits(newHabits);
      setNewHabit({ name: '', time: '', quality: '' });
      setShowAddHabit(false);
      
      // Schedule notification for new habit
      await notificationService.scheduleHabitNotifications(newHabits);
    }
  };

  const removeHabit = (habitId: number) => {
    if (window.confirm('Are you sure you want to remove this habit?')) {
      setHabits(habits.filter(h => h.id !== habitId));
      notificationService.cancelHabitReminder(habitId);
    }
  };

  const confirmPendingAutoCheck = (habitId: number, confirmed: boolean) => {
    const event = pendingAutoChecks.get(habitId);
    if (event) {
      if (confirmed) {
        completeHabitFromAutoCheck(habitId, event);
      }
      
      // Remove from pending
      setPendingAutoChecks(prev => {
        const newPending = new Map(prev);
        newPending.delete(habitId);
        return newPending;
      });
      
      // Hide alert if no more pending
      if (pendingAutoChecks.size <= 1) {
        setShowAutoCheckAlert(false);
      }
    }
  };

  // Calculate stats
  const completedCount = habits.filter(h => h.completed).length;
  const completionPercentage = (completedCount / habits.length) * 100;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const notificationCount = habits.filter(h => h.notificationEnabled !== false).length;
  const autoCheckCount = habits.filter(h => h.autoCheckEnabled).length;

  return (
    <div className="space-y-4">
      {/* Auto-Check Alert */}
      <AnimatePresence>
        {showAutoCheckAlert && pendingAutoChecks.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Auto-Check Suggestions</h4>
              </div>
              <button
                onClick={() => setShowAutoCheckAlert(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {Array.from(pendingAutoChecks.entries()).map(([habitId, event]) => (
                <div key={habitId} className="flex items-center justify-between bg-white rounded p-3">
                  <div>
                    <p className="font-medium">{event.habitName}</p>
                    <p className="text-sm text-gray-600">{event.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmPendingAutoCheck(habitId, false)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => confirmPendingAutoCheck(habitId, true)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Today's Habits</h3>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  {completedCount}/{habits.length}
                </span>
                {completedCount === habits.length && (
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {totalStreak > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {totalStreak} total streak
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {notificationCount} with alerts
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {autoCheckCount} auto-check
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Reset Info */}
      <AnimatePresence>
        {lastResetInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Daily reset completed! Yesterday: {lastResetInfo.totalHabitsCompleted}/{lastResetInfo.habitsReset} 
                  ({lastResetInfo.completionRate.toFixed(0)}%)
                </span>
              </div>
              <button
                onClick={() => setLastResetInfo(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-2">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            id={`habit-${habit.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/90 backdrop-blur-sm rounded-lg p-3 border transition-all ${
              habit.completed 
                ? 'border-green-300 bg-green-50/50' 
                : 'border-purple-100 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="transition-transform hover:scale-110"
                >
                  {habit.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Check className="w-6 h-6 text-green-500" />
                    </motion.div>
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div>
                  <p className={`font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {habit.scheduled_time}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {habit.quality_name}
                    </span>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-3 h-3" />
                        {habit.streak} day streak
                      </span>
                    )}
                    {habit.notificationEnabled !== false && (
                      <Bell className="w-3 h-3 text-blue-500" />
                    )}
                    {habit.autoCheckEnabled && (
                      <Zap className="w-3 h-3 text-green-500" />
                    )}
                    {pendingAutoChecks.has(habit.id) && (
                      <AlertCircle className="w-3 h-3 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeHabit(habit.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Habit Button/Form */}
      {!showAddHabit ? (
        <button
          onClick={() => setShowAddHabit(true)}
          className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Habit
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-purple-200"
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Habit name"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={newHabit.time}
                onChange={(e) => setNewHabit({ ...newHabit, time: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newHabit.quality}
                onChange={(e) => setNewHabit({ ...newHabit, quality: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Quality</option>
                <option value="Discipline">Discipline</option>
                <option value="Focus">Focus</option>
                <option value="Health">Health</option>
                <option value="Spirituality">Spirituality</option>
                <option value="Knowledge">Knowledge</option>
                <option value="Gratitude">Gratitude</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addNewHabit}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Add Habit
              </button>
              <button
                onClick={() => {
                  setShowAddHabit(false);
                  setNewHabit({ name: '', time: '', quality: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <HabitSettings
            habits={habits}
            onUpdateHabit={updateHabit}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;