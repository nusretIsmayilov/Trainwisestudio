'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutDayItem } from './WorkoutDay';
import { Dumbbell, Heart, Utensils } from 'lucide-react';

interface DaySummaryProps {
  items: WorkoutDayItem[];
  activeDay?: string;
}

const DaySummary: React.FC<DaySummaryProps> = ({ items }) => {
  return (
    <div className="p-4 md:p-6 space-y-4 h-full">
      <h3 className="text-xl font-bold">Daily Overview</h3>
      <div className="space-y-4 text-sm text-muted-foreground overflow-y-auto max-h-[calc(100vh-25rem)]">
        <AnimatePresence mode="popLayout">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border shadow-sm"
              >
                <div className="shrink-0 pt-1">
                  {item.exercise.type === 'exercise' && (
                    <Dumbbell className="h-4 w-4 text-primary" />
                  )}
                  {item.exercise.type === 'warm-up' && (
                    <Heart className="h-4 w-4 text-primary" />
                  )}
                  {item.exercise.type === 'stretch' && (
                    <Utensils className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground">
                    {item.exercise.name}
                  </span>
                  {item.exercise.type === 'exercise' && (
                    <span className="ml-2 text-muted-foreground">
                      - {item.sets.length} sets
                    </span>
                  )}
                  {item.comment && (
                    <p className="italic text-xs mt-1 truncate max-w-full">
                      "{item.comment}"
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>Add exercises to see a summary.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DaySummary;
