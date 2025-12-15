// src/components/coach/createprogram/nutrition/RecipeLibrary.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Utensils, Zap, X, Soup, Heart } from 'lucide-react';
import { RecipeItem, MealType, IngredientType } from '@/mockdata/createprogram/mockRecipes';
import { cn } from '@/lib/utils';
import { mockRecipes } from '@/mockdata/createprogram/mockRecipes';

interface RecipeLibraryProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: RecipeItem[];
  onSelect: (item: RecipeItem) => void;
  onSearch: (query: string, mealTypeFilter?: MealType | 'all', ingredientType?: IngredientType | 'all') => void;
  allRecipes: RecipeItem[];
}

const getIconForType = (type: MealType) => {
  // Keeping the original colored icons for differentiation
  switch (type) {
    case 'breakfast': return <Utensils className="h-4 w-4 text-orange-600" />;
    case 'lunch': return <Soup className="h-4 w-4 text-green-600" />;
    case 'dinner': return <Heart className="h-4 w-4 text-red-600" />;
    case 'snack':
    case 'nightsnack':
    case 'smoothie':
    case 'pre-workout':
    case 'post-workout':
    default: return <Zap className="h-4 w-4 text-yellow-600" />;
  }
};

const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelect,
  onSearch,
  allRecipes,
}) => {
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'all'>('all');
  const [ingredientTypeFilter, setIngredientTypeFilter] = useState<IngredientType | 'all'>('all');

  const uniqueIngredientTypes = React.useMemo(() => {
    const groups = new Set<IngredientType>();
    allRecipes.forEach(recipe => {
      recipe.ingredientTypes.forEach(group => groups.add(group));
    });
    return Array.from(groups).sort();
  }, [allRecipes]);
  
  const mealTypeOptions: (MealType | 'all')[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'nightsnack', 'smoothie', 'pre-workout', 'post-workout'];


  useEffect(() => {
    onSearch(searchQuery, mealTypeFilter, ingredientTypeFilter);
  }, [searchQuery, mealTypeFilter, ingredientTypeFilter, onSearch]);

  const handleClearFilters = () => {
    setMealTypeFilter('all');
    setIngredientTypeFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = mealTypeFilter !== 'all' || ingredientTypeFilter !== 'all' || searchQuery.length > 0;

  return (
    // P-3/4 for mobile/tablet, P-2 for desktop, space-y-3/4/2
    <div className="space-y-3 sm:space-y-4 lg:space-y-2 h-full flex flex-col p-3 sm:p-4 lg:p-2"> 
      <h3 className="text-lg sm:text-xl lg:text-sm font-bold text-foreground">Recipe Library</h3>

      {/* Search + Filter Row - Matched sizing from ExerciseLibrary */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {/* Matched input sizing and text size */}
          <Input 
            placeholder="Search recipes, ingredients, macros..."
            className="pl-9 w-full h-11 sm:h-10 lg:h-11 xl:h-12 text-base sm:text-sm lg:text-base xl:text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Section - Matched responsive layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:gap-3">
          <div className="flex gap-2 flex-1 lg:flex-col lg:gap-2">
            
            {/* Meal Type Filter - Matched height and font sizing */}
            <Select value={mealTypeFilter} onValueChange={(val) => setMealTypeFilter(val as MealType | 'all')}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-9 text-base sm:text-sm lg:text-sm capitalize">
                <Filter className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground mr-2" />
                <SelectValue placeholder="Meal Type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypeOptions.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ingredient Type Filter - Matched height and font sizing */}
            <Select value={ingredientTypeFilter} onValueChange={(value) => setIngredientTypeFilter(value as IngredientType | 'all')}>
              <SelectTrigger className="flex-1 sm:w-44 lg:w-full h-11 sm:h-10 lg:h-8 text-base sm:text-sm lg:text-xs capitalize">
                <Soup className="h-4 w-4 lg:h-3 lg:w-3 text-muted-foreground mr-2" />
                <SelectValue placeholder="Ingredient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ingredients</SelectItem>
                {uniqueIngredientTypes.map((group) => (
                  <SelectItem key={group} value={group} className="capitalize">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button - Matched sizing and text size */}
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

        {/* Active Filters Summary - Matched sizing and text size */}
        {hasActiveFilters && (
          <div className="text-sm sm:text-xs lg:text-xs text-muted-foreground px-1 lg:px-1">
            <span className="font-medium">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Recipe Cards - Matched sizing and padding from ExerciseLibrary */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 lg:space-y-1 pr-1 sm:pr-2 lg:pr-1">
        <AnimatePresence>
          {searchResults.length > 0 ? (
            searchResults.map((recipe) => (
              <motion.div
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                // Matched padding and min-height
                className="group flex items-center gap-3 sm:gap-4 lg:gap-2 p-4 lg:p-2 rounded-xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 min-h-[80px] sm:min-h-[64px] lg:min-h-[60px] touch-manipulation active:scale-[0.98] hover:bg-card/80"
              >
                {/* Image Placeholder - Matched sizing */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-10 lg:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl text-primary/70 group-hover:scale-105 transition-transform duration-300">
                  {getIconForType(recipe.mealTypes[0])}
                </div>

                {/* Content - Matched sizing and font size */}
                <div className="flex-1 flex flex-col justify-center min-w-0 gap-1 lg:gap-1">
                  <div className="flex items-start justify-between mb-1 sm:mb-1 lg:mb-1">
                    {/* Matched title font size */}
                    <h4 className="text-base sm:text-sm lg:text-xs font-semibold text-foreground leading-tight pr-2 group-hover:text-primary transition-colors duration-200 truncate">
                      {recipe.name}
                    </h4>
                    <span
                      // Matched badge font size and padding
                      className="text-xs lg:text-xs px-2 py-1 lg:px-1 lg:py-0.5 rounded-full font-medium capitalize flex items-center gap-1 lg:gap-1 shrink-0 shadow-sm bg-blue-100 text-blue-700"
                    >
                       {getIconForType(recipe.mealTypes[0])} 
                      <span className="hidden sm:inline-block lg:hidden">{recipe.mealTypes[0].replace('-', ' ')}</span>
                    </span>
                  </div>
                   {/* Matched description font size */}
                  <p className="text-sm sm:text-xs lg:text-xs text-muted-foreground leading-relaxed">
                    {recipe.description && recipe.description.length > 0 
                      ? `${recipe.description.slice(0, 30)}${recipe.description.length > 30 ? '...' : ''}`
                      : `${recipe.ingredientTypes.slice(0, 1).join(', ')}${recipe.ingredientTypes.length > 1 ? '...' : ''}`
                    }
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 hidden lg:block">
                    {/* Detailed macros hidden on narrow desktop to match exercise library complexity reduction */}
                    {recipe.calories} Cal | P: {recipe.protein}g
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="p-8 sm:p-4 lg:p-4 text-center text-muted-foreground">
              <div className="text-base sm:text-sm lg:text-sm font-medium">
                {searchQuery.length > 2
                  ? 'No recipes found'
                  : 'Search recipes...'}
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

export default RecipeLibrary;
