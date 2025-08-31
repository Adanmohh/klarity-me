// Auto-Check Service - Intelligently handles habit completion based on configurable rules
interface Habit {
  id: number;
  name: string;
  scheduled_time: string;
  quality_name: string;
  completed: boolean;
  streak: number;
  autoCheckEnabled?: boolean;
  autoCheckWindowMinutes?: number;
  autoCheckRules?: AutoCheckRule[];
}

interface AutoCheckRule {
  type: 'time_window' | 'location' | 'activity' | 'calendar_event' | 'manual_pattern';
  enabled: boolean;
  config: {
    // Time window rule
    windowStartMinutes?: number; // minutes after scheduled time
    windowEndMinutes?: number; // minutes after scheduled time
    
    // Location rule (future enhancement)
    locationName?: string;
    radius?: number; // meters
    
    // Activity rule (future enhancement)
    activityType?: string; // 'walking', 'running', 'stationary'
    minDuration?: number; // minutes
    
    // Calendar event rule (future enhancement)
    eventKeywords?: string[];
    eventDuration?: number;
    
    // Manual pattern rule
    timePatterns?: string[]; // time ranges like '06:00-06:30'
    dayPatterns?: string[]; // days like 'monday', 'weekday', 'weekend'
  };
  confidence?: number; // 0-100, how confident we are this rule applies
}

interface AutoCheckSettings {
  globalEnabled: boolean;
  defaultWindowMinutes: number;
  confidenceThreshold: number; // minimum confidence to auto-check
  requireUserConsent: boolean; // ask user before auto-checking
  notifyOnAutoCheck: boolean;
  preserveStreaks: boolean;
  learningEnabled: boolean; // learn from user patterns
}

interface AutoCheckEvent {
  habitId: number;
  habitName: string;
  timestamp: Date;
  rule: AutoCheckRule;
  confidence: number;
  reason: string;
  userConfirmed?: boolean;
}

class AutoCheckService {
  private static instance: AutoCheckService;
  private settings: AutoCheckSettings;
  private autoCheckHistory: AutoCheckEvent[] = [];
  private pendingAutoChecks: Map<number, AutoCheckEvent> = new Map();
  private userPatterns: Map<number, UserPattern> = new Map();

  private constructor() {
    this.settings = this.loadSettings();
    this.loadUserPatterns();
  }

  static getInstance(): AutoCheckService {
    if (!AutoCheckService.instance) {
      AutoCheckService.instance = new AutoCheckService();
    }
    return AutoCheckService.instance;
  }

  private loadSettings(): AutoCheckSettings {
    const saved = localStorage.getItem('autoCheckSettings');
    return saved ? JSON.parse(saved) : {
      globalEnabled: false, // Disabled by default for user consent
      defaultWindowMinutes: 30,
      confidenceThreshold: 70,
      requireUserConsent: true,
      notifyOnAutoCheck: true,
      preserveStreaks: true,
      learningEnabled: true,
    };
  }

  private saveSettings(): void {
    localStorage.setItem('autoCheckSettings', JSON.stringify(this.settings));
  }

  private loadUserPatterns(): void {
    const saved = localStorage.getItem('habitUserPatterns');
    if (saved) {
      const patterns = JSON.parse(saved);
      Object.entries(patterns).forEach(([habitId, pattern]) => {
        this.userPatterns.set(Number(habitId), pattern as UserPattern);
      });
    }
  }

  private saveUserPatterns(): void {
    const patterns: Record<number, UserPattern> = {};
    this.userPatterns.forEach((pattern, habitId) => {
      patterns[habitId] = pattern;
    });
    localStorage.setItem('habitUserPatterns', JSON.stringify(patterns));
  }

  // Main auto-check evaluation method
  async evaluateHabitForAutoCheck(habit: Habit, currentTime: Date = new Date()): Promise<AutoCheckEvent | null> {
    if (!this.settings.globalEnabled || !habit.autoCheckEnabled || habit.completed) {
      return null;
    }

    const [habitHour, habitMinute] = habit.scheduled_time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(habitHour, habitMinute, 0, 0);

    // Check if we're within any auto-check window
    const applicableRules = this.getApplicableRules(habit, currentTime, scheduledTime);
    
    if (applicableRules.length === 0) {
      return null;
    }

    // Calculate confidence based on rules and user patterns
    const bestRule = this.selectBestRule(applicableRules, habit);
    const confidence = this.calculateConfidence(habit, bestRule, currentTime, scheduledTime);

    if (confidence < this.settings.confidenceThreshold) {
      return null;
    }

    const autoCheckEvent: AutoCheckEvent = {
      habitId: habit.id,
      habitName: habit.name,
      timestamp: currentTime,
      rule: bestRule,
      confidence,
      reason: this.generateReason(bestRule, confidence),
    };

    // If user consent is required and confidence is not 100%, add to pending
    if (this.settings.requireUserConsent && confidence < 100) {
      this.pendingAutoChecks.set(habit.id, autoCheckEvent);
      return null; // Don't auto-check yet, wait for user confirmation
    }

    return autoCheckEvent;
  }

