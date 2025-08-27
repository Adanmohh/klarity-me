import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons/LucideIcons';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
}) => {
  const variants = {
    danger: {
      icon: <Icons.AlertTriangle className="w-6 h-6 text-red-500" />,
      confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    warning: {
      icon: <Icons.AlertTriangle className="w-6 h-6 text-yellow-500" />,
      confirmClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    info: {
      icon: <Icons.Info className="w-6 h-6 text-blue-500" />,
      confirmClass: 'bg-blue-500 hover:bg-blue-600 text-white',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  };

  const variantStyles = variants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
            role="dialog"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-elevation-4 overflow-hidden">
              {/* Icon and Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-lg', variantStyles.bgColor)}>
                    {variantStyles.icon}
                  </div>
                  <div className="flex-1">
                    <h3 id="confirm-dialog-title" className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {title}
                    </h3>
                    <p id="confirm-dialog-description" className="text-neutral-600 dark:text-neutral-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={onCancel}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg font-medium',
                    'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                    'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2',
                    'transition-all duration-200'
                  )}
                  aria-label={cancelText}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel(); // Close dialog after confirm
                  }}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg font-medium',
                    variantStyles.confirmClass,
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'transition-all duration-200',
                    'shadow-sm hover:shadow-md'
                  )}
                  aria-label={confirmText}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};