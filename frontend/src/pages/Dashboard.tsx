import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import { cn } from '../utils/cn';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { StatsSkeleton, ContentSkeleton } from '../components/ui/SkeletonLoader';
import { useCardStore } from '../store/cardStore';
import { useDailyTaskStore } from '../store/dailyTaskStore';
import { DailyTaskStatus } from '../types';

interface DashboardProps {
  cards: Card[];
  dailyTasksCount: number;
  completedToday: number;
  weeklyStreak: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cards,
  dailyTasksCount,
  completedToday,
  weeklyStreak,
}) => {
  const [loading, setLoading] = useState(true);
  const { fetchCards } = useCardStore();
  const { tasks } = useDailyTaskStore();
  
  // Calculate real stats from actual data
  const stats = useMemo(() => {
    const activeCards = cards.filter(c => c.status === 'active');
    const completedTasks = tasks.filter(t => t.status === DailyTaskStatus.COMPLETED);
    const todayTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString();
    });
    const todayCompleted = todayTasks.filter(t => t.status === DailyTaskStatus.COMPLETED).length;
    
    // Calculate weekly activity (real data based on task completion dates)
    const weekActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.updated_at || t.created_at);
        return taskDate.toDateString() === date.toDateString();
      });
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' })[0],
        count: dayTasks.length,
        completed: dayTasks.filter(t => t.status === DailyTaskStatus.COMPLETED).length,
      };
    });
    
    return {
      activeCards: activeCards.length,
      totalTasks: tasks.length,
      completedToday: todayCompleted,
      weeklyStreak: calculateStreak(tasks),
      weekActivity,
      completionRate: tasks.length > 0 
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0,
    };
  }, [cards, tasks]);
  
  const activeCards = cards.filter(c => c.status === 'active');
  const focusCard = activeCards[0];
  
  // Calculate real progress for focus card
  const focusCardProgress = useMemo(() => {
    if (!focusCard) return 0;
    const cardTasks = tasks.filter(t => t.card_id === focusCard.id);
    const completedCardTasks = cardTasks.filter(t => t.status === DailyTaskStatus.COMPLETED);
    return cardTasks.length > 0 
      ? Math.round((completedCardTasks.length / cardTasks.length) * 100)
      : 0;
  }, [focusCard, tasks]);

  useEffect(() => {
    // Simulate loading real data
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <ContentSkeleton lines={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <StatsSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section - Responsive text sizes */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Stats Grid - Fully responsive with proper mobile layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        {[
          {
            label: 'Active Cards',
            value: stats.activeCards,
            color: 'from-primary-gold to-yellow-500',
            icon: '🎯',
            trend: '+2 this week',
          },
          {
            label: 'Total Tasks',
            value: stats.totalTasks,
            color: 'from-blue-500 to-blue-600',
            icon: '📋',
            trend: `${stats.completionRate}% complete`,
          },
          {
            label: 'Done Today',
            value: stats.completedToday,
            color: 'from-green-500 to-green-600',
            icon: '✅',
            trend: 'Great progress!',
          },
          {
            label: 'Week Streak',
            value: `${stats.weeklyStreak}d`,
            color: 'from-purple-500 to-purple-600',
            icon: '🔥',
            trend: 'Keep it up!',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard 
              className="p-4 md:p-6 hover:scale-105 transition-transform"
              variant="default"
              hoverable
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  stat.color
                )}>
                  <span className="text-xl md:text-2xl">{stat.icon}</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  className="text-right"
                >
                  <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </motion.div>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.trend}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Focus Card - Full width on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Today's Focus
          </h2>
          {focusCard ? (
            <GlassCard variant="gold" className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {focusCard.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {focusCard.description || 'No description'}
                  </p>
                </div>
                <span className="inline-flex px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-bold">
                  Active
                </span>
              </div>
              
              {/* Progress Bar with real data */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {focusCardProgress}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-gold to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${focusCardProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Quick Actions - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="primary" className="flex-1 sm:flex-initial">
                  Open Card
                </Button>
                <Button variant="secondary" className="flex-1 sm:flex-initial">
                  Add Task
                </Button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard variant="subtle" className="p-8 text-center">
              <span className="text-4xl mb-4 block">🎯</span>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No active focus cards
              </p>
              <Button variant="primary">
                Create First Card
              </Button>
            </GlassCard>
          )}
        </motion.div>

        {/* Activity Section - Full width on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Activity
          </h2>
          
          {/* Week Activity Chart - Responsive */}
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              This Week
            </h3>
            <div className="flex items-end justify-between h-24 md:h-32 gap-1 md:gap-2">
              {stats.weekActivity.map((day, index) => {
                const maxCount = Math.max(...stats.weekActivity.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                const isToday = index === 6;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                    <motion.div
                      className={cn(
                        "w-full rounded-t-lg",
                        isToday 
                          ? "bg-gradient-to-t from-primary-gold to-yellow-400" 
                          : day.completed > 0
                          ? "bg-gradient-to-t from-green-400 to-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      title={`${day.count} tasks`}
                    />
                    <span className={cn(
                      "text-xs font-bold",
                      isToday ? "text-primary-gold" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Recent Activity - Responsive text */}
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {getRecentActivity(tasks).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg md:text-xl flex-shrink-0">
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
              {getRecentActivity(tasks).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

// Helper functions for real data calculations
function calculateStreak(tasks: any[]): number {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.completedAt || t.createdAt);
      return taskDate.toDateString() === date.toDateString() && t.status === DailyTaskStatus.COMPLETED;
    });
    
    if (dayTasks.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}

function getRecentActivity(tasks: any[]): Array<{icon: string, action: string, time: string}> {
  const activities = [];
  const now = new Date();
  
  // Get recent completed tasks
  const recentCompleted = tasks
    .filter(t => t.status === DailyTaskStatus.COMPLETED && t.updated_at)
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 3);
    
  for (const task of recentCompleted) {
    const time = getRelativeTime(new Date(task.updated_at || task.created_at), now);
    activities.push({
      icon: '✅',
      action: `Completed: ${task.title}`,
      time,
    });
  }
  
  return activities.slice(0, 3);
}

function getRelativeTime(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}