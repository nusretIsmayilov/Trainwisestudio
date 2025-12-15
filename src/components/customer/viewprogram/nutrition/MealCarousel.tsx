// src/components/customer/viewprogram/nutrition/MealCarousel.tsx

import { Meal } from "@/mockdata/viewprograms/mocknutritionprograms";
import ItemCarousel, { CarouselItem } from '../shared/ItemCarousel';

interface MealCarouselProps {
  meals: Meal[];
  selectedMealId: string;
  onSelectMeal: (id: string) => void;
}

export default function MealCarousel({ meals, selectedMealId, onSelectMeal }: MealCarouselProps) {
  // Transform specific meal data into the generic format
  const carouselItems: CarouselItem[] = meals.map(meal => ({
    id: meal.id,
    imageUrl: meal.imageUrl, // Assumes you've added this to your Meal type
    label: meal.mealType,    // Shows "Breakfast", "Lunch", etc.
    isCompleted: meal.isCompleted, // Assumes this property exists
  }));
  
  return (
    <ItemCarousel 
      items={carouselItems}
      selectedItemId={selectedMealId}
      onSelectItem={onSelectMeal}
    />
  );
}
