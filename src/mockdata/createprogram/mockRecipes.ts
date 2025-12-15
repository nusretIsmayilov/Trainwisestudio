// src/mockdata/createprogram/mockRecipes.ts

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'nightsnack' | 'smoothie' | 'pre-workout' | 'post-workout';
export type IngredientType = 'chicken' | 'meat' | 'vegetables' | 'fish' | 'vegan' | 'dessert';

export interface RecipeItem {
  id: string;
  name: string;
  description: string;
  mealTypes: MealType[];
  ingredientTypes: IngredientType[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const mockRecipes: RecipeItem[] = [
  {
    id: 'rec1',
    name: 'Overnight Oats',
    description: 'Quick and easy protein-rich breakfast.',
    mealTypes: ['breakfast', 'snack'],
    ingredientTypes: ['vegan'],
    calories: 350,
    protein: 20,
    carbs: 45,
    fat: 10,
  },
  {
    id: 'rec2',
    name: 'Grilled Chicken Salad',
    description: 'Lean protein and fresh greens.',
    mealTypes: ['lunch', 'dinner'],
    ingredientTypes: ['chicken', 'vegetables'],
    calories: 400,
    protein: 45,
    carbs: 15,
    fat: 18,
  },
  {
    id: 'rec3',
    name: 'Steak & Asparagus',
    description: 'Classic high-protein dinner.',
    mealTypes: ['dinner'],
    ingredientTypes: ['meat', 'vegetables'],
    calories: 650,
    protein: 55,
    carbs: 10,
    fat: 40,
  },
  {
    id: 'rec4',
    name: 'Protein Smoothie',
    description: 'Perfect for a quick post-workout refuel.',
    mealTypes: ['smoothie', 'pre-workout', 'post-workout'],
    ingredientTypes: ['vegan'],
    calories: 250,
    protein: 30,
    carbs: 25,
    fat: 5,
  },
  {
    id: 'rec5',
    name: 'Tuna Wrap',
    description: 'A light and convenient lunch.',
    mealTypes: ['lunch', 'snack'],
    ingredientTypes: ['fish'],
    calories: 300,
    protein: 25,
    carbs: 30,
    fat: 8,
  },
  {
    id: 'rec6',
    name: 'Fruit and Yogurt Parfait',
    description: 'A refreshing light night snack.',
    mealTypes: ['nightsnack', 'snack'],
    ingredientTypes: ['dessert'],
    calories: 180,
    protein: 10,
    carbs: 30,
    fat: 2,
  },
];
