import { 
  DailyTask, 
  DailyTaskStatus, 
  Card, 
  CardStatus,
  TaskDuration 
} from '../types';
import { 
  IdentityQuality, 
  IdentityEvidence, 
  IdentityChallenge,
  IdentityMilestone 
} from '../types/identity';

export interface AnalyticsData {
  tasks: DailyTask[];
  cards: Card[];
  identityQualities: IdentityQuality[];
  identityEvidence: IdentityEvidence[];
  challenges: IdentityChallenge[];
  milestones: IdentityMilestone[];
}

export interface HabitAnalytics {
  id: number;
  name: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  averageCompletionTime: string | null;
  consistencyScore: number;
  weeklyPattern: number[];
  monthlyTrend: { date: string; completed: boolean }[];
}

export interface TaskVelocityMetrics {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  completionRateByLane: { [lane: string]: number };
  completionRateByDuration: { [duration: string]: number };
  peakProductivityHours: string[];
  velocityTrend: { date: string; completed: number; total: number }[];
}

export interface MentalTrainingMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  skillDistribution: { [skill: string]: number };
  progressOverTime: { date: string; score: number }[];
  streakData: { current: number; longest: number };
  competencyLevels: { [skill: string]: string };
}

export interface ManifestationMetrics {
  totalManifestations: number;
  successRate: number;
  averageTimeToManifest: number;
  categoryBreakdown: { [category: string]: { total: number; successful: number } };
  monthlyTrend: { date: string; created: number; achieved: number }[];
  powerStatementUsage: { statement: string; frequency: number; effectivenessScore: number }[];
}

export interface IdentityGrowthMetrics {
  qualityStrengthDistribution: { [category: string]: number };
  growthRates: { [qualityName: string]: number };
  evidenceByType: { [type: string]: number };
  milestonesByMonth: { date: string; count: number }[];
  topGrowingQualities: { name: string; growthRate: number; strength: number }[];
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Habit Analytics Methods
  public calculateHabitAnalytics(
    habits: any[], 
    completionHistory: { habitId: number; date: string; completed: boolean }[]
  ): HabitAnalytics[] {
    return habits.map(habit => {
      const habitHistory = completionHistory.filter(h => h.habitId === habit.id);
      const completedHistory = habitHistory.filter(h => h.completed);
      
      return {
        id: habit.id,
        name: habit.name,
        completionRate: this.calculateCompletionRate(habitHistory),
        currentStreak: this.calculateCurrentStreak(habitHistory),
        longestStreak: this.calculateLongestStreak(habitHistory),
        totalCompletions: completedHistory.length,
        averageCompletionTime: this.calculateAverageCompletionTime(habit, completedHistory),
        consistencyScore: this.calculateConsistencyScore(habitHistory),
        weeklyPattern: this.calculateWeeklyPattern(habitHistory),
        monthlyTrend: this.getMonthlyTrend(habitHistory)
      };
    });
  }

  public calculateTaskVelocityMetrics(tasks: DailyTask[]): TaskVelocityMetrics {
    const completedTasks = tasks.filter(task => task.status === DailyTaskStatus.COMPLETED);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTasks = tasks.filter(task => new Date(task.created_at) >= thirtyDaysAgo);
    const recentCompletedTasks = completedTasks.filter(task => new Date(task.created_at) >= thirtyDaysAgo);

    return {
      dailyAverage: this.calculateDailyAverage(recentCompletedTasks),
      weeklyAverage: this.calculateWeeklyAverage(recentCompletedTasks),
      monthlyAverage: recentCompletedTasks.length,
      completionRateByLane: this.calculateCompletionByLane(tasks),
      completionRateByDuration: this.calculateCompletionByDuration(tasks),
      peakProductivityHours: this.calculatePeakHours(completedTasks),
      velocityTrend: this.calculateVelocityTrend(tasks)
    };
  }

  public calculateMentalTrainingMetrics(
    trainingData: any[]
  ): MentalTrainingMetrics {
    const sessions = trainingData.filter(session => session.type === 'mental_training');
    
    return {
      totalSessions: sessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      skillDistribution: this.calculateSkillDistribution(sessions),
      progressOverTime: this.calculateProgressOverTime(sessions),
      streakData: this.calculateTrainingStreak(sessions),
      competencyLevels: this.calculateCompetencyLevels(sessions)
    };
  }