  private getApplicableRules(habit: Habit, currentTime: Date, scheduledTime: Date): AutoCheckRule[] {
    const rules = habit.autoCheckRules || this.getDefaultRules(habit);
    
    return rules.filter(rule => {
      if (!rule.enabled) return false;

      switch (rule.type) {
        case 'time_window':
          return this.isWithinTimeWindow(currentTime, scheduledTime, rule);
        case 'manual_pattern':
          return this.matchesManualPattern(currentTime, rule);
        // Future enhancements
        case 'location':
        case 'activity':
        case 'calendar_event':
          return false; // Not implemented yet
        default:
          return false;
      }
    });
  }

  private getDefaultRules(habit: Habit): AutoCheckRule[] {
    return [
      {
        type: 'time_window',
        enabled: true,
        config: {
          windowStartMinutes: 0,
          windowEndMinutes: habit.autoCheckWindowMinutes || this.settings.defaultWindowMinutes,
        },
        confidence: 80,
      },
    ];
  }

  private isWithinTimeWindow(currentTime: Date, scheduledTime: Date, rule: AutoCheckRule): boolean {
    const { windowStartMinutes = 0, windowEndMinutes = 30 } = rule.config;
    
    const windowStart = new Date(scheduledTime.getTime() + windowStartMinutes * 60000);
    const windowEnd = new Date(scheduledTime.getTime() + windowEndMinutes * 60000);
    
    return currentTime >= windowStart && currentTime <= windowEnd;
  }

  private matchesManualPattern(currentTime: Date, rule: AutoCheckRule): boolean {
    const { timePatterns, dayPatterns } = rule.config;
    
    // Check day patterns
    if (dayPatterns && dayPatterns.length > 0) {
      const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const isWeekend = currentDay === 'saturday' || currentDay === 'sunday';
      const isWeekday = !isWeekend;
      
      const dayMatch = dayPatterns.some(pattern => {
        if (pattern === 'weekend') return isWeekend;
        if (pattern === 'weekday') return isWeekday;
        return pattern.toLowerCase() === currentDay;
      });
      
      if (!dayMatch) return false;
    }

    // Check time patterns
    if (timePatterns && timePatterns.length > 0) {
      const currentTimeStr = currentTime.toTimeString().substring(0, 5); // HH:MM format
      
      return timePatterns.some(pattern => {
        if (pattern.includes('-')) {
          const [start, end] = pattern.split('-');
          return currentTimeStr >= start && currentTimeStr <= end;
        } else {
          return currentTimeStr === pattern;
        }
      });
    }

    return true;
  }

  private selectBestRule(rules: AutoCheckRule[], habit: Habit): AutoCheckRule {
    // Sort by confidence and specificity
    return rules.sort((a, b) => {
      const confidenceA = a.confidence || 50;
      const confidenceB = b.confidence || 50;
      return confidenceB - confidenceA;
    })[0];
  }

  private calculateConfidence(habit: Habit, rule: AutoCheckRule, currentTime: Date, scheduledTime: Date): number {
    let confidence = rule.confidence || 50;

    // Adjust based on user patterns
    const userPattern = this.userPatterns.get(habit.id);
    if (userPattern && this.settings.learningEnabled) {
      confidence = this.adjustConfidenceByUserPattern(confidence, userPattern, currentTime);
    }

    // Adjust based on how close to scheduled time
    const timeDiff = Math.abs(currentTime.getTime() - scheduledTime.getTime()) / (1000 * 60); // minutes
    if (timeDiff <= 5) {
      confidence += 20; // Very close to scheduled time
    } else if (timeDiff <= 15) {
      confidence += 10; // Reasonably close
    }

    // Adjust based on habit streak (higher streaks get higher confidence)
    if (habit.streak > 7) {
      confidence += 10; // Good streak, likely to continue
    } else if (habit.streak > 30) {
      confidence += 20; // Excellent streak
    }

    return Math.min(100, Math.max(0, confidence));
  }

  private adjustConfidenceByUserPattern(baseConfidence: number, userPattern: UserPattern, currentTime: Date): number {
    const currentHour = currentTime.getHours();
    const currentDay = currentTime.getDay(); // 0 = Sunday

    // Check if current time matches user's typical completion times
    if (userPattern.typicalCompletionHours.includes(currentHour)) {
      baseConfidence += 15;
    }

    // Check if current day matches user's typical completion days
    if (userPattern.typicalCompletionDays.includes(currentDay)) {
      baseConfidence += 10;
    }

    // Check recent completion rate
    if (userPattern.recentCompletionRate > 0.8) {
      baseConfidence += 15;
    } else if (userPattern.recentCompletionRate > 0.6) {
      baseConfidence += 5;
    } else {
      baseConfidence -= 10;
    }

    return baseConfidence;
  }

