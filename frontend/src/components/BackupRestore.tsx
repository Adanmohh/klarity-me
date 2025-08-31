import React, { useState } from 'react';
import { supabaseService } from '../services/supabase';
import { DataMigrationService } from '../utils/dataMigration';

interface BackupRestoreProps {
  className?: string;
}

interface MigrationStatus {
  completed: boolean;
  timestamp?: string;
  migratedCounts?: {
    cards: number;
    dailyTasks: number;
    habits: number;
    powerStatements: number;
    manifestations: number;
    mindJournalEntries: number;
  };
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>(
    DataMigrationService.getMigrationStatus()
  );

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExportSupabaseData = async () => {
    if (!supabaseService.isAuthenticated()) {
      showMessage('Please sign in to export your data', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const backup = await supabaseService.exportUserData();
      if (backup) {
        DataMigrationService.downloadBackup(backup);
        showMessage('Data exported successfully!', 'success');
      } else {
        showMessage('Failed to export data', 'error');
      }
    } catch (error: any) {
      showMessage(`Export failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateFromLocalStorage = async () => {
    if (!supabaseService.isAuthenticated()) {
      showMessage('Please sign in to migrate your data', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await DataMigrationService.migrateToSupabase();
      
      if (result.success) {
        showMessage(result.message, 'success');
        setMigrationStatus(DataMigrationService.getMigrationStatus());
      } else {
        showMessage(result.message, 'error');
        if (result.errors.length > 0) {
          console.error('Migration errors:', result.errors);
        }
      }
    } catch (error: any) {
      showMessage(`Migration failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLocalStorageData = () => {
    const backup = DataMigrationService.exportLocalStorageData();
    if (backup) {
      DataMigrationService.downloadBackup(backup, 'localStorage-backup.json');
      showMessage('localStorage data exported successfully!', 'success');
    } else {
      showMessage('No localStorage data found to export', 'error');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validate backup structure
        if (!backupData.timestamp || !backupData.data) {
          throw new Error('Invalid backup file format');
        }

        // Import to localStorage
        const success = DataMigrationService.importLocalStorageData(backupData);
        if (success) {
          showMessage('Backup restored to localStorage successfully!', 'success');
          // Refresh the page to reload data
          setTimeout(() => window.location.reload(), 2000);
        } else {
          showMessage('Failed to restore backup', 'error');
        }
      } catch (error: any) {
        showMessage(`Invalid backup file: ${error.message}`, 'error');
      }
    };
    
    reader.readAsText(file);
    // Clear the input
    event.target.value = '';
  };

  const handleClearMigrationStatus = () => {
    DataMigrationService.clearMigrationStatus();
    setMigrationStatus({ completed: false });
    showMessage('Migration status cleared', 'info');
  };

  const getTotalMigratedItems = () => {
    if (!migrationStatus.migratedCounts) return 0;
    return Object.values(migrationStatus.migratedCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Data Management</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          messageType === 'success' ? 'bg-green-100 text-green-700' :
          messageType === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      {/* Migration Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Migration Status</h3>
        {migrationStatus.completed ? (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-800">
              ✅ Data migration completed on {new Date(migrationStatus.timestamp!).toLocaleDateString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Migrated {getTotalMigratedItems()} items total
            </p>
            <button
              onClick={handleClearMigrationStatus}
              className="text-sm text-green-600 hover:text-green-800 underline mt-1"
            >
              Clear status (for re-migration)
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-yellow-800">
              ⚠️ No migration completed yet
            </p>
            <p className="text-sm text-yellow-600">
              Sign in and migrate your localStorage data to Supabase for cloud sync
            </p>
          </div>
        )}
      </div>

      {/* Migration Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Data Migration</h3>
        <div className="space-y-2">
          <button
            onClick={handleMigrateFromLocalStorage}
            disabled={isLoading || !supabaseService.isAuthenticated()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Migrating...' : 'Migrate localStorage to Supabase'}
          </button>
          <p className="text-sm text-gray-600">
            Transfer your local data to Supabase cloud storage (requires sign-in)
          </p>
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Export Data</h3>
        <div className="space-y-2">
          <button
            onClick={handleExportSupabaseData}
            disabled={isLoading || !supabaseService.isAuthenticated()}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Exporting...' : 'Export Supabase Data'}
          </button>
          <p className="text-sm text-gray-600">
            Download your cloud data as JSON backup (requires sign-in)
          </p>
          
          <button
            onClick={handleExportLocalStorageData}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Export localStorage Data
          </button>
          <p className="text-sm text-gray-600">
            Download your local browser data as JSON backup
          </p>
        </div>
      </div>

      {/* Import Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Import Data</h3>
        <div className="space-y-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-600">
            Restore data from a JSON backup file to localStorage
          </p>
        </div>
      </div>

      {/* Authentication Notice */}
      {!supabaseService.isAuthenticated() && (
        <div className="bg-orange-50 border border-orange-200 rounded p-3">
          <p className="text-orange-800">
            🔐 Sign in to access cloud backup and migration features
          </p>
          <p className="text-sm text-orange-600 mt-1">
            Local export/import works without authentication
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 rounded p-3">
        <h4 className="font-medium mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Migration:</strong> One-time transfer from browser storage to Supabase cloud</li>
          <li>• <strong>Export:</strong> Create backup files of your data</li>
          <li>• <strong>Import:</strong> Restore data from backup files</li>
          <li>• <strong>Cloud sync:</strong> Real-time synchronization across devices when signed in</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupRestore;