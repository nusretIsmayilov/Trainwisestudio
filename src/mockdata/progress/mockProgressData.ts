import { subDays, format } from 'date-fns';

// --- INTERFACES ---

export interface WeightEntry {
  date: string; // "yyyy-MM-dd"
  weight: number; // in kg
}

export interface PhotoEntry {
  id: string;
  date: string; // "yyyy-MM-dd"
  imageUrl: string;
}

export interface DailyCheckin {
  date: string; // "yyyy-MM-dd"
  waterLiters: number;
  sleepHours: number;
  energyLevel: number; // 1-5
  mood: 'great' | 'good' | 'okay' | 'bad';
  stressLevel: number; // 1-10
}

export interface ExerciseProgress {
    exerciseName: string;
    personalRecord: { value: number; unit: string; date: string; };
    history: { date: string; weight: number; reps: number; sets: number; }[];
}

export interface MentalHealthData {
    meditationMinutes: { date: string; minutes: number }[];
    yogaSessions: { date: string; completed: boolean }[];
}

export interface SmartInsight {
    id: string;
    text: string;
    emoji: string;
    type: 'positive' | 'warning';
}

export interface Recipe {
    id: string;
    name: string;
    imageUrl: string;
    portion: string;
    calories: number;
    macros: { protein: number; carbs: number; fat: number; };
}

export interface UserGoal {
    id: string;
    title: string;
    type: 'IMPROVE_SLEEP' | 'BUILD_MUSCLE' | 'IMPROVE_NUTRITION';
    targetValue?: number;
    targetUnit?: string;
}

export interface ProgressData {
    weightEntries: WeightEntry[];
    workoutStreak: number;
    kcalBurnedLast7Days: number;
    userGoals: UserGoal[];
    dailyCheckins: DailyCheckin[];
    fitnessProgression: {
      exercises: ExerciseProgress[];
      weeklyVolume: { week: string; volume: number }[];
      consistency: number;
    };
    nutrition: {
      // The macros interface now includes kcal
      macros: { date: string; protein: number; carbs: number; fat: number; kcal: number; }[];
      recommended: { kcal: number; protein: number; carbs: number; fat: number };
      mealCompletion: number;
      outsideMeals: number;
      recentRecipes: Recipe[];
    };
    mentalHealth: MentalHealthData;
    photoEntries: PhotoEntry[];
    smartInsights: SmartInsight[];
}

// --- MOCK DATA GENERATION ---
const today = new Date();

