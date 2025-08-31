// Daily Reset Service - Handles midnight reset of habits with timezone considerations
interface Habit {
  id: number;
  name: string;
  scheduled_time: string;
  quality_name: string;
  completed: boolean;
  streak: number;
  completedAt?: string; // ISO timestamp when completed
  resetPreference?: 'strict' | 'grace_period' | 'flexible'; // How to handle missed days
  gracePeriodHours?: number; // Hours after midnight to still count as previous day
}

interface ResetSettings {
  timezone: string;
  resetTime: string; // HH:MM format, when to reset (usually "00:00")
  gracePeriodHours: number; // Global grace period in hours
  preserveStreaks: boolean;
  streakBreakThreshold: number; // Days missed before breaking streak
  notifyOnReset: boolean;
  autoBackup: boolean; // Backup data before reset
}

interface ResetEvent {
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  habitsReset: number;
  streaksBroken: number;
  streaksPreserved: number;
  totalHabitsCompleted: number;
  completionRate: number;
  timezone: string;
}

interface StreakBackup {
  habitId: number;
  habitName: string;
  streakBeforeReset: number;
  lastCompletedDate: string;
  resetDate: string;
  reason: 'missed_day' | 'grace_period_expired' | 'manual_reset';
}

class DailyResetService {
  private static instance: DailyResetService;
  private settings: ResetSettings;
  private resetHistory: ResetEvent[] = [];
  private streakBackups: StreakBackup[] = [];
  private resetTimer: any = null;
  private lastResetDate: string = '';

  private constructor() {
    this.settings = this.loadSettings();
    this.loadResetHistory();
    this.loadStreakBackups();
    this.scheduleNextReset();
    this.detectTimezoneChange();
  }

  static getInstance(): DailyResetService {
    if (!DailyResetService.instance) {
      DailyResetService.instance = new DailyResetService();
    }
    return DailyResetService.instance;
  }

  private loadSettings(): ResetSettings {
    const saved = localStorage.getItem('dailyResetSettings');
    return saved ? JSON.parse(saved) : {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      resetTime: '00:00',
      gracePeriodHours: 3, // 3 hours after midnight
      preserveStreaks: true,
      streakBreakThreshold: 2, // Break streak after 2 missed days
      notifyOnReset: true,
      autoBackup: true,
    };
  }

  private saveSettings(): void {
    localStorage.setItem('dailyResetSettings', JSON.stringify(this.settings));
  }

  private loadResetHistory(): void {
    const saved = localStorage.getItem('dailyResetHistory');
    if (saved) {
      this.resetHistory = JSON.parse(saved);
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      this.resetHistory = this.resetHistory.filter(event => event.date >= cutoffDate);
      this.saveResetHistory();
    }
  }

  private saveResetHistory(): void {
    localStorage.setItem('dailyResetHistory', JSON.stringify(this.resetHistory));
  }

  private loadStreakBackups(): void {
    const saved = localStorage.getItem('habitStreakBackups');
    if (saved) {
      this.streakBackups = JSON.parse(saved);
      // Keep only last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
      
      this.streakBackups = this.streakBackups.filter(backup => backup.resetDate >= cutoffDate);
      this.saveStreakBackups();
    }
  }

  private saveStreakBackups(): void {
    localStorage.setItem('habitStreakBackups', JSON.stringify(this.streakBackups));
  }

  // Main reset logic
  async performDailyReset(habits: Habit[], force: boolean = false): Promise<ResetEvent> {
    const now = new Date();
    const today = this.formatDateInTimezone(now, this.settings.timezone);
    
    // Check if we already reset today (prevent double resets)
    if (!force && this.lastResetDate === today) {
      throw new Error('Daily reset already performed today');
    }

    console.log(`Performing daily reset for ${today} in timezone ${this.settings.timezone}`);

    const resetEvent: ResetEvent = {
      date: today,
      timestamp: now.toISOString(),
      habitsReset: 0,
      streaksBroken: 0,
      streaksPreserved: 0,
      totalHabitsCompleted: 0,
      completionRate: 0,
      timezone: this.settings.timezone,
    };

    const updatedHabits: Habit[] = [];

    // Process each habit
    for (const habit of habits) {
      const wasCompleted = habit.completed;
      const updatedHabit = { ...habit };

      // Count completed habits before reset
      if (wasCompleted) {
        resetEvent.totalHabitsCompleted++;
      }

      // Apply reset logic based on habit preferences
      const shouldPreserveStreak = this.shouldPreserveStreak(habit, now);
      
      if (wasCompleted || shouldPreserveStreak) {
        // Habit was completed or within grace period
        resetEvent.streaksPreserved++;
        
        // Increment streak if it was actually completed
        if (wasCompleted) {
          updatedHabit.streak = Math.max(0, habit.streak + 1);
        }
      } else {
        // Habit was not completed and outside grace period
        const streakBroken = habit.streak > 0;
        
        if (streakBroken) {
          resetEvent.streaksBroken++;
          
          // Backup streak before breaking it
          if (this.settings.autoBackup) {
            this.backupStreak(habit, today, 'missed_day');
          }
        }

        // Apply streak break logic
        updatedHabit.streak = this.calculateNewStreak(habit);
      }

      // Reset completion status for new day
      updatedHabit.completed = false;
      updatedHabit.completedAt = undefined;
      
      resetEvent.habitsReset++;
      updatedHabits.push(updatedHabit);
    }

    // Calculate completion rate
    resetEvent.completionRate = habits.length > 0 
      ? (resetEvent.totalHabitsCompleted / habits.length) * 100 
      : 0;

    // Record reset event
    this.resetHistory.push(resetEvent);
    this.saveResetHistory();
    
    // Update last reset date
    this.lastResetDate = today;
    localStorage.setItem('lastResetDate', today);

    // Schedule next reset
    this.scheduleNextReset();

    // Notify if enabled
    if (this.settings.notifyOnReset) {
      this.sendResetNotification(resetEvent);
    }

    console.log(`Daily reset completed:`, resetEvent);
    return resetEvent;
  }

