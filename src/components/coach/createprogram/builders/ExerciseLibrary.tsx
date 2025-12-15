// src/components/coach/createprogram/builders/ExerciseLibrary.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Corrected import
import { Search, Filter, Dumbbell, Heart, Utensils, Zap, X } from 'lucide-react';
import { ExerciseItem, ExerciseType } from '@/mockdata/createprogram/mockExercises';
import { cn } from '@/lib/utils';

interface ExerciseLibraryProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: ExerciseItem[];
  onSelect: (item: ExerciseItem) => void;
  onSearch: (query: string, filterType?: ExerciseType | 'all', muscleGroup?: string, equipment?: string) => void;
  allExercises: ExerciseItem[];
}

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

const getIconForType = (type: ExerciseType) => {
  switch (type) {
    case 'warm-up':
      return <Heart className="h-4 w-4" />;
    case 'exercise':
      return <Dumbbell className="h-4 w-4" />;
    case 'stretch':
      return <Utensils className="h-4 w-4" />;
    default:
      return <Filter className="h-4 w-4" />;
  }
};

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelect,
  onSearch,
  allExercises,
}) => {
  const [filterType, setFilterType] = useState<ExerciseType | 'all'>('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  // Get unique muscle groups from all exercises
  const uniqueMuscleGroups = React.useMemo(() => {
    const groups = new Set<string>();
    allExercises.forEach(exercise => {
      exercise.muscleGroups.forEach(group => {
        if (group) groups.add(group);
      });
    });
    return Array.from(groups).sort();
  }, [allExercises]);

  // Get unique equipment from all exercises
  const uniqueEquipment = React.useMemo(() => {
    const equipment = new Set<string>();
    allExercises.forEach(exercise => {
      exercise.equipment?.forEach(eq => {
        if (eq) equipment.add(eq);
      });
    });
    return Array.from(equipment).sort();
  }, [allExercises]);

  useEffect(() => {
    onSearch(searchQuery, filterType, muscleGroupFilter, equipmentFilter);
  }, [searchQuery, filterType, muscleGroupFilter, equipmentFilter, onSearch]);

  const handleClearFilters = () => {
    setFilterType('all');
    setMuscleGroupFilter('all');
    setEquipmentFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterType !== 'all' || muscleGroupFilter !== 'all' || equipmentFilter !== 'all' || searchQuery.length > 0;

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-2 h-full flex flex-col p-3 sm:p-4 lg:p-2">
      <h3 className="text-lg sm:text-xl lg:text-sm font-bold text-foreground">Exercise Library</h3>

      {/* Search + Filter Row - Desktop Enhanced */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises, muscle groups, descriptions..."
            className="pl-9 w-full h-11 sm:h-10 lg:h-11 xl:h-12 text-base sm:text-sm lg:text-base xl:text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Section - Compact Layout for smaller width */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:gap-3">
          <div className="flex gap-2 flex-1 lg:flex-col lg:gap-2">
            {/* Exercise Type Filter - Desktop Enhanced */}
            <Select value={filterType} onValueChange={(val) => setFilterType(val as ExerciseType | 'all')}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-9 text-base sm:text-sm lg:text-sm">
                <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Exercise Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="warm-up">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-blue-700" /> Warm-up
                  </div>
                </SelectItem>
                <SelectItem value="exercise">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-green-700" /> Exercise
                  </div>
                </SelectItem>
                <SelectItem value="stretch">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-purple-700" /> Stretch
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Muscle Group Filter - Compact */}
            <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-8 text-base sm:text-sm lg:text-xs">
                <Zap className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground mr-2" />
                <SelectValue placeholder="Muscle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscles</SelectItem>
                {uniqueMuscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    <div className="flex items-center gap-2 capitalize">
                      <Zap className="h-3 w-3" />
                      {group}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Equipment Filter - New */}
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-8 text-base sm:text-sm lg:text-xs">
                <Dumbbell className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground mr-2" />
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {uniqueEquipment.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-3 w-3" />
                      {eq}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button - Compact */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1 px-3 py-2 sm:px-3 sm:py-2 lg:px-2 lg:py-1 text-base sm:text-sm lg:text-xs text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap bg-background hover:bg-muted border border-border rounded-md min-h-[44px] sm:min-h-auto lg:min-h-[32px] touch-manipulation hover:shadow-sm"
            >
              <X className="h-4 w-4 sm:h-3 sm:w-3 lg:h-3 lg:w-3" />
              <span className="lg:hidden">Clear</span>
            </button>
          )}
        </div>

        {/* Active Filters Summary - Compact */}
        {hasActiveFilters && (
          <div className="text-sm sm:text-xs lg:text-xs text-muted-foreground px-1 lg:px-1">
            <span className="font-medium">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Exercise Cards - Compact for narrow column */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 lg:space-y-1 pr-1 sm:pr-2 lg:pr-1">
        <AnimatePresence>
          {searchResults.length > 0 ? (
            searchResults.map((exercise) => (
              <motion.div
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group flex items-center gap-3 sm:gap-4 lg:gap-2 p-4 lg:p-2 rounded-xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 min-h-[80px] sm:min-h-[64px] lg:min-h-[60px] touch-manipulation active:scale-[0.98] hover:bg-card/80"
              >
                {/* Image Placeholder - Very compact */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-10 lg:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={`https://via.placeholder.com/96?text=${exercise.name.charAt(0).toUpperCase()}`}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                  />
                </div>

                {/* Content - Compact */}
                <div className="flex-1 flex flex-col justify-center min-w-0 gap-1 lg:gap-1">
                  <div className="flex items-start justify-between mb-1 sm:mb-1 lg:mb-1">
                    <h4 className="text-base sm:text-sm lg:text-xs font-semibold text-foreground leading-tight pr-2 group-hover:text-primary transition-colors duration-200">
                      {exercise.name}
                    </h4>
                    <span
                      className={cn(
                        'text-xs lg:text-xs px-2 py-1 lg:px-1 lg:py-0.5 rounded-full font-medium capitalize flex items-center gap-1 lg:gap-1 shrink-0 shadow-sm',
                        getBadgeColor(exercise.type)
                      )}
                    >
                      {getIconForType(exercise.type)}
                      <span className="hidden sm:inline-block lg:hidden">{exercise.type}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-xs lg:text-xs text-muted-foreground leading-relaxed">
                    {exercise.description && exercise.description.length > 0 
                      ? `${exercise.description.slice(0, 30)}${exercise.description.length > 30 ? '...' : ''}`
                      : exercise.muscleGroups.length > 0 
                        ? `${exercise.muscleGroups.slice(0, 1).join(', ')}${exercise.muscleGroups.length > 1 ? '...' : ''}`
                        : 'Exercise'
                    }
                  </p>
                  {/* Hide muscle group tags on desktop to save space */}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 sm:p-4 lg:p-4 text-center text-muted-foreground">
              <div className="text-base sm:text-sm lg:text-sm font-medium">
                {searchQuery.length > 2
                  ? 'No exercises found'
                  : 'Search exercises...'}
              </div>
              {searchQuery.length > 2 && (
                <p className="text-sm lg:text-xs text-muted-foreground/80 mt-2">
                  Try different terms
                </p>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
