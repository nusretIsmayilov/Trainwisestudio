"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LibraryItem, LibraryCategory } from "@/mockdata/library/mockLibrary";
import ExerciseForm from "@/components/coach/library/creation/ExerciseForm";
import RecipeForm from "@/components/coach/library/creation/RecipeForm";
import MentalHealthForm from "@/components/coach/library/creation/MentalHealthForm";
import LibraryCreationWrapper from "@/components/coach/library/creation/LibraryCreationWrapper";
import { useCoachLibrary } from "@/hooks/useCoachLibrary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LibraryCreatorPageProps {
  onBack: () => void;
  onSubmit: (item: LibraryItem) => void;
  initialItem: Partial<LibraryItem> | null;
  activeCategory: LibraryCategory;
}

type FormField = keyof LibraryItem | "heroImageUrl";

const LibraryCreatorPage: React.FC<LibraryCreatorPageProps> = ({
  onBack,
  onSubmit,
  initialItem,
  activeCategory,
}) => {
  const { upsertItem } = useCoachLibrary();
  const [formData, setFormData] = useState<
    Partial<LibraryItem> & { heroImageUrl?: string }
  >({});

  useEffect(() => {
    setFormData((prev) => {
      if (initialItem) {
        return {
          ...prev,
          ...initialItem,
          category: activeCategory,
          isCustom: true,

          heroImageUrl:
            (prev as any).heroImageUrl ??
            (initialItem as any).hero_image_url ??
            undefined,
        };
      }

      return {
        ...prev,
        category: activeCategory,
        isCustom: true,
      };
    });
  }, [initialItem, activeCategory]);

  const handleFormChange = useCallback(async (field: FormField, value: any) => {
    if (
      field === "heroImageUrl" &&
      typeof value === "string" &&
      value.startsWith("blob:")
    ) {
      try {
        const blob = await fetch(value).then((r) => r.blob());

        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes.user?.id || "anonymous";

        const path = `${userId}/${Date.now()}.jpg`;

        const { error } = await supabase.storage
          .from("library-heroes")
          .upload(path, blob, {
            contentType: blob.type,
            upsert: false,
          });

        if (error) {
          console.error(error);
          toast.error("Image upload failed");
          return;
        }

        const { data } = supabase.storage
          .from("library-heroes")
          .getPublicUrl(path);

        if (!data?.publicUrl) {
          toast.error("Failed to get public image URL");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          heroImageUrl: data.publicUrl,
        }));

        toast.success("Image uploaded successfully");
        return;
      } catch (err) {
        console.error(err);
        toast.error("Unexpected image upload error");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    console.log("SUBMIT TIKLANDI – formData:", formData);

    if (!formData.name || !formData.introduction) {
      alert("Please fill in Name and Introduction.");
      return;
    }

    if (formData.heroImageUrl?.startsWith("blob:")) {
      toast.error("Image upload not completed");
      return;
    }

    let details: Record<string, any> = {};

    if (activeCategory === "exercise") {
      details = {
        muscleGroup: formData.muscleGroup || "",
        howTo: formData.howTo || [],
        proTip: formData.proTip || "",
        whatToAvoid: formData.whatToAvoid || "",
      };
    } else if (activeCategory === "recipe") {
      details = {
        allergies: formData.allergies || "",
        ingredients: formData.ingredients || [],
        stepByStep: formData.stepByStep || [],
        proTip: formData.proTip || "",
      };
    } else if (activeCategory === "mental health") {
      details = {
        content: formData.content || [],
        proTip: formData.proTip || "",
      };
    }

    console.log("Prepared details:", details);

    const payload = {
      id: formData.id,
      name: formData.name,
      category: activeCategory,
      introduction: formData.introduction,
      hero_image_url: formData.heroImageUrl || null,
      ...details,
    };

    try {
      await upsertItem(payload);
      console.log("Upsert succsess – payload:", payload);
      onSubmit({ ...formData, category: activeCategory } as LibraryItem);
    } catch (err) {
      console.error("Upsert ERROR:", err);
    }
  };

  const renderForm = () => {
    const castedFormChange = handleFormChange as any;

    switch (activeCategory) {
      case "exercise":
        return (
          <ExerciseForm
            formData={formData as any}
            onFormChange={castedFormChange}
          />
        );
      case "recipe":
        return (
          <RecipeForm
            formData={formData as any}
            onFormChange={castedFormChange}
          />
        );
      case "mental health":
        return (
          <MentalHealthForm
            formData={formData as any}
            onFormChange={castedFormChange}
          />
        );
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
      formData={formData}
      onFormChange={handleFormChange as any}
    >
      {renderForm()}
    </LibraryCreationWrapper>
  );
};

export default LibraryCreatorPage;
