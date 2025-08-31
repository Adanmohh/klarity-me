import { 
  format, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  differenceInDays,
  addDays,
  subMonths,
  subWeeks,
  startOfDay,
  endOfDay
} from 'date-fns';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { eachWeekOfInterval } from 'date-fns/eachWeekOfInterval';
import { eachMonthOfInterval } from 'date-fns/eachMonthOfInterval';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import { parseISO } from 'date-fns/parseISO';

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface AggregatedData {
  daily: TimeSeriesData[];
  weekly: TimeSeriesData[];
  monthly: TimeSeriesData[];
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  significance: 'low' | 'medium' | 'high';
  summary: string;
}

export interface PredictiveInsight {
  type: 'streak_risk' | 'peak_performance' | 'goal_achievement' | 'habit_formation';
  confidence: number;
  prediction: string;
  recommendedActions: string[];
  timeframe: string;
}

export class DataAggregator {
  
  /**
   * Aggregate data into daily, weekly, and monthly buckets
   */
  public static aggregateTimeSeriesData(
    data: { date: string; value: number }[],
    period: 'day' | 'week' | 'month' = 'day',
    aggregationType: 'sum' | 'average' | 'count' = 'sum'
  ): AggregatedData {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const twelveWeeksAgo = subWeeks(now, 12);
    const sixMonthsAgo = subMonths(now, 6);

    return {
      daily: this.aggregateByPeriod(data, thirtyDaysAgo, now, 'day', aggregationType),
      weekly: this.aggregateByPeriod(data, twelveWeeksAgo, now, 'week', aggregationType),
      monthly: this.aggregateByPeriod(data, sixMonthsAgo, now, 'month', aggregationType)
    };
  }

