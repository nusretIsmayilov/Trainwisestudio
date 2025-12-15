// src/components/customer/library/recipe/RecipeDetails.tsx

import { useState, useMemo } from "react";
import { Recipe } from "@/mockdata/library/mockrecipes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, ChefHat, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper and KeyStat components remain the same...
const formatQuantity = (quantity: number, unit: string) => {
  if (quantity === 0) return "0";
  let displayQuantity;
  const pluralUnit =
    quantity > 1 && unit && !unit.endsWith("s") ? `${unit}s` : unit;
  if (unit === "handful" || unit === "scoop") {
    displayQuantity = Math.round(quantity);
    return `${displayQuantity} ${pluralUnit}`;
  }
  if (quantity < 0.1 && quantity > 0) displayQuantity = quantity.toFixed(2);
  else if (quantity < 1)
    displayQuantity = (Math.round(quantity * 100) / 100).toString();
  else
    displayQuantity = (Math.round(quantity * 100) / 100)
      .toString()
      .replace(/\.00$/, "");

  return `${displayQuantity} ${unit}`;
};

const KeyStat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <Icon className="w-6 h-6 text-primary" />
    <span className="font-bold text-base text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const [portions, setPortions] = useState(recipe.servings);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(
    new Array(recipe.instructions.length).fill(false)
  );

  const handleToggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const newCheckedState = [...prev];
      newCheckedState[index] = !newCheckedState[index];
      return newCheckedState;
    });
  };

  const { adjustedIngredients, adjustedNutrition } = useMemo(() => {
    const ratio = portions / recipe.servings;
    return {
      adjustedIngredients: recipe.ingredients.map((ing) => ({
        ...ing,
        quantity: ing.quantity * ratio,
      })),
      adjustedNutrition: {
        calories: recipe.calories * ratio,
      },
    };
  }, [portions, recipe]);

  return (
    // ✅ NEW main container inspired by FitnessProgramView
    <div className="w-full space-y-6">
        {/* ✅ Image now has responsive sizing */}
        <div className="w-full sm:max-w-2xl sm:mx-auto aspect-square sm:aspect-video overflow-hidden rounded-2xl bg-muted shadow-lg">
            <img 
                src={recipe.imageUrl} 
                alt={recipe.name}
                className="w-full h-full object-cover"
            />
        </div>

        {/* ✅ Content container with responsive card layout */}
        <div className={cn(
            "space-y-6 px-4", // Base padding for mobile
            "sm:bg-card sm:p-6 sm:rounded-2xl sm:border" // Card layout for desktop
        )}>
            <div className="flex justify-center">
                <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-full shadow-sm">
                    <Button onClick={() => setPortions((p) => Math.max(1, p - 1))} size="icon" variant="ghost" className="rounded-full h-10 w-10">
                        <Minus className="w-5 h-5" />
                    </Button>
                    <span className="font-bold text-xl w-12 text-center">{portions}</span>
                    <Button onClick={() => setPortions((p) => p + 1)} size="icon" variant="ghost" className="rounded-full h-10 w-10">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight">{recipe.name}</h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">{recipe.description}</p>
            </div>

            <div className="flex justify-around items-center p-4 bg-background rounded-2xl">
                <KeyStat icon={Clock} value={recipe.prepTime} label="Prep" />
                <KeyStat icon={ChefHat} value={recipe.cookTime} label="Cook" />
                <KeyStat icon={Flame} value={`${Math.round(adjustedNutrition.calories)}`} label="Calories"/>
            </div>

            <div>
                <Tabs defaultValue="ingredients">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                        <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients" className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Ingredients for {portions} serving{portions > 1 && "s"}</h3>
                        <ul className="space-y-3">
                        {adjustedIngredients.map((ing, index) => (
                            <li key={index} className="flex justify-between items-center text-base p-3 bg-background rounded-lg">
                            <span className="text-muted-foreground">{ing.name}</span>
                            <span className="font-semibold text-primary">{formatQuantity(ing.quantity, ing.unit)}</span>
                            </li>
                        ))}
                        </ul>
                    </TabsContent>
                    <TabsContent value="instructions" className="pt-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Instructions</h3>
                        <ol className="space-y-4">
                        {recipe.instructions.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                            <Checkbox id={`step-${index}`} checked={checkedSteps[index]} onCheckedChange={() => handleToggleStep(index)} className="mt-1 h-5 w-5 shrink-0"/>
                            <label htmlFor={`step-${index}`} className={cn("text-base leading-relaxed text-muted-foreground", checkedSteps[index] && "line-through opacity-60")}>
                                {step}
                            </label>
                            </li>
                        ))}
                        </ol>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  );
}
