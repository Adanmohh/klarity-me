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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { 
  Zap, 
  MessageCircle, 
  TrendingUp, 
  Star, 
  Award,
  Clock,
  Target,
  Lightbulb,
  Heart,
  Brain,
  Flame,
  Trophy,
  Eye,
  RotateCcw
} from 'lucide-react';

interface PowerStatementAnalyticsProps {
  powerStatements: {
    id: string;
    statement: string;
    category: 'confidence' | 'success' | 'health' | 'relationships' | 'abundance' | 'growth';
    timesUsed: number;
    effectivenessScore: number;
    createdAt: string;
    lastUsed: string;
    emotionalImpact: number;
    manifestationsLinked: number;
    favoriteTime: string;
    usageHistory: { date: string; count: number }[];
  }[];
  usageData: {
    date: string;
    totalUsage: number;
    uniqueStatements: number;
    categories: { [key: string]: number };
    effectivenessScore: number;
    emotionalState: 'positive' | 'neutral' | 'negative';
  }[];
  height?: number;
}

interface StatementInsight {
  type: 'top_performer' | 'rising_star' | 'needs_attention' | 'category_strength' | 'usage_pattern';
  title: string;
  description: string;
  value: number;
  statement?: string;
  icon: any;
  color: string;
}

const PowerStatementAnalytics: React.FC<PowerStatementAnalyticsProps> = ({
  powerStatements,
  usageData,
  height = 400
}) => {

  const categoryColors = {
    confidence: '#3b82f6',
    success: '#f59e0b',
    health: '#10b981',
    relationships: '#ec4899',
    abundance: '#8b5cf6',
    growth: '#06b6d4'
  };

  const categoryIcons = {
    confidence: Zap,
    success: Trophy,
    health: Heart,
    relationships: MessageCircle,
    abundance: Star,
    growth: TrendingUp
  };

  const { 
    topPerformers, 
    categoryBreakdown, 
    usagePatterns, 
    insights, 
    emotionalImpactRadar,
    timeBasedAnalysis 
  } = useMemo(() => {
    // Analyze top performing statements
    const topPerformers = powerStatements
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, 5)
      .map(statement => ({
        ...statement,
        color: categoryColors[statement.category] || '#6b7280'
      }));

    // Category breakdown
    const categoryStats = powerStatements.reduce((acc, statement) => {
      const category = statement.category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalUsage: 0,
          totalEffectiveness: 0,
          statements: []
        };
      }
      acc[category].count++;
      acc[category].totalUsage += statement.timesUsed;
      acc[category].totalEffectiveness += statement.effectivenessScore;
      acc[category].statements.push(statement);
      return acc;
    }, {} as any);

    const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]: [string, any]) => ({
      category,
      count: stats.count,
      totalUsage: stats.totalUsage,
      averageEffectiveness: stats.totalEffectiveness / stats.count,
      color: categoryColors[category as keyof typeof categoryColors] || '#6b7280',
      topStatement: stats.statements.sort((a: any, b: any) => b.effectivenessScore - a.effectivenessScore)[0]
    }));

    // Usage patterns over time
    const usagePatterns = usageData.map(data => ({
      ...data,
      formattedDate: format(new Date(data.date), 'MMM dd'),
      diversityScore: data.uniqueStatements > 0 ? (data.uniqueStatements / data.totalUsage) * 100 : 0
    }));

    // Time-based analysis (hour of day preferences)
    const timeBasedData = powerStatements.reduce((acc, statement) => {
      if (statement.favoriteTime) {
        const hour = parseInt(statement.favoriteTime.split(':')[0]);
        const timeSlot = hour < 6 ? 'Early Morning' :
                       hour < 12 ? 'Morning' :
                       hour < 17 ? 'Afternoon' :
                       hour < 21 ? 'Evening' : 'Night';
        
        acc[timeSlot] = (acc[timeSlot] || 0) + statement.timesUsed;
      }
      return acc;
    }, {} as any);

    const timeBasedAnalysis = Object.entries(timeBasedData).map(([timeSlot, usage]) => ({
      timeSlot,
      usage: usage as number,
      percentage: ((usage as number) / powerStatements.reduce((sum, s) => sum + s.timesUsed, 0)) * 100
    }));

    // Emotional impact radar chart
    const emotionalImpactRadar = categoryBreakdown.map(category => ({
      category: category.category,
      effectiveness: category.averageEffectiveness,
      usage: Math.min(category.totalUsage / 10, 100), // Scale usage to 0-100
      statements: category.count * 10 // Scale count for visibility
    }));

    // Generate insights
    const insights: StatementInsight[] = [];
    
    // Top performer insight
    if (topPerformers.length > 0) {
      const topStatement = topPerformers[0];
      insights.push({
        type: 'top_performer',
        title: 'Power Statement Champion',
        description: `"${topStatement.statement.substring(0, 50)}..." shows ${topStatement.effectivenessScore.toFixed(1)}% effectiveness`,
        value: topStatement.effectivenessScore,
        statement: topStatement.statement,
        icon: Award,
        color: 'text-yellow-600'
      });
    }

    // Rising star (statement with high recent usage but new)
    const recentStatements = powerStatements
      .filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.timesUsed - a.timesUsed);
    
    if (recentStatements.length > 0 && recentStatements[0].timesUsed >= 10) {
      insights.push({
        type: 'rising_star',
        title: 'Rising Power Statement',
        description: `New statement gaining traction with ${recentStatements[0].timesUsed} uses`,
        value: recentStatements[0].timesUsed,
        statement: recentStatements[0].statement,
        icon: Star,
        color: 'text-blue-600'
      });
    }

    // Category strength
    const strongestCategory = categoryBreakdown
      .sort((a, b) => b.averageEffectiveness - a.averageEffectiveness)[0];
    
    if (strongestCategory && strongestCategory.averageEffectiveness > 75) {
      const Icon = categoryIcons[strongestCategory.category as keyof typeof categoryIcons];
      insights.push({
        type: 'category_strength',
        title: `${strongestCategory.category} Mastery`,
        description: `${strongestCategory.averageEffectiveness.toFixed(1)}% avg effectiveness in ${strongestCategory.category}`,
        value: strongestCategory.averageEffectiveness,
        icon: Icon,
        color: 'text-purple-600'
      });
    }

    // Usage pattern insight
    const totalUsage = powerStatements.reduce((sum, s) => sum + s.timesUsed, 0);
    const avgUsagePerStatement = totalUsage / powerStatements.length;
    
    if (avgUsagePerStatement > 20) {
      insights.push({
        type: 'usage_pattern',
        title: 'Power Statement Devotee',
        description: `Average ${avgUsagePerStatement.toFixed(1)} uses per statement shows strong commitment`,
        value: avgUsagePerStatement,
        icon: Flame,
        color: 'text-orange-600'
      });
    }

    // Needs attention (statements with low usage)
    const underutilized = powerStatements
      .filter(s => s.timesUsed < avgUsagePerStatement * 0.3)
      .length;
    
    if (underutilized > 0) {
      insights.push({
        type: 'needs_attention',
        title: 'Underutilized Statements',
        description: `${underutilized} statements could use more attention`,
        value: underutilized,
        icon: Target,
        color: 'text-red-600'
      });
    }

    return {
      topPerformers,
      categoryBreakdown,
      usagePatterns,
      insights: insights.slice(0, 4),
      emotionalImpactRadar,
      timeBasedAnalysis
    };
  }, [powerStatements, usageData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{data.formattedDate}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span className="text-sm text-gray-600">{entry.name}:</span>
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                  {entry.name.includes('Score') || entry.name.includes('Diversity') ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const totalStatements = powerStatements.length;
  const totalUsage = powerStatements.reduce((sum, s) => sum + s.timesUsed, 0);
  const avgEffectiveness = powerStatements.reduce((sum, s) => sum + s.effectivenessScore, 0) / totalStatements;
  const totalManifestationsLinked = powerStatements.reduce((sum, s) => sum + s.manifestationsLinked, 0);

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
              <Zap className="w-5 h-5 text-orange-500" />
              Power Statement Analytics
            </h3>
            <p className="text-sm text-gray-600">Analyze the impact and effectiveness of your affirmations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {totalStatements}
            </div>
            <div className="text-xs text-orange-700 flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Total Statements
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalUsage}
            </div>
            <div className="text-xs text-purple-700 flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3" />
              Total Usage
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {avgEffectiveness.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Avg Effectiveness
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalManifestationsLinked}
            </div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" />
              Manifestations Linked
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Usage Patterns Over Time
        </h4>
        
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usagePatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="usage"
                orientation="left"
                tick={{ fontSize: 12 }}
                label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="score"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Score (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                yAxisId="usage" 
                type="monotone" 
                dataKey="totalUsage" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Total Usage"
              />
              <Line 
                yAxisId="usage" 
                type="monotone" 
                dataKey="uniqueStatements" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Unique Statements"
              />
              <Line 
                yAxisId="score" 
                type="monotone" 
                dataKey="effectivenessScore" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Effectiveness Score (%)"
              />
              <Line 
                yAxisId="score" 
                type="monotone" 
                dataKey="diversityScore" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Diversity Score (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Radar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            Category Performance Radar
          </h4>
          
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={emotionalImpactRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }} 
                  tickCount={5}
                />
                <Radar
                  name="Effectiveness"
                  dataKey="effectiveness"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Usage Intensity"
                  dataKey="usage"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time-Based Usage */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Preferred Usage Times
          </h4>
          
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeBasedAnalysis} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="timeSlot" type="category" width={80} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value} uses (${(value / totalUsage * 100).toFixed(1)}%)`, 
                    'Usage'
                  ]}
                />
                <Bar dataKey="usage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Statements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performing Statements
        </h4>
        
        <div className="space-y-3">
          {topPerformers.map((statement, index) => (
            <motion.div
              key={statement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: statement.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      "{statement.statement}"
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded-full">
                        {statement.category}
                      </span>
                      <span>Used {statement.timesUsed} times</span>
                      <span>Linked to {statement.manifestationsLinked} manifestations</span>
                      <span>Impact: {statement.emotionalImpact}/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold" style={{ color: statement.color }}>
                    {statement.effectivenessScore.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">effectiveness</div>
                </div>
              </div>
              
              <div className="ml-11">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statement.effectivenessScore}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: statement.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-green-500" />
          Category Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map((category, index) => {
            const Icon = categoryIcons[category.category as keyof typeof categoryIcons];
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: category.color }}
                  />
                  <h5 className="font-medium text-gray-900 capitalize">
                    {category.category}
                  </h5>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Statements:</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Usage:</span>
                    <span className="font-medium">{category.totalUsage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Effectiveness:</span>
                    <span 
                      className="font-medium" 
                      style={{ color: category.color }}
                    >
                      {category.averageEffectiveness.toFixed(1)}%
                    </span>
                  </div>
                  
                  {category.topStatement && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium text-gray-700 mb-1">Top Statement:</div>
                      <div className="text-gray-600 italic">
                        "{category.topStatement.statement.substring(0, 60)}..."
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
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
                      {insight.statement && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs italic text-gray-600">
                          "{insight.statement.substring(0, 100)}..."
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
    </motion.div>
  );
};

export default PowerStatementAnalytics;