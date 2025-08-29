import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks, FocusTask, TaskLane, TaskStatus } from '../../types';
import { TaskLane as TaskLaneComponent } from './TaskLane';
import { TaskFilters } from './TaskFilters';
import { focusTasksAPI } from '../../services/api';
import { Button } from '../ui/Button';

interface FocusAreaProps {
  card: CardWithTasks;
}

export const FocusArea: React.FC<FocusAreaProps> = ({ card }) => {
  const [tasks, setTasks] = useState(card.focus_tasks || []);
  const [showArchived, setShowArchived] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    tags: [] as string[],
    dateRange: null as { start: Date; end: Date } | null
  });

  const activeTasks = tasks.filter(task => task.status !== TaskStatus.ARCHIVED);
  const archivedTasks = tasks.filter(task => task.status === TaskStatus.ARCHIVED);
  
  const controllerTasks = activeTasks.filter(task => task.lane === TaskLane.CONTROLLER);
  const mainTasks = activeTasks.filter(task => task.lane === TaskLane.MAIN);

  const filteredMainTasks = mainTasks.filter(task => {
    // Filter by tags
    if (activeFilters.tags.length > 0) {
      const hasMatchingTag = task.tags.some(tag => 
        activeFilters.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Filter by date range
    if (activeFilters.dateRange && task.date) {
      const taskDate = new Date(task.date);
      if (taskDate < activeFilters.dateRange.start || taskDate > activeFilters.dateRange.end) {
        return false;
      }
    }

    return true;
  });

  const handleCreateTask = async (title: string, lane: TaskLane) => {
    try {
      const newTask = await focusTasksAPI.createTask({
        title,
        card_id: card.id,
        lane,
        position: tasks.filter(t => t.lane === lane).length
      });
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<FocusTask>) => {
    try {
      // Ensure card_id is always included for backend mock data
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

  const handleArchiveTask = async (taskId: string) => {
    try {
      const updatedTask = await focusTasksAPI.updateTask(taskId, { status: TaskStatus.ARCHIVED });
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await focusTasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      const updatedTask = await focusTasksAPI.updateTask(taskId, { status: TaskStatus.ACTIVE });
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const handleMoveTask = async (taskId: string, toLane: TaskLane) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await handleUpdateTask(taskId, { lane: toLane });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <TaskFilters
          availableTags={allTags}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
        <Button
          variant="ghost"
          onClick={() => setShowArchived(!showArchived)}
          className="ml-4"
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'} ({archivedTasks.length})
        </Button>
      </div>

      {!showArchived ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 lg:gap-6 min-h-0">
          {/* Controller Lane */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 flex flex-col min-h-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Controller</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dump miscellaneous tasks here</p>
            </div>
            <TaskLaneComponent
              title=""
              subtitle=""
              tasks={controllerTasks}
              onCreateTask={(title) => handleCreateTask(title, TaskLane.CONTROLLER)}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleArchiveTask}
              onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.MAIN)}
              moveButtonText="Move to Main →"
              taskType="focus"
              hideHeader
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>

          {/* Main Task List Lane */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 flex flex-col min-h-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Main Task List</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organized focus tasks</p>
            </div>
            <TaskLaneComponent
              title=""
              subtitle=""
              tasks={filteredMainTasks}
              onCreateTask={(title) => handleCreateTask(title, TaskLane.MAIN)}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleArchiveTask}
              onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.CONTROLLER)}
              moveButtonText="← Move to Controller"
              taskType="focus"
              showFilters
              hideHeader
            />
          </div>
        </div>
      ) : (
        <TaskLaneComponent
          title="Archived Tasks"
          subtitle="Tasks that have been archived"
          tasks={archivedTasks}
          onCreateTask={() => {}}
          onUpdateTask={() => {}}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleRestoreTask}
          moveButtonText="Restore"
          taskType="focus"
          isArchiveView={true}
        />
      )}
    </motion.div>
  );
};