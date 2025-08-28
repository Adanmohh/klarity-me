import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Sun, Moon, RotateCw, Save, Trash2, Edit2 } from 'lucide-react';
import { identityAPI } from '../services/api';

interface IdentityStatement {
  id?: string;
  text: string;
  background_color?: string;
  background_image?: string;
  order: number;
  active: boolean;
}

interface ReminderSettings {
  morning_ritual: boolean;
  morning_time: string;
  day_rotation: boolean;
  rotation_interval: number;
  evening_review: boolean;
  evening_time: string;
}

interface IdentitySettingsData {
  id?: string;
  user_id?: string;
  statements: IdentityStatement[];
  reminder_settings: ReminderSettings;
}

const IdentitySettings: React.FC = () => {
  const [settings, setSettings] = useState<IdentitySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStatement, setEditingStatement] = useState<string | null>(null);
  const [newStatementText, setNewStatementText] = useState('');
  const [editText, setEditText] = useState('');

  const colors = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
    '#EF4444', '#6366F1', '#84CC16', '#06B6D4', '#F97316'
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await identityAPI.getSettings();
      setSettings(response);
    } catch (error) {
      console.error('Failed to fetch identity settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStatement = async () => {
    if (!newStatementText.trim() || !settings) return;
    if (settings.statements.length >= 5) {
      alert('Maximum 5 identity statements allowed');
      return;
    }

    try {
      const response = await identityAPI.addStatement({
        text: newStatementText.trim(),
        background_color: colors[settings.statements.length],
        active: true
      });
      
      setSettings({
        ...settings,
        statements: [...settings.statements, response]
      });
      setNewStatementText('');
    } catch (error) {
      console.error('Failed to add statement:', error);
    }
  };

  const updateStatement = async (id: string) => {
    if (!editText.trim() || !settings) return;

    try {
      const response = await identityAPI.updateStatement(id, {
        text: editText.trim()
      });
      
      setSettings({
        ...settings,
        statements: settings.statements.map(stmt => 
          stmt.id === id ? { ...stmt, text: editText.trim() } : stmt
        )
      });
      setEditingStatement(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update statement:', error);
    }
  };

  const deleteStatement = async (id: string) => {
    if (!settings) return;

    try {
      await identityAPI.deleteStatement(id);
      setSettings({
        ...settings,
        statements: settings.statements.filter(stmt => stmt.id !== id)
      });
    } catch (error) {
      console.error('Failed to delete statement:', error);
    }
  };

  const updateReminderSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await identityAPI.updateSettings({
        reminder_settings: settings.reminder_settings
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Identity Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Define who you are becoming with powerful "I am" statements
        </p>
      </div>

      {/* Identity Statements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Identity Statements
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {settings.statements.length}/5 statements
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {settings.statements.map((statement, index) => (
              <motion.div
                key={statement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative group"
              >
                <div 
                  className="p-4 rounded-lg text-white font-medium shadow-md"
                  style={{ backgroundColor: statement.background_color || colors[index] }}
                >
                  {editingStatement === statement.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateStatement(statement.id!)}
                        className="flex-1 px-3 py-1 rounded bg-white/20 placeholder-white/70 text-white"
                        placeholder="I am..."
                        autoFocus
                      />
                      <button
                        onClick={() => updateStatement(statement.id!)}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStatement(null);
                          setEditText('');
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg">{statement.text}</span>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingStatement(statement.id!);
                            setEditText(statement.text);
                          }}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteStatement(statement.id!)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {settings.statements.length < 5 && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newStatementText}
                onChange={(e) => setNewStatementText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStatement()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add new identity statement (e.g., I am disciplined)"
              />
              <button
                onClick={addStatement}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Reminder Settings
        </h2>

        <div className="space-y-6">
          {/* Morning Ritual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sun className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Morning Ritual</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review your identity at the start of each day
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="time"
                value={settings.reminder_settings.morning_time}
                onChange={(e) => setSettings({
                  ...settings,
                  reminder_settings: {
                    ...settings.reminder_settings,
                    morning_time: e.target.value
                  }
                })}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminder_settings.morning_ritual}
                  onChange={(e) => setSettings({
                    ...settings,
                    reminder_settings: {
                      ...settings.reminder_settings,
                      morning_ritual: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Day Rotation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RotateCw className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Day Rotation</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rotate through statements during the day
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={settings.reminder_settings.rotation_interval}
                onChange={(e) => setSettings({
                  ...settings,
                  reminder_settings: {
                    ...settings.reminder_settings,
                    rotation_interval: parseInt(e.target.value)
                  }
                })}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>Every hour</option>
                <option value={2}>Every 2 hours</option>
                <option value={3}>Every 3 hours</option>
                <option value={4}>Every 4 hours</option>
                <option value={6}>Every 6 hours</option>
              </select>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminder_settings.day_rotation}
                  onChange={(e) => setSettings({
                    ...settings,
                    reminder_settings: {
                      ...settings.reminder_settings,
                      day_rotation: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Evening Review */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Evening Review</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reflect on your identity before sleep
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="time"
                value={settings.reminder_settings.evening_time}
                onChange={(e) => setSettings({
                  ...settings,
                  reminder_settings: {
                    ...settings.reminder_settings,
                    evening_time: e.target.value
                  }
                })}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminder_settings.evening_review}
                  onChange={(e) => setSettings({
                    ...settings,
                    reminder_settings: {
                      ...settings.reminder_settings,
                      evening_review: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={updateReminderSettings}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentitySettings;