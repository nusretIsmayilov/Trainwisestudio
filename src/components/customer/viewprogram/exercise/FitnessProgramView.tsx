// src/components/customer/viewprogram/exercise/FitnessProgramView.tsx

import { useState, useEffect } from "react";
import { DetailedFitnessTask, ExerciseSet } from "@/mockdata/viewprograms/mockexerciseprograms";
import { findExerciseGuideById } from "@/mockdata/library/mockexercises";
import ExerciseCarousel from "./ExerciseCarousel";
import ExerciseDetails from "./ExerciseDetails";
import ExerciseGuide from "@/components/customer/library/exercises/ExerciseGuide";
import GuideDrawer from "../shared/GuideDrawer";

interface FitnessProgramViewProps {
  initialData: DetailedFitnessTask;
}

export default function FitnessProgramView({ initialData }: FitnessProgramViewProps) {
  const [workoutData, setWorkoutData] = useState<DetailedFitnessTask>(initialData);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    initialData.exercises.length > 0 ? initialData.exercises[0].id : null
  );
  // ✅ UPDATED breakpoint to 768px
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // ✅ UPDATED breakpoint to 768px
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ... (handleSetChange, handleAddSet, handleRemoveSet functions remain unchanged)
  const handleSetChange = (exerciseId: string, setIndex: number, updatedSet: Partial<ExerciseSet>) => {
    setWorkoutData(prevData => {
      const newWorkoutData = JSON.parse(JSON.stringify(prevData));
      const exerciseToUpdate = newWorkoutData.exercises.find((ex: { id: string; }) => ex.id === exerciseId);
      if (exerciseToUpdate) {
        Object.assign(exerciseToUpdate.sets[setIndex], updatedSet);
      }
      return newWorkoutData;
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setWorkoutData(prevData => {
      const newWorkoutData = JSON.parse(JSON.stringify(prevData));
      const exerciseToUpdate = newWorkoutData.exercises.find((ex: { id: string; }) => ex.id === exerciseId);
      if (exerciseToUpdate) {
        const lastSet = exerciseToUpdate.sets[exerciseToUpdate.sets.length - 1];
        const newSet: ExerciseSet = {
          targetReps: lastSet?.targetReps || "8-12",
          performedKg: null, performedReps: null, completed: false, previous: "New set",
        };
        exerciseToUpdate.sets.push(newSet);
      }
      return newWorkoutData;
    });
  };

  const handleRemoveSet = (exerciseId: string, setIndex: number) => {
    setWorkoutData(prevData => {
      const newWorkoutData = JSON.parse(JSON.stringify(prevData));
      const exerciseToUpdate = newWorkoutData.exercises.find((ex: { id: string; }) => ex.id === exerciseId);
      if (exerciseToUpdate && exerciseToUpdate.sets.length > 1) {
        exerciseToUpdate.sets.splice(setIndex, 1);
      }
      return newWorkoutData;
    });
  };

  const selectedExercise = workoutData.exercises.find(ex => ex.id === selectedExerciseId);
  const exerciseGuide = selectedExercise ? findExerciseGuideById(selectedExercise.libraryExerciseId) : null;

  return (
    <main className="space-y-8">
      <ExerciseCarousel
        exercises={workoutData.exercises}
        selectedExerciseId={selectedExerciseId!}
        onSelectExercise={setSelectedExerciseId}
      />

      {selectedExercise && (
        <ExerciseDetails
          exercise={selectedExercise}
          onSetChange={(setIndex, updatedValues) =>
            handleSetChange(selectedExercise.id, setIndex, updatedValues)
          }
          onAddSet={() => handleAddSet(selectedExercise.id)}
          onRemoveSet={(setIndex) => handleRemoveSet(selectedExercise.id, setIndex)}
        />
      )}
      
      <GuideDrawer
        guideData={exerciseGuide}
        isMobile={isMobile}
        triggerText="How to do:"
      >
        {exerciseGuide && <ExerciseGuide guide={exerciseGuide} />}
      </GuideDrawer>
    </main>
  );
}
