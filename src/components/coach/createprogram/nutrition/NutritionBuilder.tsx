// src/components/coach/createprogram/nutrition/NutritionBuilder.tsx
// Updated: 2024-01-15 15:30:00
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DateCircles from '../builders/DateCircles'; // Reused
import RecipeLibrary from './RecipeLibrary'; // New
import NutritionDay, { NutritionDayItem, MealSection } from './NutritionDay'; // New
import NutritionSummary from './NutritionSummary'; // New/Adapted
import { RecipeItem, MealType, IngredientType, mockRecipes } from '@/mockdata/createprogram/mockRecipes';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';

// Helper function to create a unique key for data storage
const getDataKey = (week: number, day: string) => `W${week}_${day}`;
const INITIAL_WEEK_DAY = 'Monday';

// Initial state for a day's nutrition plan
const initialDayData = (): { [key in MealSection]: NutritionDayItem[] } => ({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    nightsnack: [],
});

interface NutritionBuilderProps {
  onBack: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const NutritionBuilder: React.FC<NutritionBuilderProps> = ({ onBack, onSave, initialData }) => {
  // ⭐ ADD WEEK STATE
  const [activeWeek, setActiveWeek] = useState(1); 
  const [activeDay, setActiveDay] = useState(INITIAL_WEEK_DAY);
  
  // ⭐ UPDATE DATA STRUCTURE to use the compound key: { "W#_DayName": { breakfast: [] } }
  const [nutritionData, setNutritionData] = useState<{ [key: string]: { [key in MealSection]: NutritionDayItem[] } }>(() => {
    // Ensure we always have a valid object, even if initialData is undefined
    return initialData && typeof initialData === 'object' ? initialData : {};
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<MealSection>('breakfast');
  const { items: libraryItems, loading: libraryLoading } = useCoachLibrary();
  
  // Filter library items for recipes only and convert type
  const recipeItems: RecipeItem[] = libraryItems
    .filter(item => item.category === 'recipe')
    .map(item => {
      const details = (item.details as any) || {};
      // Derive ingredient types from actual ingredients if ingredient_types is not set
      const ingredients = details.ingredients || [];
      let ingredientTypes: IngredientType[] = details.ingredient_types || [];
      
      // If no ingredient_types, try to derive from ingredient names
      if (ingredientTypes.length === 0 && ingredients.length > 0) {
        const ingredientNames = ingredients.map((ing: any) => 
          (ing.name || ing).toLowerCase()
        ).join(' ');
        
        // Simple keyword matching to derive ingredient types
        if (ingredientNames.includes('chicken') || ingredientNames.includes('poultry')) {
          ingredientTypes.push('chicken');
        }
        if (ingredientNames.includes('beef') || ingredientNames.includes('steak') || ingredientNames.includes('pork') || ingredientNames.includes('lamb')) {
          ingredientTypes.push('meat');
        }
        if (ingredientNames.includes('fish') || ingredientNames.includes('salmon') || ingredientNames.includes('tuna') || ingredientNames.includes('seafood')) {
          ingredientTypes.push('fish');
        }
        if (ingredientNames.includes('vegetable') || ingredientNames.includes('lettuce') || ingredientNames.includes('spinach') || ingredientNames.includes('broccoli') || ingredientNames.includes('carrot')) {
          ingredientTypes.push('vegetables');
        }
        if (ingredientNames.includes('vegan') || (ingredientNames.includes('tofu') && !ingredientNames.includes('chicken') && !ingredientNames.includes('meat'))) {
          ingredientTypes.push('vegan');
        }
        if (ingredientNames.includes('dessert') || ingredientNames.includes('sweet') || ingredientNames.includes('cake') || ingredientNames.includes('cookie')) {
          ingredientTypes.push('dessert');
        }
        
        // Default to vegetables if nothing matched
        if (ingredientTypes.length === 0) {
          ingredientTypes.push('vegetables');
        }
      }
      
      // Default meal types if not set
      let mealTypes: MealType[] = details.meal_types || [];
      if (mealTypes.length === 0) {
        // Default to lunch/dinner for most recipes
        mealTypes = ['lunch', 'dinner'];
      }
      
      return {
        id: item.id,
        name: item.name,
        description: item.introduction || '',
        mealTypes: mealTypes,
        ingredientTypes: ingredientTypes,
        calories: details.calories || 0,
        protein: details.protein || 0,
        carbs: details.carbs || 0,
        fat: details.fat || 0,
        prepTime: details.prep_time,
        cookTime: details.cook_time,
        servings: details.servings,
        difficulty: details.difficulty,
        content: (item as any).content
      } as RecipeItem;
    });
  
  // Merge with mock recipes to ensure we always have some recipes with ingredient types
  const allRecipeItems = [...recipeItems, ...mockRecipes];
  const [searchResults, setSearchResults] = useState<RecipeItem[]>(allRecipeItems);
  
  // ⭐ CALCULATE UNIQUE KEY
  const currentDataKey = getDataKey(activeWeek, activeDay); 

  // ⭐ DATA INDICATORS for DateCircles (shows which days have data) - FIXED v2
  const dataIndicators = Object.keys(nutritionData || {}).reduce((acc, key) => {
    const hasData = Object.values(nutritionData[key] || {}).some(mealItems => mealItems.length > 0);
    acc[key] = hasData;
    return acc;
  }, {} as { [key: string]: boolean });

  // Ensure initial data exists for the current W#_DayName
  useEffect(() => {
    if (!nutritionData[currentDataKey]) {
        setNutritionData(prev => ({
            ...prev,
            [currentDataKey]: initialDayData(),
        }));
    }
  }, [currentDataKey, nutritionData]);

  // Handle data update for the active day/week using compound key
  const handleUpdateDayData = useCallback((key: string, data: { [key in MealSection]: NutritionDayItem[] }) => {
    setNutritionData(prevData => ({
      ...prevData,
      [key]: data,
    }));
  }, []);

  // ⭐ NEW HANDLER for week change
  const handleWeekChange = useCallback((week: number) => {
    setActiveWeek(week);
    setActiveDay(INITIAL_WEEK_DAY); // Reset to Monday when week changes
  }, []);

  // Handle recipe search with enhanced filtering
  const handleSearch = useCallback((query: string, mealTypeFilter?: MealType | 'all', ingredientType?: IngredientType | 'all') => {
    let filtered = allRecipeItems;

    if (mealTypeFilter && mealTypeFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.mealTypes?.includes(mealTypeFilter as MealType));
    }

    if (ingredientType && ingredientType !== 'all') {
      filtered = filtered.filter(recipe => recipe.ingredientTypes?.includes(ingredientType as IngredientType));
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm) ||
        recipe.ingredientTypes?.some(type => type.toLowerCase().includes(searchTerm))
      );
    }

    setSearchResults(filtered);
  }, [allRecipeItems]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleSelectRecipe = (recipe: RecipeItem) => {
    const newItem: NutritionDayItem = {
      id: `${recipe.id}-${Date.now()}`,
      recipe: recipe,
      time: '', 
      comment: '',
      portionSize: '1 serving', 
    };
    
    // Always add to the currently selected section (free assignment)
    const targetSection = selectedSection;

    // ⭐ USE COMPOUND KEY for data retrieval/update
    const currentDayData = nutritionData[currentDataKey] || initialDayData();
    const itemsForSection = currentDayData[targetSection]
        ? [...currentDayData[targetSection], newItem]
        : [newItem];
        
    handleUpdateDayData(currentDataKey, { ...currentDayData, [targetSection]: itemsForSection });
    setIsSheetOpen(false);
  };
  
  const currentDayData = nutritionData[currentDataKey] || initialDayData(); // ⭐ USE COMPOUND KEY for current day data

  // Helper function to open the sheet 
  const handleOpenSheet = () => {
      setIsSheetOpen(true); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col"
    >
      {/* Global Header */}
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
          onClick={() => onSave(nutritionData)} // Pass all data (containing W#_DayName keys)
          className="gap-2 shrink-0"
        >
          <Check className="h-4 w-4" /> Save Program
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 lg:gap-4 bg-card rounded-xl shadow-md border overflow-hidden lg:h-[calc(100vh-8rem)]">
        
        {/* Date Selector Header (Desktop only) */}
        <div className="lg:col-span-5 border-b border-border p-4 lg:sticky lg:top-0 bg-card z-10">
          <DateCircles 
            activeDay={activeDay} 
            onDayChange={setActiveDay} 
            // ⭐ PASS NEW WEEK PROPS
            activeWeek={activeWeek}
            onWeekChange={handleWeekChange}
            dataIndicators={dataIndicators}
          />
        </div>

        {/* Left Column: Recipe Library (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1 border-r border-border bg-muted/20 lg:sticky lg:top-[60px] lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
          <RecipeLibrary
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSelect={handleSelectRecipe}
            onSearch={handleSearch}
            allRecipes={allRecipeItems}
          />
        </div>

        {/* Middle Column: Nutrition Day */}
        <div className="lg:col-span-3 flex-1 p-4 md:p-6 lg:p-8 space-y-4 overflow-y-auto">
          {/* Date selector (mobile/tablet only) - Needs the same props now */}
          <div className="mb-4 lg:hidden">
            <DateCircles 
              activeDay={activeDay} 
              onDayChange={setActiveDay} 
              activeWeek={activeWeek}
              onWeekChange={handleWeekChange}
            />
          </div>

          <NutritionDay
            // ⭐ UPDATE DISPLAY NAME
            day={`Week ${activeWeek} - ${activeDay}`}
            data={currentDayData}
            onDataChange={data => handleUpdateDayData(currentDataKey, data)} // ⭐ USE COMPOUND KEY
            onAddClick={handleOpenSheet}
            selectedSection={selectedSection}
            onSectionSelect={setSelectedSection}
          />
        </div>

        {/* Right Column: Day Summary (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1 border-l border-border min-h-full overflow-y-auto">
          <NutritionSummary data={currentDayData} activeDay={activeDay} />
        </div>
      </div>

      {/* Mobile / Tablet Bottom Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] overflow-hidden pb-safe">
          <SheetHeader className="pb-4 border-b sticky top-0 bg-background z-10">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-2" />
            <SheetTitle className="text-lg font-semibold">Add Recipe</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-80px)] overflow-hidden mt-4">
            <RecipeLibrary
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onSelect={handleSelectRecipe}
              onSearch={handleSearch}
              allRecipes={allRecipeItems}
            />
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default NutritionBuilder;
