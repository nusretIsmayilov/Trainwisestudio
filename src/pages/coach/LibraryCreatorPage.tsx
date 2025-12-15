'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LibraryItem, LibraryCategory } from '@/mockdata/library/mockLibrary';
import ExerciseForm from '@/components/coach/library/creation/ExerciseForm';
import RecipeForm from '@/components/coach/library/creation/RecipeForm';
import MentalHealthForm from '@/components/coach/library/creation/MentalHealthForm';
import LibraryCreationWrapper from '@/components/coach/library/creation/LibraryCreationWrapper';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';

interface LibraryCreatorPageProps {
  onBack: () => void;
  onSubmit: (item: LibraryItem) => void;
  initialItem: Partial<LibraryItem> | null;
  activeCategory: LibraryCategory;
}

const LibraryCreatorPage: React.FC<LibraryCreatorPageProps> = ({ onBack, onSubmit, initialItem, activeCategory }) => {
  const { upsertItem } = useCoachLibrary();
  const [formData, setFormData] = useState<Partial<LibraryItem>>({});

  useEffect(() => {
    const baseData = { category: activeCategory, isCustom: true };
    setFormData(initialItem ? { ...baseData, ...initialItem } : baseData);
  }, [initialItem, activeCategory]);

  const handleFormChange = useCallback((field: keyof LibraryItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.introduction) {
      alert("Please fill in Name and Introduction.");
      return;
    }
    
    // Build details per category
    let details: any = {};
    if (activeCategory === 'exercise') {
      details = {
        muscleGroup: (formData as any).muscleGroup || '',
        howTo: (formData as any).howTo || [],
      };
    } else if (activeCategory === 'recipe') {
      details = {
        allergies: (formData as any).allergies || '',
        ingredients: (formData as any).ingredients || [],
        stepByStep: (formData as any).stepByStep || [],
      };
    } else if (activeCategory === 'mental health') {
      details = {
        content: (formData as any).content || [],
      };
    }

    await upsertItem({
      id: (formData as any).id,
      name: formData.name,
      category: activeCategory,
      introduction: formData.introduction,
      hero_image_url: (formData as any).heroImageUrl || null,
      details,
    } as any);

    onSubmit({ ...(formData as any), category: activeCategory } as LibraryItem);
  };

  const renderForm = () => {
    // Note: Type casting is necessary here because TypeScript doesn't know the exact item structure until runtime
    const castedFormChange = handleFormChange as any; 

    switch (activeCategory) {
      case 'exercise':
        return <ExerciseForm formData={formData as any} onFormChange={castedFormChange} />;
      case 'recipe':
        return <RecipeForm formData={formData as any} onFormChange={castedFormChange} />;
      case 'mental health':
        return <MentalHealthForm formData={formData as any} onFormChange={castedFormChange} />;
      default:
        return <div>Select a category first.</div>;
    }
  };

  const isEditing = !!initialItem?.id;

  return (
    <LibraryCreationWrapper
      category={activeCategory}
      isEditing={isEditing}
      onBack={onBack}
      onSubmit={handleSubmit}
      // Pass state handlers to the wrapper for Hero Image control
      formData={formData}
      onFormChange={handleFormChange}
    >
      {renderForm()}
    </LibraryCreationWrapper>
  );
};

export default LibraryCreatorPage;
