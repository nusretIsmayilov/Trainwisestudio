// src/components/coach/createprogram/builders/WorkoutDay.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ExerciseItem, ExerciseType } from '@/mockdata/createprogram/mockExercises';
import { cn } from '@/lib/utils';

export interface WorkoutDayItem {
  id: string;
  exercise: ExerciseItem;
  comment?: string;
  sets: { reps: string }[];
  restTimeSeconds?: number;
}

interface WorkoutDayProps {
  day: string;
  items: WorkoutDayItem[];
  onItemsChange: (items: WorkoutDayItem[]) => void;
  onAddClick: () => void;
}

const WorkoutDay: React.FC<WorkoutDayProps> = ({ day, items, onItemsChange, onAddClick }) => {

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const item = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = item;
    onItemsChange(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const item = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = item;
    onItemsChange(newItems);
  };

  const handleUpdateReps = (itemIndex: number, setIndex: number, value: string) => {
    const newItems = [...items];
    newItems[itemIndex].sets[setIndex].reps = value;
    onItemsChange(newItems);
  };

  const handleAddSet = (itemIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].sets.push({ reps: "" });
    onItemsChange(newItems);
  };

  const handleRemoveSet = (itemIndex: number, setIndex: number) => {
    const newItems = [...items];
    if (newItems[itemIndex].sets.length > 1) {
      newItems[itemIndex].sets.splice(setIndex, 1);
      onItemsChange(newItems);
    }
  };

  const handleUpdateComment = (itemIndex: number, comment: string) => {
    const newItems = [...items];
    newItems[itemIndex].comment = comment;
    onItemsChange(newItems);
  };

  const handleUpdateRestTime = (itemIndex: number, restTime: string) => {
    const newItems = [...items];
    newItems[itemIndex].restTimeSeconds = parseInt(restTime) || 0;
    onItemsChange(newItems);
  };

  const getBadgeColor = (type: ExerciseType) => {
    switch (type) {
      case 'warm-up':
        return 'bg-blue-100 text-blue-700';
      case 'exercise':
        return 'bg-green-100 text-green-700';
      case 'stretch':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{day}</h3>
        <Button onClick={onAddClick} className="gap-2 lg:hidden">
            <Plus className="h-4 w-4" /> Add Exercise
        </Button>
      </div>
      
      <div className="space-y-4 min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl p-4">
        <AnimatePresence>
            {items.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 border rounded-lg relative group bg-card"
                layout
              >
                 <div className="flex items-center justify-between gap-2 mb-2">
                   <div className="flex items-center gap-2">
                     <div className="flex flex-col gap-1">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-4 w-4 p-0 hover:bg-muted"
                         onClick={() => handleMoveUp(itemIndex)}
                         disabled={itemIndex === 0}
                       >
                         <ChevronUp className="h-3 w-3" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-4 w-4 p-0 hover:bg-muted"
                         onClick={() => handleMoveDown(itemIndex)}
                         disabled={itemIndex === items.length - 1}
                       >
                         <ChevronDown className="h-3 w-3" />
                       </Button>
                     </div>
                     <span className={cn("text-sm px-2 py-1 rounded-full font-medium", getBadgeColor(item.exercise.type))}>
                       {item.exercise.type}
                     </span>
                     <span className="font-semibold text-lg flex-1 truncate">{item.exercise.name}</span>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6 opacity-50 hover:opacity-100"
                     onClick={() => handleRemoveItem(itemIndex)}
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 </div>

                 {item.exercise.type === 'exercise' && (
                   <div className="space-y-3">
                     {item.sets.map((set, setIndex) => (
                       <motion.div
                         key={setIndex}
                         className="flex gap-2 items-end"
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                       >
                         <div className="flex-1">
                           <label className="block text-xs text-muted-foreground">Set {setIndex + 1}</label>
                           <Input
                             type="text"
                             placeholder="e.g., 12 or 8-12"
                             value={set.reps}
                             onChange={(e) => handleUpdateReps(itemIndex, setIndex, e.target.value)}
                             className="w-full text-base"
                           />
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => handleRemoveSet(itemIndex, setIndex)}>
                           <X className="h-4 w-4 text-muted-foreground" />
                         </Button>
                       </motion.div>
                     ))}
                     <Button variant="outline" className="w-full gap-2" onClick={() => handleAddSet(itemIndex)}>
                       <Plus className="h-4 w-4" /> Add Set
                     </Button>
                     
                     <div className="mt-4 space-y-2">
                       <Label>Rest Time Between Sets</Label>
                       <div className="flex gap-2 items-center">
                         <Input
                           type="number"
                           placeholder="90"
                           value={item.restTimeSeconds || ''}
                           onChange={(e) => handleUpdateRestTime(itemIndex, e.target.value)}
                           className="w-20"
                           min="0"
                         />
                         <span className="text-sm text-muted-foreground">seconds</span>
                       </div>
                     </div>
                   </div>
                 )}
                
                <div className="mt-4 space-y-2">
                  <Label>Optional Comment</Label>
                  <Textarea
                    placeholder="e.g., Use light weights for this warm-up set."
                    value={item.comment}
                    onChange={(e) => handleUpdateComment(itemIndex, e.target.value)}
                  />
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Plus className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30"/>
            <p className="font-semibold">Start building your workout</p>
            <p className="text-sm">Add exercises to {day} to get started.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkoutDay;
