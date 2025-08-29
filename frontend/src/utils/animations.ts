import { Variants } from 'framer-motion';

// Text Animations
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const letterByLetter: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut'
    }
  })
};

// Card Animations
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 }
  }
};

export const cardTilt = {
  rest: {
    rotateX: 0,
    rotateY: 0,
    transition: { duration: 0.4 }
  },
  hover: {
    rotateX: -5,
    rotateY: 5,
    transition: { duration: 0.4 }
  }
};

// Button Animations
export const buttonScale = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const buttonSlide = {
  rest: { x: 0 },
  hover: { x: 4 },
  tap: { x: 0 }
};

// List Animations
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

// Alert/Toast Animations
export const slideDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Pulse Animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    repeatType: 'loop' as const
  }
};

// Gradient Animation
export const gradientAnimation = {
  background: [
    'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to right, #764ba2 0%, #f093fb 100%)',
    'linear-gradient(to right, #f093fb 0%, #667eea 100%)'
  ],
  transition: {
    duration: 5,
    repeat: Infinity,
    repeatType: 'loop' as const
  }
};

// Blur Animation
export const blurFade: Variants = {
  hidden: { 
    opacity: 0, 
    filter: 'blur(10px)',
    scale: 0.95
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.4 }
  }
};

// Shake Animation for Errors
export const shake = {
  x: [-10, 10, -10, 10, 0],
  transition: { duration: 0.5 }
};

// Timing Functions
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
};

// Duration Guidelines
export const duration = {
  ultraFast: 0.1,
  fast: 0.2,
  normal: 0.3,
  medium: 0.5,
  slow: 0.7,
  verySlow: 1
};