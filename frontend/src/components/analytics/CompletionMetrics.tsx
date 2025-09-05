import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Target,
  Clock,
  Award,
  Zap,
  Check
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Simple eachDayOfInterval implementation
function eachDayOfInterval({ start, end }: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

interface TaskMetrics {
  completed: number;
  pending: number;
  archived: number;
  averageCompletionTime: number; // in hours
  completionRate: number; // percentage
  streak: number; // days
  bestDay: string;
  totalFocusTime: number; // in hours
}

interface DailyMetric {
  date: Date;
  completed: number;
  created: number;
  focusTime: number;
}

interface CompletionMetricsProps {
  metrics: TaskMetrics;
  dailyMetrics: DailyMetric[];
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
}

export function CompletionMetrics({
  metrics,
  dailyMetrics,
  timeRange,
  onTimeRangeChange
}: CompletionMetricsProps) {
  // Calculate trend
  const trend = useMemo(() => {
    if (dailyMetrics.length < 2) return 0;
    const recent = dailyMetrics.slice(-7).reduce((sum, d) => sum + d.completed, 0);
    const previous = dailyMetrics.slice(-14, -7).reduce((sum, d) => sum + d.completed, 0);
    return previous === 0 ? 100 : ((recent - previous) / previous) * 100;
  }, [dailyMetrics]);

  // Get this week's data
  const weekData = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    // Generate array of days in the week
    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days.map(day => {
      const metric = dailyMetrics.find(
        m => format(m.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        day: format(day, 'EEE'),
        date: day,
        completed: metric?.completed || 0,
        created: metric?.created || 0,
        focusTime: metric?.focusTime || 0
      };
    });
  }, [dailyMetrics]);

  // Calculate max for chart scaling
  const maxCompleted = Math.max(...weekData.map(d => d.completed), 1);

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Performance Metrics
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Track your productivity and progress
          </p>
        </div>
        
        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          change={trend}
          icon={<Target className="w-5 h-5" />}
          color="primary"
        />
        <MetricCard
          title="Current Streak"
          value={`${metrics.streak} days`}
          subtitle="Keep it up!"
          icon={<Zap className="w-5 h-5" />}
          color="success"
        />
        <MetricCard
          title="Tasks Completed"
          value={metrics.completed.toString()}
          subtitle={`${metrics.pending} pending`}
          icon={<Award className="w-5 h-5" />}
          color="info"
        />
        <MetricCard
          title="Focus Time"
          value={`${metrics.totalFocusTime}h`}
          subtitle={`Avg ${(metrics.totalFocusTime / 7).toFixed(1)}h/day`}
          icon={<Clock className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Weekly completion chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Weekly Activity
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <span className="text-neutral-600 dark:text-neutral-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
              <span className="text-neutral-600 dark:text-neutral-400">Created</span>
            </div>
          </div>
        </div>

        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {weekData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1 items-center">
                  {/* Completed bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / maxCompleted) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-8 bg-primary-500 rounded-t-md relative group"
                    style={{ minHeight: day.completed > 0 ? '4px' : '0' }}
                  >
                    {day.completed > 0 && (
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-neutral-700 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.completed}
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Created bar (stacked) */}
                  {day.created > day.completed && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${((day.created - day.completed) / maxCompleted) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className="w-8 bg-neutral-300 dark:bg-neutral-600 rounded-t-md"
                      style={{ minHeight: '2px' }}
                    />
                  )}
                </div>
                
                <span className={`text-xs ${
                  day.date.toDateString() === new Date().toDateString()
                    ? 'font-bold text-primary-600 dark:text-primary-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-neutral-500">
            <span>{maxCompleted}</span>
            <span>{Math.round(maxCompleted / 2)}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Productivity score */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Productivity Score
            </h3>
            <Activity className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="relative h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - metrics.completionRate / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-primary-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {metrics.completionRate}%
                </span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  Efficiency
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Best day</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {metrics.bestDay}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Avg completion</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {metrics.averageCompletionTime}h
              </span>
            </div>
          </div>
        </div>

        {/* Achievement badges */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Achievements
            </h3>
            <Award className="w-5 h-5 text-neutral-500" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <AchievementBadge
              icon="🔥"
              title="On Fire"
              description={`${metrics.streak} day streak`}
              unlocked={metrics.streak >= 3}
            />
            <AchievementBadge
              icon="⚡"
              title="Productive"
              description="90%+ completion"
              unlocked={metrics.completionRate >= 90}
            />
            <AchievementBadge
              icon="🎯"
              title="Focused"
              description="100+ tasks done"
              unlocked={metrics.completed >= 100}
            />
            <AchievementBadge
              icon="⏰"
              title="Dedicated"
              description="40h+ focus time"
              unlocked={metrics.totalFocusTime >= 40}
            />
            <AchievementBadge
              icon="📚"
              title="Organized"
              description="50+ archived"
              unlocked={metrics.archived >= 50}
            />
            <AchievementBadge
              icon="🌟"
              title="Champion"
              description="All goals met"
              unlocked={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
}

function MetricCard({ title, value, subtitle, change, icon, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

function AchievementBadge({ icon, title, description, unlocked }: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05 } : {}}
      className={`relative p-3 rounded-lg text-center transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800'
          : 'bg-neutral-100 dark:bg-neutral-800 opacity-50'
      }`}
    >
      <div className="text-2xl mb-1">{unlocked ? icon : '🔒'}</div>
      <p className={`text-xs font-medium ${
        unlocked ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'
      }`}>
        {title}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
        {description}
      </p>
      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}