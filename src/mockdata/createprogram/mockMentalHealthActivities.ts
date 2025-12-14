// src/mockdata/createprogram/mockMentalHealthActivities.ts

export type ActivityType = 'yoga' | 'meditation' | 'reflections' | 'breathwork' | 'exercise';
export type FocusArea = 'stress' | 'sleep' | 'focus' | 'relaxation' | 'energy';

export interface MentalHealthActivity {
  id: string;
  name: string;
  description: string;
  type: ActivityType;
  focusAreas: FocusArea[];
  durationMinutes: number;
}

export const mockMentalHealthActivities: MentalHealthActivity[] = [
  {
    id: 'mh1',
    name: '5-Minute Mindful Breathing',
    description: 'Simple box breathing technique for immediate stress relief.',
    type: 'breathwork',
    focusAreas: ['stress', 'focus'],
    durationMinutes: 5,
  },
  {
    id: 'mh2',
    name: 'Guided Body Scan',
    description: 'A meditation practice to increase body awareness and relaxation for better sleep.',
    type: 'meditation',
    focusAreas: ['sleep', 'relaxation'],
    durationMinutes: 15,
  },
  {
    id: 'mh3',
    name: 'Morning Sun Salutation',
    description: 'A gentle Vinyasa flow to awaken the body and set positive intentions.',
    type: 'yoga',
    focusAreas: ['energy', 'relaxation'],
    durationMinutes: 20,
  },
  {
    id: 'mh4',
    name: 'Gratitude Journaling',
    description: 'A written reflection exercise to shift focus to positive aspects of the day.',
    type: 'reflections',
    focusAreas: ['stress', 'focus'],
    durationMinutes: 10,
  },
  {
    id: 'mh5',
    name: 'Walking Meditation',
    description: 'Mindful walking exercise to ground the body and clear the mind.',
    type: 'meditation',
    focusAreas: ['focus', 'energy'],
    durationMinutes: 30,
  },
  {
    id: 'mh6',
    name: 'Progressive Muscle Relaxation',
    description: 'Tensing and relaxing muscle groups to prepare the body for deep sleep.',
    type: 'exercise',
    focusAreas: ['sleep', 'relaxation'],
    durationMinutes: 10,
  },
];
