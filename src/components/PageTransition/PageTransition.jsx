import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -30,
    scale: 0.96,
  },
};

const pageTransition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1], // Custom easing curve for smoother transitions
  duration: 0.6,
};

// Different transition types you can use
const transitions = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
    transition: { duration: 0.4 }
  },
  slideUp: {
    initial: { opacity: 0, y: 40 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -40 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  slideLeft: {
    initial: { opacity: 0, x: 40 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -40 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  scale: {
    initial: { opacity: 0, scale: 0.92 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.92 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const PageTransition = ({ children, type = 'slideUp' }) => {
  const variant = transitions[type] || transitions.slideUp;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={{
        initial: variant.initial,
        in: variant.in,
        out: variant.out,
      }}
      transition={variant.transition}
      style={{
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;