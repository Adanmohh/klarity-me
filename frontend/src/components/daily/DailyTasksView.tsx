import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskDuration, DailyTaskStatus, DailyTaskLane, type DailyTask } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Icons } from '../icons/LucideIcons';
import { useDailyTaskStore } from '../../store/dailyTaskStore';
import { cn } from '../../utils/cn';

export const DailyTasksView: React.FC = () => {
  // Zustand store state and actions
  const {
    tasks,
    loading,
    error,
    isOnline,
    lastSync,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    reopenTask,
    moveToMain,
    moveToController,
    clearError
  } = useDailyTaskStore();

  // Local form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<TaskDuration>(TaskDuration.FIFTEEN_MIN);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLane, setSelectedLane] = useState<DailyTaskLane>(DailyTaskLane.CONTROLLER);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Separate tasks by lane
  const controllerTasks = tasks.filter(task => task.lane === DailyTaskLane.CONTROLLER);
  const mainTasks = tasks.filter(task => task.lane === DailyTaskLane.MAIN);

  // Group main tasks by duration
  const mainTasksByDuration = {
    [TaskDuration.TEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.TEN_MIN),
    [TaskDuration.FIFTEEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.FIFTEEN_MIN),
    [TaskDuration.THIRTY_MIN]: mainTasks.filter(task => task.duration === TaskDuration.THIRTY_MIN),
    'No Duration': mainTasks.filter(task => !task.duration),
  };

  // Action handlers using the store
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      lane: selectedLane,
      duration: selectedLane === DailyTaskLane.MAIN ? selectedDuration : undefined,
    });

    // Clear form on success (error handling is done in store)
    if (!error) {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddForm(false);
    }
  };

  const handleMoveToMain = async (taskId: string, duration?: TaskDuration) => {
    await moveToMain(taskId, duration);
  };

  const handleMoveToController = async (taskId: string) => {
    await moveToController(taskId);
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === DailyTaskStatus.COMPLETED) {
      await reopenTask(taskId);
    } else {
      await completeTask(taskId);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<DailyTask>) => {
    await updateTask(taskId, updates);
  };

  const TaskItem: React.FC<{ task: DailyTask; showMoveButton?: boolean }> = ({ task, showMoveButton = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const [showDurationSelect, setShowDurationSelect] = useState(false);

    const handleSaveEdit = async () => {
      if (editTitle.trim() && (editTitle !== task.title || editDescription !== task.description)) {
        await handleUpdateTask(task.id, {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
        });
      }
      setIsEditing(false);
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={cn(
          "glass-effect rounded-lg p-3 mb-2",
          task.status === DailyTaskStatus.COMPLETED && "opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleToggleComplete(task.id)}
            className={cn(
              "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              task.status === DailyTaskStatus.COMPLETED
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-primary-500"
            )}
          >
            {task.status === DailyTaskStatus.COMPLETED && (
              <Icons.Check className="w-3 h-3 text-white" />
            )}
          </button>

          {isEditing ? (
            <div className="flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 mb-1 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-300 dark:border-gray-600"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-300 dark:border-gray-600 text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "font-medium",
                  task.status === DailyTaskStatus.COMPLETED && "line-through"
                )}>
                  {task.title}
                </div>
                {/* Local task indicator */}
                {task.id.startsWith('local-') && (
                  <span 
                    className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full"
                    title="Created offline - will sync when connection is restored"
                  >
                    Local
                  </span>
                )}
              </div>
              {task.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {task.duration && (
                  <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded">
                    {task.duration}
                  </span>
                )}
                {task.completed_at && (
                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                    Completed at {new Date(task.completed_at).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                {showMoveButton && task.lane === DailyTaskLane.CONTROLLER && (
                  <div className="relative">
                    {showDurationSelect ? (
                      <div className="absolute right-0 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10">
                        <div className="text-xs font-medium mb-1">Select duration:</div>
                        {Object.values(TaskDuration).map(duration => (
                          <button
                            key={duration}
                            onClick={() => {
                              handleMoveToMain(task.id, duration);
                              setShowDurationSelect(false);
                            }}
                            className="block w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDurationSelect(true)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                        title="Move to Main"
                      >
                        <Icons.Move className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                  </div>
                )}
                {showMoveButton && task.lane === DailyTaskLane.MAIN && (
                  <button
                    onClick={() => handleMoveToController(task.id)}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    title="Move to Controller"
                  >
                    <Icons.Move className="w-4 h-4 text-blue-500" />
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Edit task"
                >
                  <Icons.Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Delete task"
                >
                  <Icons.Trash className="w-4 h-4 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Daily Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your daily tasks and miscellaneous to-dos
              </p>
            </div>
            
            {/* Connection Status & Sync Info */}
            <div className="flex items-center gap-4">
              {/* Online/Offline Status */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                isOnline 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isOnline ? "bg-green-500" : "bg-orange-500"
                )} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              {/* Last Sync Time */}
              {lastSync && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last synced: {new Date(lastSync).toLocaleTimeString()}
                </div>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={() => fetchTasks()}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh tasks"
              >
                <Icons.RefreshCw className={cn(
                  "w-4 h-4 text-gray-500",
                  loading && "animate-spin"
                )} />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    {error.message}
                    {!isOnline && " (Working offline - changes will sync when connection is restored)"}
                  </span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Task Form */}
        <GlassCard className="mb-6">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="ghost"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          ) : (
            <form onSubmit={handleCreateTask} className="p-4">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedLane(DailyTaskLane.CONTROLLER)}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    selectedLane === DailyTaskLane.CONTROLLER
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  Add to Controller
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLane(DailyTaskLane.MAIN)}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    selectedLane === DailyTaskLane.MAIN
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  Add to Main
                </button>
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-3 py-2 mb-2 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-300 dark:border-gray-600"
                autoFocus
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 mb-3 bg-white/50 dark:bg-gray-800/50 rounded border border-gray-300 dark:border-gray-600"
                rows={2}
              />
              {selectedLane === DailyTaskLane.MAIN && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                  <div className="flex gap-2">
                    {Object.values(TaskDuration).map(duration => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSelectedDuration(duration)}
                        className={cn(
                          "px-3 py-1 rounded text-sm transition-colors",
                          selectedDuration === duration
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        )}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={!newTaskTitle.trim()}>
                  Add Task
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle('');
                    setNewTaskDescription('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </GlassCard>

        {/* Horizontal Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controller Lane */}
          <GlassCard className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Layers className="w-5 h-5" />
                Controller
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Task ideas and unorganized items
              </p>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {controllerTasks.length > 0 ? (
                  controllerTasks.map(task => (
                    <TaskItem key={task.id} task={task} showMoveButton />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icons.ListX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No tasks in controller</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Main Lane */}
          <GlassCard className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.Target className="w-5 h-5" />
                Main Tasks
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Organized tasks with time estimates
              </p>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {Object.entries(mainTasksByDuration).map(([duration, durationTasks]) => (
                durationTasks.length > 0 && (
                  <div key={duration}>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {duration}
                    </div>
                    <AnimatePresence>
                      {durationTasks.map(task => (
                        <TaskItem key={task.id} task={task} showMoveButton />
                      ))}
                    </AnimatePresence>
                  </div>
                )
              ))}
              {mainTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Icons.ListX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks in main</p>
                  <p className="text-sm mt-2">Move tasks from Controller to get started</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {controllerTasks.filter(t => t.status !== DailyTaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Controller Tasks</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {mainTasks.filter(t => t.status !== DailyTaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Main Tasks</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.filter(t => t.status === DailyTaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed Today</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};