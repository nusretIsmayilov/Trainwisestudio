import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RecipeItem, Ingredient } from '@/mockdata/library/mockLibrary';
import { Lightbulb, Plus, Trash2, Salad, Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentUploadSection from './ContentUploadSection';

interface RecipeFormProps {
  formData: Partial<RecipeItem>;
  onFormChange: (field: keyof RecipeItem, value: any) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ formData, onFormChange }) => {
  const ingredients: Ingredient[] = formData.ingredients || [];
  
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = ingredients.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    ));
    onFormChange('ingredients', newIngredients);
  };

  const addIngredient = () => {
    onFormChange('ingredients', [...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index: number) => {
    onFormChange('ingredients', ingredients.filter((_, i) => i !== index));
  };
  
  const steps: string[] = formData.stepByStep || [];
  
  const handleStepChange = (index: number, value: string) => {
    const newSteps = steps.map((item, i) => (
      i === index ? value : item
    ));
    onFormChange('stepByStep', newSteps);
  };
  
  const addStep = () => {
    onFormChange('stepByStep', [...steps, '']);
  };
  
  const removeStep = (index: number) => {
    onFormChange('stepByStep', steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recipe Details</h2>

      {/* Core Fields */}
      <div className="space-y-2">
        <Label htmlFor="name">Recipe Name</Label>
        <Input id="name" value={formData.name || ''} onChange={(e) => onFormChange('name', e.target.value)} placeholder="e.g., High-Protein Salmon Bowl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="introduction">Introduction / Description</Label>
        <Textarea id="introduction" value={formData.introduction || ''} onChange={(e) => onFormChange('introduction', e.target.value)} placeholder="Quick description, e.g., High protein, low carb meal prep." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies / Dietary Notes (Target)</Label>
        <Input id="allergies" value={formData.allergies || ''} onChange={(e) => onFormChange('allergies', e.target.value)} placeholder="e.g., Gluten-Free, Contains Nuts, Vegan" />
      </div>
      
      {/* Ingredients List (FIXED: Dedicated fields for Qty and Name) */}
      <div className="space-y-4 p-4 rounded-xl border bg-muted/10">
        <h3 className="text-xl font-bold flex justify-between items-center text-primary">
            INGREDIENTS LIST 🔪
            <Button variant="default" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
        </h3>
        {ingredients.map((item, index) => (
          <div key={index} className="flex gap-3 items-center p-2 border-b last:border-b-0">
            <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center"><Scale className="h-3 w-3 mr-1" /> Qty</Label>
                <Input 
                  value={item.quantity} 
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} 
                  placeholder="e.g., 150g or 1 cup" 
                />
            </div>
            <div className="flex-[3] space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center"><Salad className="h-3 w-3 mr-1" /> Item Name</Label>
                {/* Simulated Selector for intuitive experience */}
                <Input 
                  value={item.name} 
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} 
                  placeholder="e.g., Tomato (or Banana, Chicken Breast)" 
                />
            </div>
            <Button variant="destructive" size="icon" className="h-10 w-10 flex-shrink-0 self-end" onClick={() => removeIngredient(index)}>
                <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Image/Video uploads only - no content field for recipes */}
      <ContentUploadSection
        content={[]} 
        onContentChange={() => {}} 
        allowedTypes={['image', 'video']} 
      />
      
      {/* Recipe Steps (Now using the old Recipe model structure but with the new, prominent Step-by-Step look) */}
      <div className="space-y-5 border-t pt-5">
              <h4 className="text-xl font-bold flex justify-between items-center text-primary">
                  Step by step instructions 👣
                  <Button variant="default" onClick={addStep}>+ Add Step</Button>
              </h4>
              {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-card rounded-lg shadow-inner border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold mt-1">{index + 1}</div>
                      <Textarea 
                          value={step} 
                          onChange={(e) => handleStepChange(index, e.target.value)} 
                          placeholder={`Step ${index + 1} instructions`}
                          className="flex-grow min-h-[60px]"
                      />
                      <Button variant="ghost" size="icon" className="flex-shrink-0 mt-1 text-destructive hover:bg-destructive/10" onClick={() => removeStep(index)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
              ))}
      </div>

      {/* Pro Tip Section */}
      <div className="space-y-2 p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/10">
        <Label htmlFor="proTip" className="flex items-center text-yellow-600 font-semibold">
          <Lightbulb className="w-5 h-5 mr-2" /> Pro Tip
        </Label>
        <Textarea id="proTip" value={formData.proTip || ''} onChange={(e) => onFormChange('proTip', e.target.value)} placeholder="Advice for best results, e.g., 'Use a high-quality olive oil for better flavor.'" />
      </div>
    </div>
  );
};

export default RecipeForm;