  public calculateManifestationMetrics(
    manifestations: any[],
    powerStatements: any[]
  ): ManifestationMetrics {
    const achieved = manifestations.filter(m => m.status === 'achieved');
    
    return {
      totalManifestations: manifestations.length,
      successRate: (achieved.length / manifestations.length) * 100,
      averageTimeToManifest: this.calculateAverageManifestationTime(achieved),
      categoryBreakdown: this.calculateManifestationBreakdown(manifestations),
      monthlyTrend: this.calculateManifestationTrend(manifestations),
      powerStatementUsage: this.calculatePowerStatementMetrics(powerStatements, achieved)
    };
  }

  public calculateIdentityGrowthMetrics(
    qualities: IdentityQuality[],
    evidence: IdentityEvidence[],
    milestones: IdentityMilestone[]
  ): IdentityGrowthMetrics {
    return {
      qualityStrengthDistribution: this.calculateStrengthDistribution(qualities),
      growthRates: this.calculateQualityGrowthRates(qualities),
      evidenceByType: this.calculateEvidenceDistribution(evidence),
      milestonesByMonth: this.calculateMilestonesByMonth(milestones),
      topGrowingQualities: this.getTopGrowingQualities(qualities, 5)
    };
  }

  // Helper Methods for Habit Analytics
  private calculateCompletionRate(history: { completed: boolean }[]): number {
    if (history.length === 0) return 0;
    return (history.filter(h => h.completed).length / history.length) * 100;
  }

