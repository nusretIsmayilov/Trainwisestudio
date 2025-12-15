// src/mockdata/library/mockrecipes.ts

// ✅ UPDATED Ingredient Interface
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string; // Changed from title to name to match existing file
  imageUrl: string;
  description: string;
  servings: number; // ✅ ADDED: Base serving size for calculations
  prepTime: string;
  cookTime: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: Ingredient[]; // ✅ UPDATED to use new Ingredient interface
  instructions: string[];
}

export const mockRecipes: Recipe[] = [
  {
    id: "recipe-1",
    name: "Grilled Chicken Salad",
    imageUrl: "/images/recipes/grilled-chicken-salad.png",
    description: "A light and refreshing salad, perfect for a post-workout lunch.",
    servings: 1, // ✅ ADDED
    prepTime: "10 min",
    cookTime: "15 min",
    calories: 450,
    protein: 40,
    carbs: 15,
    fats: 25,
    // ✅ UPDATED Ingredients
    ingredients: [
      { name: "Chicken Breast", quantity: 200, unit: "g" },
      { name: "Mixed Greens", quantity: 100, unit: "g" },
      { name: "Cherry Tomatoes", quantity: 50, unit: "g" },
      { name: "Cucumber, sliced", quantity: 0.25, unit: "" },
      { name: "Olive Oil Vinaigrette", quantity: 2, unit: "tbsp" },
    ],
    instructions: [
      "Season the chicken breast with salt and pepper.",
      "Grill the chicken for 6-8 minutes per side, until cooked through.",
      "While the chicken is cooking, combine the mixed greens, cherry tomatoes, and cucumber in a large bowl.",
      "Once cooked, let the chicken rest for a few minutes before slicing it.",
      "Add the sliced chicken to the salad, drizzle with vinaigrette, and toss to combine.",
    ],
  },
  {
    id: "recipe-2",
    name: "Protein Oats",
    imageUrl: "/images/recipes/protein-oats.png",
    description: "A hearty and protein-packed breakfast to start your day strong.",
    servings: 1, // ✅ ADDED
    prepTime: "5 min",
    cookTime: "5 min",
    calories: 380,
    protein: 30,
    carbs: 50,
    fats: 8,
    // ✅ UPDATED Ingredients
    ingredients: [
      { name: "Rolled Oats", quantity: 50, unit: "g" },
      { name: "Whey Protein (Vanilla)", quantity: 1, unit: "scoop" },
      { name: "Almond Milk", quantity: 150, unit: "ml" },
      { name: "Chia Seeds", quantity: 1, unit: "tbsp" },
      { name: "Berries for topping", quantity: 1, unit: "handful" },
    ],
    instructions: [
      "Combine oats and almond milk in a saucepan and cook over medium heat.",
      "Once the oats start to thicken, remove from heat and stir in the whey protein and chia seeds.",
      "Mix until smooth and well combined.",
      "Transfer to a bowl and top with your favorite berries.",
    ],
  },
];

export const findRecipeById = (id: string): Recipe | undefined => {
  return mockRecipes.find((r) => r.id === id);
};
