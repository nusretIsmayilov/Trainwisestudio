// src/mockdata/viewprograms/mockexerciseprograms.ts

export interface ExerciseSet {
  // ✅ Target reps can now be a string for ranges (e.g., "8-12")
  targetReps: string; 
  // ✅ Fields for what the user actually performed
  performedReps: number | null;
  performedKg: number | null;
  // Previous fields
  rir?: number | null;
  completed: boolean;
  // ✅ Added a field to store previous performance for this set
  previous: string; // e.g., "8 reps @ 80 kg"
}

export interface WorkoutExercise {
  id: string;
  libraryExerciseId: string;
  name: string;
  imageUrl: string;
  restTimeSeconds: number;
  // ✅ lastTimeKg is removed, as this info is now per-set in 'previous'
  sets: ExerciseSet[];
  targetSets: number;
}

export interface DetailedFitnessTask {
  id: string;
  type: 'fitness'; // Important for dynamic rendering
  title: string;
  coachNotes: string;
  exercises: WorkoutExercise[];
  duration?: string;
  equipment?: string[];
}

// ✅ MOCK DATA UPDATED TO NEW STRUCTURE
const mockDetailedPrograms: DetailedFitnessTask[] = [
  {
    id: "t9",
    type: 'fitness',
    title: "Push Day",
    duration: "75 min",
    equipment: ["Dumbbell", "Bodyweight"],
    coachNotes: "Focus on chest contraction and full extension on the dips.",
    exercises: [
        {
            id: "ex_ip_t9",
            libraryExerciseId: "lib-ip",
            name: "Incline Press",
            imageUrl: "/images/incline-press-thumb.png",
            restTimeSeconds: 120,
            targetSets: 3,
            sets: [
                { targetReps: "8-10", performedKg: 42.5, performedReps: 10, rir: 2, completed: true, previous: "8 reps @ 40 kg" },
                { targetReps: "8-10", performedKg: null, performedReps: null, rir: 1, completed: false, previous: "8 reps @ 40 kg" },
                { targetReps: "8-10", performedKg: null, performedReps: null, rir: 1, completed: false, previous: "7 reps @ 40 kg" },
            ]
        },
        {
            id: "ex_fly_t9",
            libraryExerciseId: "lib-fly",
            name: "Flyes",
            imageUrl: "/images/flyes-thumb.png",
            restTimeSeconds: 90,
            targetSets: 2,
            sets: [ 
                { targetReps: "12-15", performedKg: null, performedReps: null, rir: 1, completed: false, previous: "12 reps @ 12 kg" },
                { targetReps: "12-15", performedKg: null, performedReps: null, rir: 1, completed: false, previous: "11 reps @ 12 kg" } 
            ]
        },
        {
            id: "ex_dips_t9",
            libraryExerciseId: "lib-td",
            name: "Dips",
            imageUrl: "/images/dips-thumb.png",
            restTimeSeconds: 90,
            targetSets: 2,
            sets: [ 
                { targetReps: "AMRAP", performedKg: null, performedReps: null, rir: 2, completed: false, previous: "10 reps @ Bodyweight" },
                { targetReps: "AMRAP", performedKg: null, performedReps: null, rir: 1, completed: false, previous: "8 reps @ Bodyweight" } 
            ]
        }
    ]
  },
  // ... (Add your other workout tasks here with the new structure)
];

export const findExerciseProgramById = (id: string): DetailedFitnessTask | undefined => {
  return mockDetailedPrograms.find((p) => p.id === id);
};
