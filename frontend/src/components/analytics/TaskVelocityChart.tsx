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
  BarChart,
  Bar,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Legend,
  ReferenceLine
} from 'recharts';
import { format, startOfWeek, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { eachHourOfInterval } from 'date-fns/eachHourOfInterval';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Target, 
  BarChart3,
  Activity,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Award,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { TaskVelocityMetrics } from '../../services/analyticsService';
import { DataAggregator } from '../../utils/dataAggregation';

interface TaskVelocityChartProps {
  velocityData: TaskVelocityMetrics;
  taskHistory: {
    id: string;
    title: string;
    lane: 'controller' | 'main';
    duration: '10min' | '15min' | '30min' | null;
    status: 'pending' | 'completed' | 'archived';
    createdAt: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    complexity: 'low' | 'medium' | 'high';
    tags: string[];
  }[];
  height?: number;
}

interface VelocityInsight {
  type: 'peak_hour' | 'efficiency' | 'trend' | 'bottleneck' | 'achievement';
  title: string;
  description: string;
  value: number;
  icon: any;
  color: string;
  recommendation?: string;
}

const TaskVelocityChart: React.FC<TaskVelocityChartProps> = ({
  velocityData,
  taskHistory,
  height = 400
}) => {

  const laneColors = {
    controller: '#3b82f6',
    main: '#10b981'
  };

  const durationColors = {
    '10min': '#f59e0b',
    '15min': '#8b5cf6',
    '30min': '#ef4444'
  };

  const { 
    processedVelocityData, 
    hourlyPerformance, 
    efficiencyMetrics, 
    insights,
    trendAnalysis,
    productivityPatterns 
  } = useMemo(() => {
    // Process velocity trends
    const processedVelocityData = velocityData.velocityTrend.map(point => ({
      ...point,
      completionRate: point.total > 0 ? (point.completed / point.total) * 100 : 0,
      formattedDate: format(new Date(point.date), 'MM/dd'),
      efficiency: point.completed / Math.max(point.total, 1)
    }));

    // Analyze hourly performance
    const hourlyStats = taskHistory
      .filter(task => task.completedAt)
      .reduce((acc, task) => {
        const hour = new Date(task.completedAt!).getHours();
        if (!acc[hour]) {
          acc[hour] = { count: 0, totalDuration: 0, complexTasks: 0 };
        }
        acc[hour].count++;
        acc[hour].totalDuration += task.actualDuration || 0;
        if (task.complexity === 'high') acc[hour].complexTasks++;
        return acc;
      }, {} as any);

    const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      formattedHour: `${hour.toString().padStart(2, '0')}:00`,
      tasksCompleted: hourlyStats[hour]?.count || 0,
      averageDuration: hourlyStats[hour] 
        ? hourlyStats[hour].totalDuration / hourlyStats[hour].count 
        : 0,
      complexTasks: hourlyStats[hour]?.complexTasks || 0,
      productivity: hourlyStats[hour]?.count || 0
    }));

    // Calculate efficiency metrics
    const completedTasks = taskHistory.filter(t => t.status === 'completed');
    const tasksWithEstimates = completedTasks.filter(t => t.estimatedDuration && t.actualDuration);
    
    const efficiencyMetrics = {
      overallVelocity: velocityData.dailyAverage,
      estimationAccuracy: tasksWithEstimates.length > 0 
        ? tasksWithEstimates.reduce((acc, task) => {
            const accuracy = 1 - Math.abs(task.estimatedDuration! - task.actualDuration!) / task.estimatedDuration!;
            return acc + Math.max(0, accuracy);
          }, 0) / tasksWithEstimates.length * 100
        : 0,
      
      complexityDistribution: {
        low: taskHistory.filter(t => t.complexity === 'low').length,
        medium: taskHistory.filter(t => t.complexity === 'medium').length,
        high: taskHistory.filter(t => t.complexity === 'high').length
      },
      
      peakHours: velocityData.peakProductivityHours,
      
      laneEfficiency: {
        controller: velocityData.completionRateByLane.controller || 0,
        main: velocityData.completionRateByLane.main || 0
      },
      
      durationEfficiency: velocityData.completionRateByDuration
    };

    // Generate productivity patterns
    const weeklyPattern = taskHistory.reduce((acc, task) => {
      if (task.completedAt) {
        const dayOfWeek = new Date(task.completedAt).getDay();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[dayOfWeek];
        acc[dayName] = (acc[dayName] || 0) + 1;
      }
      return acc;
    }, {} as any);

    const productivityPatterns = Object.entries(weeklyPattern).map(([day, count]) => ({
      day,
      tasks: count as number,
      percentage: ((count as number) / completedTasks.length) * 100
    }));

    // Trend analysis
    const recentData = processedVelocityData.slice(-7);
    const previousData = processedVelocityData.slice(-14, -7);
    const recentAvg = recentData.reduce((sum, d) => sum + d.completed, 0) / recentData.length;
    const previousAvg = previousData.reduce((sum, d) => sum + d.completed, 0) / previousData.length;
    const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    const trendAnalysis = {
      direction: trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(trendPercentage),
      recentAvg,
      previousAvg
    };

    // Generate insights
    const insights: VelocityInsight[] = [];

    // Peak performance insight
    const peakHour = hourlyPerformance.reduce((max, curr) => 
      curr.tasksCompleted > max.tasksCompleted ? curr : max
    );
    
    if (peakHour.tasksCompleted > 0) {
      insights.push({
        type: 'peak_hour',
        title: 'Peak Performance Hour',
        description: `Most productive at ${peakHour.formattedHour} with ${peakHour.tasksCompleted} tasks`,
        value: peakHour.hour,
        icon: Clock,
        color: 'text-blue-600',
        recommendation: `Schedule important tasks around ${peakHour.formattedHour}`
      });
    }

    // Efficiency insight
    if (efficiencyMetrics.estimationAccuracy > 80) {
      insights.push({
        type: 'efficiency',
        title: 'Estimation Master',
        description: `${efficiencyMetrics.estimationAccuracy.toFixed(1)}% accuracy in time estimates`,
        value: efficiencyMetrics.estimationAccuracy,
        icon: Target,
        color: 'text-green-600'
      });
    } else if (efficiencyMetrics.estimationAccuracy < 60) {
      insights.push({
        type: 'efficiency',
        title: 'Estimation Challenge',
        description: `${efficiencyMetrics.estimationAccuracy.toFixed(1)}% estimation accuracy needs improvement`,
        value: efficiencyMetrics.estimationAccuracy,
        icon: AlertTriangle,
        color: 'text-red-600',
        recommendation: 'Track actual vs estimated time to improve planning'
      });
    }

    // Trend insight
    if (trendAnalysis.direction === 'up' && trendAnalysis.percentage > 15) {
      insights.push({
        type: 'trend',
        title: 'Velocity Increasing',
        description: `${trendAnalysis.percentage.toFixed(1)}% improvement in recent performance`,
        value: trendAnalysis.percentage,
        icon: TrendingUp,
        color: 'text-green-600'
      });
    } else if (trendAnalysis.direction === 'down' && trendAnalysis.percentage > 15) {
      insights.push({
        type: 'trend',
        title: 'Velocity Declining',
        description: `${trendAnalysis.percentage.toFixed(1)}% decrease in recent performance`,
        value: trendAnalysis.percentage,
        icon: ArrowDown,
        color: 'text-red-600',
        recommendation: 'Review workload and optimize task prioritization'
      });
    }

    // Achievement insight
    if (velocityData.dailyAverage >= 10) {
      insights.push({
        type: 'achievement',
        title: 'High Velocity Achiever',
        description: `Averaging ${velocityData.dailyAverage.toFixed(1)} tasks per day`,
        value: velocityData.dailyAverage,
        icon: Award,
        color: 'text-yellow-600'
      });
    }

    // Bottleneck insight
    const lowestLaneRate = Math.min(...Object.values(efficiencyMetrics.laneEfficiency));
    const bottleneckLane = Object.entries(efficiencyMetrics.laneEfficiency)
      .find(([_, rate]) => rate === lowestLaneRate)?.[0];
    
    if (lowestLaneRate < 70 && bottleneckLane) {
      insights.push({
        type: 'bottleneck',
        title: `${bottleneckLane} Lane Bottleneck`,
        description: `Only ${lowestLaneRate.toFixed(1)}% completion rate in ${bottleneckLane}`,
        value: lowestLaneRate,
        icon: AlertTriangle,
        color: 'text-orange-600',
        recommendation: `Focus on optimizing ${bottleneckLane} lane workflow`
      });
    }

    return {
      processedVelocityData,
      hourlyPerformance,
      efficiencyMetrics,
      insights: insights.slice(0, 4),
      trendAnalysis,
      productivityPatterns
    };
  }, [velocityData, taskHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{data.formattedDate || data.formattedHour}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span className="text-sm text-gray-600">{entry.name}:</span>
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                  {entry.name.includes('Rate') ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const TrendIcon = trendAnalysis.direction === 'up' ? ArrowUp : 
                   trendAnalysis.direction === 'down' ? ArrowDown : Minus;
  const trendColor = trendAnalysis.direction === 'up' ? 'text-green-600' : 
                    trendAnalysis.direction === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Task Velocity Analytics
            </h3>
            <p className="text-sm text-gray-600">Monitor your task completion speed and productivity patterns</p>
          </div>
          <div className={`flex items-center gap-2 ${trendColor}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="font-medium">
              {trendAnalysis.percentage.toFixed(1)}% {trendAnalysis.direction}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {velocityData.dailyAverage.toFixed(1)}
            </div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3" />
              Daily Average
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {velocityData.weeklyAverage.toFixed(1)}
            </div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              Weekly Average
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {efficiencyMetrics.estimationAccuracy.toFixed(0)}%
            </div>
            <div className="text-xs text-purple-700 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Estimation Accuracy
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {efficiencyMetrics.peakHours.length}
            </div>
            <div className="text-xs text-orange-700 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" />
              Peak Hours
            </div>
          </div>
        </div>
      </div>

      {/* Velocity Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Task Completion Velocity
        </h4>
        
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedVelocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="count"
                orientation="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Task Count', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="rate"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Completion Rate (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference line for target completion rate */}
              <ReferenceLine yAxisId="rate" y={80} stroke="#10b981" strokeDasharray="2 2" />
              
              <Bar yAxisId="count" dataKey="total" fill="#e5e7eb" name="Total Tasks" />
              <Bar yAxisId="count" dataKey="completed" fill="#3b82f6" name="Completed Tasks" />
              <Line 
                yAxisId="rate" 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Completion Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Hourly Productivity Pattern
          </h4>
          
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedHour"
                  tick={{ fontSize: 10 }}
                  interval={1}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasksCompleted" fill="#8b5cf6" name="Tasks Completed">
                  {hourlyPerformance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.tasksCompleted > 0 ? '#8b5cf6' : '#e5e7eb'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lane & Duration Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Performance by Category
          </h4>
          
          <div className="space-y-4">
            {/* Lane Performance */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">By Lane</h5>
              <div className="space-y-2">
                {Object.entries(efficiencyMetrics.laneEfficiency).map(([lane, rate]) => (
                  <div key={lane} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: laneColors[lane as keyof typeof laneColors] }}
                      />
                      <span className="text-sm capitalize">{lane}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${rate}%`,
                            backgroundColor: laneColors[lane as keyof typeof laneColors]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Performance */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">By Duration</h5>
              <div className="space-y-2">
                {Object.entries(efficiencyMetrics.durationEfficiency).map(([duration, rate]) => (
                  <div key={duration} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: durationColors[duration as keyof typeof durationColors] }}
                      />
                      <span className="text-sm">{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${rate}%`,
                            backgroundColor: durationColors[duration as keyof typeof durationColors]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Distribution */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Task Complexity</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {efficiencyMetrics.complexityDistribution.low}
                  </div>
                  <div className="text-xs text-green-700">Low</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">
                    {efficiencyMetrics.complexityDistribution.medium}
                  </div>
                  <div className="text-xs text-yellow-700">Medium</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">
                    {efficiencyMetrics.complexityDistribution.high}
                  </div>
                  <div className="text-xs text-red-700">High</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          Weekly Productivity Pattern
        </h4>
        
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value} tasks (${((value / taskHistory.filter(t => t.completedAt).length) * 100).toFixed(1)}%)`, 
                  'Tasks Completed'
                ]}
              />
              <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Performance Insights
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 ${insight.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {insight.title}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          💡 {insight.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hours Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-500" />
          Peak Performance Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-lg font-bold text-blue-600 mb-2">
              {efficiencyMetrics.peakHours.join(', ')}
            </div>
            <div className="text-sm text-blue-700">Peak Performance Hours</div>
            <div className="text-xs text-blue-600 mt-1">
              Schedule important tasks during these hours
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-lg font-bold text-green-600 mb-2">
              {Math.max(...Object.values(efficiencyMetrics.laneEfficiency)).toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">Best Lane Performance</div>
            <div className="text-xs text-green-600 mt-1">
              {Object.entries(efficiencyMetrics.laneEfficiency)
                .find(([_, rate]) => rate === Math.max(...Object.values(efficiencyMetrics.laneEfficiency)))?.[0]} lane
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-lg font-bold text-purple-600 mb-2">
              {Math.max(...Object.values(efficiencyMetrics.durationEfficiency)).toFixed(1)}%
            </div>
            <div className="text-sm text-purple-700">Best Duration Performance</div>
            <div className="text-xs text-purple-600 mt-1">
              {Object.entries(efficiencyMetrics.durationEfficiency)
                .find(([_, rate]) => rate === Math.max(...Object.values(efficiencyMetrics.durationEfficiency)))?.[0]} tasks
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskVelocityChart;