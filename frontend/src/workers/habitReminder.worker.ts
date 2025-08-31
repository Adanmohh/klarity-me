// Habit Reminder Worker - Handles scheduling and timing logic for habit notifications
// This worker runs in the background to check for habit reminders and auto-check functionality

interface Habit {
  id: number;
  name: string;
  scheduled_time: string;
  quality_name: string;
  completed: boolean;
  streak: number;
  notificationEnabled?: boolean;
  reminderOffset?: number; // minutes before scheduled time
  autoCheckEnabled?: boolean;
  autoCheckWindowMinutes?: number; // how long after scheduled time to auto-check
}

interface WorkerSettings {
  notificationsEnabled: boolean;
  autoCheckEnabled: boolean;
  defaultReminderOffset: number;
  defaultAutoCheckWindow: number;
  timezone: string;
}

class HabitReminderWorker {
  private habits: Map<number, Habit> = new Map();
  private settings: WorkerSettings = {
    notificationsEnabled: true,
    autoCheckEnabled: false,
    defaultReminderOffset: 5, // 5 minutes before
    defaultAutoCheckWindow: 30, // 30 minutes after scheduled time
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  private scheduledChecks: Map<string, any> = new Map();
  private lastMidnightReset: Date = new Date();

  constructor() {
    this.startPeriodicCheck();
    this.scheduleNextMidnightReset();
  }

  // Main periodic check - runs every minute
  private startPeriodicCheck(): void {
    const checkInterval = setInterval(() => {
      this.checkCurrentTime();
    }, 60000); // Check every minute

    // Store interval for cleanup if needed
    this.scheduledChecks.set('main_interval', checkInterval);
  }

  private checkCurrentTime(): void {
    const now = new Date();
    
    // Check if it's past midnight and we need to reset
    if (this.shouldResetDaily(now)) {
      this.performDailyReset();
    }

    // Check all habits for notifications and auto-check
    this.habits.forEach(habit => {
      if (habit.completed) return;

      const [habitHour, habitMinute] = habit.scheduled_time.split(':').map(Number);
      const habitTime = new Date();
      habitTime.setHours(habitHour, habitMinute, 0, 0);

      // Check for notification time
      if (this.settings.notificationsEnabled && (habit.notificationEnabled !== false)) {
        const reminderOffset = habit.reminderOffset ?? this.settings.defaultReminderOffset;
        const reminderTime = new Date(habitTime.getTime() - reminderOffset * 60000);
        
        if (this.isTimeToNotify(now, reminderTime, habit.id)) {
          this.sendNotificationMessage(habit);
        }
      }

      // Check for auto-check time
      if (this.settings.autoCheckEnabled && habit.autoCheckEnabled) {
        const autoCheckWindow = habit.autoCheckWindowMinutes ?? this.settings.defaultAutoCheckWindow;
        const autoCheckEndTime = new Date(habitTime.getTime() + autoCheckWindow * 60000);
        
        if (now >= habitTime && now <= autoCheckEndTime && !habit.completed) {
          this.performAutoCheck(habit);
        }
      }
    });
  }

  private isTimeToNotify(currentTime: Date, reminderTime: Date, habitId: number): boolean {
    const timeDiff = Math.abs(currentTime.getTime() - reminderTime.getTime());
    const withinOneMinute = timeDiff < 60000; // Within 1 minute
    const notificationKey = `notification_${habitId}_${reminderTime.toISOString().split('T')[0]}`;
    
    // Check if we already sent notification today
    const alreadySent = this.scheduledChecks.has(notificationKey);
    
    if (withinOneMinute && !alreadySent) {
      // Mark as sent for today
      this.scheduledChecks.set(notificationKey, Date.now());
      return true;
    }
    
    return false;
  }

  private sendNotificationMessage(habit: Habit): void {
    const message = {
      type: 'SEND_NOTIFICATION',
      data: {
        habitId: habit.id,
        habitName: habit.name,
        scheduledTime: habit.scheduled_time,
        qualityName: habit.quality_name,
        streak: habit.streak
      }
    };

    // Send message to main thread
    self.postMessage(message);
    console.log(`Notification sent for habit: ${habit.name}`);
  }

  private performAutoCheck(habit: Habit): void {
    const message = {
      type: 'AUTO_CHECK_HABIT',
      data: {
        habitId: habit.id,
        habitName: habit.name,
        timestamp: new Date().toISOString(),
        reason: 'auto_check_window_expired'
      }
    };

    // Update local habit state
    habit.completed = true;
    habit.streak += 1;
    
    // Send message to main thread
    self.postMessage(message);
    console.log(`Auto-checked habit: ${habit.name}`);
  }

  private shouldResetDaily(now: Date): boolean {
    const lastReset = this.lastMidnightReset;
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    
    // Check if it's a new day and we haven't reset yet
    return now >= todayMidnight && lastReset < todayMidnight;
  }

  private performDailyReset(): void {
    console.log('Performing daily reset...');
    
    // Reset all habit completion status but preserve streaks
    this.habits.forEach(habit => {
      const wasCompleted = habit.completed;
      habit.completed = false;
      
      // If habit wasn't completed yesterday, break the streak
      if (!wasCompleted && habit.streak > 0) {
        habit.streak = Math.max(0, habit.streak - 1);
      }
    });

    // Clear scheduled checks from previous day
    const today = new Date().toISOString().split('T')[0];
    Array.from(this.scheduledChecks.keys()).forEach(key => {
      if (!key.includes(today)) {
        this.scheduledChecks.delete(key);
      }
    });

    // Update last reset timestamp
    this.lastMidnightReset = new Date();

    // Send reset message to main thread
    const message = {
      type: 'DAILY_RESET_COMPLETE',
      data: {
        resetTime: this.lastMidnightReset.toISOString(),
        habitsReset: Array.from(this.habits.values())
      }
    };
    
    self.postMessage(message);
    
    // Schedule next midnight reset
    this.scheduleNextMidnightReset();
  }

  private scheduleNextMidnightReset(): void {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    // Clear existing midnight reset timer
    const existingTimer = this.scheduledChecks.get('midnight_reset');
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Schedule new midnight reset
    const timerId = setTimeout(() => {
      this.performDailyReset();
    }, timeUntilMidnight);
    
    this.scheduledChecks.set('midnight_reset', timerId);
    console.log(`Next daily reset scheduled for: ${nextMidnight.toISOString()}`);
  }

  // Public methods for external control
  updateHabits(habits: Habit[]): void {
    this.habits.clear();
    habits.forEach(habit => {
      this.habits.set(habit.id, { ...habit });
    });
    
    console.log(`Updated habits in worker: ${habits.length} habits`);
  }

  updateSettings(newSettings: Partial<WorkerSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Updated worker settings:', this.settings);
  }

  addHabit(habit: Habit): void {
    this.habits.set(habit.id, { ...habit });
    console.log(`Added habit to worker: ${habit.name}`);
  }

  removeHabit(habitId: number): void {
    this.habits.delete(habitId);
    console.log(`Removed habit from worker: ${habitId}`);
  }

  completeHabit(habitId: number): void {
    const habit = this.habits.get(habitId);
    if (habit && !habit.completed) {
      habit.completed = true;
      habit.streak += 1;
      console.log(`Marked habit as complete: ${habit.name}, streak: ${habit.streak}`);
    }
  }

  uncompleteHabit(habitId: number): void {
    const habit = this.habits.get(habitId);
    if (habit && habit.completed) {
      habit.completed = false;
      habit.streak = Math.max(0, habit.streak - 1);
      console.log(`Unmarked habit: ${habit.name}, streak: ${habit.streak}`);
    }
  }

  getHabitStatus(): Habit[] {
    return Array.from(this.habits.values());
  }

  // Time zone handling
  updateTimezone(timezone: string): void {
    this.settings.timezone = timezone;
    console.log(`Updated timezone to: ${timezone}`);
    
    // Reschedule midnight reset for new timezone
    this.scheduleNextMidnightReset();
  }

  // Manual triggers for testing
  triggerNotification(habitId: number): void {
    const habit = this.habits.get(habitId);
    if (habit) {
      this.sendNotificationMessage(habit);
    }
  }

  triggerAutoCheck(habitId: number): void {
    const habit = this.habits.get(habitId);
    if (habit && !habit.completed) {
      this.performAutoCheck(habit);
    }
  }

  // Cleanup method
  destroy(): void {
    // Clear all scheduled timers
    this.scheduledChecks.forEach((timerId: any) => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.scheduledChecks.clear();
    
    console.log('Habit reminder worker destroyed');
  }
}

// Initialize worker instance
const habitWorker = new HabitReminderWorker();

// Handle messages from main thread
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'UPDATE_HABITS':
      habitWorker.updateHabits(data.habits);
      break;
      
    case 'UPDATE_SETTINGS':
      habitWorker.updateSettings(data.settings);
      break;
      
    case 'ADD_HABIT':
      habitWorker.addHabit(data.habit);
      break;
      
    case 'REMOVE_HABIT':
      habitWorker.removeHabit(data.habitId);
      break;
      
    case 'COMPLETE_HABIT':
      habitWorker.completeHabit(data.habitId);
      break;
      
    case 'UNCOMPLETE_HABIT':
      habitWorker.uncompleteHabit(data.habitId);
      break;
      
    case 'GET_STATUS':
      self.postMessage({
        type: 'STATUS_RESPONSE',
        data: {
          habits: habitWorker.getHabitStatus()
        }
      });
      break;
      
    case 'UPDATE_TIMEZONE':
      habitWorker.updateTimezone(data.timezone);
      break;
      
    case 'TRIGGER_NOTIFICATION':
      habitWorker.triggerNotification(data.habitId);
      break;
      
    case 'TRIGGER_AUTO_CHECK':
      habitWorker.triggerAutoCheck(data.habitId);
      break;
      
    case 'DESTROY':
      habitWorker.destroy();
      break;
      
    default:
      console.warn('Unknown message type received:', type);
  }
};

// Export types for TypeScript (won't be available at runtime but helps with development)
export type { Habit, WorkerSettings };