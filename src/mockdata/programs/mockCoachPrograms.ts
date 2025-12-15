// src/mockdata/programs/mockCoachPrograms.ts

// This file defines the Program type for type safety.
// You might want to move this to a shared types directory later.
export type ProgramStatus = 'active' | 'scheduled' | 'draft' | 'normal';
export type ProgramCategory = 'fitness' | 'nutrition' | 'mental health';

export interface Program {
  id: string;
  name: string;
  description: string;
  status: ProgramStatus;
  category: ProgramCategory;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  scheduledDate?: string;
}

export const mockCoachPrograms: Program[] = [
  {
    id: 'prog-1',
    name: '30-Day Strength Builder',
    description: 'A comprehensive plan to build foundational strength and muscle mass.',
    status: 'active',
    category: 'fitness',
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-09-10T11:30:00Z',
    assignedTo: 'client-1',
  },
  {
    id: 'prog-2',
    name: 'Mindful Eating Guide',
    description: 'Learn to develop a healthier relationship with food and improve digestion.',
    status: 'scheduled',
    category: 'nutrition',
    createdAt: '2025-09-01T09:00:00Z',
    updatedAt: '2025-09-05T14:00:00Z',
    assignedTo: 'client-2',
    scheduledDate: '2025-09-25T08:00:00Z',
  },
  {
    id: 'prog-3',
    name: 'Beginner Yoga Flow',
    description: 'A series of gentle yoga sessions to improve flexibility and reduce stress.',
    status: 'draft',
    category: 'mental health',
    createdAt: '2025-09-12T16:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z',
    assignedTo: null,
  },
  {
    id: 'prog-4',
    name: 'Advanced Weight Loss',
    description: 'An intense program focusing on high-intensity workouts and calorie tracking.',
    status: 'normal',
    category: 'fitness',
    createdAt: '2025-07-15T08:00:00Z',
    updatedAt: '2025-07-20T12:00:00Z',
    assignedTo: null,
  },
  {
    id: 'prog-5',
    name: 'Stress Reduction Techniques',
    description: 'Guided meditations and breathing exercises to manage daily stress.',
    status: 'normal',
    category: 'mental health',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-03T11:00:00Z',
    assignedTo: null,
  },
  {
    id: 'prog-6',
    name: 'Nutrition Basics',
    description: 'A simple guide to understanding macros, micros, and healthy eating habits.',
    status: 'draft',
    category: 'nutrition',
    createdAt: '2025-09-10T13:00:00Z',
    updatedAt: '2025-09-10T13:00:00Z',
    assignedTo: null,
  },
];
