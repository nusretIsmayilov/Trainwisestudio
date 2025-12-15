'use client';

import React from 'react';
import { LibraryItem, LibraryCategory } from '@/mockdata/library/mockLibrary';
import LibraryCard from './LibraryCard';
import { motion } from 'framer-motion';

interface LibraryListProps {
  filteredItems: LibraryItem[];
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onView?: (item: LibraryItem) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
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

const LibraryList: React.FC<LibraryListProps> = ({
  filteredItems,
  onEdit,
  onDelete,
  onView,
}) => {
  if (filteredItems.length === 0) {
    return (
      <motion.div 
        className="py-20 text-center text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xl font-semibold mb-2">No Content Found</p>
        <p>Try adjusting your search or category filters.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredItems.map((item, index) => (
        <motion.div key={item.id} variants={itemVariants}>
          <LibraryCard
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default LibraryList;
