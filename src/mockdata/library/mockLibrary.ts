// src/mockdata/library/mockLibrary.ts

// --- COMMON TYPES ---
export type LibraryCategory = 'exercise' | 'recipe' | 'mental health';

export interface ContentStep {
  id: string;
  type: 'image' | 'video' | 'text' | 'step' | 'soundfile';
  value: string;
}

export interface BaseItem {
  id: string;
  category: LibraryCategory;
  name: string;
  introduction: string;
  proTip?: string;
  whatToAvoid?: string;
  isCustom: boolean;
}

// --- EXERCISE TYPES ---
export interface ExerciseItem extends BaseItem {
  category: 'exercise';
  muscleGroup: string;
  howTo: ContentStep[];
}

// --- RECIPE TYPES ---
export interface Ingredient {
  name: string;
  quantity: string;
}

export interface RecipeItem extends BaseItem {
  category: 'recipe';
  allergies: string;
  ingredients: Ingredient[];
  stepByStep: string[];
}

// --- MENTAL HEALTH TYPES ---
export interface MentalHealthItem extends BaseItem {
  category: 'mental health';
  content: ContentStep[]; // Can include text, video, image, soundfile
}

export type LibraryItem = ExerciseItem | RecipeItem | MentalHealthItem;


// --- MOCK DATA ---
export const mockLibrary: LibraryItem[] = [
  {
    id: 'e1',
    category: 'exercise',
    name: 'Barbell Squat',
    introduction: 'The king of all leg exercises, essential for lower body strength.',
    muscleGroup: 'Quads, Glutes',
    howTo: [{ id: 'h1', type: 'step', value: 'Place the bar across your upper back.' }],
    proTip: 'Keep your chest up and core tight.',
    whatToAvoid: 'Letting your knees collapse inward.',
    isCustom: false,
  },
  {
    id: 'r1',
    category: 'recipe',
    name: 'High-Protein Salmon Bowl',
    introduction: 'A nutritious meal perfect for post-workout recovery.',
    allergies: 'Fish, Soy (if using soy sauce)',
    ingredients: [{ name: 'Salmon fillet', quantity: '150g' }, { name: 'Brown Rice', quantity: '1 cup' }],
    stepByStep: ['Bake salmon.', 'Mix rice with vegetables.', 'Combine and enjoy.'],
    isCustom: false,
  },
  {
    id: 'mh1',
    category: 'mental health',
    name: '5 Minute Box Breathing',
    introduction: 'A technique for regulating the nervous system and reducing stress.',
    content: [{ id: 'c1', type: 'soundfile', value: 'link-to-audio.mp3' }, { id: 'c2', type: 'text', value: 'Inhale for 4, hold for 4, exhale for 4, hold for 4.' }],
    isCustom: true,
  },
];
