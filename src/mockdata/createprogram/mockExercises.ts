// src/mockdata/createprogram/mockExercises.ts
export type ExerciseType = 'warm-up' | 'exercise' | 'stretch';
export type ProgramCategory = 'fitness' | 'nutrition' | 'mental health';

export interface ExerciseItem {
  id: string;
  name: string;
  type: ExerciseType;
  description: string;
  muscleGroups: string[];
  equipment: string[];
}

export const mockExercises: ExerciseItem[] = [
  { id: 'ex-1', name: 'Push-ups', type: 'exercise', description: 'Classic bodyweight exercise for chest and triceps.', muscleGroups: ['chest', 'triceps'], equipment: ['Bodyweight'] },
  { id: 'ex-2', name: 'Squats', type: 'exercise', description: 'Fundamental lower body exercise.', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: ['Bodyweight'] },
  { id: 'ex-3', name: 'Jumping Jacks', type: 'warm-up', description: 'Full-body cardio warm-up.', muscleGroups: [], equipment: ['Bodyweight'] },
  { id: 'ex-4', name: 'Hamstring Stretch', type: 'stretch', description: 'Stretches the back of the legs.', muscleGroups: ['hamstrings'], equipment: ['Yoga Mat'] },
  { id: 'ex-5', name: 'Pull-ups', type: 'exercise', description: 'Upper body pulling exercise.', muscleGroups: ['back', 'biceps'], equipment: ['Pull-up Bar'] },
  { id: 'ex-6', name: 'Lunges', type: 'exercise', description: 'Single-leg strength exercise.', muscleGroups: ['quads', 'glutes'], equipment: ['Bodyweight'] },
  { id: 'ex-7', name: 'Cat-Cow', type: 'warm-up', description: 'Spinal mobility warm-up.', muscleGroups: [], equipment: ['Yoga Mat'] },
  { id: 'ex-8', name: 'Quad Stretch', type: 'stretch', description: 'Stretches the front of the thighs.', muscleGroups: ['quads'], equipment: ['Yoga Mat'] },
];
