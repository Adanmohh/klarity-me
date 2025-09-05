import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Target, 
  CheckSquare, 
  Book, 
  Archive,
  Sparkles,
  KeyboardIcon,
  Smartphone,
  BarChart,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccessibleButton } from '../ui/AccessibleButton';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  features?: string[];
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Focus Cards',
    description: 'Your personal task management system designed for deep focus and productivity',
    icon: <Sparkles className="w-8 h-8" />,
    features: [
      'Card-based task management',
      'Daily task tracking',
      'Mind & dream journaling',
      'Analytics & insights'
    ]
  },
  {
    id: 'focus-area',
    title: 'Focus Area',
    description: 'Manage your main tasks and projects using our intuitive card system',
    icon: <Target className="w-8 h-8" />,
    features: [
      'Create and organize task cards',
      'Prioritize with drag & drop',
      'Track progress visually',
      'Archive completed work'
    ]
  },
  {
    id: 'daily-tasks',
    title: 'Daily Tasks',
    description: 'Keep track of your daily activities and routines',
    icon: <CheckSquare className="w-8 h-8" />,
    features: [
      'Quick task creation',
      'Time-based organization',
      'Daily review system',
      'Habit tracking'
    ]
  },
  {
    id: 'journal',
    title: 'Mind Journal',
    description: 'Capture your thoughts, ideas, and reflections',
    icon: <Book className="w-8 h-8" />,
    features: [
      'Rich text editing',
      'Tag organization',
      'Search functionality',
      'Export options'
    ]
  },
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    description: 'Navigate faster with powerful keyboard shortcuts',
    icon: <KeyboardIcon className="w-8 h-8" />,
    features: [
      'Press ? for help',
      'Ctrl+/ for search',
      'C to create card',
      'Arrow keys to navigate'
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Gestures',
    description: 'Intuitive touch gestures for mobile devices',
    icon: <Smartphone className="w-8 h-8" />,
    features: [
      'Swipe to complete tasks',
      'Long press for options',
      'Pinch to zoom',
      'Pull to refresh'
    ]
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'Visualize your productivity with detailed analytics',
    icon: <BarChart className="w-8 h-8" />,
    features: [
      'Completion metrics',
      'Time tracking',
      'Productivity trends',
      'Goal setting'
    ]
  }
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    setHasInteracted(true);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    setHasInteracted(true);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_date', new Date().toISOString());
    onComplete();
    navigate('/focus');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          handleSkip();
          break;
        case 'Enter':
          if (currentStep === steps.length - 1) {
            handleComplete();
          } else {
            handleNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-xl text-primary-600 dark:text-primary-400">
                {step.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="bg-primary-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  {step.description}
                </p>

                {step.features && (
                  <div className="space-y-3">
                    {step.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-200">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Interactive demo area */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {['Focus', 'Daily', 'Journal', 'Archive'].map((item) => (
                        <div
                          key={item}
                          className="p-3 bg-white dark:bg-neutral-700 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Skip tutorial
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <AccessibleButton
                  onClick={handlePrevious}
                  variant="secondary"
                  size="sm"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Previous
                </AccessibleButton>
              )}

              <AccessibleButton
                onClick={handleNext}
                variant="primary"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </AccessibleButton>
            </div>
          </div>

          {/* Step indicators */}
          <div className="px-6 pb-4 flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setHasInteracted(true);
                  setCurrentStep(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary-500'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('onboarding_completed');
    const hasSkipped = localStorage.getItem('onboarding_skipped');
    const isNewUser = !localStorage.getItem('user_created_at');

    if (!hasCompleted && !hasSkipped) {
      setShouldShowOnboarding(true);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_skipped');
    localStorage.removeItem('onboarding_date');
    setShouldShowOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    setShouldShowOnboarding,
    resetOnboarding
  };
}