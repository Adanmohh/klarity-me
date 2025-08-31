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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, subDays } from 'date-fns';
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  Zap, 
  Award,
  Activity,
  BookOpen,
  Focus,
  Lightbulb,
  Timer,
  BarChart3
} from 'lucide-react';
import { MentalTrainingMetrics } from '../../services/analyticsService';
import { DataAggregator } from '../../utils/dataAggregation';

interface MentalTrainingStatsProps {
  trainingData: MentalTrainingMetrics;
  sessionHistory: {
    date: string;
    skill: string;
    duration: number;
    score: number;
    techniques: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    notes?: string;
  }[];
  height?: number;
}

interface SkillProgress {
  skill: string;
  currentLevel: string;
  progress: number;
  sessionsCompleted: number;
  averageScore: number;
  improvement: number;
  nextMilestone: string;
}

interface SessionInsight {
  type: 'improvement' | 'plateau' | 'decline' | 'milestone';
  title: string;
  description: string;
  skill?: string;
  value?: number;
  icon: any;
  color: string;
}

const MentalTrainingStats: React.FC<MentalTrainingStatsProps> = ({
  trainingData,
  sessionHistory,
  height = 400
}) => {

  const skillColors = {
    'Focus': '#3b82f6',
    'Visualization': '#8b5cf6',
    'Meditation': '#10b981',
    'Memory': '#f59e0b',
    'Mindfulness': '#06b6d4',
    'Concentration': '#ef4444',
    'Breathing': '#84cc16',
    'Relaxation': '#f97316'
  };

  const { skillProgress, recentTrends, sessionInsights, competencyRadar } = useMemo(() => {
    // Process skill progress
    const skillProgress: SkillProgress[] = Object.entries(trainingData.skillDistribution).map(([skill, count]) => {
      const skillSessions = sessionHistory.filter(s => s.skill === skill);
      const averageScore = skillSessions.reduce((sum, s) => sum + s.score, 0) / skillSessions.length || 0;
      
      // Calculate improvement trend (last 10 sessions vs previous 10)
      const recent10 = skillSessions.slice(-10);
      const previous10 = skillSessions.slice(-20, -10);
      const recentAvg = recent10.reduce((sum, s) => sum + s.score, 0) / recent10.length || 0;
      const previousAvg = previous10.reduce((sum, s) => sum + s.score, 0) / previous10.length || 0;
      const improvement = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

      // Determine current level and progress
      const currentLevel = trainingData.competencyLevels[skill] || 'Novice';
      let progress = 0;
      let nextMilestone = '';
      
      if (averageScore >= 90) {
        progress = 100;
        nextMilestone = 'Master level achieved!';
      } else if (averageScore >= 75) {
        progress = (averageScore - 75) / 15 * 100;
        nextMilestone = 'Master level';
      } else if (averageScore >= 60) {
        progress = (averageScore - 60) / 15 * 100;
        nextMilestone = 'Advanced level';
      } else if (averageScore >= 40) {
        progress = (averageScore - 40) / 20 * 100;
        nextMilestone = 'Intermediate level';
      } else {
        progress = averageScore / 40 * 100;
        nextMilestone = 'Beginner level';
      }

      return {
        skill,
        currentLevel,
        progress,
        sessionsCompleted: count,
        averageScore,
        improvement,
        nextMilestone
      };
    });

    // Calculate recent trends (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentSessions = sessionHistory
      .filter(s => new Date(s.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const trendData = recentSessions.map(session => ({
      date: session.date,
      score: session.score,
      skill: session.skill,
      duration: session.duration,
      formattedDate: format(new Date(session.date), 'MM/dd')
    }));

    // Generate session insights
    const insights: SessionInsight[] = [];
    
    // Check for improvements
    skillProgress.forEach(skill => {
      if (skill.improvement > 15) {
        insights.push({
          type: 'improvement',
          title: `${skill.skill} Breakthrough`,
          description: `${skill.improvement.toFixed(1)}% improvement in recent sessions`,
          skill: skill.skill,
          value: skill.improvement,
          icon: TrendingUp,
          color: 'text-green-600'
        });
      } else if (skill.improvement < -10) {
        insights.push({
          type: 'decline',
          title: `${skill.skill} Attention Needed`,
          description: `Performance has declined ${Math.abs(skill.improvement).toFixed(1)}%`,
          skill: skill.skill,
          value: skill.improvement,
          icon: Target,
          color: 'text-red-600'
        });
      }
    });

    // Check for milestones
    skillProgress.forEach(skill => {
      if (skill.progress >= 90 && skill.currentLevel !== 'Expert') {
        insights.push({
          type: 'milestone',
          title: `${skill.skill} Mastery Near`,
          description: `You're ${(100 - skill.progress).toFixed(0)}% away from mastering ${skill.skill}`,
          skill: skill.skill,
          icon: Award,
          color: 'text-purple-600'
        });
      }
    });

    // Generate radar chart data
    const radarData = Object.keys(trainingData.skillDistribution).map(skill => ({
      skill,
      score: skillProgress.find(s => s.skill === skill)?.averageScore || 0,
      sessions: trainingData.skillDistribution[skill]
    }));

    return {
      skillProgress: skillProgress.sort((a, b) => b.averageScore - a.averageScore),
      recentTrends: trendData,
      sessionInsights: insights.slice(0, 6), // Show top 6 insights
      competencyRadar: radarData
    };
  }, [trainingData, sessionHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">
            {format(new Date(data.date), 'MMM dd, yyyy')}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Score:</div>
              <div className="text-sm font-medium text-blue-600">{data.score}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Skill:</div>
              <div className="text-sm font-medium text-gray-900">{data.skill}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Duration:</div>
              <div className="text-sm font-medium text-gray-900">{data.duration}min</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="font-medium text-gray-900">{data.skill}</div>
          <div className="text-sm text-gray-600">Score: {data.score.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Sessions: {data.sessions}</div>
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
      {/* Header Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Mental Training Analytics
            </h3>
            <p className="text-sm text-gray-600">Track your cognitive development and skill mastery</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {trainingData.totalSessions}
            </div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3" />
              Total Sessions
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {trainingData.averageSessionDuration.toFixed(0)}m
            </div>
            <div className="text-xs text-purple-700 flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" />
              Avg Duration
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {trainingData.streakData.current}
            </div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Current Streak
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Object.keys(trainingData.skillDistribution).length}
            </div>
            <div className="text-xs text-orange-700 flex items-center justify-center gap-1">
              <Focus className="w-3 h-3" />
              Skills Practiced
            </div>
          </div>
        </div>
      </div>

      {/* Progress Over Time */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Progress Over Time
        </h4>
        
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Competency Radar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Skill Competency Map
          </h4>
          
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competencyRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }} 
                  tickCount={5}
                />
                <Radar
                  name="Average Score"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Training Focus Distribution
          </h4>
          
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(trainingData.skillDistribution).map(([skill, count]) => ({
                    name: skill,
                    value: count,
                    color: skillColors[skill as keyof typeof skillColors] || '#6b7280'
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(trainingData.skillDistribution).map(([skill], index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={skillColors[skill as keyof typeof skillColors] || '#6b7280'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill Progress Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Individual Skill Progress
        </h4>
        
        <div className="space-y-4">
          {skillProgress.map((skill, index) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-medium text-gray-900">{skill.skill}</h5>
                  <p className="text-sm text-gray-600">
                    {skill.currentLevel} • {skill.sessionsCompleted} sessions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {skill.averageScore.toFixed(1)}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    skill.improvement > 0 ? 'text-green-600' : 
                    skill.improvement < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {skill.improvement > 0 ? '↗' : skill.improvement < 0 ? '↘' : '→'}
                    {Math.abs(skill.improvement).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress to {skill.nextMilestone}</span>
                  <span>{skill.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Session Insights */}
      {sessionInsights.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Training Insights
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">
                        {insight.title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
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

export default MentalTrainingStats;