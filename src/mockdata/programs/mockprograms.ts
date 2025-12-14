import { format, addDays, parseISO, startOfWeek } from "date-fns";

// ==================================================================
// TYPES & INTERFACES
// ==================================================================

export type ProgramTaskType = "fitness" | "nutrition" | "mental";

export interface ProgramTask {
  id: string;
  detailedProgramId?: string;
  type: ProgramTaskType;
  title: string;
  content: string[];
  status: "pending" | "completed" | "missed" | "in-progress";
  progress: number;
}

export interface ProgramDay {
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  tasks: ProgramTask[];
}

export interface ProgramWeek {
  weekNumber: number;
  days: ProgramDay[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // ✅ ADDED: Image for the program card
  type: ProgramTaskType; // ✅ ADDED: Program type for UI config
  status: "active" | "scheduled" | "purchased";
  startDate?: string;
  weeks: ProgramWeek[];
  isAIGenerated?: boolean;
}

export interface ScheduledTask extends ProgramTask {
  date: Date;
  programId: string;
  programTitle: string;
  weekNumber: number;
  isAIGenerated?: boolean;
}

// ==================================================================
// CONFIG
// ==================================================================

export const typeConfig = {
  fitness: {
    dot: "bg-emerald-500",
    missedDot: "bg-red-400",
    emoji: "🏋️‍♂️",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200",
  },
  nutrition: {
    dot: "bg-amber-500",
    missedDot: "bg-red-400",
    emoji: "🥗",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800",
  },
  mental: {
    dot: "bg-indigo-500",
    missedDot: "bg-red-400",
    emoji: "🧠",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
  },
};

// ==================================================================
// MOCK PROGRAM DATA
// ==================================================================

export const mockPrograms: Program[] = [
  {
    id: "prog1",
    title: "4-Week Wellness Plan",
    description: "A holistic 4-week plan for body and mind.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200",
    type: "fitness",
    status: "active",
    startDate: "2025-08-11", // Past start date
    weeks: [
      // ... weeks 1-3 remain unchanged ...
      {
        weekNumber: 1, // August 11 - August 17
        days: [
          { dayOfWeek: "Monday", tasks: [{ id: "t1", type: "fitness", title: "Leg Day", content: ["Squats", "Leg Press"], status: "completed", progress: 100 }] },
          { dayOfWeek: "Wednesday", tasks: [{ id: "t3", type: "fitness", title: "Chest & Triceps", content: ["Bench Press", "Tricep Dips"], status: "missed", progress: 0 }] },
        ]
      },
      {
        weekNumber: 2, // August 18 - August 24
        days: [
          { dayOfWeek: "Monday", tasks: [{ id: "t5", type: "fitness", title: "Leg Day Vol. 2", content: ["Leg Press", "Calf Raises"], status: "completed", progress: 100 }] },
        ]
      },
      {
        weekNumber: 3, // August 25 - August 31
        days: [
          { dayOfWeek: "Monday", tasks: [{ id: "t8", type: "fitness", title: "Heavy Legs", content: ["Squats", "Deadlifts"], status: "completed", progress: 100 }] },
          {
            dayOfWeek: "Wednesday",
            tasks: [
              { id: "t9", detailedProgramId: "t9", type: "fitness", title: "Push Day", content: ["Incline Press", "Flyes", "Dips"], status: "completed", progress: 100 },
              { id: "t13", detailedProgramId: "n-1", type: "nutrition", title: "Lean Gain Meal Plan", content: ["Breakfast", "Lunch", "Dinner"], status: "completed", progress: 100 },
              { id: "t14", detailedProgramId: "t14", type: "mental", title: "Afternoon Reset", content: ["Meditation", "Journaling"], status: "missed", progress: 0 }
            ],
          },
          { dayOfWeek: "Friday", tasks: [{ id: "t10", type: "fitness", title: "Pull Day", content: ["T-Bar Rows", "Lat Pulldowns"], status: "missed", progress: 0 }] },
        ]
      },
      {
        weekNumber: 4, // September 1 - September 7
        days: [
          { dayOfWeek: "Tuesday", tasks: [{ id: "t11", detailedProgramId: "t11", type: "fitness", title: "Final Chest Day", content: ["Dumbbell Press", "Crossovers"], status: "pending", progress: 0 }] },
        ]
      }
    ],
  },
  // ✅ ADDED: New scheduled program for testing the feature
  {
    id: "prog2",
    title: "Mindful Movement Challenge",
    description: "A 2-week challenge to connect your mind and body.",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200",
    type: "mental",
    status: "scheduled",
    startDate: "2025-09-15", // Future start date
    weeks: [
      {
        weekNumber: 1,
        days: [
          { dayOfWeek: "Monday", tasks: [{ id: "s1", type: "mental", title: "Morning Meditation", content: ["10-min guided session"], status: "pending", progress: 0 }] },
          { dayOfWeek: "Wednesday", tasks: [{ id: "s2", type: "fitness", title: "Restorative Yoga", content: ["Sun Salutation", "Child's Pose"], status: "pending", progress: 0 }] },
          { dayOfWeek: "Friday", tasks: [{ id: "s3", type: "mental", title: "Gratitude Journaling", content: ["Write 3 things"], status: "pending", progress: 0 }] },
        ]
      },
      {
        weekNumber: 2,
        days: [
          { dayOfWeek: "Tuesday", tasks: [{ id: "s4", type: "fitness", title: "Power Yoga Flow", content: ["Vinyasa Flow", "Core work"], status: "pending", progress: 0 }] },
          { dayOfWeek: "Thursday", tasks: [{ id: "s5", type: "mental", title: "Mindful Breathing", content: ["Box Breathing exercise"], status: "pending", progress: 0 }] },
        ]
      }
    ]
  }
];

// ==================================================================
// SCHEDULE GENERATOR (No changes)
// ==================================================================

export const generateDailySchedule = (programs: Program[]): ScheduledTask[] => {
  const dailySchedule: ScheduledTask[] = [];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  programs
    .filter(p => p.status === "active" || p.status === "scheduled")
    .forEach(program => {
      if (!program.startDate) return;

      const programStartDate = parseISO(program.startDate);

      program.weeks.forEach(week => {
        const weekStartOffset = (week.weekNumber - 1) * 7;
        const weekContextDate = addDays(programStartDate, weekStartOffset);
        const firstDayOfCalendarWeek = startOfWeek(weekContextDate, { weekStartsOn: 1 }); // Starts on Monday

        week.days.forEach(day => {
          const dayIndex = daysOfWeek.indexOf(day.dayOfWeek);
          const taskDate = addDays(firstDayOfCalendarWeek, dayIndex);
        
          day.tasks.forEach(task => {
            dailySchedule.push({ 
              ...task, 
              date: taskDate, 
              programId: program.id, 
              programTitle: program.title, 
              weekNumber: week.weekNumber 
            });
          });
        });
      });
    });

  return dailySchedule;
};
