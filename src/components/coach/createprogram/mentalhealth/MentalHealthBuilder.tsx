// src/components/coach/createprogram/mentalhealth/MentalHealthBuilder.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DateCircles from '../builders/DateCircles'; // Reused
import MentalHealthLibrary from './MentalHealthLibrary'; // New
import MentalHealthDay, { MentalHealthDayItem, MentalHealthSection } from './MentalHealthDay'; // New
import MentalHealthSummary from './MentalHealthSummary'; // New/Adapted
import { MentalHealthActivity, ActivityType, FocusArea } from '@/mockdata/createprogram/mockMentalHealthActivities';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';

// Helper function to create a unique key for data storage
const getDataKey = (week: number, day: string) => `W${week}_${day}`;
const INITIAL_WEEK_DAY = 'Monday';

// Initial state for a day's mental health plan
const initialDayData = (): { [key in MentalHealthSection]: MentalHealthDayItem[] } => ({
    morning: [],
    evening: [],
    night: [],
});

interface MentalHealthBuilderProps {
  onBack: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const MentalHealthBuilder: React.FC<MentalHealthBuilderProps> = ({ onBack, onSave, initialData }) => {
  // ⭐ ADD WEEK STATE
  const [activeWeek, setActiveWeek] = useState(1); 
  const [activeDay, setActiveDay] = useState(INITIAL_WEEK_DAY);
  
  // ⭐ UPDATE DATA STRUCTURE to use the compound key: { "W1_Monday": { morning: [] } }
  const [mhData, setMhData] = useState<{ [key: string]: { [key in MentalHealthSection]: MentalHealthDayItem[] } }>(() => {
    // Ensure we always have a valid object, even if initialData is undefined
    return initialData && typeof initialData === 'object' ? initialData : {};
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<MentalHealthSection>('morning');
  const { items: libraryItems, loading: libraryLoading } = useCoachLibrary();
  
  // Filter library items for mental health activities only and convert type
  const mentalHealthItems: MentalHealthActivity[] = libraryItems
    .filter(item => item.category === 'mental health')
    .map(item => {
      const details = (item.details as any) || {};
      return {
        id: item.id,
        name: item.name,
        description: item.introduction || '',
        type: details.type || 'meditation',
        focusAreas: details.focus_areas || [],
        durationMinutes: details.duration_minutes || 10,
        difficulty: details.difficulty,
        content: (item as any).content
      } as MentalHealthActivity;
    });
  const [searchResults, setSearchResults] = useState<MentalHealthActivity[]>(mentalHealthItems);

  // ⭐ CALCULATE UNIQUE KEY
  const currentDataKey = getDataKey(activeWeek, activeDay); 

  // ⭐ DATA INDICATORS for DateCircles (shows which days have data)
  const dataIndicators = Object.keys(mhData || {}).reduce((acc, key) => {
    const hasData = Object.values(mhData[key] || {}).some(activities => activities.length > 0);
    acc[key] = hasData;
    return acc;
  }, {} as { [key: string]: boolean });

  // Ensure initial data exists for the current W#_DayName when navigating
  useEffect(() => {
    if (!mhData[currentDataKey]) {
        setMhData(prev => ({
            ...prev,
            [currentDataKey]: initialDayData(),
        }));
    }
  }, [currentDataKey, mhData]);

  // ⭐ UPDATE HANDLER to use the compound key
  const handleUpdateDayData = useCallback((key: string, data: { [key in MentalHealthSection]: MentalHealthDayItem[] }) => {
    setMhData(prevData => ({
      ...prevData,
      [key]: data,
    }));
  }, []);

  // ⭐ NEW HANDLER for week change
  const handleWeekChange = useCallback((week: number) => {
    setActiveWeek(week);
    setActiveDay(INITIAL_WEEK_DAY); // Reset to Monday when week changes
  }, []);
  
  // Handlers for search
  const handleSearch = useCallback((query: string, activityTypeFilter?: ActivityType | 'all', focusArea?: FocusArea | 'all') => {
    let filtered = mentalHealthItems;
    if (activityTypeFilter && activityTypeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityTypeFilter);
    }
    if (focusArea && focusArea !== 'all') {
      filtered = filtered.filter(activity => activity.focusAreas?.includes(focusArea as FocusArea));
    }
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm) ||
        activity.description?.toLowerCase().includes(searchTerm) ||
        activity.focusAreas?.some(area => area.toLowerCase().includes(searchTerm))
      );
    }
    setSearchResults(filtered);
  }, [mentalHealthItems]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleSelectActivity = (activity: MentalHealthActivity) => {
    const newItem: MentalHealthDayItem = {
      id: `${activity.id}-${Date.now()}`,
      activity: activity,
      comment: '',
    };
    
    // Use selected section for desktop, automatic assignment for mobile
    let targetSection: MentalHealthSection = selectedSection;

    // For mobile/tablet (when section selection is not visible), use automatic assignment
    if (window.innerWidth < 1024) {
      if (activity.type === 'yoga' || activity.type === 'breathwork' || activity.focusAreas.includes('energy')) {
          targetSection = 'morning';
      } else if (activity.focusAreas.includes('sleep') || activity.type === 'meditation' || activity.type === 'reflections') {
          targetSection = 'night';
      } else {
          targetSection = 'evening';
      }
    }

    // ⭐ USE COMPOUND KEY for data retrieval/update
    const currentDayData = mhData[currentDataKey] || initialDayData();
    const itemsForSection = currentDayData[targetSection]
        ? [...currentDayData[targetSection], newItem]
        : [newItem];
        
    handleUpdateDayData(currentDataKey, { ...currentDayData, [targetSection]: itemsForSection });
    setIsSheetOpen(false);
  };
  
