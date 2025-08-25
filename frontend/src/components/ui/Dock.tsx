import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface DockProps {
  items: DockItem[];
  className?: string;
  magnification?: number;
  distance?: number;
}

export const Dock: React.FC<DockProps> = ({
  items,
  className,
  magnification = 1.6,
  distance = 140,
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);

  return (
    <motion.div
      onMouseMove={(e: React.MouseEvent) => setMouseX(e.pageX)}
      onMouseLeave={() => setMouseX(null)}
      className={cn(
        'mx-auto flex h-16 gap-2 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 px-3 items-end pb-3',
        className
      )}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          mouseX={mouseX}
          item={item}
          magnification={magnification}
          distance={distance}
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
}

const DockIcon: React.FC<DockIconProps> = ({
  mouseX,
  item,
  magnification,
  distance,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  
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

  return (
    <motion.button
      ref={ref}
      onClick={item.onClick}
      className={cn(
        'flex aspect-square cursor-pointer items-center justify-center rounded-xl',
        'bg-white/90 backdrop-blur-sm border',
        'transition-colors duration-200',
        'w-12 h-12',
        item.isActive
          ? 'border-primary-gold bg-primary-gold/10 shadow-lg shadow-primary-gold/20'
          : 'border-gray-200 hover:bg-gray-50',
        'focus:outline-none focus:ring-2 focus:ring-primary-gold/50'
      )}
      animate={{
        scale,
        y: scale > 1 ? -5 : 0,
      }}
      transition={{
        type: 'spring',
        mass: 0.1,
        stiffness: 150,
        damping: 12,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={cn(
          'flex flex-col items-center justify-center',
          item.isActive ? 'text-primary-gold' : 'text-gray-600'
        )}
      >
        {item.icon}
        <motion.span
          className="mt-1 text-[10px] font-medium absolute -bottom-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: scale > 1.2 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {item.label}
        </motion.span>
      </motion.div>
    </motion.button>
  );
};