import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardWithTasks, FocusTask, TaskLane, TaskStatus } from '../../types';
import { focusTasksAPI } from '../../services/api';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';
import { theme } from '../../styles/theme';

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

  const TaskCard = React.forwardRef<HTMLDivElement, { task: FocusTask }>(({ task }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const isCompleted = task.status === TaskStatus.COMPLETED;

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
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "group relative bg-white rounded-xl p-4",
          "border-2 transition-all duration-200",
          isCompleted 
            ? "border-green-200 bg-green-50/30" 
            : "border-gray-200 hover:border-indigo-300",
          "hover:shadow-lg"
        )}
        style={{
          boxShadow: isCompleted ? theme.shadows.sm : theme.shadows.md,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => handleToggleComplete(task.id)}
              className={cn(
                "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                isCompleted
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 hover:border-indigo-500"
              )}
            >
              {isCompleted && (
                <Icons.Check className="w-3 h-3 text-white" />
              )}
            </button>

            {isEditing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 mb-2 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                  onBlur={handleSaveEdit}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-2 py-1 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:outline-none text-sm"
                  rows={2}
                  onBlur={handleSaveEdit}
                />
              </div>
            ) : (
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium text-gray-800 mb-1",
                  isCompleted && "line-through text-gray-500"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isEditing && (
              <>
                <button
                  onClick={() => handleMoveTask(task.id)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title={task.lane === TaskLane.CONTROLLER ? "Move to Main" : "Move to Controller"}
                >
                  {task.lane === TaskLane.CONTROLLER ? (
                    <Icons.MoveRight className="w-4 h-4" />
                  ) : (
                    <Icons.ArrowLeft className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Icons.Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Icons.Trash className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Focus Mode: {card.title}
            </h1>
            <p className="text-gray-600">
              {card.description || 'Manage your focus tasks efficiently'}
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ boxShadow: theme.shadows.lg }}
          >
            <Icons.Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ boxShadow: theme.shadows.xl }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLane(TaskLane.CONTROLLER)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg font-medium transition-all",
                      selectedLane === TaskLane.CONTROLLER
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                    )}
                  >
                    <Icons.Lightbulb className="w-4 h-4 inline mr-2" />
                    Controller
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLane(TaskLane.MAIN)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg font-medium transition-all",
                      selectedLane === TaskLane.MAIN
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent"
                    )}
                  >
                    <Icons.Target className="w-4 h-4 inline mr-2" />
                    Main
                  </button>
                </div>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 mb-3 bg-white rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 mb-4 bg-white rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !newTaskTitle.trim()}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Lane Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controller Lane */}
        <div 
          className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          style={{ boxShadow: theme.shadows.xl }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Icons.Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Controller</h2>
              <p className="text-sm text-gray-600">Ideas & unorganized tasks</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {controllerTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {controllerTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </AnimatePresence>
            
            {controllerTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Icons.Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No tasks in controller</p>
                <p className="text-sm mt-1">Add ideas and tasks to organize later</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Lane */}
        <div 
          className="bg-white rounded-2xl border-2 border-indigo-200 p-6"
          style={{ boxShadow: theme.shadows.xl }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Icons.Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Main Focus</h2>
              <p className="text-sm text-gray-600">Priority tasks to complete</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {mainTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {mainTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </AnimatePresence>
            
            {mainTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Icons.Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No main tasks</p>
                <p className="text-sm mt-1">Move important tasks here to focus</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};