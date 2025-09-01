// TODO: Implement data migration through backend API
// import { api } from '../services/api';
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

  // Migrate all data from localStorage to Supabase
  static async migrateToSupabase(): Promise<MigrationResult> {
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        result.message = 'User must be authenticated to migrate data';
        return result;
      }

      // Export current localStorage data as backup
      const backup = this.exportLocalStorageData();
      if (!backup) {
        result.message = 'Failed to create backup of localStorage data';
        return result;
      }

      // Migrate cards
      if (backup.data.cards && backup.data.cards.length > 0) {
        try {
          const cardsToMigrate = backup.data.cards
            .filter(card => !card.id.startsWith('temp-') && !card.id.startsWith('local-'))
            .map(card => ({
              title: card.title,
              description: card.description,
              position: card.position,
              status: card.status,
              pause_until: card.pause_until,
              last_worked_on: card.last_worked_on,
              sessions_count: card.sessions_count || 0,
              where_left_off: card.where_left_off,
              momentum_score: card.momentum_score || 0
            }));

          if (cardsToMigrate.length > 0) {
            const { data, error } = await supabase
              .from('cards')
              .insert(cardsToMigrate);

            if (error) {
              result.errors.push(`Cards migration error: ${error.message}`);
            } else {
              result.migratedCounts.cards = cardsToMigrate.length;
            }
          }
        } catch (error: any) {
          result.errors.push(`Cards migration failed: ${error.message}`);
        }
      }

      // Migrate daily tasks
      if (backup.data.dailyTasks && backup.data.dailyTasks.length > 0) {
        try {
          const tasksToMigrate = backup.data.dailyTasks
            .filter(task => !task.id.startsWith('temp-') && !task.id.startsWith('local-'))
            .map(task => ({
              title: task.title,
              description: task.description,
              lane: task.lane,
              duration: task.duration,
              status: task.status,
              position: task.position,
              completed_at: task.completed_at
            }));

          if (tasksToMigrate.length > 0) {
            const { data, error } = await supabase
              .from('daily_tasks')
              .insert(tasksToMigrate);

            if (error) {
              result.errors.push(`Daily tasks migration error: ${error.message}`);
            } else {
              result.migratedCounts.dailyTasks = tasksToMigrate.length;
            }
          }
        } catch (error: any) {
          result.errors.push(`Daily tasks migration failed: ${error.message}`);
        }
      }

      // Migrate habits
      if (backup.data.habits && backup.data.habits.length > 0) {
        try {
          const habitsToMigrate = backup.data.habits
            .filter(habit => !habit.id.startsWith('temp-'))
            .map(habit => ({
              title: habit.title,
              description: habit.description,
              lane: habit.lane,
              target_frequency: habit.target_frequency || 1,
              current_streak: habit.current_streak || 0,
              best_streak: habit.best_streak || 0,
              total_completions: habit.total_completions || 0,
              is_active: habit.is_active,
              graduation_criteria: habit.graduation_criteria,
              graduated_at: habit.graduated_at
            }));

          if (habitsToMigrate.length > 0) {
            const { data, error } = await supabase
              .from('habits')
              .insert(habitsToMigrate);

            if (error) {
              result.errors.push(`Habits migration error: ${error.message}`);
            } else {
              result.migratedCounts.habits = habitsToMigrate.length;
            }
          }
        } catch (error: any) {
          result.errors.push(`Habits migration failed: ${error.message}`);
        }
      }

      // Migrate power statements
      if (backup.data.powerStatements && backup.data.powerStatements.length > 0) {
        try {
          const statementsToMigrate = backup.data.powerStatements
            .filter(statement => !statement.id.startsWith('temp-'))
            .map(statement => ({
              statement: statement.statement,
              category: statement.category || 'general',
              affirmation_count: statement.affirmation_count || 0,
              last_affirmed: statement.last_affirmed,
              is_active: statement.is_active,
              strength_rating: statement.strength_rating || 5.0
            }));

          if (statementsToMigrate.length > 0) {
            const { data, error } = await supabase
              .from('power_statements')
              .insert(statementsToMigrate);

            if (error) {
              result.errors.push(`Power statements migration error: ${error.message}`);
            } else {
              result.migratedCounts.powerStatements = statementsToMigrate.length;
            }
          }
        } catch (error: any) {
          result.errors.push(`Power statements migration failed: ${error.message}`);
        }
      }

      // Migrate manifestations
      if (backup.data.manifestations && backup.data.manifestations.length > 0) {
        try {
          const manifestationsToMigrate = backup.data.manifestations
            .filter(manifestation => !manifestation.id.startsWith('temp-'))
            .map(manifestation => ({
              title: manifestation.title,
              description: manifestation.description,
              visualization_notes: manifestation.visualization_notes,
              target_date: manifestation.target_date,
              achieved: manifestation.achieved || false,
              achieved_at: manifestation.achieved_at,
              achievement_notes: manifestation.achievement_notes,
              energy_level: manifestation.energy_level || 5,
              belief_level: manifestation.belief_level || 5,
              tags: manifestation.tags || []
            }));

          if (manifestationsToMigrate.length > 0) {
            const { data, error } = await supabase
              .from('manifestations')
              .insert(manifestationsToMigrate);

            if (error) {
              result.errors.push(`Manifestations migration error: ${error.message}`);
            } else {
              result.migratedCounts.manifestations = manifestationsToMigrate.length;
            }
          }
        } catch (error: any) {
          result.errors.push(`Manifestations migration failed: ${error.message}`);
        }
      }

      // Calculate success
      const totalMigrated = Object.values(result.migratedCounts).reduce((sum, count) => sum + count, 0);
      const hasErrors = result.errors.length > 0;
      
      result.success = totalMigrated > 0 && !hasErrors;
      
      if (result.success) {
        result.message = `Successfully migrated ${totalMigrated} items to Supabase`;
        // Mark migration as complete
        localStorage.setItem(this.MIGRATION_STATUS_KEY, JSON.stringify({
          completed: true,
          timestamp: new Date().toISOString(),
          migratedCounts: result.migratedCounts
        }));
      } else if (totalMigrated > 0) {
        result.message = `Partially migrated ${totalMigrated} items with ${result.errors.length} errors`;
      } else {
        result.message = 'No data found to migrate or migration failed completely';
      }

    } catch (error: any) {
      result.errors.push(`Migration failed: ${error.message}`);
      result.message = 'Migration failed with errors';
    }

    return result;
  }

  // Export user data from Supabase (backup functionality)
  static async exportSupabaseData(): Promise<LocalStorageBackup | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User must be authenticated to export data');
      }

      const backup: LocalStorageBackup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {}
      };

      // Export cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
      
      if (!cardsError && cards) {
        backup.data.cards = cards;
      }

      // Export daily tasks
      const { data: dailyTasks, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('*');
      
      if (!tasksError && dailyTasks) {
        backup.data.dailyTasks = dailyTasks;
      }

      // Export habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*');
      
      if (!habitsError && habits) {
        backup.data.habits = habits;
      }

      // Export power statements
      const { data: powerStatements, error: statementsError } = await supabase
        .from('power_statements')
        .select('*');
      
      if (!statementsError && powerStatements) {
        backup.data.powerStatements = powerStatements;
      }

      // Export manifestations
      const { data: manifestations, error: manifestationsError } = await supabase
        .from('manifestations')
        .select('*');
      
      if (!manifestationsError && manifestations) {
        backup.data.manifestations = manifestations;
      }

      return backup;
    } catch (error) {
      console.error('Failed to export Supabase data:', error);
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