import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskDuration, DailyTaskStatus, DailyTaskLane, type DailyTask } from '../../types';
import { Icons } from '../icons/LucideIcons';
import { dailyTasksAPI } from '../../services/api';
import { cn } from '../../utils/cn';
import { theme } from '../../styles/theme';

export const DailyTasksViewStyled: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<TaskDuration>(TaskDuration.FIFTEEN_MIN);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLane, setSelectedLane] = useState<DailyTaskLane>(DailyTaskLane.CONTROLLER);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await dailyTasksAPI.getAllTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const controllerTasks = tasks.filter(task => task.lane === DailyTaskLane.CONTROLLER);
  const mainTasks = tasks.filter(task => task.lane === DailyTaskLane.MAIN);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await dailyTasksAPI.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        lane: selectedLane,
        duration: selectedLane === DailyTaskLane.MAIN ? selectedDuration : undefined,
        status: DailyTaskStatus.PENDING,
        position: tasks.filter(t => t.lane === selectedLane).length,
      });
      
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleMoveToMain = async (taskId: string, duration?: TaskDuration) => {
    try {
      const updatedTask = await dailyTasksAPI.moveToMain(taskId, duration);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      setMovingTaskId(null);
    } catch (error) {
      console.error('Failed to move task to main:', error);
    }
  };

  const handleMoveToController = async (taskId: string) => {
    try {
      const updatedTask = await dailyTasksAPI.moveToController(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to move task to controller:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updatedTask = await dailyTasksAPI.completeTask(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleReopenTask = async (taskId: string) => {
    try {
      const updatedTask = await dailyTasksAPI.reopenTask(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to reopen task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dailyTasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const TaskCard = ({ task }: { task: DailyTask }) => {
    const isCompleted = task.status === DailyTaskStatus.COMPLETED;
    const isMoving = movingTaskId === task.id;
    
    return (
      <motion.div
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
            {task.duration && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                <Icons.Clock className="w-3 h-3" />
                {task.duration}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {task.lane === DailyTaskLane.CONTROLLER ? (
              <button
                onClick={() => setMovingTaskId(task.id)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Move to Main"
              >
                <Icons.Move className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleMoveToController(task.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Move to Controller"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
              </button>
            )}
            
            {isCompleted ? (
              <button
                onClick={() => handleReopenTask(task.id)}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Reopen"
              >
                <Icons.RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Complete"
              >
                <Icons.Check className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isMoving && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <p className="text-sm text-gray-600 mb-2">Select duration:</p>
            <div className="flex gap-2">
              {Object.values(TaskDuration).map(duration => (
                <button
                  key={duration}
                  onClick={() => handleMoveToMain(task.id, duration)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {duration}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Tasks</h1>
            <p className="text-gray-600">Focus on what matters today</p>
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
              <p className="text-sm text-gray-600">Ideas & unscheduled tasks</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {controllerTasks.length}
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
              <p className="text-sm text-gray-600">Today's scheduled tasks</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {mainTasks.length}
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
                <Icons.CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No scheduled tasks</p>
                <p className="text-sm mt-1">Move tasks from controller to schedule them</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowAddForm(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl border-2 border-gray-200 p-6 z-50"
              style={{ boxShadow: theme.shadows['2xl'] }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h3>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Enter task title..."
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    placeholder="Enter task description..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lane
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLane(DailyTaskLane.CONTROLLER)}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 border-2",
                        selectedLane === DailyTaskLane.CONTROLLER
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      )}
                    >
                      Controller
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLane(DailyTaskLane.MAIN)}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 border-2",
                        selectedLane === DailyTaskLane.MAIN
                          ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      )}
                    >
                      Main Focus
                    </button>
                  </div>
                </div>
                
                {selectedLane === DailyTaskLane.MAIN && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {Object.values(TaskDuration).map(duration => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setSelectedDuration(duration)}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border-2",
                            selectedDuration === duration
                              ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          )}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyTasksViewStyled;