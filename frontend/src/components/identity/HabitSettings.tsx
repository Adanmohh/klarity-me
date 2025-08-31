import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Bell, BellOff, Clock, Smartphone, Volume2, VolumeX, 
  ToggleLeft, ToggleRight, Save, RefreshCw, TestTube, Info, 
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle
} from 'lucide-react';

import NotificationService, { NotificationSettings, NotificationPermissions } from '../../services/notificationService';
import AutoCheckService, { AutoCheckSettings } from '../../services/autoCheckService';
import DailyResetService, { ResetSettings } from '../../services/dailyResetService';

interface Habit {
  id: number;
  name: string;
  scheduled_time: string;
  notificationEnabled?: boolean;
  reminderOffset?: number;
  autoCheckEnabled?: boolean;
  autoCheckWindowMinutes?: number;
}

interface HabitSettingsProps {
  habits: Habit[];
  onUpdateHabit: (habitId: number, updates: Partial<Habit>) => void;
  onClose: () => void;
}

const HabitSettings: React.FC<HabitSettingsProps> = ({ habits, onUpdateHabit, onClose }) => {
  // Service instances
  const notificationService = NotificationService.getInstance();
  const autoCheckService = AutoCheckService.getInstance();
  const dailyResetService = DailyResetService.getInstance();

  // States
  const [activeTab, setActiveTab] = useState<'notifications' | 'autocheck' | 'reset'>('notifications');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [autoCheckSettings, setAutoCheckSettings] = useState<AutoCheckSettings>(autoCheckService.getSettings());
  const [resetSettings, setResetSettings] = useState<ResetSettings>(dailyResetService.getSettings());
  const [permissions, setPermissions] = useState<NotificationPermissions>(notificationService.getPermissionStatus());
  const [testingNotification, setTestingNotification] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load initial settings
    setNotificationSettings(notificationService.getSettings());
    setAutoCheckSettings(autoCheckService.getSettings());
    setResetSettings(dailyResetService.getSettings());
    setPermissions(notificationService.getPermissionStatus());
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNotificationSettingsChange = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...updates };
    setNotificationSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleAutoCheckSettingsChange = (updates: Partial<AutoCheckSettings>) => {
    const newSettings = { ...autoCheckSettings, ...updates };
    setAutoCheckSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleResetSettingsChange = (updates: Partial<ResetSettings>) => {
    const newSettings = { ...resetSettings, ...updates };
    setResetSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleHabitSettingChange = (habitId: number, updates: Partial<Habit>) => {
    onUpdateHabit(habitId, updates);
    setHasUnsavedChanges(true);
  };

  const requestNotificationPermission = async () => {
    try {
      const newPermissions = await notificationService.requestPermission();
      setPermissions(newPermissions);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const testNotification = async () => {
    setTestingNotification(true);
    try {
      await notificationService.testNotification();
    } catch (error) {
      console.error('Failed to test notification:', error);
      alert('Failed to send test notification. Please check your permissions.');
    }
    setTimeout(() => setTestingNotification(false), 2000);
  };

  const saveAllSettings = async () => {
    try {
      // Update all services
      notificationService.updateSettings(notificationSettings);
      autoCheckService.updateSettings(autoCheckSettings);
      dailyResetService.updateSettings(resetSettings);

      // Reschedule notifications with new settings
      await notificationService.scheduleHabitNotifications(habits);

      setHasUnsavedChanges(false);
      
      // Show success feedback
      const successNotification = document.createElement('div');
      successNotification.textContent = 'Settings saved successfully!';
      successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successNotification);
      setTimeout(() => document.body.removeChild(successNotification), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setNotificationSettings({
        globalEnabled: true,
        soundEnabled: true,
        badgeEnabled: true,
        vibrationEnabled: true,
        reminderOffset: 5,
      });
      
      setAutoCheckSettings({
        globalEnabled: false,
        defaultWindowMinutes: 30,
        confidenceThreshold: 70,
        requireUserConsent: true,
        notifyOnAutoCheck: true,
        preserveStreaks: true,
        learningEnabled: true,
      });

      setResetSettings({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        resetTime: '00:00',
        gracePeriodHours: 3,
        preserveStreaks: true,
        streakBreakThreshold: 2,
        notifyOnReset: true,
        autoBackup: true,
      });

      setHasUnsavedChanges(true);
    }
  };

  const ToggleSwitch: React.FC<{ 
    enabled: boolean; 
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {enabled ? (
        <ToggleRight className={`w-8 h-8 ${disabled ? 'text-gray-400' : 'text-green-500'}`} />
      ) : (
        <ToggleLeft className={`w-8 h-8 ${disabled ? 'text-gray-400' : 'text-gray-300'}`} />
      )}
    </button>
  );

  const TabButton: React.FC<{ 
    tab: typeof activeTab; 
    icon: React.ReactNode; 
    label: string; 
    count?: number;
  }> = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab 
          ? 'bg-purple-100 text-purple-700 border border-purple-300' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-1 rounded-full text-xs ${
          activeTab === tab ? 'bg-purple-200' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Habit Settings</h2>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-yellow-200 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <TabButton
              tab="notifications"
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
              count={habits.filter(h => h.notificationEnabled !== false).length}
            />
            <TabButton
              tab="autocheck"
              icon={<CheckCircle className="w-4 h-4" />}
              label="Auto-Check"
              count={habits.filter(h => h.autoCheckEnabled).length}
            />
            <TabButton
              tab="reset"
              icon={<RefreshCw className="w-4 h-4" />}
              label="Daily Reset"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                {/* Permission Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  permissions.granted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {permissions.granted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <h3 className="font-medium">
                          Notification Permission {permissions.granted ? 'Granted' : 'Required'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {permissions.granted 
                            ? 'You will receive habit reminders' 
                            : 'Click to enable browser notifications for habit reminders'
                          }
                        </p>
                      </div>
                    </div>
                    {!permissions.granted && (
                      <button
                        onClick={requestNotificationPermission}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Enable Notifications
                      </button>
                    )}
                  </div>
                </div>

                {/* Global Notification Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('global-notifications')}
                  >
                    <h3 className="font-medium flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Global Notification Settings
                    </h3>
                    {expandedSections['global-notifications'] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections['global-notifications'] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Enable Notifications</label>
                            <p className="text-sm text-gray-600">Turn on/off all habit notifications</p>
                          </div>
                          <ToggleSwitch
                            enabled={notificationSettings.globalEnabled}
                            onChange={(enabled) => handleNotificationSettingsChange({ globalEnabled: enabled })}
                            disabled={!permissions.granted}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Sound Notifications</label>
                            <p className="text-sm text-gray-600">Play sound when notifications appear</p>
                          </div>
                          <ToggleSwitch
                            enabled={notificationSettings.soundEnabled}
                            onChange={(enabled) => handleNotificationSettingsChange({ soundEnabled: enabled })}
                            disabled={!notificationSettings.globalEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Badge Notifications</label>
                            <p className="text-sm text-gray-600">Show badges on app icon</p>
                          </div>
                          <ToggleSwitch
                            enabled={notificationSettings.badgeEnabled}
                            onChange={(enabled) => handleNotificationSettingsChange({ badgeEnabled: enabled })}
                            disabled={!notificationSettings.globalEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-medium">Vibration</label>
                            <p className="text-sm text-gray-600">Vibrate device on mobile</p>
                          </div>
                          <ToggleSwitch
                            enabled={notificationSettings.vibrationEnabled}
                            onChange={(enabled) => handleNotificationSettingsChange({ vibrationEnabled: enabled })}
                            disabled={!notificationSettings.globalEnabled}
                          />
                        </div>
                        
                        <div>
                          <label className="block font-medium mb-2">Default Reminder Time</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="60"
                              step="5"
                              value={notificationSettings.reminderOffset}
                              onChange={(e) => handleNotificationSettingsChange({ reminderOffset: Number(e.target.value) })}
                              className="flex-1"
                              disabled={!notificationSettings.globalEnabled}
                            />
                            <span className="text-sm text-gray-600 min-w-0">
                              {notificationSettings.reminderOffset} min before
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={testNotification}
                            disabled={!permissions.granted || testingNotification}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <TestTube className="w-4 h-4" />
                            {testingNotification ? 'Testing...' : 'Test Notification'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Per-Habit Notification Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium">Individual Habit Settings</h3>
                  {habits.map((habit) => (
                    <div key={habit.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{habit.name}</h4>
                          <p className="text-sm text-gray-600">Scheduled at {habit.scheduled_time}</p>
                        </div>
                        <ToggleSwitch
                          enabled={habit.notificationEnabled !== false}
                          onChange={(enabled) => handleHabitSettingChange(habit.id, { notificationEnabled: enabled })}
                          disabled={!notificationSettings.globalEnabled}
                        />
                      </div>
                      
                      {habit.notificationEnabled !== false && (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          <div>
                            <label className="block text-sm font-medium mb-1">Reminder Time</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="60"
                                step="5"
                                value={habit.reminderOffset ?? notificationSettings.reminderOffset}
                                onChange={(e) => handleHabitSettingChange(habit.id, { reminderOffset: Number(e.target.value) })}
                                className="flex-1"
                              />
                              <span className="text-xs text-gray-500 min-w-0">
                                {habit.reminderOffset ?? notificationSettings.reminderOffset} min before
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'autocheck' && (
              <motion.div
                key="autocheck"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                {/* Auto-Check Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">About Auto-Check</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Auto-check can automatically mark habits as completed based on configurable rules and your patterns. 
                        This feature learns from your behavior to make intelligent decisions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Global Auto-Check Settings */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Global Auto-Check Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Enable Auto-Check</label>
                      <p className="text-sm text-gray-600">Allow habits to be automatically completed</p>
                    </div>
                    <ToggleSwitch
                      enabled={autoCheckSettings.globalEnabled}
                      onChange={(enabled) => handleAutoCheckSettingsChange({ globalEnabled: enabled })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Require Confirmation</label>
                      <p className="text-sm text-gray-600">Ask before auto-completing habits</p>
                    </div>
                    <ToggleSwitch
                      enabled={autoCheckSettings.requireUserConsent}
                      onChange={(enabled) => handleAutoCheckSettingsChange({ requireUserConsent: enabled })}
                      disabled={!autoCheckSettings.globalEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Learning Mode</label>
                      <p className="text-sm text-gray-600">Learn from your completion patterns</p>
                    </div>
                    <ToggleSwitch
                      enabled={autoCheckSettings.learningEnabled}
                      onChange={(enabled) => handleAutoCheckSettingsChange({ learningEnabled: enabled })}
                      disabled={!autoCheckSettings.globalEnabled}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Default Time Window</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={autoCheckSettings.defaultWindowMinutes}
                        onChange={(e) => handleAutoCheckSettingsChange({ defaultWindowMinutes: Number(e.target.value) })}
                        className="flex-1"
                        disabled={!autoCheckSettings.globalEnabled}
                      />
                      <span className="text-sm text-gray-600 min-w-0">
                        {autoCheckSettings.defaultWindowMinutes} min after
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Confidence Threshold</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={autoCheckSettings.confidenceThreshold}
                        onChange={(e) => handleAutoCheckSettingsChange({ confidenceThreshold: Number(e.target.value) })}
                        className="flex-1"
                        disabled={!autoCheckSettings.globalEnabled}
                      />
                      <span className="text-sm text-gray-600 min-w-0">
                        {autoCheckSettings.confidenceThreshold}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-Habit Auto-Check Settings */}
                <div className="space-y-3">
                  <h3 className="font-medium">Individual Habit Auto-Check</h3>
                  {habits.map((habit) => (
                    <div key={habit.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{habit.name}</h4>
                          <p className="text-sm text-gray-600">Scheduled at {habit.scheduled_time}</p>
                        </div>
                        <ToggleSwitch
                          enabled={habit.autoCheckEnabled === true}
                          onChange={(enabled) => handleHabitSettingChange(habit.id, { autoCheckEnabled: enabled })}
                          disabled={!autoCheckSettings.globalEnabled}
                        />
                      </div>
                      
                      {habit.autoCheckEnabled && (
                        <div className="pt-3 border-t border-gray-100">
                          <label className="block text-sm font-medium mb-1">Auto-Check Window</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="5"
                              max="120"
                              step="5"
                              value={habit.autoCheckWindowMinutes ?? autoCheckSettings.defaultWindowMinutes}
                              onChange={(e) => handleHabitSettingChange(habit.id, { autoCheckWindowMinutes: Number(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500 min-w-0">
                              {habit.autoCheckWindowMinutes ?? autoCheckSettings.defaultWindowMinutes} min after
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Daily Reset Settings</h3>
                  
                  <div>
                    <label className="block font-medium mb-2">Reset Time</label>
                    <input
                      type="time"
                      value={resetSettings.resetTime}
                      onChange={(e) => handleResetSettingsChange({ resetTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-gray-600 mt-1">When to reset habit completion status</p>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Timezone</label>
                    <select
                      value={resetSettings.timezone}
                      onChange={(e) => handleResetSettingsChange({ timezone: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {[
                        'America/New_York',
                        'America/Chicago',
                        'America/Denver',
                        'America/Los_Angeles',
                        'Europe/London',
                        'Europe/Paris',
                        'Europe/Berlin',
                        'Asia/Tokyo',
                        'Asia/Shanghai',
                        'Australia/Sydney',
                        'UTC'
                      ].map((tz: string) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Grace Period</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={resetSettings.gracePeriodHours}
                        onChange={(e) => handleResetSettingsChange({ gracePeriodHours: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 min-w-0">
                        {resetSettings.gracePeriodHours} hours
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Time after midnight to still count as previous day</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Preserve Streaks</label>
                      <p className="text-sm text-gray-600">Don't immediately break streaks on missed days</p>
                    </div>
                    <ToggleSwitch
                      enabled={resetSettings.preserveStreaks}
                      onChange={(enabled) => handleResetSettingsChange({ preserveStreaks: enabled })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Reset Notifications</label>
                      <p className="text-sm text-gray-600">Notify when daily reset occurs</p>
                    </div>
                    <ToggleSwitch
                      enabled={resetSettings.notifyOnReset}
                      onChange={(enabled) => handleResetSettingsChange({ notifyOnReset: enabled })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Auto Backup</label>
                      <p className="text-sm text-gray-600">Automatically backup streak data</p>
                    </div>
                    <ToggleSwitch
                      enabled={resetSettings.autoBackup}
                      onChange={(enabled) => handleResetSettingsChange({ autoBackup: enabled })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveAllSettings}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HabitSettings;