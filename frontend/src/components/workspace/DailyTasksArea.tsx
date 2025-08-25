import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardWithTasks, DailyTask, TaskLane, TaskDuration } from '../../types';
import { TaskLane as TaskLaneComponent } from './TaskLane';
import { dailyTasksAPI } from '../../services/api';

interface DailyTasksAreaProps {
  card: CardWithTasks;
}

export const DailyTasksArea: React.FC<DailyTasksAreaProps> = ({ card }) => {
  const [tasks, setTasks] = useState(card.daily_tasks);

  const controllerTasks = tasks.filter(task => task.lane === TaskLane.CONTROLLER);
  const mainTasks = tasks.filter(task => task.lane === TaskLane.MAIN);

  // Group main tasks by duration
  const tasksByDuration = {
    [TaskDuration.TEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.TEN_MIN),
    [TaskDuration.FIFTEEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.FIFTEEN_MIN),
    [TaskDuration.THIRTY_MIN]: mainTasks.filter(task => task.duration === TaskDuration.THIRTY_MIN),
    unassigned: mainTasks.filter(task => !task.duration)
  };

  const handleCreateTask = async (title: string, lane: TaskLane, duration?: TaskDuration) => {
    try {
      const newTask = await dailyTasksAPI.createTask({
        title,
        card_id: card.id,
        lane,
        duration,
        position: tasks.filter(t => t.lane === lane).length
      });
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<DailyTask>) => {
    try {
      const updatedTask = await dailyTasksAPI.updateTask(taskId, updates);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dailyTasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controller Lane */}
        <TaskLaneComponent
          title="Controller"
          subtitle="Dump small tasks here before organizing"
          tasks={controllerTasks}
          onCreateTask={(title) => handleCreateTask(title, TaskLane.CONTROLLER)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.MAIN)}
          moveButtonText="Move to Main →"
          taskType="daily"
        />

        {/* Main Tasks Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary-black">
            Daily Tasks Overview
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(tasksByDuration).map(([duration, durationTasks]) => (
              <motion.div
                key={duration}
                className="glass-effect p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-black">
                    {duration === 'unassigned' ? 'Unassigned Duration' : duration}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {durationTasks.length} tasks
                  </span>
                </div>
                <div className="space-y-1">
                  {durationTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="text-sm text-gray-700 truncate"
                    >
                      {task.title}
                    </div>
                  ))}
                  {durationTasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{durationTasks.length - 3} more...
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Task Lists by Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TaskLaneComponent
          title="10 Minute Tasks"
          subtitle="Quick wins and small actions"
          tasks={tasksByDuration[TaskDuration.TEN_MIN]}
          onCreateTask={(title) => handleCreateTask(title, TaskLane.MAIN, TaskDuration.TEN_MIN)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.CONTROLLER)}
          moveButtonText="← To Controller"
          taskType="daily"
        />

        <TaskLaneComponent
          title="15 Minute Tasks"
          subtitle="Medium-sized daily actions"
          tasks={tasksByDuration[TaskDuration.FIFTEEN_MIN]}
          onCreateTask={(title) => handleCreateTask(title, TaskLane.MAIN, TaskDuration.FIFTEEN_MIN)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.CONTROLLER)}
          moveButtonText="← To Controller"
          taskType="daily"
        />

        <TaskLaneComponent
          title="30 Minute Tasks"
          subtitle="Focused daily sessions"
          tasks={tasksByDuration[TaskDuration.THIRTY_MIN]}
          onCreateTask={(title) => handleCreateTask(title, TaskLane.MAIN, TaskDuration.THIRTY_MIN)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.CONTROLLER)}
          moveButtonText="← To Controller"
          taskType="daily"
        />
      </div>

      {/* Unassigned Duration Tasks */}
      {tasksByDuration.unassigned.length > 0 && (
        <TaskLaneComponent
          title="Unassigned Duration"
          subtitle="Tasks without time estimates"
          tasks={tasksByDuration.unassigned}
          onCreateTask={(title) => handleCreateTask(title, TaskLane.MAIN)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={(taskId) => handleMoveTask(taskId, TaskLane.CONTROLLER)}
          moveButtonText="← To Controller"
          taskType="daily"
        />
      )}
    </motion.div>
  );
};