  private generateReason(rule: AutoCheckRule, confidence: number): string {
    const baseReason = this.getRuleDescription(rule);
    return `${baseReason} (${confidence}% confidence)`;
  }

  private getRuleDescription(rule: AutoCheckRule): string {
    switch (rule.type) {
      case 'time_window':
        const { windowEndMinutes = 30 } = rule.config;
        return `Auto-checked within ${windowEndMinutes} minute window after scheduled time`;
      case 'manual_pattern':
        return 'Auto-checked based on your usual completion pattern';
      case 'location':
        return 'Auto-checked based on location detection';
      case 'activity':
        return 'Auto-checked based on activity detection';
      case 'calendar_event':
        return 'Auto-checked based on calendar event';
      default:
        return 'Auto-checked based on configured rules';
    }
  }

  // User pattern learning
  recordHabitCompletion(habit: Habit, completionTime: Date, wasManual: boolean = true): void {
    if (!this.settings.learningEnabled) return;

    let pattern = this.userPatterns.get(habit.id) || this.createEmptyUserPattern();
    
    const hour = completionTime.getHours();
    const day = completionTime.getDay();

    // Update typical completion times
    if (!pattern.typicalCompletionHours.includes(hour)) {
      pattern.typicalCompletionHours.push(hour);
    }

    if (!pattern.typicalCompletionDays.includes(day)) {
      pattern.typicalCompletionDays.push(day);
    }

    // Update completion history (keep last 30 days)
    pattern.completionHistory.push({
      date: completionTime.toISOString().split('T')[0],
      hour,
      day,
      wasManual,
    });

    if (pattern.completionHistory.length > 30) {
      pattern.completionHistory = pattern.completionHistory.slice(-30);
    }

    // Recalculate recent completion rate
    pattern.recentCompletionRate = this.calculateRecentCompletionRate(pattern);

    this.userPatterns.set(habit.id, pattern);
    this.saveUserPatterns();
  }

  private createEmptyUserPattern(): UserPattern {
    return {
      typicalCompletionHours: [],
      typicalCompletionDays: [],
      recentCompletionRate: 0,
      completionHistory: [],
    };
  }

  private calculateRecentCompletionRate(pattern: UserPattern): number {
    const last7Days = pattern.completionHistory.slice(-7);
    if (last7Days.length === 0) return 0;
    return last7Days.length / 7; // Completion rate out of possible 7 days
  }

  // Public methods for managing auto-check
  async processAutoCheck(event: AutoCheckEvent): Promise<boolean> {
    try {
      // Record the auto-check event
      this.autoCheckHistory.push(event);
      
      // Limit history size
      if (this.autoCheckHistory.length > 100) {
        this.autoCheckHistory = this.autoCheckHistory.slice(-100);
      }

      // Save to localStorage
      localStorage.setItem('autoCheckHistory', JSON.stringify(this.autoCheckHistory));

      return true;
    } catch (error) {
      console.error('Failed to process auto-check:', error);
      return false;
    }
  }

  getPendingAutoChecks(): Map<number, AutoCheckEvent> {
    return new Map(this.pendingAutoChecks);
  }

  confirmAutoCheck(habitId: number, confirmed: boolean): boolean {
    const event = this.pendingAutoChecks.get(habitId);
    if (!event) return false;

    event.userConfirmed = confirmed;
    this.pendingAutoChecks.delete(habitId);

    if (confirmed) {
      this.processAutoCheck(event);
      return true;
    }

    return false;
  }

  updateSettings(newSettings: Partial<AutoCheckSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // If auto-check was disabled, clear pending checks
    if (!this.settings.globalEnabled) {
      this.pendingAutoChecks.clear();
    }
  }

  getSettings(): AutoCheckSettings {
    return { ...this.settings };
  }

  getAutoCheckHistory(habitId?: number): AutoCheckEvent[] {
    return habitId
      ? this.autoCheckHistory.filter(event => event.habitId === habitId)
      : [...this.autoCheckHistory];
  }

  // Test method for development
  async testAutoCheck(habit: Habit): Promise<AutoCheckEvent | null> {
    const testTime = new Date();
    const [habitHour, habitMinute] = habit.scheduled_time.split(':').map(Number);
    testTime.setHours(habitHour, habitMinute + 10, 0, 0); // 10 minutes after scheduled

    return this.evaluateHabitForAutoCheck(habit, testTime);
  }
}

interface UserPattern {
  typicalCompletionHours: number[]; // Hours (0-23) when user typically completes
  typicalCompletionDays: number[]; // Days (0-6) when user typically completes
  recentCompletionRate: number; // 0-1, percentage of recent completions
  completionHistory: Array<{
    date: string;
    hour: number;
    day: number;
    wasManual: boolean;
  }>;
}

export default AutoCheckService;
export type { AutoCheckRule, AutoCheckSettings, AutoCheckEvent, Habit as AutoCheckHabit };