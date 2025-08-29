import React from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'letter' | 'word' | 'blur';
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  type = 'fade'
}) => {
  const words = text.split(' ');
  const letters = text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: type === 'letter' ? 0.03 : 0.1
      }
    }
  };

  const childVariants = {
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration }
      }
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration }
      }
    },
    letter: {
      hidden: { opacity: 0, y: 50, rotateX: -90 },
      visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: { duration: duration * 0.8 }
      }
    },
    word: {
      hidden: { opacity: 0, y: 20, scale: 0.9 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration }
      }
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { duration }
      }
    }
  };

  if (type === 'letter') {
    return (
      <motion.span
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'inline-block' }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={childVariants[type]}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  if (type === 'word') {
    return (
      <motion.span
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'inline-block' }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={childVariants[type]}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  return (
    <motion.div
      className={className}
      variants={childVariants[type]}
      initial="hidden"
      animate="visible"
    >
      {text}
    </motion.div>
  );
};