import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export const MagicCard = forwardRef<HTMLDivElement, MagicCardProps>(({
  children,
  className,
  gradientSize = 200,
  gradientColor = '#FFD700',
  gradientOpacity = 0.3,
}, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  
  // Merge refs
  useImperativeHandle(forwardedRef, () => internalRef.current!, []);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!internalRef.current) return;

      const rect = internalRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angleX = ((e.clientY - centerY) / rect.height) * 10;
      const angleY = ((e.clientX - centerX) / rect.width) * 10;
      
      setRotateX(-angleX);
      setRotateY(angleY);
      
      setGradientPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGradientPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={internalRef}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'transform-gpu',
        className
      )}
      style={{
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Gradient spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${gradientPosition.x}px ${gradientPosition.y}px, ${gradientColor} 0%, transparent 100%)`,
          opacity: gradientPosition.x > 0 ? gradientOpacity : 0,
        }}
      />
      
      {/* Card content */}
      <div className="relative z-20">
        {children}
      </div>
    </motion.div>
  );
});

MagicCard.displayName = 'MagicCard';