  const currentDayData = mhData[currentDataKey] || initialDayData(); // ⭐ USE COMPOUND KEY for current day data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col"
    >
      {/* Global Header (Reused from FitnessBuilder) */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl shadow-md border mb-4">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button size="sm" onClick={() => onSave(mhData)} className="gap-2 shrink-0">
          <Check className="h-4 w-4" /> Save Program
        </Button>
      </div>

      {/* Main Content Area (Reused 3-column grid structure) */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 lg:gap-4 bg-card rounded-xl shadow-md border overflow-hidden">
        
        {/* Date Selector Header (Reused from DateCircles) */}
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

        {/* Left Column: Library */}
        <div className="hidden lg:block lg:col-span-1 border-r border-border min-h-full overflow-y-auto bg-muted/20">
          <MentalHealthLibrary
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSelect={handleSelectActivity}
            onSearch={handleSearch}
            allActivities={mentalHealthItems}
          />
        </div>

        {/* Middle Column: Day Plan */}
        <div className="lg:col-span-3 flex-1 p-4 md:p-6 lg:p-8 space-y-4 overflow-y-auto">
          {/* Mobile/Tablet date selector is handled inside the full DateCircles component now */}

          <MentalHealthDay
            // ⭐ UPDATE DISPLAY NAME
            day={`Week ${activeWeek} - ${activeDay}`}
            data={currentDayData}
            onDataChange={data => handleUpdateDayData(currentDataKey, data)} // ⭐ USE COMPOUND KEY
            onAddClick={() => setIsSheetOpen(true)}
            selectedSection={selectedSection}
            onSectionSelect={setSelectedSection}
          />
        </div>

        {/* Right Column: Day Summary */}
        <div className="hidden lg:block lg:col-span-1 border-l border-border min-h-full overflow-y-auto">
          <MentalHealthSummary data={currentDayData} activeDay={activeDay} />
        </div>
      </div>

      {/* Mobile / Tablet Bottom Drawer (Reused Sheet structure) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] overflow-hidden pb-safe">
          <SheetHeader className="pb-4 border-b sticky top-0 bg-background z-10">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-2" />
            <SheetTitle className="text-lg font-semibold">Add Mental Activity</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-80px)] overflow-hidden mt-4">
            <MentalHealthLibrary
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onSelect={handleSelectActivity}
              onSearch={handleSearch}
              allActivities={mentalHealthItems}
            />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default MentalHealthBuilder;
