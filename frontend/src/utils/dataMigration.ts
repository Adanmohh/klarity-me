// TODO: Implement data migration through backend API
import { api } from '../services/api';
import { 
  Card, 
  DailyTask, 
  Habit, 
  PowerStatement, 
  Manifestation,
  MindJournalEntry 
} from '../types';

interface MigrationResult {
  success: boolean;
  message: string;
  migratedCounts: {
    cards: number;
    dailyTasks: number;
    habits: number;
    powerStatements: number;
    manifestations: number;
    mindJournalEntries: number;
  };
  errors: string[];
}

interface LocalStorageBackup {
  timestamp: string;
  version: string;
  data: {
    cards?: Card[];
    dailyTasks?: DailyTask[];
    habits?: Habit[];
    powerStatements?: PowerStatement[];
    manifestations?: Manifestation[];
    mindJournalEntries?: MindJournalEntry[];
  };
}

export class DataMigrationService {
  private static readonly BACKUP_KEY = 'todo-app-backup';
  private static readonly MIGRATION_STATUS_KEY = 'migration-status';

  // Export all localStorage data to a backup format
  static exportLocalStorageData(): LocalStorageBackup | null {
    try {
      const backup: LocalStorageBackup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {}
      };

      // Export cards from card store
      const cardStorage = localStorage.getItem('card-storage');
      if (cardStorage) {
        try {
          const cardData = JSON.parse(cardStorage);
          if (cardData?.state?.cards) {
            backup.data.cards = cardData.state.cards;
          }
        } catch (e) {
          console.warn('Failed to parse card storage:', e);
        }
      }

      // Export daily tasks from daily task store
      const dailyTaskStorage = localStorage.getItem('daily-task-storage');
      if (dailyTaskStorage) {
        try {
          const taskData = JSON.parse(dailyTaskStorage);
          if (taskData?.state?.tasks) {
            backup.data.dailyTasks = taskData.state.tasks;
          }
        } catch (e) {
          console.warn('Failed to parse daily task storage:', e);
        }
      }

      // Export habits (if they exist in localStorage)
      const habitsStorage = localStorage.getItem('habits-storage');
      if (habitsStorage) {
        try {
          const habitsData = JSON.parse(habitsStorage);
          if (habitsData?.state?.habits) {
            backup.data.habits = habitsData.state.habits;
          }
        } catch (e) {
          console.warn('Failed to parse habits storage:', e);
        }
      }

      // Export power statements (if they exist)
      const statementsStorage = localStorage.getItem('power-statements-storage');
      if (statementsStorage) {
        try {
          const statementsData = JSON.parse(statementsStorage);
          if (statementsData?.state?.statements) {
            backup.data.powerStatements = statementsData.state.statements;
          }
        } catch (e) {
          console.warn('Failed to parse power statements storage:', e);
        }
      }

      // Export manifestations (if they exist)
      const manifestationsStorage = localStorage.getItem('manifestations-storage');
      if (manifestationsStorage) {
        try {
          const manifestationsData = JSON.parse(manifestationsStorage);
          if (manifestationsData?.state?.manifestations) {
            backup.data.manifestations = manifestationsData.state.manifestations;
          }
        } catch (e) {
          console.warn('Failed to parse manifestations storage:', e);
        }
      }

      // Export mind journal entries (if they exist)
      const journalStorage = localStorage.getItem('mind-journal-storage');
      if (journalStorage) {
        try {
          const journalData = JSON.parse(journalStorage);
          if (journalData?.state?.entries) {
            backup.data.mindJournalEntries = journalData.state.entries;
          }
        } catch (e) {
          console.warn('Failed to parse mind journal storage:', e);
        }
      }

      // Save backup to localStorage
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      
      return backup;
    } catch (error) {
      console.error('Failed to export localStorage data:', error);
      return null;
    }
  }

  // Import backup data to localStorage (for rollback)
  static importLocalStorageData(backup: LocalStorageBackup): boolean {
    try {
      if (backup.data.cards) {
        const cardStorage = {
          state: { cards: backup.data.cards, lastSync: backup.timestamp },
          version: 0
        };
        localStorage.setItem('card-storage', JSON.stringify(cardStorage));
      }

      if (backup.data.dailyTasks) {
        const taskStorage = {
          state: { 
            tasks: backup.data.dailyTasks, 
            lastSync: backup.timestamp,
            pendingSyncs: []
          },
          version: 0
        };
        localStorage.setItem('daily-task-storage', JSON.stringify(taskStorage));
      }

      // Add other data types as needed
      
      return true;
    } catch (error) {
      console.error('Failed to import localStorage data:', error);
      return false;
    }
  }

  // Migrate all data from localStorage to backend
  static async migrateToBackend(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      migratedCounts: {
        cards: 0,
        dailyTasks: 0,
        habits: 0,
        powerStatements: 0,
        manifestations: 0,
        mindJournalEntries: 0
      },
      errors: []
    };

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        result.message = 'User must be authenticated to migrate data';
        return result;
      }

      // Export current localStorage data as backup
      const backup = this.exportLocalStorageData();
      if (!backup) {
        result.message = 'Failed to create backup of localStorage data';
        return result;
      }

      // TODO: Implement backend migration endpoints
      // This would involve creating batch import endpoints in the backend
      // For now, we'll just return a placeholder result
      
      result.message = 'Data migration is not yet implemented. Please check back later.';
      
    } catch (error: any) {
      result.errors.push(`Migration failed: ${error.message}`);
      result.message = 'Migration failed with errors';
    }

    return result;
  }

  // Export user data from backend (backup functionality)
  static async exportBackendData(): Promise<LocalStorageBackup | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User must be authenticated to export data');
      }

      // TODO: Implement backend export endpoint
      // This would involve creating a data export endpoint in the backend
      
      return null;
    } catch (error) {
      console.error('Failed to export backend data:', error);
      return null;
    }
  }

  // Download backup as JSON file
  static downloadBackup(backup: LocalStorageBackup, filename?: string): void {
    try {
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
    }
  }

  // Check migration status
  static getMigrationStatus(): { completed: boolean; timestamp?: string; migratedCounts?: any } {
    try {
      const status = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      if (status) {
        return JSON.parse(status);
      }
    } catch (error) {
      console.error('Failed to get migration status:', error);
    }
    
    return { completed: false };
  }

  // Clear migration status (for testing or re-migration)
  static clearMigrationStatus(): void {
    localStorage.removeItem(this.MIGRATION_STATUS_KEY);
  }
}