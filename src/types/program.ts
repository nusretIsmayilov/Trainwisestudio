// Program types for type safety across the application
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
  plan?: any; // JSON data for the program plan
  isAIGenerated?: boolean; // display badge when true
}