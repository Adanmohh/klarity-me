import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../components/icons/LucideIcons';
import { TaskStatus, DailyTaskStatus, type FocusTask, type DailyTask } from '../types';
import { focusTasksAPI, dailyTasksAPI } from '../services/api';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { cn } from '../utils/cn';
import { fadeInUp, staggerChildren, buttonScale } from '../utils/animations';

type ArchivedItem = (FocusTask | DailyTask) & { type: 'focus' | 'daily' };

export const Archive: React.FC = () => {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'focus' | 'daily'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: ArchivedItem | null }>({
    isOpen: false,
    item: null,
  });

  useEffect(() => {
    loadArchivedItems();
  }, []);

  const loadArchivedItems = async () => {
    setLoading(true);
    try {
      const [focusTasks, dailyTasks] = await Promise.all([
        focusTasksAPI.getAllTasks(),
        dailyTasksAPI.getAllTasks(),
      ]);

      const archivedFocus = focusTasks
        .filter((task: FocusTask) => task.status === TaskStatus.ARCHIVED)
        .map((task: FocusTask) => ({ ...task, type: 'focus' as const }));

      const archivedDaily = dailyTasks
        .filter((task: DailyTask) => task.status === DailyTaskStatus.ARCHIVED)
        .map((task: DailyTask) => ({ ...task, type: 'daily' as const }));

      setArchivedItems([...archivedFocus, ...archivedDaily]);
    } catch (error) {
      console.error('Failed to load archived items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item: ArchivedItem) => {
    try {
      if (item.type === 'focus') {
        await focusTasksAPI.updateTask(item.id, { status: TaskStatus.ACTIVE });
      } else {
        await dailyTasksAPI.updateTask(item.id, { status: DailyTaskStatus.PENDING });
      }
      await loadArchivedItems();
    } catch (error) {
      console.error('Failed to restore item:', error);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteConfirm.item) return;

    try {
      if (deleteConfirm.item.type === 'focus') {
        await focusTasksAPI.deleteTask(deleteConfirm.item.id);
      } else {
        await dailyTasksAPI.deleteTask(deleteConfirm.item.id);
      }
      setDeleteConfirm({ isOpen: false, item: null });
      await loadArchivedItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const filteredItems = archivedItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const stats = {
    total: archivedItems.length,
    focus: archivedItems.filter(item => item.type === 'focus').length,
    daily: archivedItems.filter(item => item.type === 'daily').length,
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          variants={fadeInUp}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Archive</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your archived tasks and items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                variants={buttonScale}
                whileHover="hover"
                whileTap="tap"
                onClick={loadArchivedItems}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Icons.Refresh className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <motion.div 
            variants={staggerChildren}
            className="grid grid-cols-3 gap-4 mb-8">
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl cursor-pointer">
              <div className="flex items-center justify-between">
                <Icons.Archive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">Total Archived</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl cursor-pointer">
              <div className="flex items-center justify-between">
                <Icons.Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.focus}
                </span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">Focus Tasks</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl cursor-pointer">
              <div className="flex items-center justify-between">
                <Icons.Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.daily}
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">Daily Tasks</p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="flex items-center gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all',
                filter === 'all'
                  ? 'bg-primary-gold text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              )}
            >
              All ({stats.total})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('focus')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all',
                filter === 'focus'
                  ? 'bg-primary-gold text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              )}
            >
              Focus Tasks ({stats.focus})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('daily')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all',
                filter === 'daily'
                  ? 'bg-primary-gold text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              )}
            >
              Daily Tasks ({stats.daily})
            </motion.button>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Icons.Loader className="w-8 h-8 text-neutral-400" />
              </motion.div>
            </motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div 
              variants={fadeInUp}
              className="text-center py-12">
              <Icons.Archive className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
                No archived items
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                Archived tasks will appear here
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerChildren}
              className="grid gap-4">
              <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium',
                          item.type === 'focus'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        )}>
                          {item.type === 'focus' ? 'Focus Task' : 'Daily Task'}
                        </span>
                        {'lane' in item && (
                          <span className="px-2 py-1 rounded-md text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                            {item.lane}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      {'description' in item && item.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {item.description as string}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-3 h-3" />
                          Archived: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <motion.button
                        variants={buttonScale}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => handleRestore(item)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="Restore"
                      >
                        <Icons.RefreshCw className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        variants={buttonScale}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setDeleteConfirm({ isOpen: true, item })}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Delete Permanently"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={handlePermanentDelete}
        title="Delete Permanently"
        message="This action cannot be undone. The item will be permanently deleted."
        variant="danger"
      />
    </motion.div>
  );
};