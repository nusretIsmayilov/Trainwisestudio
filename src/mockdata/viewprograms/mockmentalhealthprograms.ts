export interface MentalHealthActivity {
  id: string;
  libraryActivityId: string;
  name: string;
  type: 'Meditation' | 'Journaling';
  durationMinutes: number;
  isCompleted: boolean;
  // ✅ ADDED: Properties required by the new ItemCarousel component
  imageUrl: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

export interface DetailedMentalHealthTask {
  id: string;
  type: 'mental'; 
  title: string;
  coachNotes: string;
  activities: MentalHealthActivity[];
  totalDurationMinutes: number;
}

const mockDetailedMentalHealthPrograms: DetailedMentalHealthTask[] = [
  {
    id: "t14", // Matches the ID from mockprograms.ts
    type: 'mental',
    title: "Afternoon Reset",
    coachNotes: "Take this time for yourself. Disconnect from distractions and focus on your inner state. You deserve this peace.",
    totalDurationMinutes: 15,
    activities: [
      { 
        id: "mha-1", 
        libraryActivityId: "mh-lib-1", 
        name: "Guided Meditation", 
        type: "Meditation", 
        durationMinutes: 10, 
        isCompleted: false,
        // ✅ ADDED: Image and time of day
        imageUrl: "/images/meditation.jpg", // Replace with your image path
        timeOfDay: 'Afternoon'
      },
      { 
        id: "mha-2", 
        libraryActivityId: "mh-lib-2", 
        name: "Gratitude Journaling", 
        type: "Journaling", 
        durationMinutes: 5, 
        isCompleted: false,
        // ✅ ADDED: Image and time of day
        imageUrl: "/images/journaling.jpg", // Replace with your image path
        timeOfDay: 'Afternoon'
      },
    ]
  }
];

export const findMentalHealthProgramById = (id: string): DetailedMentalHealthTask | undefined => {
  return mockDetailedMentalHealthPrograms.find((p) => p.id === id);
};
