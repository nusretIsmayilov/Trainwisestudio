// src/mockdata/viewprograms/mocknutritionprograms.ts

import { findRecipeById, Recipe } from "@/mockdata/library/mockrecipes";

export interface Meal {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipeId: string;
  // For convenience, we can resolve the recipe here
  recipe: Recipe | undefined;
  // Required for carousel component
  imageUrl: string;
  isCompleted: boolean;
}

export interface DetailedNutritionTask {
  id: string;
  type: 'nutrition'; // Important for dynamic rendering
  title: string;
  coachNotes: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
}

const mockDetailedNutritionPrograms: DetailedNutritionTask[] = [
  {
    id: "n-1",
    type: 'nutrition',
    title: "Lean Gain Meal Plan",
    coachNotes: "Make sure to drink at least 3L of water today. You can swap the chicken for fish if you prefer.",
    totalCalories: 2400,
    totalProtein: 180,
    meals: [
      { 
        id: "meal-1", 
        mealType: "Breakfast", 
        recipeId: "recipe-2", 
        recipe: findRecipeById("recipe-2"),
        imageUrl: "/images/breakfast.jpg",
        isCompleted: false
      },
      { 
        id: "meal-2", 
        mealType: "Lunch", 
        recipeId: "recipe-1", 
        recipe: findRecipeById("recipe-1"),
        imageUrl: "/images/lunch.jpg",
        isCompleted: false
      },
      // Add more meals for dinner, snacks etc.
    ]
  }
];

export const findNutritionProgramById = (id: string): DetailedNutritionTask | undefined => {
  return mockDetailedNutritionPrograms.find((p) => p.id === id);
};
