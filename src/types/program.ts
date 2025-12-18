// Program types for type safety across the application
export type ProgramStatus = "active" | "scheduled" | "draft" | "normal";
export type ProgramCategory = "fitness" | "nutrition" | "mental health";

export interface Program {
  id: string;
  name: string;
  description: string;
  category: ProgramCategory;
  status: ProgramStatus;

  // 🔥 EKSİK OLANLAR
  muscleGroups?: string[] | null;
  equipment?: string[] | null;
  benefits?: string | null;
  allergies?: string | null;

  assignedTo?: string | null;
  scheduledDate?: string | null;
  plan?: any;

  createdAt?: string;
  updatedAt?: string;
  isAIGenerated?: boolean;
}
