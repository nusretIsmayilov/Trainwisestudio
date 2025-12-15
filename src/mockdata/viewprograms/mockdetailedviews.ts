// src/mockdata/viewprograms/mockdetailedviews.ts

export interface DetailViewItem {
  name: string;
  imageUrl: string;
  details: string;
}

export interface DetailedTask {
  id: string; 
  type: "fitness" | "nutrition" | "mental";
  content: DetailViewItem[];
}

const mockDetailedTasks: DetailedTask[] = [
  {
    id: "t1", type: "fitness", content: [
      { name: "Squats", imageUrl: "/images/squat-thumb.png", details: "4 sets, 8-12 reps" },
      { name: "Leg Press", imageUrl: "/images/leg-press-thumb.png", details: "3 sets, 10-15 reps" }
    ]
  },
  {
    id: "t3", type: "fitness", content: [
      { name: "Bench Press", imageUrl: "/images/bench-press-thumb.png", details: "4 sets, 8-12 reps" },
      { name: "Tricep Dips", imageUrl: "/images/tricep-dips-thumb.png", details: "3 sets, to failure" }
    ]
  },
  {
    id: "t5", type: "fitness", content: [
        { name: "Leg Press", imageUrl: "/images/leg-press-thumb.png", details: "4 sets, 12-15 reps" },
        { name: "Calf Raises", imageUrl: "/images/calf-raises-thumb.png", details: "4 sets, 15-20 reps" }
    ]
  },
  {
    id: "t8", type: "fitness", content: [
        { name: "Squats", imageUrl: "/images/squat-thumb.png", details: "5 sets, 5 reps" },
        { name: "Deadlifts", imageUrl: "/images/deadlift-thumb.png", details: "3 sets, 5 reps" }
    ]
  },
  {
    id: "t9", type: "fitness", content: [
      { name: "Incline Press", imageUrl: "/images/incline-press-thumb.png", details: "3 sets, 8-10 reps" },
      { name: "Flyes", imageUrl: "/images/flyes-thumb.png", details: "2 sets, 12-15 reps" },
      { name: "Dips", imageUrl: "/images/dips-thumb.png", details: "2 sets, AMRAP" },
    ]
  },
  {
    id: "t10", type: "fitness", content: [
        { name: "T-Bar Rows", imageUrl: "/images/t-bar-row-thumb.png", details: "4 sets, 8-12 reps" },
        { name: "Lat Pulldowns", imageUrl: "/images/lat-pulldown-thumb.png", details: "3 sets, 10-15 reps" }
    ]
  },
  {
    id: "t11", type: "fitness", content: [
        { name: "Dumbbell Press", imageUrl: "/images/dumbbell-press-thumb.png", details: "4 sets, 8-12 reps" },
        { name: "Crossovers", imageUrl: "/images/crossovers-thumb.png", details: "3 sets, 12-15 reps" }
    ]
  },
  {
    id: "n-1", type: "nutrition", content: [
      { name: "Oatmeal Delight", imageUrl: "/images/oatmeal.jpg", details: "Breakfast" },
      { name: "Chicken Salad", imageUrl: "/images/salad.jpg", details: "Lunch" },
      { name: "Salmon & Veggies", imageUrl: "/images/salmon.jpg", details: "Dinner" },
    ]
  },
  {
    id: "t14", type: "mental", content: [
       { name: "Guided Meditation", imageUrl: "/images/meditation.jpg", details: "Afternoon" },
       { name: "Gratitude Journaling", imageUrl: "/images/journaling.jpg", details: "Afternoon" },
    ]
  },
];

export const findDetailedTaskById = (id: string): DetailedTask | undefined => {
  return mockDetailedTasks.find(task => task.id === id);
};
