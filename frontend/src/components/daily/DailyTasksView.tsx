import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TaskLane, TaskDuration } from '../../types';
import { TaskLane as TaskLaneComponent } from '../workspace/TaskLane';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  lane: TaskLane;
  duration?: TaskDuration;
  completed: boolean;
  created_at: string;
}

export const DailyTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<TaskDuration>(TaskDuration.TEN_MIN);

  // Separate tasks by lane
  const controllerTasks = tasks.filter(task => task.lane === TaskLane.CONTROLLER);
  const mainTasks = tasks.filter(task => task.lane === TaskLane.MAIN);

  // Group main tasks by duration
  const tasksByDuration = {
    [TaskDuration.TEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.TEN_MIN),
    [TaskDuration.FIFTEEN_MIN]: mainTasks.filter(task => task.duration === TaskDuration.FIFTEEN_MIN),
    [TaskDuration.THIRTY_MIN]: mainTasks.filter(task => task.duration === TaskDuration.THIRTY_MIN),
  };

  const handleCreateTask = (lane: TaskLane) => {
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      lane,
      duration: lane === TaskLane.MAIN ? selectedDuration : undefined,
      completed: false,
      created_at: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleMoveTask = (taskId: string, toLane: TaskLane, duration?: TaskDuration) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, lane: toLane, duration: toLane === TaskLane.MAIN ? duration : undefined }
        : task
    ));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary-black mb-2">Daily Tasks</h2>
        <p className="text-gray-600">Quick tasks organized by time duration</p>
      </div>

      {/* Add Task Section */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTask(TaskLane.CONTROLLER)}
            placeholder="Add a quick task..."
            className="flex-1 px-4 py-2 rounded-lg glass-effect border border-white/20 
                     focus:outline-none focus:ring-2 focus:ring-primary-gold/50"
          />
          
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value as TaskDuration)}
            className="px-4 py-2 rounded-lg glass-effect border border-white/20"
          >
            <option value={TaskDuration.TEN_MIN}>10 min</option>
            <option value={TaskDuration.FIFTEEN_MIN}>15 min</option>
            <option value={TaskDuration.THIRTY_MIN}>30 min</option>
          </select>
          
          <Button
            variant="gold"
            onClick={() => handleCreateTask(TaskLane.CONTROLLER)}
          >
            Add Task
          </Button>
        </div>
      </GlassCard>

      {/* Two-Lane System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controller Lane */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-primary-black mb-4 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Controller (Dump Area)
          </h3>
          <div className="space-y-3">
            {controllerTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 glass-effect rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className={cn(
                      "text-gray-800",
                      task.completed && "line-through opacity-60"
                    )}>
                      {task.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveTask(task.id, TaskLane.MAIN, selectedDuration)}
                    >
                      →
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {controllerTasks.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Add tasks here before organizing
              </p>
            )}
          </div>
        </GlassCard>

        {/* Main Tasks Lane (Organized by Duration) */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-primary-black mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Organized Tasks
          </h3>
          
          <div className="space-y-6">
            {Object.entries(tasksByDuration).map(([duration, durationTasks]) => (
              <div key={duration} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                  {duration.replace('_', ' ')}
                </h4>
                
                <div className="space-y-2">
                  {durationTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 glass-effect rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                            className="w-5 h-5 rounded border-gray-300"
                          />
                          <span className={cn(
                            "text-gray-800",
                            task.completed && "line-through opacity-60"
                          )}>
                            {task.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {duration.replace('_', ' ')}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveTask(task.id, TaskLane.CONTROLLER)}
                          >
                            ←
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {durationTasks.length === 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
                    No {duration.replace('_', ' ').toLowerCase()} tasks
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}