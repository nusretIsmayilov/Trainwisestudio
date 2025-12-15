// src/components/coach/createprogram/builders/WeekSelector.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeekSelectorProps {
  currentWeek: number;
  maxWeeks: number;
  onWeekChange: (week: number) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, maxWeeks, onWeekChange }) => {
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  const handlePrev = () => {
    if (currentWeek > 1) {
      onWeekChange(currentWeek - 1);
    }
  };

  const handleNext = () => {
    if (currentWeek < maxWeeks) {
      onWeekChange(currentWeek + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={currentWeek === 1}
        className="h-8 w-8 shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-2">
        {weeks.map((weekNum) => (
          <motion.div
            key={weekNum}
            onClick={() => onWeekChange(weekNum)}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors duration-200",
              currentWeek === weekNum
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            W{weekNum}
          </motion.div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentWeek === maxWeeks}
        className="h-8 w-8 shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekSelector;
