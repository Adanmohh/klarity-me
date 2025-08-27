import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  badge?: number | string;
}

interface DockProps {
  items: DockItem[];
  className?: string;
  magnification?: number;
  distance?: number;
  variant?: 'glass' | 'solid' | 'minimal';
}

export const Dock: React.FC<DockProps> = ({
  items,
  className,
  magnification = 1.4,
  distance = 100,
  variant = 'glass',
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);

  const variantStyles = {
    glass: 'bg-glass-whiteHeavy dark:bg-glass-darkHeavy backdrop-blur-xl border-neutral-200/50 dark:border-neutral-700/50 shadow-elevation-3',
    solid: 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-elevation-2',
    minimal: 'bg-transparent border-transparent',
  };

  return (
    <motion.div
      onMouseMove={(e: React.MouseEvent) => setMouseX(e.pageX)}
      onMouseLeave={() => setMouseX(null)}
      className={cn(
        'mx-auto flex h-20 gap-3 rounded-2xl px-4 items-end pb-4 border transition-all duration-300',
        variantStyles[variant],
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          mouseX={mouseX}
          item={item}
          magnification={magnification}
          distance={distance}
          variant={variant}
        />
      ))}
    </motion.div>
  );
};

interface DockIconProps {
  mouseX: number | null;
  item: DockItem;
  magnification: number;
  distance: number;
  variant: 'glass' | 'solid' | 'minimal';
}

const DockIcon: React.FC<DockIconProps> = ({
  mouseX,
  item,
  magnification,
  distance,
  variant,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  let scale = 1;
  
  if (mouseX !== null && ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const distanceFromMouse = Math.abs(mouseX - centerX);
    
    if (distanceFromMouse < distance) {
      const distanceRatio = (distance - distanceFromMouse) / distance;
      scale = 1 + (magnification - 1) * distanceRatio;
    }
  }

  const iconVariantStyles = {
    glass: {
      base: 'bg-white/80 dark:bg-neutral-800/80 border-neutral-200/50 dark:border-neutral-700/50',
      active: 'bg-primary-500 border-primary-500 shadow-gold text-white',
      hover: 'hover:bg-white dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600',
    },
    solid: {
      base: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
      active: 'bg-primary-500 border-primary-500 shadow-gold-sm text-white',
      hover: 'hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
    },
    minimal: {
      base: 'bg-transparent border-transparent',
      active: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      hover: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    },
  };

  const styles = iconVariantStyles[variant];

  return (
    <div className="relative">
      <motion.button
        ref={ref}
        onClick={item.onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'flex aspect-square cursor-pointer items-center justify-center rounded-xl',
          'backdrop-blur-sm border',
          'transition-all duration-200',
          'w-16 h-16',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          item.isActive ? styles.active : [styles.base, styles.hover],
          !item.isActive && 'text-neutral-600 dark:text-neutral-400'
        )}
        animate={{
          scale,
          y: scale > 1 ? -12 : 0,
        }}
        transition={{
          type: 'spring',
          mass: 0.1,
          stiffness: 150,
          damping: 12,
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={item.label}
        aria-current={item.isActive ? 'page' : undefined}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
        >
          {item.icon}
          
          {/* Badge */}
          {item.badge && (
            <motion.span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-error text-white text-xxs font-semibold px-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {item.badge}
            </motion.span>
          )}
        </motion.div>
      </motion.button>
      
      {/* Tooltip */}
      <motion.div
        className={cn(
          "absolute -top-10 left-1/2 transform -translate-x-1/2 z-50",
          "px-2 py-1 rounded-md",
          "bg-neutral-900 dark:bg-neutral-800 text-white",
          "text-sm font-medium whitespace-nowrap",
          "pointer-events-none select-none",
          "shadow-elevation-2"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10
        }}
        transition={{ duration: 0.15 }}
      >
        {item.label}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-neutral-900 dark:bg-neutral-800 rotate-45" />
      </motion.div>
      
      {/* Active indicator */}
      {item.isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
          layoutId="activeIndicator"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </div>
  );
};