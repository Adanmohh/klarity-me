import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle, Circle, Trophy, Star, Zap, Target, 
  Calendar, TrendingUp, Clock, ChevronRight, Sparkles,
  Award, X, Edit2, Trash2
} from 'lucide-react';
import { habitsAPI } from '../services/api';

interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    target_days?: number;
    specific_days?: number[];
  };
  tiny_habit_option?: string;
  lane: 'becoming' | 'i_am';
  required_days: number;
  current_day: number;
  missed_days: number;
  grace_days_used: number;
  longest_streak: number;
  current_streak: number;
  total_completions: number;
  last_check_in?: string;
  graduation_date?: string;
}

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (habitId: string, completed: boolean, tinyUsed: boolean) => void;
  onGraduate: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  onCheckIn, 
  onGraduate, 
  onEdit, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);
  const progressPercentage = (habit.current_day / habit.required_days) * 100;
  const canGraduate = habit.current_day >= 21 && habit.lane === 'becoming';
  
  const todayCheckedIn = habit.last_check_in && 
    new Date(habit.last_check_in).toDateString() === new Date().toDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`relative p-4 rounded-lg shadow-sm border ${
        habit.lane === 'i_am' 
          ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Graduation Ready Badge */}
      {canGraduate && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center"
        >
          <Trophy className="h-3 w-3 mr-1" />
          Ready!
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {habit.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
          </button>
          {showActions && (
            <button
              onClick={() => onDelete(habit.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Frequency Badge */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 text-xs rounded-full ${
          habit.frequency.type === 'daily' 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : habit.frequency.type === 'weekly'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        }`}>
          {habit.frequency.type === 'daily' ? 'Daily' :
           habit.frequency.type === 'weekly' ? 'Weekly' :
           `${habit.frequency.target_days} days/week`}
        </span>
        {habit.tiny_habit_option && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Tiny: {habit.tiny_habit_option}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Day {habit.current_day}</span>
          <span>{habit.required_days} days required</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            className={`h-2 rounded-full ${
              habit.lane === 'i_am'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
          <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-center">
            <Zap className="h-3 w-3 mr-1 text-yellow-500" />
            {habit.current_streak}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
          <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-center">
            <Star className="h-3 w-3 mr-1 text-orange-500" />
            {habit.longest_streak}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {habit.total_completions}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {habit.lane === 'becoming' && !todayCheckedIn && (
          <>
            <button
              onClick={() => onCheckIn(habit.id, true, false)}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </button>
            {habit.tiny_habit_option && (
              <button
                onClick={() => onCheckIn(habit.id, true, true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Complete tiny version"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onCheckIn(habit.id, false, false)}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
        
        {habit.lane === 'becoming' && todayCheckedIn && (
          <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-center">
            ✓ Checked in today
          </div>
        )}

        {canGraduate && (
          <button
            onClick={() => onGraduate(habit.id)}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Graduate
          </button>
        )}

        {habit.lane === 'i_am' && (
          <div className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-center font-medium">
            <Award className="h-4 w-4 inline mr-1" />
            Graduated {habit.graduation_date && 
              new Date(habit.graduation_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Habits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState<{
    title: string;
    description: string;
    frequency: { type: 'daily' | 'weekly' | 'custom' };
    tiny_habit_option: string;
  }>({
    title: '',
    description: '',
    frequency: { type: 'daily' },
    tiny_habit_option: ''
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitsAPI.getAll();
      setHabits(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId: string, completed: boolean, tinyUsed: boolean) => {
    try {
      await habitsAPI.checkIn(habitId, {
        habit_id: habitId,
        completed,
        tiny_habit_used: tinyUsed,
        note: ''
      });
      fetchHabits();
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleGraduate = async (habitId: string) => {
    try {
      await habitsAPI.graduate(habitId, {
        manual: true,
        note: 'Manual graduation'
      });
      fetchHabits();
    } catch (error) {
      console.error('Failed to graduate habit:', error);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabit.title.trim()) return;

    try {
      await habitsAPI.create(newHabit);
      setNewHabit({
        title: '',
        description: '',
        frequency: { type: 'daily' },
        tiny_habit_option: ''
      });
      setShowNewHabitForm(false);
      fetchHabits();
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await habitsAPI.delete(habitId);
      fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const becomingHabits = habits.filter(h => h.lane === 'becoming');
  const iAmHabits = habits.filter(h => h.lane === 'i_am');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Habit Building System
        </h1>
        <p className="mt-1 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Transform your identity through consistent daily actions
        </p>
      </div>

      {/* Two Lane System - Side by side on desktop */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 lg:gap-6 min-h-0">
        {/* I AM Lane (Left on desktop) */}
        <div className="order-2 lg:order-1 flex flex-col min-h-0">
          <div className="mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Award className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-purple-500" />
              I AM
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Graduated habits that define who you are
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4">
            <AnimatePresence>
              {iAmHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onCheckIn={handleCheckIn}
                  onGraduate={handleGraduate}
                  onEdit={() => {}}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </AnimatePresence>
            
            {iAmHabits.length === 0 && (
              <div className="text-center py-8 lg:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Trophy className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                  Graduate habits from "Becoming" to see them here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Arrow - Only visible on desktop */}
        <div className="hidden lg:flex items-center justify-center order-2 px-2">
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-gray-400 dark:text-gray-600"
          >
            <ChevronRight className="h-16 w-16 rotate-180" />
          </motion.div>
        </div>

        {/* Becoming Lane (Right on desktop) */}
        <div className="order-1 lg:order-3 flex flex-col min-h-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-blue-500" />
                Becoming
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Habits you're building to transform yourself
              </p>
            </div>
            <button
              onClick={() => setShowNewHabitForm(true)}
              className="px-3 py-1.5 lg:px-4 lg:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center text-sm lg:text-base"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">New Habit</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4">
            <AnimatePresence>
              {becomingHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onCheckIn={handleCheckIn}
                  onGraduate={handleGraduate}
                  onEdit={() => {}}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </AnimatePresence>

            {becomingHabits.length === 0 && !showNewHabitForm && (
              <div className="text-center py-8 lg:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Target className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                  Start building your first habit
                </p>
                <button
                  onClick={() => setShowNewHabitForm(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm lg:text-base"
                >
                  Create Habit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Habit Form Modal */}
      <AnimatePresence>
        {showNewHabitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewHabitForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Habit
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Habit Title *
                  </label>
                  <input
                    type="text"
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Exercise, Meditate, Read"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    placeholder="What does this habit mean to you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newHabit.frequency.type}
                    onChange={(e) => setNewHabit({ 
                      ...newHabit, 
                      frequency: { type: e.target.value as 'daily' | 'weekly' | 'custom' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiny Habit Option (optional)
                  </label>
                  <input
                    type="text"
                    value={newHabit.tiny_habit_option}
                    onChange={(e) => setNewHabit({ ...newHabit, tiny_habit_option: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 1 pushup, 1 minute meditation"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleCreateHabit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Habit
                </button>
                <button
                  onClick={() => setShowNewHabitForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Habits;