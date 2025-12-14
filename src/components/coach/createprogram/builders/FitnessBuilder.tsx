// src/components/coach/createprogram/builders/FitnessBuilder.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import WorkoutDay, { WorkoutDayItem } from './WorkoutDay';
import { ExerciseItem } from '@/mockdata/createprogram/mockExercises';
import ExerciseLibrary from './ExerciseLibrary';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';
import DaySummary from './DaySummary';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DateCircles from './DateCircles';

// Helper function to create a unique key for data storage
const getDataKey = (week: number, day: string) => `W${week}_${day}`;
const INITIAL_WEEK_DAY = 'Monday';

interface FitnessBuilderProps {
  onBack: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const FitnessBuilder: React.FC<FitnessBuilderProps> = ({ onBack, onSave, initialData }) => {
  // ⭐ ADD WEEK STATE
  const [activeWeek, setActiveWeek] = useState(1); 
  const [activeDay, setActiveDay] = useState(INITIAL_WEEK_DAY);
  
  // ⭐ UPDATE DATA STRUCTURE to use the compound key
  const [workoutData, setWorkoutData] = useState<{ [key: string]: WorkoutDayItem[] }>(() => {
    // Ensure we always have a valid object, even if initialData is undefined
    return initialData && typeof initialData === 'object' ? initialData : {};
  }); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { items: libraryItems, loading: libraryLoading } = useCoachLibrary();
  
  // Filter library items for exercises only and convert to ExerciseItem type
  const exerciseItems: ExerciseItem[] = libraryItems
    .filter(item => item.category === 'exercise')
    .map(item => {
      const details = (item.details as any) || {};
      return {
        id: item.id,
        name: item.name,
        type: details.type || 'exercise',
        description: item.introduction || '',
        muscleGroups: details.muscle_groups || [],
        equipment: details.equipment || [],
        difficulty: details.difficulty,
        sets: details.sets,
        reps: details.reps,
        duration: details.duration,
        content: (item as any).content
      } as ExerciseItem;
    });
  const [searchResults, setSearchResults] = useState<ExerciseItem[]>(exerciseItems);

  // ⭐ CALCULATE UNIQUE KEY
  const currentDataKey = getDataKey(activeWeek, activeDay); 

  // ⭐ DATA INDICATORS for DateCircles (shows which days have data)
  const dataIndicators = Object.keys(workoutData || {}).reduce((acc, key) => {
    const hasData = (workoutData[key] || []).length > 0;
    acc[key] = hasData;
    return acc;
  }, {} as { [key: string]: boolean });

  // ⭐ UPDATE HANDLERS to use the compound key
  const handleUpdateItems = useCallback((key: string, items: WorkoutDayItem[]) => {
    setWorkoutData(prevData => ({
      ...prevData,
      [key]: items,
    }));
  }, []);
  
  // ⭐ NEW HANDLER for week change
  const handleWeekChange = useCallback((week: number) => {
    setActiveWeek(week);
    setActiveDay(INITIAL_WEEK_DAY); // Optional: reset to Monday when week changes
  }, []);


  // Handle exercise search with enhanced filtering
  const handleSearch = useCallback((query: string, filterType?: any, muscleGroup?: string, equipment?: string) => {
    let filtered = exerciseItems;

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(exercise => exercise.type === filterType);
    }

    if (muscleGroup && muscleGroup !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.muscleGroups?.some(group => 
          group.toLowerCase() === muscleGroup.toLowerCase()
        )
      );
    }

    if (equipment && equipment !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.equipment?.some(eq => 
          eq.toLowerCase() === equipment.toLowerCase()
        )
      );
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description?.toLowerCase().includes(searchTerm) ||
        exercise.muscleGroups?.some(group => 
          group.toLowerCase().includes(searchTerm)
        ) ||
        exercise.equipment?.some(eq => 
          eq.toLowerCase().includes(searchTerm)
        )
      );
    }

    setSearchResults(filtered);
  }, [exerciseItems]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleSelectExercise = (exercise: ExerciseItem) => {
    const newItem: WorkoutDayItem = {
      id: `${exercise.id}-${Date.now()}`,
      exercise: exercise,
      sets: [{ reps: "" }],
      comment: '',
    };
    // ⭐ USE COMPOUND KEY for adding item
    const itemsForDay = workoutData[currentDataKey]
      ? [...workoutData[currentDataKey]]
      : [];
    itemsForDay.push(newItem);
    handleUpdateItems(currentDataKey, itemsForDay);
    setIsSheetOpen(false);
  };

  const currentDayItems = workoutData[currentDataKey] || []; // ⭐ USE COMPOUND KEY for display

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col"
    >
      {/* Global Header - now always visible */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl shadow-md border mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(workoutData)} // Pass all data (containing W#_DayName keys)
          className="gap-2 shrink-0"
        >
          <Check className="h-4 w-4" /> Save Program
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 lg:gap-4 bg-card rounded-xl shadow-md border">
        
        {/* Date Selector Header (Now includes Week Selector) */}
        <div className="lg:col-span-5 border-b border-border p-4">
          <DateCircles 
            activeDay={activeDay} 
            onDayChange={setActiveDay} 
            // ⭐ PASS NEW WEEK PROPS
            activeWeek={activeWeek}
            onWeekChange={handleWeekChange}
            dataIndicators={dataIndicators}
          />
        </div>

        {/* Left Column: Search & Library (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1 border-r border-border min-h-[calc(100vh-4rem)] overflow-y-auto bg-muted/20">
          <ExerciseLibrary
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSelect={handleSelectExercise}
            onSearch={handleSearch}
            allExercises={exerciseItems}
          />
        </div>

        {/* Middle Column: Workout Day */}
        <div className="lg:col-span-3 flex-1 p-4 md:p-6 lg:p-8 space-y-4">
          {/* Mobile/Tablet date selector is handled inside the full DateCircles component now */}

          <WorkoutDay
            // ⭐ UPDATE DISPLAY NAME
            day={`Week ${activeWeek} - ${activeDay}`}
            items={currentDayItems}
            onItemsChange={items => handleUpdateItems(currentDataKey, items)} // ⭐ USE COMPOUND KEY
            onAddClick={() => setIsSheetOpen(true)}
          />
        </div>

        {/* Right Column: Day Summary (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1 border-l border-border min-h-[calc(100vh-4rem)] overflow-y-auto">
          <DaySummary items={currentDayItems} activeDay={activeDay} />
        </div>
      </div>

      {/* Mobile / Tablet Bottom Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] overflow-hidden pb-safe">
          <SheetHeader className="pb-4 border-b sticky top-0 bg-background z-10">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-2" />
            <SheetTitle className="text-lg font-semibold">Add Exercise</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-80px)] overflow-hidden mt-4">
            <ExerciseLibrary
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onSelect={handleSelectExercise}
              onSearch={handleSearch}
              allExercises={exerciseItems}
            />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default FitnessBuilder;
