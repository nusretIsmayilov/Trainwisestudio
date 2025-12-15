import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export const StaggeredList = ({ 
  children, 
  className = "",
  staggerDelay = 0.1,
  initialDelay = 0.1,
}: StaggeredListProps) => {
  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={customContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export const StaggeredItem = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) => {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};

// For grid layouts
interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggeredGrid = ({ 
  children, 
  className = "",
  staggerDelay = 0.08,
}: StaggeredGridProps) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

// Card-specific animation with hover effect
export const AnimatedCard = ({ 
  children, 
  className = "",
  index = 0,
}: { 
  children: ReactNode; 
  className?: string;
  index?: number;
}) => {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      whileHover={{ 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
    >
      {children}
    </motion.div>
  );
};

export { containerVariants, itemVariants };