  private shouldPreserveStreak(habit: Habit, currentTime: Date): boolean {
    if (!habit.completedAt) return false;

    const completionTime = new Date(habit.completedAt);
    const gracePeriodHours = habit.gracePeriodHours ?? this.settings.gracePeriodHours;
    
    // Calculate the grace period cutoff time
    const todayMidnight = new Date(currentTime);
    todayMidnight.setHours(0, 0, 0, 0);
    const gracePeriodEnd = new Date(todayMidnight.getTime() + gracePeriodHours * 60 * 60 * 1000);

    // If current time is within grace period and habit was completed yesterday
    const isWithinGracePeriod = currentTime <= gracePeriodEnd;
    const yesterdayStart = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);
    const wasCompletedYesterday = completionTime >= yesterdayStart && completionTime < todayMidnight;

    return isWithinGracePeriod && wasCompletedYesterday;
  }

  private calculateNewStreak(habit: Habit): number {
    if (!this.settings.preserveStreaks) {
      return 0; // Always break streaks
    }

    const resetPreference = habit.resetPreference || 'strict';
    
    switch (resetPreference) {
      case 'strict':
        return 0; // Break streak immediately on missed day
      
      case 'grace_period':
        // Allow one missed day before breaking streak
        return Math.max(0, habit.streak - 1);
      
      case 'flexible':
        // Use global streak break threshold
        const missedDays = this.calculateMissedDays(habit);
        return missedDays >= this.settings.streakBreakThreshold ? 0 : habit.streak;
      
      default:
        return 0;
    }
  }

  private calculateMissedDays(habit: Habit): number {
    // This would need to track completion history to accurately calculate
    // For now, return 1 as a simple implementation
    return 1;
  }

  private backupStreak(habit: Habit, resetDate: string, reason: StreakBackup['reason']): void {
    const backup: StreakBackup = {
      habitId: habit.id,
      habitName: habit.name,
      streakBeforeReset: habit.streak,
      lastCompletedDate: habit.completedAt || '',
      resetDate,
      reason,
    };

    this.streakBackups.push(backup);
    this.saveStreakBackups();
  }

  private formatDateInTimezone(date: Date, timezone: string): string {
    try {
      return new Intl.DateTimeFormat('en-CA', { 
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn(`Invalid timezone ${timezone}, using local time`);
      return date.toISOString().split('T')[0];
    }
  }

  private scheduleNextReset(): void {
    // Clear existing timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    const now = new Date();
    const [resetHours, resetMinutes] = this.settings.resetTime.split(':').map(Number);
    
    // Calculate next reset time in the user's timezone
    const nextReset = new Date();
    nextReset.setHours(resetHours, resetMinutes, 0, 0);
    
    // If reset time has already passed today, schedule for tomorrow
    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    const timeUntilReset = nextReset.getTime() - now.getTime();
    
    console.log(`Next reset scheduled for: ${nextReset.toISOString()}`);
    
    this.resetTimer = setTimeout(() => {
      // The actual reset will be triggered by the calling component
      this.notifyResetTime();
    }, timeUntilReset);
  }

  private notifyResetTime(): void {
    // Dispatch custom event to notify the application it's time to reset
    window.dispatchEvent(new CustomEvent('dailyResetTime', {
      detail: {
        timezone: this.settings.timezone,
        resetTime: this.settings.resetTime,
      }
    }));
  }

  private sendResetNotification(resetEvent: ResetEvent): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Daily Habit Reset', {
        body: `${resetEvent.totalHabitsCompleted}/${resetEvent.habitsReset} habits completed (${resetEvent.completionRate.toFixed(0)}%)`,
        icon: '/icons/habit-reminder-192.png',
        tag: 'daily_reset',
      });
    }
  }

  private detectTimezoneChange(): void {
    // Check for timezone changes every hour
    setInterval(() => {
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (currentTimezone !== this.settings.timezone) {
        console.log(`Timezone changed from ${this.settings.timezone} to ${currentTimezone}`);
        this.updateTimezone(currentTimezone);
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  // Public methods
  updateTimezone(newTimezone: string): void {
    const oldTimezone = this.settings.timezone;
    this.settings.timezone = newTimezone;
    this.saveSettings();
    
    // Reschedule reset with new timezone
    this.scheduleNextReset();
    
    console.log(`Timezone updated from ${oldTimezone} to ${newTimezone}`);
    
    // Notify application of timezone change
    window.dispatchEvent(new CustomEvent('timezoneChanged', {
      detail: { oldTimezone, newTimezone }
    }));
  }

  updateSettings(newSettings: Partial<ResetSettings>): void {
    const oldTimezone = this.settings.timezone;
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // If timezone or reset time changed, reschedule
    if (newSettings.timezone !== oldTimezone || newSettings.resetTime) {
      this.scheduleNextReset();
    }
  }

  getSettings(): ResetSettings {
    return { ...this.settings };
  }

  getResetHistory(days: number = 30): ResetEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    return this.resetHistory.filter(event => event.date >= cutoffDateStr);
  }

  getStreakBackups(habitId?: number): StreakBackup[] {
    return habitId 
      ? this.streakBackups.filter(backup => backup.habitId === habitId)
      : [...this.streakBackups];
  }

  // Recovery methods
  restoreStreak(habitId: number, backupDate: string): boolean {
    const backup = this.streakBackups.find(
      b => b.habitId === habitId && b.resetDate === backupDate
    );
    
    if (!backup) {
      console.error(`No streak backup found for habit ${habitId} on ${backupDate}`);
      return false;
    }

    // This would need to be handled by the calling component
    // as we don't have direct access to habit state here
    window.dispatchEvent(new CustomEvent('restoreHabitStreak', {
      detail: { habitId, streak: backup.streakBeforeReset, backup }
    }));

    return true;
  }

  // Check if reset is needed (for manual checking)
  needsReset(habits: Habit[]): boolean {
    const today = this.formatDateInTimezone(new Date(), this.settings.timezone);
    return this.lastResetDate !== today && habits.some(h => h.completed);
  }

  // Get next reset time
  getNextResetTime(): Date {
    const now = new Date();
    const [resetHours, resetMinutes] = this.settings.resetTime.split(':').map(Number);
    
    const nextReset = new Date();
    nextReset.setHours(resetHours, resetMinutes, 0, 0);
    
    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    
    return nextReset;
  }

  // Statistics
  getCompletionStats(days: number = 7): {
    averageCompletionRate: number;
    totalHabitsCompleted: number;
    totalHabitsAvailable: number;
    streaksBroken: number;
    bestDay: string;
    worstDay: string;
  } {
    const recentEvents = this.getResetHistory(days);
    
    if (recentEvents.length === 0) {
      return {
        averageCompletionRate: 0,
        totalHabitsCompleted: 0,
        totalHabitsAvailable: 0,
        streaksBroken: 0,
        bestDay: '',
        worstDay: '',
      };
    }

    const totalCompleted = recentEvents.reduce((sum, event) => sum + event.totalHabitsCompleted, 0);
    const totalAvailable = recentEvents.reduce((sum, event) => sum + event.habitsReset, 0);
    const totalStreaksBroken = recentEvents.reduce((sum, event) => sum + event.streaksBroken, 0);
    
    const bestEvent = recentEvents.reduce((best, event) => 
      event.completionRate > best.completionRate ? event : best
    );
    
    const worstEvent = recentEvents.reduce((worst, event) => 
      event.completionRate < worst.completionRate ? event : worst
    );

    return {
      averageCompletionRate: totalAvailable > 0 ? (totalCompleted / totalAvailable) * 100 : 0,
      totalHabitsCompleted: totalCompleted,
      totalHabitsAvailable: totalAvailable,
      streaksBroken: totalStreaksBroken,
      bestDay: bestEvent.date,
      worstDay: worstEvent.date,
    };
  }

  // Cleanup
  destroy(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}

export default DailyResetService;
export type { ResetSettings, ResetEvent, StreakBackup, Habit as ResetHabit };