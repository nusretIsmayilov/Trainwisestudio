// src/components/coach/createprogram/nutrition/NutritionDay.tsx
'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, Utensils, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { RecipeItem, MealType } from '@/mockdata/createprogram/mockRecipes';
import { cn } from '@/lib/utils';

export interface NutritionDayItem {
  id: string;
  recipe: RecipeItem;
  comment?: string;
  time?: string; // Optional time input
  portionSize: string; // e.g., '1 serving', '1.5x'
}

export type MealSection = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'nightsnack';

export interface NutritionDayData {
  items: NutritionDayItem[];
  section: MealSection;
}

interface NutritionDayProps {
  day: string; // This prop now contains "Week # - DayName"
  data: { [key in MealSection]: NutritionDayItem[] };
  onDataChange: (data: { [key in MealSection]: NutritionDayItem[] }) => void;
  onAddClick: () => void;
  selectedSection?: MealSection;
  onSectionSelect?: (section: MealSection) => void;
}

const mealSections: MealSection[] = ['breakfast', 'lunch', 'dinner', 'snack', 'nightsnack'];

const NutritionDay: React.FC<NutritionDayProps> = ({ day, data, onDataChange, onAddClick, selectedSection, onSectionSelect }) => {

  const handleUpdateItem = useCallback((section: MealSection, itemIndex: number, field: keyof NutritionDayItem, value: string) => {
    const newItems = [...data[section]];
    (newItems[itemIndex] as any)[field] = value;
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const handleRemoveItem = useCallback((section: MealSection, itemIndex: number) => {
    const newItems = data[section].filter((_, i) => i !== itemIndex);
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const handleMove = useCallback((section: MealSection, index: number, direction: 'up' | 'down') => {
    const newItems = [...data[section]];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
        return; // No move needed
    }
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const renderRecipeCard = (item: NutritionDayItem, itemIndex: number, section: MealSection) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="p-4 border rounded-lg relative group bg-card"
      layout
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex flex-col gap-1 items-center">
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-muted" onClick={() => handleMove(section, itemIndex, 'up')} disabled={itemIndex === 0}>
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-muted" onClick={() => handleMove(section, itemIndex, 'down')} disabled={itemIndex === data[section].length - 1}>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <Utensils className="h-5 w-5 text-primary/70 shrink-0" />
          <span className="font-semibold text-lg flex-1 truncate">{item.recipe.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-50 hover:opacity-100 shrink-0"
          onClick={() => handleRemoveItem(section, itemIndex)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        {/* Time Input (Optional) */}
        <div className="space-y-1">
          <Label htmlFor={`time-${item.id}`} className='text-xs'>Time (Optional)</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`time-${item.id}`}
              type="time"
              placeholder="e.g., 08:00"
              value={item.time || ''}
              onChange={(e) => handleUpdateItem(section, itemIndex, 'time', e.target.value)}
              className="pl-10 text-base"
            />
          </div>
        </div>
        
        {/* Portion Size Input */}
        <div className="space-y-1">
          <Label htmlFor={`portion-${item.id}`} className='text-xs'>Portion Size</Label>
          <Input
            id={`portion-${item.id}`}
            placeholder="e.g., 1 serving"
            value={item.portionSize}
            onChange={(e) => handleUpdateItem(section, itemIndex, 'portionSize', e.target.value)}
            className="text-base"
          />
        </div>
      </div>
      
      {/* Comment */}
      <div className="mt-4 space-y-2">
        <Label htmlFor={`comment-${item.id}`} className='text-xs'>Optional Notes</Label>
        <Textarea
          id={`comment-${item.id}`}
          placeholder="e.g., Use low-fat yogurt."
          value={item.comment}
          onChange={(e) => handleUpdateItem(section, itemIndex, 'comment', e.target.value)}
        />
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {/* ⭐ Use the dynamic day prop */}
        <h3 className="text-xl font-bold">{day}'s Nutrition Plan</h3>
        <Button onClick={onAddClick} className="gap-2 lg:hidden">
          <Plus className="h-4 w-4" /> Add Recipe
        </Button>
      </div>
      
      <div className="space-y-6">
        {mealSections.map((section) => (
          <div key={section} className="space-y-3">
            <h4 
              className={cn(
                "text-lg font-semibold capitalize border-b pb-1 cursor-pointer transition-colors duration-200",
                selectedSection === section && onSectionSelect 
                  ? "text-primary bg-primary/5 px-2 py-1 rounded-md border-primary" 
                  : "text-primary hover:text-primary/80"
              )}
              onClick={() => onSectionSelect?.(section)}
            >
              {section.replace('snack', ' Snack')}
              {selectedSection === section && onSectionSelect && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full hidden lg:inline">
                  Selected
                </span>
              )}
            </h4>
            
            <div 
              className={cn(
                "space-y-4 p-4 rounded-xl transition-all duration-200",
                selectedSection === section && onSectionSelect 
                  ? "border-2 border-primary/30 bg-primary/5" 
                  : data[section].length === 0 
                    ? "border-2 border-dashed border-gray-200" 
                    : "border border-border",
              )}
              onClick={() => onSectionSelect?.(section)}
            >
              <AnimatePresence>
                {data[section].length > 0 ? (
                  data[section].map((item, itemIndex) => renderRecipeCard(item, itemIndex, section))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Utensils className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="font-semibold capitalize">Add recipes to your {section.replace('snack', ' Snack')} plan.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            <Button variant="outline" className="w-full gap-2" onClick={onAddClick}>
              <Plus className="h-4 w-4" /> Add Recipe to {section.replace('snack', ' Snack')}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NutritionDay;
