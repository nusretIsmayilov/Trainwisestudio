// src/pages/customer/ViewProgramPage.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ✅ Import all necessary data types
import { DetailedFitnessTask } from "@/mockdata/viewprograms/mockexerciseprograms";
import { DetailedNutritionTask } from "@/mockdata/viewprograms/mocknutritionprograms";
import { DetailedMentalHealthTask } from "@/mockdata/viewprograms/mockmentalhealthprograms";

type ProgramData = DetailedFitnessTask | DetailedNutritionTask | DetailedMentalHealthTask;

// ✅ Import all specialized headers
import WorkoutHeader from "@/components/customer/viewprogram/exercise/WorkoutHeader";
import NutritionHeader from "@/components/customer/viewprogram/nutrition/NutritionHeader";
import MentalHealthHeader from "@/components/customer/viewprogram/mentalhealth/MentalHealthHeader";

// ✅ Import all view components
import CoachMessage from "@/components/customer/viewprogram/CoachMessage";
import FitnessProgramView from "@/components/customer/viewprogram/exercise/FitnessProgramView";
import NutritionProgramView from "@/components/customer/viewprogram/nutrition/NutritionProgramView";
import MentalHealthProgramView from "@/components/customer/viewprogram/mentalhealth/MentalHealthProgramView";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgramEntries } from "@/hooks/useProgramEntries";

// Helper components remain the same
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Program not found</h1>
      <p className="text-muted-foreground">The requested program could not be found.</p>
    </div>
  </div>
);

export default function ViewProgramPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { completeToday } = useProgramEntries(id);

  useEffect(() => {
    const loadProgram = async () => {
      if (!id || !type || !profile) return;
      
      setLoading(true);
      try {
        // Load program from database
        const { data: program, error } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id)
          .eq('assigned_to', profile.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading program:', error);
          setProgramData(null);
          return;
        }

        if (!program) {
          setProgramData(null);
          return;
        }

        // Convert database program to the expected format
        const programData: ProgramData = {
          id: program.id,
          type: program.category === 'fitness' ? 'fitness' : program.category === 'nutrition' ? 'nutrition' : 'mental',
          title: program.name,
          description: program.description,
          duration: program.plan?.duration || '4 weeks',
          difficulty: program.plan?.difficulty || 'beginner',
          // Add plan data if available
          ...(program.plan || {}),
        } as ProgramData;

        setProgramData(programData);
      } catch (error) {
        console.error('Error loading program:', error);
        setProgramData(null);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [id, type, profile]);

  // ✅ Renders the correct specialized header based on program type
  const renderProgramHeader = () => {
    if (!programData) return null;
    switch (programData.type) {
      case 'fitness':
        return <WorkoutHeader task={programData as DetailedFitnessTask} />;
      case 'nutrition':
        return <NutritionHeader task={programData as DetailedNutritionTask} />;
      case 'mental':
        return <MentalHealthHeader task={programData as DetailedMentalHealthTask} />;
      default:
        return null;
    }
  };

  // ✅ Renders the correct program content view
  const renderProgramView = () => {
    if (!programData) return null;
    switch (programData.type) {
      case 'fitness':
        return <FitnessProgramView initialData={programData as DetailedFitnessTask} />;
      case 'nutrition':
        return <NutritionProgramView nutritionData={programData as DetailedNutritionTask} />;
      case 'mental':
        return <MentalHealthProgramView initialData={programData as DetailedMentalHealthTask} />;
      default:
        return <p>Unsupported program type.</p>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!programData) return <NotFound />;
  
  // ✅ Gets the correct button text for the program type
  const getButtonText = () => {
    switch (programData.type) {
        case 'fitness': return 'Complete Workout';
        case 'nutrition': return 'Complete Day';
        case 'mental': return 'Complete Session';
        default: return 'Complete';
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto px-4">
      <div className="flex-1 overflow-auto space-y-8 py-8" data-guide-scroll="true">
        {/* ✅ Renders the appropriate header */}
        {renderProgramHeader()}
        <CoachMessage message={programData.coachNotes} />
        {renderProgramView()}
      </div>

      {profile && (
        <div className="sticky bottom-[calc(15vh+env(safe-area-inset-bottom)+1rem)] md:bottom-4 z-40 md:z-50 flex w-full justify-center px-0">
          <Button
            size="lg"
            className="h-12 w-full max-w-md rounded-xl font-bold shadow-lg"
            onClick={() => completeToday({ program_id: id || null, type: (programData?.type as any) || 'fitness' })}
          >
            {getButtonText()}
          </Button>
        </div>
      )}
    </div>
  );
}
