import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { 
  Flame, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award,
  Zap,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { HabitAnalytics } from '../../services/analyticsService';
import { DataAggregator } from '../../utils/dataAggregation';

interface StreakTrackerProps {
  habitData: HabitAnalytics[];
  completionHistory: { habitId: number; date: string; completed: boolean }[];
  showHeatMap?: boolean;
  height?: number;
}

interface StreakData {
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  streakRisk: 'low' | 'medium' | 'high';
  lastCompletion: string;
  consistency: number;
  streakHistory: { date: string; streakLength: number }[];
}

interface HeatMapData {
  date: string;
  day: string;
  value: number;
  habits: { name: string; completed: boolean }[];
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  habitData,
  completionHistory,
  showHeatMap = true,
  height = 400
}) => {

  const { streakData, heatMapData, streakStats, achievements } = useMemo(() => {
    // Process streak data for each habit
    const streakData: StreakData[] = habitData.map(habit => {
      const habitHistory = completionHistory.filter(h => h.habitId === habit.id);
      
      // Calculate streak risk based on recent performance
      const recentHistory = habitHistory
        .filter(h => new Date(h.date) >= subDays(new Date(), 7))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let streakRisk: 'low' | 'medium' | 'high' = 'low';
      if (habit.currentStreak > 0) {
        const recentMisses = recentHistory.filter(h => !h.completed).length;
        const missRate = recentMisses / Math.max(recentHistory.length, 1);
        
        if (missRate > 0.4) streakRisk = 'high';
        else if (missRate > 0.2) streakRisk = 'medium';
      }

      const lastCompletion = habitHistory
        .filter(h => h.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      // Calculate streak history
      const streaks = DataAggregator.calculateStreaks(habitHistory);

      return {
        habitName: habit.name,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        streakRisk,
        lastCompletion: lastCompletion?.date || 'Never',
        consistency: habit.consistencyScore,
        streakHistory: streaks.streakHistory
      };
    });

    // Generate heat map data for the last 90 days
    const heatMapData: HeatMapData[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayHabits = habitData.map(habit => {
        const completion = completionHistory.find(h => 
          h.habitId === habit.id && isSameDay(new Date(h.date), date)
        );
        return {
          name: habit.name,
          completed: completion?.completed || false
        };
      });

      const completionRate = dayHabits.length > 0 
        ? (dayHabits.filter(h => h.completed).length / dayHabits.length) * 100
        : 0;

      heatMapData.push({
        date: dateStr,
        day: format(date, 'EEE'),
        value: completionRate,
        habits: dayHabits
      });
    }

    // Calculate streak statistics
    const streakStats = {
      totalActiveStreaks: streakData.filter(s => s.currentStreak > 0).length,
      longestCurrentStreak: Math.max(...streakData.map(s => s.currentStreak), 0),
      bestHistoricalStreak: Math.max(...streakData.map(s => s.longestStreak), 0),
      averageStreakLength: streakData.reduce((sum, s) => sum + s.currentStreak, 0) / streakData.length,
      highRiskStreaks: streakData.filter(s => s.streakRisk === 'high').length,
      perfectDays: heatMapData.filter(d => d.value === 100).length,
      averageDailyCompletion: heatMapData.reduce((sum, d) => sum + d.value, 0) / heatMapData.length
    };

    // Generate achievements based on streaks
    const achievements = [
      {
        id: 'first_week',
        title: '7-Day Warrior',
        description: 'Complete any habit for 7 days straight',
        achieved: streakStats.longestCurrentStreak >= 7,
        icon: Calendar,
        color: 'text-blue-500'
      },
      {
        id: 'consistency_king',
        title: 'Consistency King',
        description: 'Maintain 3 active streaks simultaneously',
        achieved: streakStats.totalActiveStreaks >= 3,
        icon: Trophy,
        color: 'text-yellow-500'
      },
      {
        id: 'month_master',
        title: 'Month Master',
        description: 'Complete any habit for 30 days straight',
        achieved: streakStats.longestCurrentStreak >= 30,
        icon: Star,
        color: 'text-purple-500'
      },
      {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'Complete all habits for 7 consecutive days',
        achieved: streakStats.perfectDays >= 7,
        icon: CheckCircle,
        color: 'text-green-500'
      },
      {
        id: 'streak_legend',
        title: 'Streak Legend',
        description: 'Achieve a 100-day streak on any habit',
        achieved: streakStats.bestHistoricalStreak >= 100,
        icon: Flame,
        color: 'text-red-500'
      }
    ];

    return {
      streakData: streakData.sort((a, b) => b.currentStreak - a.currentStreak),
      heatMapData,
      streakStats,
      achievements
    };
  }, [habitData, completionHistory]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ef4444'; // red
    if (streak >= 14) return '#f97316'; // orange
    if (streak >= 7) return '#eab308'; // yellow
    if (streak >= 3) return '#22c55e'; // green
    return '#6b7280'; // gray
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const HeatMapTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HeatMapData;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <p className="font-medium text-gray-900 mb-2">
            {format(new Date(data.date), 'MMM dd, yyyy')}
          </p>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              Completion Rate: <span className="font-medium">{data.value.toFixed(1)}%</span>
            </div>
            <div className="space-y-1">
              {data.habits.map((habit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    habit.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className={habit.completed ? 'text-green-700' : 'text-gray-500'}>
                    {habit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Key Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Streak Tracker
            </h3>
            <p className="text-sm text-gray-600">Monitor your habit consistency and achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {streakStats.longestCurrentStreak}
            </div>
            <div className="text-xs text-orange-700">Longest Active Streak</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {streakStats.totalActiveStreaks}
            </div>
            <div className="text-xs text-green-700">Active Streaks</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {streakStats.perfectDays}
            </div>
            <div className="text-xs text-blue-700">Perfect Days</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {streakStats.averageDailyCompletion.toFixed(0)}%
            </div>
            <div className="text-xs text-purple-700">Avg Daily Rate</div>
          </div>
        </div>
      </div>

      {/* Streak Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Habit Streaks</h4>
        <div className="space-y-3">
          {streakData.map((streak, index) => (
            <motion.div
              key={streak.habitName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Flame 
                    className="w-5 h-5" 
                    style={{ color: getStreakColor(streak.currentStreak) }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{streak.habitName}</div>
                    <div className="text-xs text-gray-600">
                      Last: {streak.lastCompletion !== 'Never' 
                        ? format(new Date(streak.lastCompletion), 'MMM dd')
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: getStreakColor(streak.currentStreak) }}>
                    {streak.currentStreak} days
                  </div>
                  <div className="text-xs text-gray-500">
                    Best: {streak.longestStreak}
                  </div>
                </div>

                <div className={`px-2 py-1 rounded-full text-xs border ${getRiskColor(streak.streakRisk)}`}>
                  {streak.streakRisk === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                  {streak.streakRisk} risk
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {streak.consistency.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">consistency</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Heat Map */}
      {showHeatMap && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            90-Day Completion Heat Map
          </h4>
          
          <div className="grid grid-cols-13 gap-1 mb-4">
            {heatMapData.map((day, index) => (
              <div
                key={day.date}
                className="aspect-square rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all group relative"
                style={{
                  backgroundColor: day.value === 0 ? '#f3f4f6' :
                    day.value < 25 ? '#fef3c7' :
                    day.value < 50 ? '#fed7aa' :
                    day.value < 75 ? '#fca5a5' : '#f87171'
                }}
                title={`${day.date}: ${day.value.toFixed(1)}%`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {format(new Date(day.date), 'MMM dd')}: {day.value.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-yellow-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-orange-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Streak Achievements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.achieved 
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 ${achievement.achieved ? achievement.color : 'text-gray-400'}`} />
                  <div>
                    <h5 className={`font-medium ${achievement.achieved ? 'text-gray-900' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h5>
                    <p className={`text-sm ${achievement.achieved ? 'text-gray-700' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    {achievement.achieved && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Achieved
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StreakTracker;