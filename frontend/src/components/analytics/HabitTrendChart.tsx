import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, Flame } from 'lucide-react';
import { HabitAnalytics } from '../../services/analyticsService';
import { DataAggregator, TimeSeriesData, TrendAnalysis } from '../../utils/dataAggregation';

interface HabitTrendChartProps {
  habitData: HabitAnalytics[];
  selectedHabits: number[];
  viewMode: 'daily' | 'weekly' | 'monthly';
  showTrendAnalysis?: boolean;
  height?: number;
}

interface ProcessedHabitData {
  date: string;
  [habitName: string]: string | number;
}

const HabitTrendChart: React.FC<HabitTrendChartProps> = ({
  habitData,
  selectedHabits = [],
  viewMode = 'daily',
  showTrendAnalysis = true,
  height = 300
}) => {
  
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#87d068', '#ffa726', '#ef5350', '#42a5f5'
  ];

  // Process and aggregate data
  const { processedData, trendAnalyses, aggregatedMetrics } = useMemo(() => {
    const habitsToShow = selectedHabits.length > 0 
      ? habitData.filter(h => selectedHabits.includes(h.id))
      : habitData.slice(0, 5); // Show top 5 if none selected

    // Convert habit data to time series format
    const timeSeriesData: { [habitName: string]: TimeSeriesData[] } = {};
    const trendAnalyses: { [habitName: string]: TrendAnalysis } = {};

    habitsToShow.forEach(habit => {
      const habitTimeSeries: TimeSeriesData[] = habit.monthlyTrend.map(point => ({
        date: point.date,
        value: point.completed ? 1 : 0,
        label: format(new Date(point.date), 'MMM dd'),
        category: habit.name
      }));

      // Aggregate data based on view mode
      const periodMap = { 'daily': 'day', 'weekly': 'week', 'monthly': 'month' } as const;
      const aggregated = DataAggregator.aggregateTimeSeriesData(
        habitTimeSeries,
        periodMap[viewMode],
        'average' // Use average for completion rates
      );

      timeSeriesData[habit.name] = aggregated[viewMode];
      
      // Calculate trend analysis
      if (showTrendAnalysis) {
        trendAnalyses[habit.name] = DataAggregator.analyzeTrend(aggregated[viewMode]);
      }
    });

    // Combine all habits into a single dataset for the chart
    const allDates = new Set<string>();
    Object.values(timeSeriesData).forEach(series => {
      series.forEach(point => allDates.add(point.date));
    });

    const combinedData: ProcessedHabitData[] = Array.from(allDates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => {
        const dataPoint: ProcessedHabitData = { date };
        
        habitsToShow.forEach(habit => {
          const habitPoint = timeSeriesData[habit.name]?.find(p => p.date === date);
          dataPoint[habit.name] = habitPoint ? (habitPoint.value * 100) : 0; // Convert to percentage
        });

        return dataPoint;
      });

    // Calculate aggregated metrics
    const metrics = {
      totalHabits: habitsToShow.length,
      averageCompletionRate: habitsToShow.reduce((sum, habit) => sum + habit.completionRate, 0) / habitsToShow.length,
      totalStreakDays: habitsToShow.reduce((sum, habit) => sum + habit.currentStreak, 0),
      bestPerformingHabit: habitsToShow.reduce((best, habit) => 
        habit.completionRate > best.completionRate ? habit : best, habitsToShow[0]),
      mostConsistent: habitsToShow.reduce((best, habit) => 
        habit.consistencyScore > best.consistencyScore ? habit : best, habitsToShow[0])
    };

    return {
      processedData: combinedData,
      trendAnalyses,
      aggregatedMetrics: metrics,
      habitsToShow
    };
  }, [habitData, selectedHabits, viewMode, showTrendAnalysis]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">
            {format(new Date(label), viewMode === 'daily' ? 'MMM dd, yyyy' : 'MMM yyyy')}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">{entry.dataKey}:</span>
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const TrendIndicator = ({ trend }: { trend: TrendAnalysis }) => {
    const Icon = trend.direction === 'up' ? TrendingUp : 
                trend.direction === 'down' ? TrendingDown : Minus;
    const colorClass = trend.direction === 'up' ? 'text-green-500' : 
                      trend.direction === 'down' ? 'text-red-500' : 'text-gray-500';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">
          {trend.percentage.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Habit Completion Trends</h3>
          <p className="text-sm text-gray-600">
            Tracking {aggregatedMetrics.totalHabits} habits over time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">{viewMode} view</span>
          </div>
          {aggregatedMetrics.totalStreakDays > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Flame className="w-4 h-4" />
              <span>{aggregatedMetrics.totalStreakDays} total streak days</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">Average Completion</div>
          <div className="text-2xl font-bold text-purple-900">
            {aggregatedMetrics.averageCompletionRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Best Habit</div>
          <div className="text-sm font-semibold text-green-900 truncate">
            {aggregatedMetrics.bestPerformingHabit?.name}
          </div>
          <div className="text-lg font-bold text-green-900">
            {aggregatedMetrics.bestPerformingHabit?.completionRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Most Consistent</div>
          <div className="text-sm font-semibold text-blue-900 truncate">
            {aggregatedMetrics.mostConsistent?.name}
          </div>
          <div className="text-lg font-bold text-blue-900">
            {aggregatedMetrics.mostConsistent?.consistencyScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData}>
            <defs>
              {habitData.slice(0, colors.length).map((habit, index) => (
                <linearGradient
                  key={habit.id}
                  id={`gradient-${habit.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={colors[index]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[index]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: any) => format(new Date(value), viewMode === 'daily' ? 'MM/dd' : 'MMM')}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value: any) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Reference line at 80% (good completion rate) */}
            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="2 2" opacity={0.5} />

            {habitData.slice(0, Math.min(selectedHabits.length || 5, colors.length)).map((habit, index) => (
              <Area
                key={habit.id}
                type="monotone"
                dataKey={habit.name}
                stroke={colors[index]}
                fillOpacity={0.6}
                fill={`url(#gradient-${habit.id})`}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      {showTrendAnalysis && Object.keys(trendAnalyses).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Trend Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(trendAnalyses).map(([habitName, trend]) => (
              <div 
                key={habitName}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {habitName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {trend.summary}
                  </div>
                </div>
                <TrendIndicator trend={trend} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Total Habits</div>
            <div className="text-lg font-semibold text-gray-900">
              {aggregatedMetrics.totalHabits}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Combined Streaks</div>
            <div className="text-lg font-semibold text-orange-600">
              {aggregatedMetrics.totalStreakDays} days
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Best Rate</div>
            <div className="text-lg font-semibold text-green-600">
              {aggregatedMetrics.bestPerformingHabit?.completionRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Consistency</div>
            <div className="text-lg font-semibold text-blue-600">
              {habitData.reduce((sum, h) => sum + h.consistencyScore, 0) / habitData.length || 0}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitTrendChart;