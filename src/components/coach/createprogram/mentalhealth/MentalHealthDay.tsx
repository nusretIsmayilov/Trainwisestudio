// src/components/coach/createprogram/mentalhealth/MentalHealthDay.tsx
'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, ChevronUp, ChevronDown, Feather, Clock } from 'lucide-react';
import { MentalHealthActivity } from '@/mockdata/createprogram/mockMentalHealthActivities';
import { cn } from '@/lib/utils';

export interface MentalHealthDayItem {
  id: string;
  activity: MentalHealthActivity;
  comment?: string;
}

export type MentalHealthSection = 'morning' | 'evening' | 'night';

interface MentalHealthDayProps {
  day: string; // This prop now contains "Week # - DayName"
  data: { [key in MentalHealthSection]: MentalHealthDayItem[] };
  onDataChange: (data: { [key in MentalHealthSection]: MentalHealthDayItem[] }) => void;
  onAddClick: () => void;
  selectedSection?: MentalHealthSection;
  onSectionSelect?: (section: MentalHealthSection) => void;
}

const mentalHealthSections: MentalHealthSection[] = ['morning', 'evening', 'night'];

const MentalHealthDay: React.FC<MentalHealthDayProps> = ({ day, data, onDataChange, onAddClick, selectedSection, onSectionSelect }) => {

  const handleUpdateItem = useCallback((section: MentalHealthSection, itemIndex: number, field: keyof MentalHealthDayItem, value: string) => {
    const newItems = [...data[section]];
    (newItems[itemIndex] as any)[field] = value;
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const handleRemoveItem = useCallback((section: MentalHealthSection, itemIndex: number) => {
    const newItems = data[section].filter((_, i) => i !== itemIndex);
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const handleMove = useCallback((section: MentalHealthSection, index: number, direction: 'up' | 'down') => {
    const newItems = [...data[section]];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
        return; 
    }
    onDataChange({ ...data, [section]: newItems });
  }, [data, onDataChange]);

  const renderActivityCard = (item: MentalHealthDayItem, itemIndex: number, section: MentalHealthSection) => (
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
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-muted" onClick={() => handleMove(section, itemIndex, 'up')} disabled={itemIndex === 0}>
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-muted" onClick={() => handleMove(section, itemIndex, 'down')} disabled={itemIndex === data[section].length - 1}>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <Feather className="h-5 w-5 text-purple-500 shrink-0" />
          <span className="font-semibold text-lg flex-1 truncate">{item.activity.name}</span>
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

      <div className='flex items-center gap-4 text-sm font-medium text-muted-foreground border-b pb-2 mb-4'>
        <span className='flex items-center gap-1 text-primary'>
            <Clock className='h-4 w-4'/> {item.activity.durationMinutes} min
        </span>
        <span className='capitalize'>
            Type: {item.activity.type}
        </span>
      </div>
      
      {/* Comment / Reflection Input */}
      <div className="mt-4 space-y-2">
        <Label htmlFor={`comment-${item.id}`}>Notes / Intention (Optional)</Label>
        <Textarea
          id={`comment-${item.id}`}
          placeholder="e.g., Focus on grounding, use this time to reflect on gratitude."
          value={item.comment}
          onChange={(e) => handleUpdateItem(section, itemIndex, 'comment', e.target.value)}
        />
      </div>
    </motion.div>
  );

  return (
    <>
      {/* ⭐ UPDATE DISPLAY TO USE THE DYNAMIC DAY PROP */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{day}'s Mental Wellness Plan</h3>
        <Button onClick={onAddClick} className="gap-2 lg:hidden">
          <Plus className="h-4 w-4" /> Add Activity
        </Button>
      </div>
      
      <div className="space-y-6">
        {mentalHealthSections.map((section) => (
          <div key={section} className="space-y-3">
            <h4 
              className={cn(
                "text-lg font-semibold capitalize border-b pb-1 transition-colors duration-200",
                // Desktop only: clickable and styled headers
                "lg:cursor-pointer",
                selectedSection === section && onSectionSelect 
                  ? "text-primary bg-primary/5 px-2 py-1 rounded-md border-primary" 
                  : "text-primary lg:hover:text-primary/80"
              )}
              onClick={() => onSectionSelect && window.innerWidth >= 1024 && onSectionSelect(section)}
            >
              {section}
              {selectedSection === section && onSectionSelect && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full hidden lg:inline">
                  Selected
                </span>
              )}
            </h4>
            
            <div 
              className={cn(
                "space-y-4 p-4 rounded-xl transition-all duration-200",
                // Desktop only: clickable containers with selection styling
                "lg:cursor-pointer",
                selectedSection === section && onSectionSelect 
                  ? "border-2 border-primary/30 bg-primary/5" 
                  : data[section].length === 0 
                    ? "border-2 border-dashed border-gray-200" 
                    : "border border-border"
              )}
              onClick={() => onSectionSelect && window.innerWidth >= 1024 && onSectionSelect(section)}
            >
              <AnimatePresence>
                {data[section].length > 0 ? (
                  data[section].map((item, itemIndex) => renderActivityCard(item, itemIndex, section))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Feather className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="font-semibold capitalize">Add activities to your {section} routine.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            <Button variant="outline" className="w-full gap-2" onClick={onAddClick}>
              <Plus className="h-4 w-4" /> Add Activity to {section}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default MentalHealthDay;
