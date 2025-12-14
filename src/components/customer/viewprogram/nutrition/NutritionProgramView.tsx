// src/components/customer/viewprogram/nutrition/NutritionProgramView.tsx

import { useState, useEffect } from "react";
import { DetailedNutritionTask } from "@/mockdata/viewprograms/mocknutritionprograms";
import MealCarousel from "./MealCarousel";
import GuideDrawer from "../shared/GuideDrawer";
import RecipeDetails from "@/components/customer/library/recipe/RecipeDetails";

interface NutritionProgramViewProps {
  nutritionData: DetailedNutritionTask;
}

export default function NutritionProgramView({ nutritionData }: NutritionProgramViewProps) {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(
    nutritionData.meals.length > 0 ? nutritionData.meals[0].id : null
  );
  // ✅ UPDATED breakpoint to 768px
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // ✅ UPDATED breakpoint to 768px
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedMeal = nutritionData.meals.find(m => m.id === selectedMealId);
  const selectedRecipe = selectedMeal?.recipe;

  return (
    <main className="w-full space-y-10">
      <MealCarousel
        meals={nutritionData.meals}
        selectedMealId={selectedMealId!}
        onSelectMeal={setSelectedMealId}
      />
      
      <GuideDrawer
        guideData={selectedRecipe}
        isMobile={isMobile}
        triggerText="View Recipe:"
      >
        {selectedRecipe && <RecipeDetails recipe={selectedRecipe} />}
      </GuideDrawer>
    </main>
  );
}
