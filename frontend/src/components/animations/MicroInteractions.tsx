import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// Success animation component
export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5 }}
        className="bg-green-500 rounded-full p-8"
      >
        <Check className="w-16 h-16 text-white" />
      </motion.div>
    </motion.div>
  );
}

// Ripple effect on click
export function RippleButton({ 
  children, 
  onClick,
  className = '' 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick?.();
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// Hover card effect
export function HoverCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={className}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
            : '0 10px 20px -5px rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Shake animation for errors
export function ShakeAnimation({ 
  children, 
  shake,
  onShakeComplete 
}: { 
  children: React.ReactNode;
  shake: boolean;
  onShakeComplete?: () => void;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (shake) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }).then(() => {
        onShakeComplete?.();
      });
    }
  }, [shake, controls, onShakeComplete]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
}

// Notification toast with micro-interactions
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}: ToastProps) {
  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        {icons[type]}
      </motion.div>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto hover:opacity-80 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Loading dots animation
export function LoadingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// Pulse animation for active elements
export function PulseIndicator({ color = 'bg-green-500' }: { color?: string }) {
  return (
    <div className="relative">
      <motion.div
        className={`absolute inset-0 ${color} rounded-full`}
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [1, 0, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <div className={`w-3 h-3 ${color} rounded-full relative`} />
    </div>
  );
}

// Stagger animation for lists
export function StaggerList({ 
  children,
  className = '' 
}: { 
  children: React.ReactNode[];
  className?: string;
}) {
  return (
    <motion.div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Confetti animation for celebrations
export function Confetti({ active }: { active: boolean }) {
  if (!active) return null;

  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F06292'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: window.innerHeight + 20,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'linear',
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
}