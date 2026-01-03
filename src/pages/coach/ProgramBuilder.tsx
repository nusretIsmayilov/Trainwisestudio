// src/pages/coach/ProgramBuilder.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProgramDetails from "@/components/coach/createprogram/ProgramDetails";
import FitnessBuilder from "@/components/coach/createprogram/builders/FitnessBuilder";
import NutritionBuilder from "@/components/coach/createprogram/nutrition/NutritionBuilder";
import MentalHealthBuilder from "@/components/coach/createprogram/mentalhealth/MentalHealthBuilder";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useProgramMutations } from "@/hooks/useProgramMutations";
import { Program, ProgramCategory, ProgramStatus } from "@/types/program";

type Step =
  | "program-details"
  | "fitness-builder"
  | "nutrition-builder"
  | "mental-health-builder";

interface ProgramData {
  category: ProgramCategory;
  title: string;
  description: string;
  plan: any;

  muscleGroups?: string[] | null;
  equipment?: string[] | null;
  benefits?: string | null;
  allergies?: string | null;

  assignedTo?: string | null;
  scheduledDate?: string | null;
  markActive?: boolean;
}

const ProgramBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createProgram, updateProgram, getProgramById, loading } =
    useProgramMutations();
  const [step, setStep] = useState<Step>("program-details");
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [existingProgram, setExistingProgram] = useState<Program | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing program data if editing (run once per id)
  const didLoadRef = useRef<string | null>(null);
  useEffect(() => {
    const loadProgram = async () => {
      if (!id) return;
      if (didLoadRef.current === id) return;
      setIsEditing(true);
      const program = await getProgramById(id);
      if (program) {
        setExistingProgram(program);
        setProgramData({
          category: program.category,
          title: program.name,
          description: program.description,
          plan: program.plan || {},

          muscleGroups: program.muscleGroups ?? null,
          equipment: program.equipment ?? null,
          benefits: program.benefits ?? null,
          allergies: program.allergies ?? null,

          assignedTo: program.assignedTo ?? null,
          scheduledDate: program.scheduledDate ?? null,
          markActive: false,
        });
        didLoadRef.current = id;
      } else {
        // Program not found, redirect to programs list
        navigate("/coach/programs");
      }
    };
    loadProgram();
  }, [id, navigate]);

  const handleProgramDetailsNext = (data: any) => {
    setProgramData((prev) => ({ ...prev, ...data }));

    // THE NAVIGATION LOGIC IS CORRECT HERE:
    if (data.category === "fitness") {
      setStep("fitness-builder");
    } else if (data.category === "nutrition") {
      setStep("nutrition-builder");
    } else if (data.category === "mental health") {
      setStep("mental-health-builder");
    } else {
      console.log(`Builder for ${data.category} is not yet implemented.`);
      alert(
        `Builder for ${data.category} is not yet implemented. Please select Fitness, Nutrition, or Mental Health.`
      );
    }
  };

  const handleSaveProgram = async (planData: any) => {
    console.log("programData:", programData);

    const finalProgram = {
      ...programData,
      plan: planData,
      muscleGroups: programData.muscleGroups ?? null,
      equipment: programData.equipment ?? null,
      benefits: programData.benefits ?? null,
      allergies: programData.allergies ?? null,
    };

    if (isEditing && existingProgram) {
      await updateProgram({
        id: existingProgram.id,
        name: finalProgram.title || existingProgram.name,
        description: finalProgram.description || existingProgram.description,
        category: finalProgram.category || existingProgram.category,
        plan: planData,

        muscleGroups: finalProgram.muscleGroups,
        equipment: finalProgram.equipment,
        benefits: finalProgram.benefits,
        allergies: finalProgram.allergies,

        assignedTo:
          finalProgram.assignedTo ?? existingProgram.assignedTo ?? null,
        scheduledDate:
          finalProgram.scheduledDate ?? existingProgram.scheduledDate ?? null,
        status: "active",
      });
    } else {
      await createProgram({
        name: finalProgram.title || "Untitled Program",
        description: finalProgram.description || "",
        category: finalProgram.category,
        plan: planData,

        muscleGroups: finalProgram.muscleGroups,
        equipment: finalProgram.equipment,
        benefits: finalProgram.benefits,
        allergies: finalProgram.allergies,

        assignedTo: finalProgram.assignedTo ?? null,
        scheduledDate: finalProgram.scheduledDate ?? null,
        status: "active",
      });
    }

    navigate("/coach/programs", { replace: true });
  };

  const renderStep = () => {
    const commonBuilderProps = {
      onBack: () => setStep("program-details"),
      onSave: handleSaveProgram,
    };

    switch (step) {
      case "program-details":
        return (
          <ProgramDetails
            onNext={handleProgramDetailsNext}
            initialData={programData ?? undefined}
            isEditing={isEditing}
          />
        );
      case "fitness-builder":
        return (
          <FitnessBuilder
            {...commonBuilderProps}
            initialData={programData.plan}
          />
        );
      case "nutrition-builder":
        return (
          <NutritionBuilder
            {...commonBuilderProps}
            initialData={programData.plan}
          />
        );
      case "mental-health-builder":
        return (
          <MentalHealthBuilder
            {...commonBuilderProps}
            initialData={programData.plan}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      {step === "program-details" && (
        <>
          <h1 className="text-4xl font-bold">
            {isEditing ? "Edit Program" : "Create New Program"}
          </h1>
          <Separator className="my-8" />
        </>
      )}

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgramBuilder;
