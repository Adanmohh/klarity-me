// Local storage persistence layer
const STORAGE_KEYS = {
  CARDS: 'focuscards_cards',
  DAILY_TASKS: 'focuscards_daily',
  PREFERENCES: 'focuscards_prefs',
  LAST_SYNC: 'focuscards_lastsync'
};

export const storage = {
  // Cards
  saveCards: (cards: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Failed to save cards:', e);
      return false;
    }
  },
  
  loadCards: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load cards:', e);
      return [];
    }
  },
  
  // Daily Tasks
  saveDailyTasks: (tasks: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Failed to save daily tasks:', e);
      return false;
    }
  },
  
  loadDailyTasks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load daily tasks:', e);
      return [];
    }
  },
  
  // Preferences
  savePreferences: (prefs: any) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
      return true;
    } catch (e) {
      console.error('Failed to save preferences:', e);
      return false;
    }
  },
  
  loadPreferences: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load preferences:', e);
      return {};
    }
  },
  
  // Export/Import
  exportData: () => {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      cards: storage.loadCards(),
      dailyTasks: storage.loadDailyTasks(),
      preferences: storage.loadPreferences()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuscards-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importData: (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.cards) storage.saveCards(data.cards);
          if (data.dailyTasks) storage.saveDailyTasks(data.dailyTasks);
          if (data.preferences) storage.savePreferences(data.preferences);
          resolve(true);
        } catch (error) {
          console.error('Failed to import data:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  },
  
  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};