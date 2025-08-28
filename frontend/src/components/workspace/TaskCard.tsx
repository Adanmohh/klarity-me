import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FocusTask, DailyTask, TaskStatus, DailyTaskStatus, TaskDuration } from '../../types';
import { Button } from '../ui/Button';
import { MagicCard } from '../ui/MagicCard';
import { Icons } from '../icons/LucideIcons';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TaskCardProps {
  task: FocusTask | DailyTask;
  taskType: 'focus' | 'daily';
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string) => void;
  moveButtonText: string;
  isArchived?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  taskType,
  onUpdate,
  onDelete,
  onMove,
  moveButtonText,
  isArchived = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    taskType === 'focus' ? (task as FocusTask).description || '' : ''
  );
  const [editTags, setEditTags] = useState(
    taskType === 'focus' ? (task as FocusTask).tags.join(', ') : ''
  );
  const [editDate, setEditDate] = useState(
    taskType === 'focus' && (task as FocusTask).date 
      ? (task as FocusTask).date 
      : ''
  );
  const [editDuration, setEditDuration] = useState(
    taskType === 'daily' ? (task as DailyTask).duration || TaskDuration.TEN_MIN : TaskDuration.TEN_MIN
  );

  const isCompleted = taskType === 'focus' 
    ? (task as FocusTask).status === TaskStatus.COMPLETED
    : (task as DailyTask).status === DailyTaskStatus.COMPLETED;

  const handleSave = () => {
    const updates: any = { title: editTitle };
    
    if (taskType === 'focus') {
      updates.description = editDescription;
      updates.tags = editTags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (editDate) updates.date = editDate;
    } else {
      updates.duration = editDuration;
    }
    
    onUpdate(task.id, updates);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    const newStatus = taskType === 'focus'
      ? (isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)
      : (isCompleted ? DailyTaskStatus.PENDING : DailyTaskStatus.COMPLETED);
    
    onUpdate(task.id, { status: newStatus });
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="task-card p-4"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 rounded glass-effect border border-white/20 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white text-sm"
            placeholder="Task title"
          />
          
          {taskType === 'focus' && (
            <>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-2 py-1 rounded glass-effect border border-white/20 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white text-sm resize-none"
                rows={2}
                placeholder="Description (optional)"
              />
              
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full px-2 py-1 rounded glass-effect border border-white/20 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white text-sm"
                placeholder="Tags (comma separated)"
              />
              
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-2 py-1 rounded glass-effect border border-white/20 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white text-sm"
              />
            </>
          )}
          
          {taskType === 'daily' && (
            <select
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value as TaskDuration)}
              className="w-full px-2 py-1 rounded glass-effect border border-white/20 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 text-gray-900 dark:text-white text-sm"
            >
              <option value={TaskDuration.TEN_MIN}>10 minutes</option>
              <option value={TaskDuration.FIFTEEN_MIN}>15 minutes</option>
              <option value={TaskDuration.THIRTY_MIN}>30 minutes</option>
            </select>
          )}
          
          <div className="flex space-x-2">
            <Button size="sm" variant="primary" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <MagicCard
        className={`task-card group ${isCompleted ? 'opacity-60' : ''}`}
        gradientColor={taskType === 'focus' ? '#FFD700' : '#60A5FA'}
        gradientOpacity={0.2}
      >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-primary-black dark:text-white'}`}>
            {task.title}
          </h4>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-black dark:hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-red-500 hover:text-red-700"
              aria-label={isArchived ? "Delete task" : "Archive task"}
            >
              {isArchived ? 'Delete' : 'Archive'}
            </button>
          </div>
        </div>

        {taskType === 'focus' && (task as FocusTask).description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {(task as FocusTask).description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {taskType === 'focus' && (task as FocusTask).tags.length > 0 && (
              <div className="flex space-x-1">
                {(task as FocusTask).tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-primary-gold/20 text-primary-black rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {taskType === 'daily' && (task as DailyTask).duration && (
              <span className="px-2 py-1 text-xs glass-effect rounded">
                {(task as DailyTask).duration}
              </span>
            )}
            
            {taskType === 'focus' && (task as FocusTask).date && (
              <span className="text-xs text-gray-500">
                {new Date((task as FocusTask).date!).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex space-x-1">
            {!isArchived && (
              <Button
                size="sm"
                variant={isCompleted ? "primary" : "secondary"}
                onClick={handleToggleComplete}
              >
                {isCompleted ? <Icons.Refresh className="w-4 h-4" /> : <Icons.Check className="w-4 h-4" />}
              </Button>
            )}
            
            <Button
              size="sm"
              variant={isArchived ? "primary" : "ghost"}
              onClick={() => onMove(task.id)}
              title={moveButtonText}
            >
              {isArchived ? <Icons.Refresh className="w-4 h-4" /> : <Icons.Move className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      </MagicCard>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={isArchived ? "Delete Task" : "Archive Task"}
        message={isArchived 
          ? `Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`
          : `Are you sure you want to archive "${task.title}"? You can restore it later from the archive.`}
        confirmText={isArchived ? "Delete Permanently" : "Archive"}
        cancelText="Cancel"
        variant={isArchived ? "danger" : "warning"}
        onConfirm={() => onDelete(task.id)}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};