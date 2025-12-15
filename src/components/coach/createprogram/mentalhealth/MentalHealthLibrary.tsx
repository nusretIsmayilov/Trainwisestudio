// src/components/coach/createprogram/mentalhealth/MentalHealthLibrary.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Feather, BookOpen, Clock, Heart, Zap, X, Sun, Moon } from 'lucide-react';
import { MentalHealthActivity, ActivityType, FocusArea, mockMentalHealthActivities } from '@/mockdata/createprogram/mockMentalHealthActivities';
import { cn } from '@/lib/utils';

interface MentalHealthLibraryProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: MentalHealthActivity[];
  onSelect: (item: MentalHealthActivity) => void;
  onSearch: (query: string, activityType?: ActivityType | 'all', focusArea?: FocusArea | 'all') => void;
  allActivities: MentalHealthActivity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'yoga': return <Sun className="h-4 w-4 text-orange-400" />;
    case 'meditation': return <Feather className="h-4 w-4 text-blue-400" />;
    case 'reflections': return <BookOpen className="h-4 w-4 text-green-400" />;
    case 'breathwork': return <Heart className="h-4 w-4 text-red-400" />;
    case 'exercise': default: return <Zap className="h-4 w-4 text-purple-400" />;
  }
};

const MentalHealthLibrary: React.FC<MentalHealthLibraryProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelect,
  onSearch,
  allActivities,
}) => {
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType | 'all'>('all');
  const [focusAreaFilter, setFocusAreaFilter] = useState<FocusArea | 'all'>('all');

  const uniqueFocusAreas = React.useMemo(() => {
    const areas = new Set<FocusArea>();
    allActivities.forEach(activity => {
      activity.focusAreas.forEach(area => areas.add(area));
    });
    return Array.from(areas).sort();
  }, [allActivities]);

  useEffect(() => {
    onSearch(searchQuery, activityTypeFilter, focusAreaFilter);
  }, [searchQuery, activityTypeFilter, focusAreaFilter, onSearch]);

  const handleClearFilters = () => {
    setActivityTypeFilter('all');
    setFocusAreaFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = activityTypeFilter !== 'all' || focusAreaFilter !== 'all' || searchQuery.length > 0;

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-2 h-full flex flex-col p-3 sm:p-4 lg:p-2">
      <h3 className="text-lg sm:text-xl lg:text-sm font-bold text-foreground">Activity Library</h3>

      {/* Search + Filter Row - Matched ExerciseLibrary Sizing */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities, focus, duration..."
            className="pl-9 w-full h-11 sm:h-10 lg:h-11 xl:h-12 text-base sm:text-sm lg:text-base xl:text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Section - Matched ExerciseLibrary Layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:gap-3">
          <div className="flex gap-2 flex-1 lg:flex-col lg:gap-2">
            
            {/* Activity Type Filter - Matched Height */}
            <Select value={activityTypeFilter} onValueChange={(val) => setActivityTypeFilter(val as ActivityType | 'all')}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-9 text-base sm:text-sm lg:text-sm capitalize">
                <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {['yoga', 'meditation', 'reflections', 'breathwork', 'exercise'].map(type => (
                  <SelectItem key={type} value={type} className='capitalize'>
                    <div className="flex items-center gap-2">
                       {getActivityIcon(type as ActivityType)} {type}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Focus Area Filter - Matched Height */}
            <Select value={focusAreaFilter} onValueChange={(value) => setFocusAreaFilter(value as FocusArea | 'all')}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-8 text-base sm:text-sm lg:text-xs capitalize">
                <Heart className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground mr-2" />
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Focus Areas</SelectItem>
                {uniqueFocusAreas.map((area) => (
                  <SelectItem key={area} value={area} className='capitalize'>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button - Matched Sizing */}
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

        {/* Active Filters Summary - Matched Sizing */}
        {hasActiveFilters && (
          <div className="text-sm sm:text-xs lg:text-xs text-muted-foreground px-1 lg:px-1">
            <span className="font-medium">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Activity Cards - Matched ExerciseLibrary Sizing */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 lg:space-y-1 pr-1 sm:pr-2 lg:pr-1">
        <AnimatePresence>
          {searchResults.length > 0 ? (
            searchResults.map((activity) => (
              <motion.div
                key={activity.id}
                onClick={() => onSelect(activity)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                // Matched Card Sizing
                className="group flex items-center gap-3 sm:gap-4 lg:gap-2 p-4 lg:p-2 rounded-xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 min-h-[80px] sm:min-h-[64px] lg:min-h-[60px] touch-manipulation active:scale-[0.98] hover:bg-card/80"
              >
                {/* Icon Placeholder - Matched Sizing */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-10 lg:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl text-primary/70 group-hover:scale-105 transition-transform duration-300">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content - Matched Font Sizing */}
                <div className="flex-1 flex flex-col justify-center min-w-0 gap-1 lg:gap-1">
                  <div className="flex items-start justify-between mb-1 sm:mb-1 lg:mb-1">
                    <h4 className="text-base sm:text-sm lg:text-xs font-semibold text-foreground leading-tight pr-2 group-hover:text-primary transition-colors duration-200">
                      {activity.name}
                    </h4>
                    <span
                      className={cn(
                        'text-xs lg:text-xs px-2 py-1 lg:px-1 lg:py-0.5 rounded-full font-medium capitalize flex items-center gap-1 lg:gap-1 shrink-0 shadow-sm bg-purple-100 text-purple-700'
                      )}
                    >
                      {getActivityIcon(activity.type)}
                      <span className="hidden sm:inline-block lg:hidden">{activity.type}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-xs lg:text-xs text-muted-foreground leading-relaxed">
                    {activity.description && activity.description.length > 0 
                      ? `${activity.description.slice(0, 30)}${activity.description.length > 30 ? '...' : ''}`
                      : `${activity.focusAreas.slice(0, 1).join(', ')}${activity.focusAreas.length > 1 ? '...' : ''}`
                    }
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 hidden lg:block">
                     <Clock className='h-3 w-3 inline-block mr-1'/> {activity.durationMinutes} minutes
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 sm:p-4 lg:p-4 text-center text-muted-foreground">
              <div className="text-base sm:text-sm lg:text-sm font-medium">
                {searchQuery.length > 2 ? 'No activities found' : 'Search activities...'}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MentalHealthLibrary;
