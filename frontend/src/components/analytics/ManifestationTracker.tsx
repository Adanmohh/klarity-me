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
  PieChart,
  Pie,
  Legend,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { 
  Sparkles, 
  Target, 
  Clock, 
  TrendingUp, 
  Star, 
  CheckCircle2,
  Calendar,
  Trophy,
  Zap,
  Heart,
  DollarSign,
  Home,
  Briefcase,
  Users,
  Award
} from 'lucide-react';
import { ManifestationMetrics } from '../../services/analyticsService';

interface ManifestationTrackerProps {
  manifestationData: ManifestationMetrics;
  manifestations: {
    id: string;
    title: string;
    description: string;
    category: 'career' | 'relationships' | 'health' | 'financial' | 'personal' | 'spiritual';
    status: 'active' | 'achieved' | 'cancelled' | 'paused';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    achievedAt?: string;
    targetDate?: string;
    powerStatements: string[];
    visualizationSessions: number;
    affirmationCount: number;
    progressNotes: { date: string; note: string; progress: number }[];
  }[];
  height?: number;
}

interface ManifestationInsight {
  type: 'success_pattern' | 'category_strength' | 'timing_insight' | 'power_statement';
  title: string;
  description: string;
  value: number;
  icon: any;
  color: string;
}

const ManifestationTracker: React.FC<ManifestationTrackerProps> = ({
  manifestationData,
  manifestations,
  height = 400
}) => {

  const categoryColors = {
    career: '#3b82f6',
    relationships: '#ec4899',
    health: '#10b981',
    financial: '#f59e0b',
    personal: '#8b5cf6',
    spiritual: '#06b6d4'
  };

  const categoryIcons = {
    career: Briefcase,
    relationships: Users,
    health: Heart,
    financial: DollarSign,
    personal: Star,
    spiritual: Sparkles
  };

  const { processedData, insights, categoryBreakdown, timelineData, successPatterns } = useMemo(() => {
    // Process manifestation timeline data
    const timelineData = manifestationData.monthlyTrend.map(point => ({
      date: point.date,
      created: point.created,
      achieved: point.achieved,
      successRate: point.created > 0 ? (point.achieved / point.created) * 100 : 0,
      formattedDate: format(new Date(point.date), 'MMM yyyy')
    }));

    // Analyze category performance
    const categoryBreakdown = Object.entries(manifestationData.categoryBreakdown).map(([category, data]) => ({
      category,
      total: data.total,
      successful: data.successful,
      successRate: data.total > 0 ? (data.successful / data.total) * 100 : 0,
      color: categoryColors[category as keyof typeof categoryColors] || '#6b7280'
    })).sort((a, b) => b.successRate - a.successRate);

    // Calculate success patterns
    const achievedManifestations = manifestations.filter(m => m.status === 'achieved');
    
    const successPatterns = {
      averageTimeToManifest: achievedManifestations.length > 0 
        ? achievedManifestations.reduce((sum, m) => {
            const days = differenceInDays(
              new Date(m.achievedAt!), 
              new Date(m.createdAt)
            );
            return sum + days;
          }, 0) / achievedManifestations.length 
        : 0,
      
      bestCategory: categoryBreakdown[0],
      
      powerStatementEffectiveness: manifestationData.powerStatementUsage
        .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
        .slice(0, 3),
      
      highPrioritySuccessRate: manifestations
        .filter(m => m.priority === 'high')
        .reduce((acc, m) => {
          acc.total++;
          if (m.status === 'achieved') acc.achieved++;
          return acc;
        }, { total: 0, achieved: 0 }),
      
      visualizationImpact: achievedManifestations.reduce((sum, m) => sum + m.visualizationSessions, 0) / achievedManifestations.length || 0
    };

    // Generate insights
    const insights: ManifestationInsight[] = [];

    // Success rate insight
    if (manifestationData.successRate > 70) {
      insights.push({
        type: 'success_pattern',
        title: 'Manifestation Master',
        description: `Exceptional ${manifestationData.successRate.toFixed(1)}% success rate`,
        value: manifestationData.successRate,
        icon: Trophy,
        color: 'text-yellow-600'
      });
    } else if (manifestationData.successRate > 50) {
      insights.push({
        type: 'success_pattern',
        title: 'Strong Manifester',
        description: `Solid ${manifestationData.successRate.toFixed(1)}% success rate`,
        value: manifestationData.successRate,
        icon: Target,
        color: 'text-green-600'
      });
    }

    // Category strength
    if (successPatterns.bestCategory && successPatterns.bestCategory.successRate > 80) {
      insights.push({
        type: 'category_strength',
        title: `${successPatterns.bestCategory.category} Specialist`,
        description: `${successPatterns.bestCategory.successRate.toFixed(1)}% success in ${successPatterns.bestCategory.category}`,
        value: successPatterns.bestCategory.successRate,
        icon: categoryIcons[successPatterns.bestCategory.category as keyof typeof categoryIcons],
        color: 'text-purple-600'
      });
    }

    // Timing insight
    if (successPatterns.averageTimeToManifest > 0) {
      const timeCategory = successPatterns.averageTimeToManifest < 30 ? 'Quick' :
                          successPatterns.averageTimeToManifest < 90 ? 'Steady' : 'Patient';
      insights.push({
        type: 'timing_insight',
        title: `${timeCategory} Manifestor`,
        description: `Average ${Math.round(successPatterns.averageTimeToManifest)} days to achieve goals`,
        value: successPatterns.averageTimeToManifest,
        icon: Clock,
        color: 'text-blue-600'
      });
    }

    // Power statement insight
    if (successPatterns.powerStatementEffectiveness.length > 0) {
      const topStatement = successPatterns.powerStatementEffectiveness[0];
      if (topStatement.effectivenessScore > 70) {
        insights.push({
          type: 'power_statement',
          title: 'Power Statement Pro',
          description: `Top statement shows ${topStatement.effectivenessScore.toFixed(1)}% effectiveness`,
          value: topStatement.effectivenessScore,
          icon: Zap,
          color: 'text-orange-600'
        });
      }
    }

    return {
      processedData: timelineData,
      insights: insights.slice(0, 4),
      categoryBreakdown,
      timelineData,
      successPatterns
    };
  }, [manifestationData, manifestations]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{data.formattedDate}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-medium text-blue-600">{data.created}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Achieved:</span>
              <span className="text-sm font-medium text-green-600">{data.achieved}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Success Rate:</span>
              <span className="text-sm font-medium text-purple-600">{data.successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const activeManifestations = manifestations.filter(m => m.status === 'active');
  const totalVisualizationSessions = manifestations.reduce((sum, m) => sum + m.visualizationSessions, 0);
  const totalAffirmations = manifestations.reduce((sum, m) => sum + m.affirmationCount, 0);

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
              <Sparkles className="w-5 h-5 text-purple-500" />
              Manifestation Analytics
            </h3>
            <p className="text-sm text-gray-600">Track your manifestation success and patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {manifestationData.totalManifestations}
            </div>
            <div className="text-xs text-purple-700 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Total Manifestations
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {manifestationData.successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Success Rate
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(manifestationData.averageTimeToManifest)}
            </div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              Avg Days to Manifest
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {activeManifestations.length}
            </div>
            <div className="text-xs text-orange-700 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Active Goals
            </div>
          </div>
        </div>
      </div>

      {/* Success Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Manifestation Timeline
        </h4>
        
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="count"
                orientation="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="rate"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Success Rate (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar yAxisId="count" dataKey="created" fill="#8b5cf6" name="Created" opacity={0.8} />
              <Bar yAxisId="count" dataKey="achieved" fill="#10b981" name="Achieved" />
              <Line 
                yAxisId="rate" 
                type="monotone" 
                dataKey="successRate" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Success Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Category Performance
          </h4>
          
          <div className="space-y-3">
            {categoryBreakdown.map((category, index) => {
              const Icon = categoryIcons[category.category as keyof typeof categoryIcons];
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: category.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {category.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.successful}/{category.total} achieved
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: category.color }}>
                        {category.successRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-20">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.successRate}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Power Statement Effectiveness */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Top Power Statements
          </h4>
          
          <div className="space-y-3">
            {manifestationData.powerStatementUsage
              .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
              .slice(0, 5)
              .map((statement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900 flex-1 pr-3">
                      "{statement.statement}"
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {statement.effectivenessScore.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used {statement.frequency} times</span>
                    <span>Effectiveness Score</span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Practice Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Practice Statistics
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {totalVisualizationSessions}
            </div>
            <div className="text-sm text-gray-600">Total Visualization Sessions</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {(totalVisualizationSessions / Math.max(manifestations.length, 1)).toFixed(1)} per goal
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {totalAffirmations}
            </div>
            <div className="text-sm text-gray-600">Total Affirmations</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {(totalAffirmations / Math.max(manifestations.length, 1)).toFixed(1)} per goal
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {successPatterns.highPrioritySuccessRate.total > 0 
                ? ((successPatterns.highPrioritySuccessRate.achieved / successPatterns.highPrioritySuccessRate.total) * 100).toFixed(1)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">High Priority Success</div>
            <div className="text-xs text-gray-500 mt-1">
              {successPatterns.highPrioritySuccessRate.achieved}/{successPatterns.highPrioritySuccessRate.total} achieved
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {manifestationData.powerStatementUsage.length}
            </div>
            <div className="text-sm text-gray-600">Unique Power Statements</div>
            <div className="text-xs text-gray-500 mt-1">
              Total usage: {manifestationData.powerStatementUsage.reduce((sum, p) => sum + p.frequency, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Key Insights
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
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ManifestationTracker;