  /**
   * Aggregate data for a specific time period
   */
  private static aggregateByPeriod(
    data: { date: string; value: number }[],
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
    aggregationType: 'sum' | 'average' | 'count'
  ): TimeSeriesData[] {
    let intervals: Date[];
    
    switch (period) {
      case 'day':
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'week':
        intervals = eachWeekOfInterval({ start: startDate, end: endDate });
        break;
      case 'month':
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
    }

    return intervals.map(intervalStart => {
      const intervalEnd = period === 'day' 
        ? endOfDay(intervalStart)
        : period === 'week' 
          ? endOfWeek(intervalStart)
          : endOfMonth(intervalStart);

      const periodsData = data.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: intervalStart, end: intervalEnd });
      });

      let value = 0;
      switch (aggregationType) {
        case 'sum':
          value = periodsData.reduce((sum, item) => sum + item.value, 0);
          break;
        case 'average':
          value = periodsData.length > 0 
            ? periodsData.reduce((sum, item) => sum + item.value, 0) / periodsData.length 
            : 0;
          break;
        case 'count':
          value = periodsData.length;
          break;
      }

      return {
        date: format(intervalStart, period === 'day' ? 'yyyy-MM-dd' : period === 'week' ? 'yyyy-\'W\'ww' : 'yyyy-MM'),
        value,
        label: format(intervalStart, period === 'day' ? 'MMM dd' : period === 'week' ? 'Week of MMM dd' : 'MMM yyyy')
      };
    });
  }

  /**
   * Calculate completion rates over time
   */
  public static calculateCompletionRates(
    completedItems: { date: string }[],
    totalItems: { date: string }[],
    period: 'day' | 'week' | 'month' = 'day'
  ): TimeSeriesData[] {
    const now = new Date();
    const startDate = period === 'day' ? subDays(now, 30) : 
                     period === 'week' ? subWeeks(now, 12) : 
                     subMonths(now, 6);

    let intervals: Date[];
    
    switch (period) {
      case 'day':
        intervals = eachDayOfInterval({ start: startDate, end: now });
        break;
      case 'week':
        intervals = eachWeekOfInterval({ start: startDate, end: now });
        break;
      case 'month':
        intervals = eachMonthOfInterval({ start: startDate, end: now });
        break;
    }

    return intervals.map(intervalStart => {
      const intervalEnd = period === 'day' 
        ? endOfDay(intervalStart)
        : period === 'week' 
          ? endOfWeek(intervalStart)
          : endOfMonth(intervalStart);

      const completedInPeriod = completedItems.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: intervalStart, end: intervalEnd });
      }).length;

      const totalInPeriod = totalItems.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: intervalStart, end: intervalEnd });
      }).length;

      const completionRate = totalInPeriod > 0 ? (completedInPeriod / totalInPeriod) * 100 : 0;

      return {
        date: format(intervalStart, period === 'day' ? 'yyyy-MM-dd' : period === 'week' ? 'yyyy-\'W\'ww' : 'yyyy-MM'),
        value: completionRate,
        label: format(intervalStart, period === 'day' ? 'MMM dd' : period === 'week' ? 'Week of MMM dd' : 'MMM yyyy')
      };
    });
  }

  /**
   * Calculate streaks from completion data
   */
  public static calculateStreaks(completionData: { date: string; completed: boolean }[]): {
    currentStreak: number;
    longestStreak: number;
    streakHistory: { date: string; streakLength: number }[];
    streakBreaks: { date: string; streakLength: number }[];
  } {
    const sortedData = completionData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const streakHistory: { date: string; streakLength: number }[] = [];
    const streakBreaks: { date: string; streakLength: number }[] = [];

    // Calculate current streak (from end)
    const reversedData = [...sortedData].reverse();
    for (const item of reversedData) {
      if (item.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak and history
    for (let i = 0; i < sortedData.length; i++) {
      const item = sortedData[i];
      
      if (item.completed) {
        tempStreak++;
        streakHistory.push({
          date: item.date,
          streakLength: tempStreak
        });
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (tempStreak > 0) {
          streakBreaks.push({
            date: sortedData[i - 1].date,
            streakLength: tempStreak
          });
          tempStreak = 0;
        }
        streakHistory.push({
          date: item.date,
          streakLength: 0
        });
      }
    }

    return {
      currentStreak,
      longestStreak,
      streakHistory,
      streakBreaks
    };
  }

  /**
   * Analyze trends in data
   */
  public static analyzeTrend(data: TimeSeriesData[], period: 'recent' | 'longterm' = 'recent'): TrendAnalysis {
    if (data.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        significance: 'low',
        summary: 'Insufficient data for trend analysis'
      };
    }

    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // For recent trend, look at last 7 days vs previous 7 days
    // For long-term, look at first vs last quarter of data
    let compareData: { recent: number; previous: number };
    
    if (period === 'recent' && sortedData.length >= 14) {
      const recentAvg = sortedData.slice(-7).reduce((sum, item) => sum + item.value, 0) / 7;
      const previousAvg = sortedData.slice(-14, -7).reduce((sum, item) => sum + item.value, 0) / 7;
      compareData = { recent: recentAvg, previous: previousAvg };
    } else {
      const quarterSize = Math.floor(sortedData.length / 4);
      const recentAvg = sortedData.slice(-quarterSize).reduce((sum, item) => sum + item.value, 0) / quarterSize;
      const previousAvg = sortedData.slice(0, quarterSize).reduce((sum, item) => sum + item.value, 0) / quarterSize;
      compareData = { recent: recentAvg, previous: previousAvg };
    }

    const percentageChange = compareData.previous !== 0 
      ? ((compareData.recent - compareData.previous) / compareData.previous) * 100
      : 0;

    let direction: 'up' | 'down' | 'stable';
    let significance: 'low' | 'medium' | 'high';

    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
      significance = 'low';
    } else if (percentageChange > 0) {
      direction = 'up';
      significance = Math.abs(percentageChange) > 20 ? 'high' : 'medium';
    } else {
      direction = 'down';
      significance = Math.abs(percentageChange) > 20 ? 'high' : 'medium';
    }

    const summary = this.generateTrendSummary(direction, percentageChange, significance);

    return {
      direction,
      percentage: Math.abs(percentageChange),
      significance,
      summary
    };
  }

  /**
   * Generate predictive insights based on historical data
   */
  public static generatePredictiveInsights(
    completionData: { date: string; completed: boolean }[],
    habitData?: any[],
    goalData?: any[]
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Streak Risk Analysis
    const streakAnalysis = this.calculateStreaks(completionData);
    if (streakAnalysis.currentStreak >= 7) {
      const recentMisses = completionData.slice(-14).filter(d => !d.completed).length;
      if (recentMisses > 3) {
        insights.push({
          type: 'streak_risk',
          confidence: 0.75,
          prediction: `Your ${streakAnalysis.currentStreak}-day streak is at risk. Recent completion rate shows declining consistency.`,
          recommendedActions: [
            'Set up reminder notifications',
            'Reduce habit difficulty temporarily',
            'Focus on your strongest motivations'
          ],
          timeframe: '3-5 days'
        });
      }
    }

    // Peak Performance Prediction
    const weeklyPerformance = this.calculateWeeklyPerformance(completionData);
    const bestDay = weeklyPerformance.reduce((max, day) => 
      day.completionRate > max.completionRate ? day : max
    );

    if (bestDay.completionRate > 80) {
      insights.push({
        type: 'peak_performance',
        confidence: 0.85,
        prediction: `Based on your patterns, ${bestDay.dayName}s are your peak performance days with ${bestDay.completionRate.toFixed(0)}% completion rate.`,
        recommendedActions: [
          `Schedule most important habits on ${bestDay.dayName}s`,
          'Review what makes these days successful',
          'Replicate successful patterns on other days'
        ],
        timeframe: 'Weekly pattern'
      });
    }

    // Habit Formation Prediction
    if (habitData && habitData.length > 0) {
      const formingHabits = habitData.filter(habit => {
        const habitCompletions = completionData.filter(d => d.completed && d.date);
        return habitCompletions.length >= 21 && habitCompletions.length < 66;
      });

      formingHabits.forEach(habit => {
        insights.push({
          type: 'habit_formation',
          confidence: 0.70,
          prediction: `${habit.name} is in the habit formation zone. Consistency over the next 3 weeks is crucial.`,
          recommendedActions: [
            'Maintain absolute consistency for 21 more days',
            'Prepare for the habit formation plateau',
            'Have backup plans for challenging days'
          ],
          timeframe: '21 days'
        });
      });
    }

    return insights;
  }

  /**
   * Calculate moving averages for smoothing data
   */
  public static calculateMovingAverage(
    data: TimeSeriesData[], 
    windowSize: number = 7
  ): TimeSeriesData[] {
    return data.map((item, index) => {
      const startIndex = Math.max(0, index - Math.floor(windowSize / 2));
      const endIndex = Math.min(data.length - 1, index + Math.floor(windowSize / 2));
      
      const windowData = data.slice(startIndex, endIndex + 1);
      const average = windowData.reduce((sum, d) => sum + d.value, 0) / windowData.length;
      
      return {
        ...item,
        value: average
      };
    });
  }

  /**
   * Calculate correlations between different metrics
   */
  public static calculateCorrelation(
    dataA: TimeSeriesData[],
    dataB: TimeSeriesData[]
  ): { correlation: number; strength: string; interpretation: string } {
    // Align data by date
    const alignedData = dataA.map(itemA => {
      const matchingB = dataB.find(itemB => itemB.date === itemA.date);
      return matchingB ? { a: itemA.value, b: matchingB.value } : null;
    }).filter(item => item !== null) as { a: number; b: number }[];

    if (alignedData.length < 3) {
      return {
        correlation: 0,
        strength: 'insufficient_data',
        interpretation: 'Not enough overlapping data points for correlation analysis'
      };
    }

    // Calculate Pearson correlation coefficient
    const n = alignedData.length;
    const sumA = alignedData.reduce((sum, item) => sum + item.a, 0);
    const sumB = alignedData.reduce((sum, item) => sum + item.b, 0);
    const sumAB = alignedData.reduce((sum, item) => sum + (item.a * item.b), 0);
    const sumA2 = alignedData.reduce((sum, item) => sum + (item.a * item.a), 0);
    const sumB2 = alignedData.reduce((sum, item) => sum + (item.b * item.b), 0);

    const numerator = (n * sumAB) - (sumA * sumB);
    const denominator = Math.sqrt(((n * sumA2) - (sumA * sumA)) * ((n * sumB2) - (sumB * sumB)));

    const correlation = denominator !== 0 ? numerator / denominator : 0;

    let strength: string;
    if (Math.abs(correlation) >= 0.8) strength = 'very_strong';
    else if (Math.abs(correlation) >= 0.6) strength = 'strong';
    else if (Math.abs(correlation) >= 0.4) strength = 'moderate';
    else if (Math.abs(correlation) >= 0.2) strength = 'weak';
    else strength = 'very_weak';

    const interpretation = this.generateCorrelationInterpretation(correlation, strength);

    return { correlation, strength, interpretation };
  }

  /**
   * Calculate statistical summary of data
   */
  public static calculateStatisticalSummary(data: TimeSeriesData[]): {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    variance: number;
    min: number;
    max: number;
    range: number;
    quartiles: { q1: number; q2: number; q3: number };
  } {
    const values = data.map(d => d.value).sort((a, b) => a - b);
    const n = values.length;

    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 ? 
      (values[n / 2 - 1] + values[n / 2]) / 2 : 
      values[Math.floor(n / 2)];

    // Calculate mode (most frequent value)
    const frequency: { [key: number]: number } = {};
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const mode = Number(Object.entries(frequency).reduce((max, [val, freq]) => 
      freq > max.freq ? { val: Number(val), freq } : max, { val: 0, freq: 0 }
    ).val);

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const q1Index = Math.floor(n / 4);
    const q2Index = Math.floor(n / 2);
    const q3Index = Math.floor(3 * n / 4);

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min,
      max,
      range,
      quartiles: {
        q1: values[q1Index],
        q2: values[q2Index],
        q3: values[q3Index]
      }
    };
  }

  // Helper Methods
  private static generateTrendSummary(
    direction: 'up' | 'down' | 'stable', 
    percentage: number, 
    significance: 'low' | 'medium' | 'high'
  ): string {
    const absPercentage = Math.abs(percentage).toFixed(1);
    
    if (direction === 'stable') {
      return `Performance has been stable with minimal variation (${absPercentage}% change)`;
    }
    
    const trendWord = direction === 'up' ? 'improved' : 'declined';
    const significanceWord = significance === 'high' ? 'significantly' : 
                            significance === 'medium' ? 'moderately' : 'slightly';
    
    return `Performance has ${significanceWord} ${trendWord} by ${absPercentage}%`;
  }

  private static generateCorrelationInterpretation(correlation: number, strength: string): string {
    const direction = correlation > 0 ? 'positive' : 'negative';
    const absCorr = Math.abs(correlation).toFixed(2);
    
    return `${direction.charAt(0).toUpperCase() + direction.slice(1)} ${strength.replace('_', ' ')} correlation (r = ${correlation >= 0 ? '+' : ''}${correlation.toFixed(2)})`;
  }

  private static calculateWeeklyPerformance(completionData: { date: string; completed: boolean }[]): {
    dayName: string;
    dayNumber: number;
    completionRate: number;
  }[] {
    const dayPerformance = Array.from({ length: 7 }, (_, i) => ({
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
      dayNumber: i,
      completed: 0,
      total: 0
    }));

    completionData.forEach(item => {
      const dayOfWeek = new Date(item.date).getDay();
      dayPerformance[dayOfWeek].total++;
      if (item.completed) {
        dayPerformance[dayOfWeek].completed++;
      }
    });

    return dayPerformance.map(day => ({
      dayName: day.dayName,
      dayNumber: day.dayNumber,
      completionRate: day.total > 0 ? (day.completed / day.total) * 100 : 0
    }));
  }
}

export default DataAggregator;