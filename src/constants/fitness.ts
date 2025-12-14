// Predefined options for fitness program creation
export const MUSCLE_GROUPS = [
  'Chest',
  'Back', 
  'Shoulders',
  'Arms',
  'Biceps',
  'Triceps',
  'Legs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Full Body',
  'Cardio'
] as const;

export const EQUIPMENT_OPTIONS = [
  'Bodyweight',
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Pull-up Bar',
  'Yoga Mat',
  'Kettlebell',
  'Medicine Ball',
  'Cardio Machine',
  'Bench',
  'Cable Machine',
  'TRX',
  'Foam Roller',
  'Stability Ball'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];
export type Equipment = typeof EQUIPMENT_OPTIONS[number];