  private calculateCurrentStreak(history: { date: string; completed: boolean }[]): number {
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    
    for (const record of sortedHistory) {
      if (record.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(history: { date: string; completed: boolean }[]): number {
    const sortedHistory = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const record of sortedHistory) {
      if (record.completed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  private calculateAverageCompletionTime(habit: any, completedHistory: any[]): string | null {
    if (!habit.scheduled_time || completedHistory.length === 0) return null;
    
    const scheduledMinutes = this.timeStringToMinutes(habit.scheduled_time);
    const completionTimes = completedHistory
      .map(h => this.timeStringToMinutes(h.completed_at))
      .filter(time => time !== null);
    
    if (completionTimes.length === 0) return null;
    
    const validTimes = completionTimes.filter((t): t is number => t !== null);
    if (validTimes.length === 0) return null;
    const avgMinutes = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
    return this.minutesToTimeString(avgMinutes);
  }

  private calculateConsistencyScore(history: { date: string; completed: boolean }[]): number {
    if (history.length === 0) return 0;
    
    const last7Days = history.slice(-7);
    const last30Days = history.slice(-30);
    
    const recent7Score = this.calculateCompletionRate(last7Days);
    const recent30Score = this.calculateCompletionRate(last30Days);
    
    // Weight recent performance more heavily
    return (recent7Score * 0.7 + recent30Score * 0.3);
  }

  private calculateWeeklyPattern(history: { date: string; completed: boolean }[]): number[] {
    const pattern = new Array(7).fill(0);
    const counts = new Array(7).fill(0);
    
    history.forEach(record => {
      const dayOfWeek = new Date(record.date).getDay();
      counts[dayOfWeek]++;
      if (record.completed) {
        pattern[dayOfWeek]++;
      }
    });
    
    return pattern.map((completed, index) => 
      counts[index] > 0 ? (completed / counts[index]) * 100 : 0
    );
  }

  private getMonthlyTrend(history: { date: string; completed: boolean }[]): { date: string; completed: boolean }[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return history
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Helper Methods for Task Velocity
  private calculateDailyAverage(tasks: DailyTask[]): number {
    const tasksByDay = this.groupTasksByDay(tasks);
    const dailyCounts = Object.values(tasksByDay).map(dayTasks => dayTasks.length);
    return dailyCounts.length > 0 ? 
      dailyCounts.reduce((sum, count) => sum + count, 0) / dailyCounts.length : 0;
  }

  private calculateWeeklyAverage(tasks: DailyTask[]): number {
    return this.calculateDailyAverage(tasks) * 7;
  }

  private calculateCompletionByLane(tasks: DailyTask[]): { [lane: string]: number } {
    const lanes = ['controller', 'main'];
    const result: { [lane: string]: number } = {};
    
    lanes.forEach(lane => {
      const laneTasks = tasks.filter(task => task.lane === lane);
      const completedLaneTasks = laneTasks.filter(task => task.status === DailyTaskStatus.COMPLETED);
      result[lane] = laneTasks.length > 0 ? (completedLaneTasks.length / laneTasks.length) * 100 : 0;
    });
    
    return result;
  }

  private calculateCompletionByDuration(tasks: DailyTask[]): { [duration: string]: number } {
    const durations = [TaskDuration.TEN_MIN, TaskDuration.FIFTEEN_MIN, TaskDuration.THIRTY_MIN];
    const result: { [duration: string]: number } = {};
    
    durations.forEach(duration => {
      const durationTasks = tasks.filter(task => task.duration === duration);
      const completedDurationTasks = durationTasks.filter(task => task.status === DailyTaskStatus.COMPLETED);
      result[duration] = durationTasks.length > 0 ? 
        (completedDurationTasks.length / durationTasks.length) * 100 : 0;
    });
    
    return result;
  }

  private calculatePeakHours(tasks: DailyTask[]): string[] {
    const hourCounts: { [hour: string]: number } = {};
    
    tasks.forEach(task => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);
    
    return sortedHours;
  }

  private calculateVelocityTrend(tasks: DailyTask[]): { date: string; completed: number; total: number }[] {
    const tasksByDay = this.groupTasksByDay(tasks);
    
    return Object.entries(tasksByDay).map(([date, dayTasks]) => {
      const completed = dayTasks.filter(task => task.status === DailyTaskStatus.COMPLETED).length;
      return {
        date,
        completed,
        total: dayTasks.length
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Helper Methods for Mental Training
  private calculateAverageSessionDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return totalDuration / sessions.length;
  }

  private calculateSkillDistribution(sessions: any[]): { [skill: string]: number } {
    const distribution: { [skill: string]: number } = {};
    sessions.forEach(session => {
      const skill = session.skill || 'General';
      distribution[skill] = (distribution[skill] || 0) + 1;
    });
    return distribution;
  }

  private calculateProgressOverTime(sessions: any[]): { date: string; score: number }[] {
    return sessions
      .map(session => ({
        date: session.created_at,
        score: session.score || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateTrainingStreak(sessions: any[]): { current: number; longest: number } {
    const sessionDates = sessions.map(s => s.created_at).sort();
    return {
      current: this.calculateCurrentStreakFromDates(sessionDates),
      longest: this.calculateLongestStreakFromDates(sessionDates)
    };
  }

  private calculateCompetencyLevels(sessions: any[]): { [skill: string]: string } {
    const skillScores: { [skill: string]: number[] } = {};
    
    sessions.forEach(session => {
      const skill = session.skill || 'General';
      if (!skillScores[skill]) skillScores[skill] = [];
      skillScores[skill].push(session.score || 0);
    });
    
    const levels: { [skill: string]: string } = {};
    Object.entries(skillScores).forEach(([skill, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      levels[skill] = this.getCompetencyLevel(avgScore);
    });
    
    return levels;
  }

  // Helper Methods for Manifestation Analytics
  private calculateAverageManifestationTime(achieved: any[]): number {
    const manifestationTimes = achieved.map(m => {
      const created = new Date(m.created_at).getTime();
      const achieved = new Date(m.achieved_at).getTime();
      return Math.ceil((achieved - created) / (1000 * 60 * 60 * 24)); // days
    });
    
    return manifestationTimes.length > 0 ? 
      manifestationTimes.reduce((sum, time) => sum + time, 0) / manifestationTimes.length : 0;
  }

  private calculateManifestationBreakdown(manifestations: any[]): { [category: string]: { total: number; successful: number } } {
    const breakdown: { [category: string]: { total: number; successful: number } } = {};
    
    manifestations.forEach(m => {
      const category = m.category || 'Other';
      if (!breakdown[category]) {
        breakdown[category] = { total: 0, successful: 0 };
      }
      breakdown[category].total++;
      if (m.status === 'achieved') {
        breakdown[category].successful++;
      }
    });
    
    return breakdown;
  }

  private calculateManifestationTrend(manifestations: any[]): { date: string; created: number; achieved: number }[] {
    const trendData: { [month: string]: { created: number; achieved: number } } = {};
    
    manifestations.forEach(m => {
      const createdMonth = new Date(m.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!trendData[createdMonth]) {
        trendData[createdMonth] = { created: 0, achieved: 0 };
      }
      trendData[createdMonth].created++;
      
      if (m.achieved_at) {
        const achievedMonth = new Date(m.achieved_at).toISOString().slice(0, 7);
        if (!trendData[achievedMonth]) {
          trendData[achievedMonth] = { created: 0, achieved: 0 };
        }
        trendData[achievedMonth].achieved++;
      }
    });
    
    return Object.entries(trendData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculatePowerStatementMetrics(statements: any[], achievements: any[]): { statement: string; frequency: number; effectivenessScore: number }[] {
    return statements.map(statement => {
      const relatedAchievements = achievements.filter(a => 
        a.power_statements_used && a.power_statements_used.includes(statement.id)
      );
      
      return {
        statement: statement.text,
        frequency: statement.usage_count || 0,
        effectivenessScore: relatedAchievements.length > 0 ? 
          (relatedAchievements.length / (statement.usage_count || 1)) * 100 : 0
      };
    });
  }

  // Helper Methods for Identity Growth
  private calculateStrengthDistribution(qualities: IdentityQuality[]): { [category: string]: number } {
    const distribution: { [category: string]: number } = {};
    
    qualities.forEach(quality => {
      const category = quality.category;
      if (!distribution[category]) distribution[category] = 0;
      distribution[category] += quality.strength;
    });
    
    return distribution;
  }

  private calculateQualityGrowthRates(qualities: IdentityQuality[]): { [qualityName: string]: number } {
    const growthRates: { [qualityName: string]: number } = {};
    
    qualities.forEach(quality => {
      growthRates[quality.quality_name] = quality.growth_rate;
    });
    
    return growthRates;
  }

  private calculateEvidenceDistribution(evidence: IdentityEvidence[]): { [type: string]: number } {
    const distribution: { [type: string]: number } = {};
    
    evidence.forEach(e => {
      distribution[e.evidence_type] = (distribution[e.evidence_type] || 0) + 1;
    });
    
    return distribution;
  }

  private calculateMilestonesByMonth(milestones: IdentityMilestone[]): { date: string; count: number }[] {
    const monthlyData: { [month: string]: number } = {};
    
    milestones.forEach(milestone => {
      const month = new Date(milestone.achieved_at).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getTopGrowingQualities(qualities: IdentityQuality[], limit: number): { name: string; growthRate: number; strength: number }[] {
    return qualities
      .sort((a, b) => b.growth_rate - a.growth_rate)
      .slice(0, limit)
      .map(q => ({
        name: q.quality_name,
        growthRate: q.growth_rate,
        strength: q.strength
      }));
  }

  // Utility Methods
  private timeStringToMinutes(timeString: string): number | null {
    const match = timeString.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private groupTasksByDay(tasks: DailyTask[]): { [date: string]: DailyTask[] } {
    return tasks.reduce((groups, task) => {
      const date = new Date(task.created_at).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
      return groups;
    }, {} as { [date: string]: DailyTask[] });
  }

  private calculateCurrentStreakFromDates(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const dateStr of sortedDates) {
      const sessionDate = new Date(dateStr);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreakFromDates(dates: string[]): number {
    if (dates.length === 0) return 0;
    
    const uniqueDates = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))]
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }

  private getCompetencyLevel(score: number): string {
    if (score >= 90) return 'Expert';
    if (score >= 75) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    if (score >= 40) return 'Beginner';
    return 'Novice';
  }
}

export default AnalyticsService;