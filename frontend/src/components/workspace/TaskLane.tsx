import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { FocusTask, DailyTask, TaskStatus, DailyTaskStatus, TaskDuration } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TaskCard } from './TaskCard';

interface TaskLaneProps {
  title: string;
  subtitle: string;
  tasks: (FocusTask | DailyTask)[];
  onCreateTask: (title: string) => void;
  onUpdateTask: (taskId: string, updates: any) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string) => void;
  moveButtonText: string;
  taskType: 'focus' | 'daily';
  showFilters?: boolean;
  isArchiveView?: boolean;
  hideHeader?: boolean;
}

export const TaskLane: React.FC<TaskLaneProps> = ({
  title,
  subtitle,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  moveButtonText,
  taskType,
  showFilters = false,
  isArchiveView = false,
  hideHeader = false
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [localTasks, setLocalTasks] = useState(tasks);
  
  // Drag and drop functionality
  const { getDragHandleProps } = useDragAndDrop(localTasks, {
    onReorder: (reorderedTasks) => {
      setLocalTasks(reorderedTasks);
      // You could also call an API here to persist the new order
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onCreateTask(newTaskTitle.trim());
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const completedTasks = tasks.filter(task => 
    taskType === 'focus' 
      ? (task as FocusTask).status === TaskStatus.COMPLETED
      : (task as DailyTask).status === DailyTaskStatus.COMPLETED
  );

  const activeTasks = tasks.filter(task => 
    taskType === 'focus' 
      ? (task as FocusTask).status !== TaskStatus.COMPLETED
      : (task as DailyTask).status !== DailyTaskStatus.COMPLETED
  );

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary-black dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      )}

      {/* Active Tasks */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
              {...getDragHandleProps(index)}
              className="cursor-move hover:scale-[1.02] transition-transform"
            >
              <TaskCard
                task={task}
                taskType={taskType}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                moveButtonText={moveButtonText}
                isArchived={isArchiveView}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add New Task - Hide in archive view */}
      {!isArchiveView && (
        <div className="border-t border-white/20 pt-4">
          {!showAddForm ? (
            <Button
              variant="ghost"
              onClick={() => setShowAddForm(true)}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-primary-black dark:hover:text-white"
            >
              + Add Task
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 rounded glass-effect border border-white/20 dark:border-neutral-700 text-sm bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTaskTitle.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="border-t border-white/20 mt-4 pt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="text-sm text-gray-500 line-through p-2 glass-effect rounded"
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};