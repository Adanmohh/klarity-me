interface NotificationPermissions {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface HabitNotification {
  habitId: number;
  habitName: string;
  scheduledTime: string;
  reminderOffset: number; // minutes before scheduled time
  enabled: boolean;
  soundEnabled: boolean;
}

interface NotificationSettings {
  globalEnabled: boolean;
  soundEnabled: boolean;
  badgeEnabled: boolean;
  vibrationEnabled: boolean;
  reminderOffset: number; // default reminder offset in minutes
}

class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private settings: NotificationSettings;
  private scheduledNotifications: Map<string, number> = new Map();

  private constructor() {
    this.settings = this.loadSettings();
    this.initializeServiceWorker();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('habitNotificationSettings');
    return saved ? JSON.parse(saved) : {
      globalEnabled: true,
      soundEnabled: true,
      badgeEnabled: true,
      vibrationEnabled: true,
      reminderOffset: 5, // 5 minutes before habit time
    };
  }

  private saveSettings(): void {
    localStorage.setItem('habitNotificationSettings', JSON.stringify(this.settings));
  }

  async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('Service workers or notifications not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully');

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    if (event.data.type === 'HABIT_NOTIFICATION_CLICKED') {
      const { habitId } = event.data;
      // Navigate to habit tracker or auto-complete habit
      window.dispatchEvent(new CustomEvent('habitNotificationClicked', { detail: { habitId } }));
    }
  }

  async requestPermission(): Promise<NotificationPermissions> {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    const permissions: NotificationPermissions = {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };

    return permissions;
  }

  getPermissionStatus(): NotificationPermissions {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  async scheduleHabitReminder(habit: HabitNotification): Promise<void> {
    if (!this.settings.globalEnabled || !habit.enabled) {
      return;
    }

    const permissions = await this.requestPermission();
    if (!permissions.granted) {
      throw new Error('Notification permission not granted');
    }

    const now = new Date();
    const [hours, minutes] = habit.scheduledTime.split(':').map(Number);
    
    // Create notification time (today or tomorrow if time has passed)
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes - habit.reminderOffset, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const delay = notificationTime.getTime() - now.getTime();
    
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        this.showNotification(habit);
      }, delay);

      // Store the timeout ID for later cancellation
      this.scheduledNotifications.set(`habit_${habit.habitId}`, timeoutId);
    }
  }

  private async showNotification(habit: HabitNotification): Promise<void> {
    if (!this.registration) {
      // Fallback to browser notification
      this.showBrowserNotification(habit);
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: `Time for your ${habit.habitName}! Let's build that streak! 🔥`,
      icon: '/icons/habit-reminder-192.png',
      badge: '/icons/habit-badge-72.png',
      tag: `habit_${habit.habitId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'complete',
          title: '✓ Mark Complete',
        },
        {
          action: 'snooze',
          title: '💤 Snooze 5min',
        }
      ],
      data: {
        habitId: habit.habitId,
        habitName: habit.habitName,
        type: 'habit_reminder'
      },
    };

    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      notificationOptions.vibrate = [200, 100, 200];
    }

    if (this.settings.soundEnabled) {
      notificationOptions.silent = false;
    }

    try {
      await this.registration.showNotification('Habit Reminder', notificationOptions);
    } catch (error) {
      console.error('Failed to show service worker notification:', error);
      this.showBrowserNotification(habit);
    }
  }

  private showBrowserNotification(habit: HabitNotification): void {
    const notification = new Notification('Habit Reminder', {
      body: `Time for your ${habit.habitName}! Let's build that streak! 🔥`,
      icon: '/icons/habit-reminder-192.png',
      tag: `habit_${habit.habitId}`,
    });

    notification.onclick = () => {
      window.focus();
      window.dispatchEvent(new CustomEvent('habitNotificationClicked', { 
        detail: { habitId: habit.habitId } 
      }));
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  cancelHabitReminder(habitId: number): void {
    const key = `habit_${habitId}`;
    const timeoutId = this.scheduledNotifications.get(key);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(key);
    }
  }

  cancelAllReminders(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  async rescheduleAllHabits(habits: HabitNotification[]): Promise<void> {
    // Cancel existing reminders
    this.cancelAllReminders();

    // Schedule new reminders
    for (const habit of habits) {
      try {
        await this.scheduleHabitReminder(habit);
      } catch (error) {
        console.error(`Failed to schedule reminder for habit ${habit.habitId}:`, error);
      }
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // If notifications were disabled, cancel all reminders
    if (!this.settings.globalEnabled) {
      this.cancelAllReminders();
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  async testNotification(): Promise<void> {
    const permissions = await this.requestPermission();
    if (!permissions.granted) {
      throw new Error('Notification permission not granted');
    }

    const testHabit: HabitNotification = {
      habitId: 0,
      habitName: 'Test Notification',
      scheduledTime: '00:00',
      reminderOffset: 0,
      enabled: true,
      soundEnabled: this.settings.soundEnabled,
    };

    await this.showNotification(testHabit);
  }

  // Daily reset functionality
  async scheduleHabitNotifications(habits: Array<{
    id: number;
    name: string;
    scheduled_time: string;
    notificationEnabled?: boolean;
    reminderOffset?: number;
    soundEnabled?: boolean;
  }>): Promise<void> {
    const habitNotifications: HabitNotification[] = habits.map(habit => ({
      habitId: habit.id,
      habitName: habit.name,
      scheduledTime: habit.scheduled_time,
      reminderOffset: habit.reminderOffset ?? this.settings.reminderOffset,
      enabled: habit.notificationEnabled ?? true,
      soundEnabled: habit.soundEnabled ?? this.settings.soundEnabled,
    }));

    await this.rescheduleAllHabits(habitNotifications);
  }

  // Check if it's time to send notifications based on current time
  checkPendingNotifications(habits: Array<{
    id: number;
    name: string;
    scheduled_time: string;
    completed: boolean;
    notificationEnabled?: boolean;
  }>): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    habits.forEach(habit => {
      if (habit.completed || (habit.notificationEnabled === false)) {
        return;
      }

      const [habitHour, habitMinute] = habit.scheduled_time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(habitHour, habitMinute - this.settings.reminderOffset, 0, 0);

      // Check if we're at the reminder time (within 1 minute window)
      const reminderHour = reminderTime.getHours();
      const reminderMinuteAdjusted = reminderTime.getMinutes();

      if (currentHour === reminderHour && Math.abs(currentMinute - reminderMinuteAdjusted) <= 1) {
        const habitNotification: HabitNotification = {
          habitId: habit.id,
          habitName: habit.name,
          scheduledTime: habit.scheduled_time,
          reminderOffset: this.settings.reminderOffset,
          enabled: true,
          soundEnabled: this.settings.soundEnabled,
        };

        this.showNotification(habitNotification);
      }
    });
  }
}

export default NotificationService;
export type { NotificationPermissions, HabitNotification, NotificationSettings };