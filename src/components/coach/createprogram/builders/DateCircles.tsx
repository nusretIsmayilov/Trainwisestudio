// src/components/coach/createprogram/builders/DateCircles.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'; // ⭐ IMPORT addWeeks
import WeekSelector from './WeekSelector'; 

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_WEEKS = 4;

interface DateCirclesProps {
  activeDay: string;
  onDayChange: (day: string) => void;
  activeWeek: number;
  onWeekChange: (week: number) => void;
  dataIndicators?: { [key: string]: boolean }; // Key format: "W#_DayName"
}

const DateCircles: React.FC<DateCirclesProps> = ({ activeDay, onDayChange, activeWeek, onWeekChange, dataIndicators = {} }) => {
  // Use a stable current date for the reference point
  const today = new Date();
  const currentCalendarWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  // ⭐ KEY CHANGE: Offset the start date by (activeWeek - 1)
  const referenceWeekStart = addWeeks(currentCalendarWeekStart, activeWeek - 1);

  // Calculate the dates for the currently active week
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(referenceWeekStart, i));

  return (
    <div className="flex flex-col gap-2">
      
      <WeekSelector
        currentWeek={activeWeek}
        maxWeeks={MAX_WEEKS}
        onWeekChange={onWeekChange}
      />
      
      <div className="flex justify-center py-4 bg-background/50 backdrop-blur-sm rounded-xl px-2">
        <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto scroll-pl-4 scroll-pr-4">
          {weekDates.map((date, index) => { // ⭐ Use weekDates
            const dayName = WEEK_DAYS[index]; 
            const dayNumber = format(date, 'd');
            
            // Highlight 'today' only if it's Week 1 AND the actual calendar date
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'); 

            return (
              <motion.div
                key={dayName}
                onClick={() => onDayChange(dayName)}
                className={cn(
                  "relative flex flex-col items-center p-2 rounded-full cursor-pointer transition-colors duration-200 min-w-[3rem] h-12 justify-center",
                  activeDay === dayName ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  isToday && "border-2 border-primary/50"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs font-semibold">{dayName.slice(0, 3)}</span>
                <span className="text-xs font-medium">{dayNumber}</span> {/* ⭐ This is now the dynamic date */}
                {/* Data indicator dot */}
                {dataIndicators[`W${activeWeek}_${dayName}`] && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateCircles;
