import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardWithTasks, FocusTask, TaskLane, TaskStatus } from '../../types';
import { focusTasksAPI } from '../../services/api';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';

interface FocusAreaProps {
  card: CardWithTasks;
}

export const FocusArea: React.FC<FocusAreaProps> = ({ card }) => {
  const [tasks, setTasks] = useState(card.focus_tasks || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedLane, setSelectedLane] = useState<TaskLane>(TaskLane.CONTROLLER);
  const [loading, setLoading] = useState(false);

  const activeTasks = tasks.filter(task => task.status !== TaskStatus.ARCHIVED);
  const controllerTasks = activeTasks.filter(task => task.lane === TaskLane.CONTROLLER);
  const mainTasks = activeTasks.filter(task => task.lane === TaskLane.MAIN);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const newTask = await focusTasksAPI.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        card_id: card.id,
        lane: selectedLane,
        position: tasks.filter(t => t.lane === selectedLane).length,
        tags: [],
      });
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<FocusTask>) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      const updatesWithCardId = {
        ...updates,
        card_id: taskToUpdate?.card_id || card.id
      };
      const updatedTask = await focusTasksAPI.updateTask(taskId, updatesWithCardId);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === TaskStatus.COMPLETED 
      ? TaskStatus.ACTIVE 
      : TaskStatus.COMPLETED;
    
    await handleUpdateTask(taskId, { status: newStatus });
  };

  const handleMoveTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newLane = task.lane === TaskLane.CONTROLLER ? TaskLane.MAIN : TaskLane.CONTROLLER;
    await handleUpdateTask(taskId, { lane: newLane });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await handleUpdateTask(taskId, { status: TaskStatus.ARCHIVED });
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const TaskItem: React.FC<{ task: FocusTask; showMoveButton?: boolean }> = ({ task, showMoveButton = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');

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
          task.status === TaskStatus.COMPLETED && "opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleToggleComplete(task.id)}
            className={cn(
              "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              task.status === TaskStatus.COMPLETED
                ? "bg-green-500 border-green-500"
                : "border-gray-300 hover:border-primary-500"
            )}
          >
            {task.status === TaskStatus.COMPLETED && (
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
              <div className={cn(
                "font-medium",
                task.status === TaskStatus.COMPLETED && "line-through"
              )}>
                {task.title}
              </div>
              {task.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </div>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-primary-gold/20 text-primary-gold rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            {showMoveButton && !isEditing && (
              <button
                onClick={() => handleMoveTask(task.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title={task.lane === TaskLane.CONTROLLER ? "Move to Main" : "Move to Controller"}
              >
                <Icons.MoveRight className="w-4 h-4 text-blue-500" />
              </button>
            )}
            {!isEditing && (
              <>
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
                  title="Archive task"
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Focus Mode: {card.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {card.description || 'Manage your focus tasks'}
          </p>
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
                  onClick={() => setSelectedLane(TaskLane.CONTROLLER)}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    selectedLane === TaskLane.CONTROLLER
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  Add to Controller
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLane(TaskLane.MAIN)}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    selectedLane === TaskLane.MAIN
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
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !newTaskTitle.trim()}>
                  {loading ? 'Creating...' : 'Create Task'}
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

        {/* Side-by-side Lanes */}
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
                Organized focus tasks
              </p>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {mainTasks.length > 0 ? (
                  mainTasks.map(task => (
                    <TaskItem key={task.id} task={task} showMoveButton />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icons.ListX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No tasks in main</p>
                    <p className="text-sm mt-2">Move tasks from Controller to get started</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {controllerTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Controller Tasks</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {mainTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Main Tasks</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};