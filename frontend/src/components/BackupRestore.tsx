import React from 'react';

interface BackupRestoreProps {
  className?: string;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
      <p className="text-gray-600">
        Backup and restore functionality is temporarily disabled while we migrate to the new architecture.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        This feature will be available soon through our backend API.
      </p>
    </div>
  );
};