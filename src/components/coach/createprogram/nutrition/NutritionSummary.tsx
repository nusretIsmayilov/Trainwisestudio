// src/components/coach/createprogram/nutrition/NutritionSummary.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NutritionDayItem, MealSection } from './NutritionDay';
import { Utensils, Clock, Flame, Beef, Carrot, Snowflake, Scale, BookOpenText } from 'lucide-react';

interface NutritionSummaryProps {
  data: { [key in MealSection]: NutritionDayItem[] };
  activeDay: string;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ data }) => {
  const allItems = Object.values(data).flat();
  
  const totalMacros = allItems.reduce(
    (acc, item) => {
      acc.calories += item.recipe.calories;
      acc.protein += item.recipe.protein;
      acc.carbs += item.recipe.carbs;
      acc.fat += item.recipe.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="p-3 md:p-4 space-y-4 h-full flex flex-col overflow-hidden">
      <h3 className="text-lg font-bold text-foreground">Daily Summary</h3>

      {/* Total Macros as plain text with icons */}
      <div className="space-y-1 text-sm font-medium text-foreground">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold">{totalMacros.calories} Kcal</span>
        </div>
        <div className="flex items-center gap-2">
          <Beef className="h-4 w-4 text-green-500 shrink-0" />
          <span>{totalMacros.protein}g Protein</span>
        </div>
        <div className="flex items-center gap-2">
          <Carrot className="h-4 w-4 text-orange-500 shrink-0" />
          <span>{totalMacros.carbs}g Carbs</span>
        </div>
        <div className="flex items-center gap-2">
          <Snowflake className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{totalMacros.fat}g Fat</span>
        </div>
      </div>

      {/* Meals */}
      <h4 className="text-base font-bold pt-2 border-b pb-1 border-border/70">Meal Schedule</h4>
      
      <div className="space-y-3 text-sm text-muted-foreground overflow-y-auto flex-1 pr-1">
        <AnimatePresence mode="popLayout">
          {allItems.length > 0 ? (
            Object.keys(data).map((sectionKey) => {
              const section = sectionKey as MealSection;
              const items = data[section] || [];

              if (items.length === 0) return null;

              return (
                <div key={section} className="space-y-2 pb-3 border-b border-border/70 last:border-b-0">
                  <h5 className="font-semibold text-xs text-primary/90 uppercase flex items-center gap-1 pt-1">
                    <BookOpenText className="h-3 w-3 shrink-0" /> {section.replace('snack', ' Snack')}
                  </h5>

                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col p-2 bg-background rounded-lg border border-border/50 shadow-sm overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-1 min-w-0">
                        <span className="font-medium text-foreground text-sm flex-1 truncate pr-2 min-w-0">
                          {item.recipe.name}
                        </span>
                        {item.time && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
                            <Clock className="h-3 w-3 shrink-0" /> {item.time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
                        <p className="flex items-center gap-1 truncate">
                          <Scale className="h-3 w-3 text-primary/70 shrink-0" /> {item.portionSize}
                        </p>
                        <p className="font-medium text-primary/80 shrink-0">
                          {item.recipe.calories} kcal
                        </p>
                      </div>
                      {item.comment && (
                        <p className="italic text-[11px] text-muted-foreground/80 mt-1 line-clamp-1">
                          "{item.comment}"
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Utensils className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">Add recipes to start tracking macros.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NutritionSummary;
