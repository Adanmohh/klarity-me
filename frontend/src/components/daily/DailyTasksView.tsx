import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TaskLane, TaskDuration, DailyTaskStatus, type DailyTask } from '../../types';
import { TaskLane as TaskLaneComponent } from '../workspace/TaskLane';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Icons } from '../icons/LucideIcons';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { dailyTasksAPI, cardsAPI } from '../../services/api';
import { useCardStore } from '../../store/cardStore';
import { cn } from '../../utils/cn';

export const DailyTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<TaskDuration>(TaskDuration.TEN_MIN);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const { cards } = useCardStore();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });

  useEffect(() => {
    loadTasks();
  }, [selectedCard]);

  const loadTasks = async () => {
    if (!selectedCard) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const fetchedTasks = await dailyTasksAPI.getTasksByCard(selectedCard);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on archive status
  const visibleTasks = tasks.filter(task => 
    showArchived ? task.status === DailyTaskStatus.ARCHIVED : task.status !== DailyTaskStatus.ARCHIVED
  );

  // Separate tasks by lane
  const controllerTasks = visibleTasks.filter(task => task.lane === TaskLane.CONTROLLER);
  const mainTasks = visibleTasks.filter(task => task.lane === TaskLane.MAIN);

  // Group main tasks by duration
  const tasksByDuration = {
    [TaskDuration.TEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.TEN_MIN),
    [TaskDuration.FIFTEEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.FIFTEEN_MIN),
    [TaskDuration.THIRTY_MIN]: mainTasks.filter(task => task.duration === TaskDuration.THIRTY_MIN),
  };

  const handleCreateTask = async (lane: TaskLane) => {
    if (!newTaskTitle.trim() || !selectedCard) return;

    try {
      const newTask = await dailyTasksAPI.createTask({
        card_id: selectedCard,
        title: newTaskTitle,
        lane,
        duration: lane === TaskLane.MAIN ? selectedDuration : undefined,
        status: DailyTaskStatus.PENDING,
      });
      
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleMoveTask = async (taskId: string, toLane: TaskLane, duration?: TaskDuration) => {
    try {
      const updatedTask = await dailyTasksAPI.updateTask(taskId, {
        lane: toLane,
        duration: toLane === TaskLane.MAIN ? duration : undefined,
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const newStatus = task.status === DailyTaskStatus.COMPLETED ? DailyTaskStatus.PENDING : DailyTaskStatus.COMPLETED;
      const updatedTask = await dailyTasksAPI.updateTask(taskId, { status: newStatus });
      
      setTasks(tasks.map(t => 
        t.id === taskId ? updatedTask : t
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    try {
      const updatedTask = await dailyTasksAPI.updateTask(taskId, { status: DailyTaskStatus.ARCHIVED });
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      const updatedTask = await dailyTasksAPI.updateTask(taskId, { status: DailyTaskStatus.PENDING });
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirm.taskId) return;

    try {
      await dailyTasksAPI.deleteTask(deleteConfirm.taskId);
      setTasks(tasks.filter(task => task.id !== deleteConfirm.taskId));
      setDeleteConfirm({ isOpen: false, taskId: null });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const renderTask = (task: DailyTask) => {
    const isArchived = task.status === DailyTaskStatus.ARCHIVED;
    const isCompleted = task.status === DailyTaskStatus.COMPLETED;

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-4 rounded-lg border transition-all",
          isArchived
            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 opacity-60"
            : isCompleted
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => handleToggleComplete(task.id)}
              className={cn(
                "mt-0.5 w-5 h-5 rounded border-2 transition-all",
                isCompleted
                  ? "bg-green-500 border-green-500"
                  : "border-neutral-300 hover:border-primary-gold"
              )}
            >
              {isCompleted && (
                <Icons.Check className="w-3 h-3 text-white" />
              )}
            </button>
            <div className="flex-1">
              <h4 className={cn(
                "font-medium",
                isCompleted && "line-through text-neutral-500"
              )}>
                {task.title}
              </h4>
              {task.duration && (
                <span className="text-xs text-neutral-500 mt-1">
                  Duration: {task.duration}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isArchived ? (
              <>
                <button
                  onClick={() => handleRestoreTask(task.id)}
                  className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                  title="Restore"
                >
                  <Icons.RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ isOpen: true, taskId: task.id })}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                  title="Delete Permanently"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleArchiveTask(task.id)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Archive"
              >
                <Icons.Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary-black dark:text-white mb-2">Daily Tasks</h2>
        <p className="text-gray-600 dark:text-gray-400">Quick tasks organized by time duration</p>
      </div>

      {/* Card Selection */}
      {cards && cards.length > 0 && (
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Select Card:
              </label>
              <select
                value={selectedCard || ''}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              >
                <option value="">Choose a card...</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                showArchived
                  ? "bg-primary-gold text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              )}
            >
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>
        </GlassCard>
      )}

      {!selectedCard ? (
        <div className="text-center py-12">
          <Icons.Layers className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Select a card to manage daily tasks
          </h3>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Icons.Refresh className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          {/* Add Task Section */}
          {!showArchived && (
            <GlassCard className="p-6">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask(TaskLane.CONTROLLER)}
                  placeholder="Add a quick task..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 
                           focus:outline-none focus:ring-2 focus:ring-primary-gold/50"
                />
                
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as TaskDuration)}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                >
                  <option value={TaskDuration.TEN_MIN}>10 min</option>
                  <option value={TaskDuration.FIFTEEN_MIN}>15 min</option>
                  <option value={TaskDuration.THIRTY_MIN}>30 min</option>
                </select>
                
                <Button onClick={() => handleCreateTask(TaskLane.CONTROLLER)}>
                  Add Task
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Tasks Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controller Tasks */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
                Controller Tasks
              </h3>
              <div className="space-y-3">
                {controllerTasks.length === 0 ? (
                  <p className="text-neutral-500 text-center py-4">
                    No controller tasks
                  </p>
                ) : (
                  controllerTasks.map(renderTask)
                )}
              </div>
            </GlassCard>

            {/* Main Tasks */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
                Main Tasks
              </h3>
              {Object.entries(tasksByDuration).map(([duration, durationTasks]) => (
                <div key={duration} className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    {duration.replace('_', ' ')}
                  </h4>
                  <div className="space-y-3">
                    {durationTasks.length === 0 ? (
                      <p className="text-neutral-400 text-sm">No tasks</p>
                    ) : (
                      durationTasks.map(renderTask)
                    )}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, taskId: null })}
        onConfirm={handleDeleteTask}
        title="Delete Task Permanently"
        message="This action cannot be undone. The task will be permanently deleted."
        variant="danger"
      />
    </motion.div>
  );
};