export const mockProgressData: ProgressData = {
    weightEntries: Array.from({ length: 90 }).map((_, i) => ({
      date: format(subDays(today, 89 - i), 'yyyy-MM-dd'),
      weight: 86.5 - i * 0.05 + (Math.random() - 0.5) * 0.5,
    })),
    workoutStreak: 14,
    kcalBurnedLast7Days: 3250,
    userGoals: [
      { id: 'g1', title: 'Improve Sleep', type: 'IMPROVE_SLEEP', targetValue: 8, targetUnit: 'hrs' },
      { id: 'g2', title: 'Build Muscle', type: 'BUILD_MUSCLE', targetValue: 160, targetUnit: 'g' },
      { id: 'g3', title: 'Nutrition Quality', type: 'IMPROVE_NUTRITION', targetValue: 160, targetUnit: 'g protein' },
    ],
    dailyCheckins: Array.from({ length: 90 }).map((_, i) => ({
      date: format(subDays(today, 89 - i), 'yyyy-MM-dd'),
      waterLiters: 2.5 + Math.random(),
      sleepHours: 7.2 + Math.sin(i / 10) * 0.8 + (Math.random() - 0.5) * 1.5,
      energyLevel: Math.max(1, Math.min(5, Math.floor(3 + Math.sin(i / 10) + Math.random() * 2.5))),
      mood: ['good', 'great', 'okay'][Math.floor(Math.random() * 3)] as 'good',
      stressLevel: Math.floor(2 + Math.random() * 5),
    })),
    // CORRECTED: Populated exercise history for the new chart
    fitnessProgression: {
      exercises: [
        {
          exerciseName: 'Deadlift',
          personalRecord: { value: 140, unit: 'kg', date: format(subDays(today, 5), 'yyyy-MM-dd') },
          history: [
            { date: format(subDays(today, 40), 'yyyy-MM-dd'), weight: 120, reps: 5, sets: 3 },
            { date: format(subDays(today, 33), 'yyyy-MM-dd'), weight: 125, reps: 4, sets: 3 },
            { date: format(subDays(today, 26), 'yyyy-MM-dd'), weight: 125, reps: 5, sets: 3 },
            { date: format(subDays(today, 19), 'yyyy-MM-dd'), weight: 130, reps: 4, sets: 3 },
            { date: format(subDays(today, 12), 'yyyy-MM-dd'), weight: 135, reps: 3, sets: 3 },
            { date: format(subDays(today, 5), 'yyyy-MM-dd'), weight: 140, reps: 1, sets: 1 },
          ],
        },
        {
          exerciseName: 'Bench Press',
          personalRecord: { value: 95, unit: 'kg', date: format(subDays(today, 12), 'yyyy-MM-dd') },
          history: [
            { date: format(subDays(today, 45), 'yyyy-MM-dd'), weight: 80, reps: 8, sets: 4 },
            { date: format(subDays(today, 38), 'yyyy-MM-dd'), weight: 82.5, reps: 7, sets: 4 },
            { date: format(subDays(today, 31), 'yyyy-MM-dd'), weight: 85, reps: 6, sets: 4 },
            { date: format(subDays(today, 24), 'yyyy-MM-dd'), weight: 87.5, reps: 5, sets: 4 },
            { date: format(subDays(today, 17), 'yyyy-MM-dd'), weight: 90, reps: 4, sets: 4 },
            { date: format(subDays(today, 12), 'yyyy-MM-dd'), weight: 95, reps: 2, sets: 3 },
          ],
        },
        {
          exerciseName: 'Squat',
          personalRecord: { value: 125, unit: 'kg', date: format(subDays(today, 20), 'yyyy-MM-dd') },
          history: [
            { date: format(subDays(today, 50), 'yyyy-MM-dd'), weight: 110, reps: 5, sets: 5 },
            { date: format(subDays(today, 43), 'yyyy-MM-dd'), weight: 115, reps: 5, sets: 5 },
            { date: format(subDays(today, 36), 'yyyy-MM-dd'), weight: 115, reps: 6, sets: 4 },
            { date: format(subDays(today, 28), 'yyyy-MM-dd'), weight: 120, reps: 4, sets: 4 },
            { date: format(subDays(today, 20), 'yyyy-MM-dd'), weight: 125, reps: 3, sets: 4 },
          ],
        }
      ],
      weeklyVolume: [
          { week: 'W1', volume: 10500 }, { week: 'W2', volume: 11200 }, { week: 'W3', volume: 11000 }, { week: 'W4', volume: 12500 },
      ],
      consistency: 88,
    },
    nutrition: {
      macros: Array.from({ length: 90 }).map((_, i) => {
          const protein = 150 + Math.sin(i/7) * 15 + (Math.random() - 0.5) * 20;
          const carbs = 200 + Math.sin(i/10) * 20 + (Math.random() - 0.5) * 30;
          const fat = 60 + (Math.random() - 0.5) * 15;
          const kcal = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
          return {
              date: format(subDays(today, 89 - i), 'yyyy-MM-dd'),
              protein: Math.round(protein),
              carbs: Math.round(carbs),
              fat: Math.round(fat),
              kcal: kcal
          };
      }),
      recommended: { kcal: 2500, protein: 160, carbs: 220, fat: 65 },
      mealCompletion: 92,
      outsideMeals: 3,
      recentRecipes: [
          { id: 'r1', name: 'Spicy Salmon Bowl', imageUrl: 'https://placehold.co/400x400/f87171/FFF?text=🍲', portion: '1 bowl', calories: 550, macros: { protein: 40, carbs: 55, fat: 20 } },
          { id: 'r2', name: 'Chicken & Quinoa', imageUrl: 'https://placehold.co/400x400/34d399/FFF?text=🥗', portion: '1 serving', calories: 480, macros: { protein: 50, carbs: 40, fat: 15 } },
          { id: 'r3', name: 'Protein Pancakes', imageUrl: 'https://placehold.co/400x400/fbbf24/FFF?text=🥞', portion: '3 pancakes', calories: 420, macros: { protein: 35, carbs: 50, fat: 12 } },
      ]
    },
    mentalHealth: {
        meditationMinutes: Array.from({ length: 90 }).map((_, i) => ({ date: format(subDays(today, 89-i), 'yyyy-MM-dd'), minutes: Math.random() > 0.3 ? 10 + Math.floor(Math.random() * 10) : 0 })),
        yogaSessions: Array.from({ length: 90 }).map((_, i) => ({ date: format(subDays(today, 89-i), 'yyyy-MM-dd'), completed: Math.random() > 0.6 })),
    },
    photoEntries: [
      { id: 'p1', date: format(subDays(today, 90), 'MMM d'), imageUrl: 'https://placehold.co/400x600/000000/FFF?text=Start' },
      { id: 'p2', date: format(subDays(today, 60), 'MMM d'), imageUrl: 'https://placehold.co/400x600/333333/FFF?text=Month+1' },
      { id: 'p3', date: format(subDays(today, 30), 'MMM d'), imageUrl: 'https://placehold.co/400x600/666666/FFF?text=Month+2' },
      { id: 'p4', date: format(subDays(today, 2), 'MMM d'), imageUrl: 'https://placehold.co/400x600/999999/FFF?text=Today' },
    ],
    smartInsights: [
        { id: 's1', emoji: '💡', text: 'On weeks with 7h+ sleep, you had 20% higher workout adherence.', type: 'positive' },
        { id: 's2', emoji: '💧', text: 'Water intake is trending down. Aim for 3L to boost energy levels.', type: 'warning'},
        { id: 's3', emoji: '💪', text: 'Your protein consistency is paying off with that new Deadlift PR!', type: 'positive'},
    ],
};
