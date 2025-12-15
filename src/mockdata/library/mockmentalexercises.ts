// src/mockdata/library/mockmentalexercises.ts

export interface MentalHealthGuide {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  benefits: string[];
  instructions: string[];
  icon: string; // e.g., an emoji or icon name
}

export const mockMentalHealthGuides: MentalHealthGuide[] = [
  {
    id: "mh-lib-1",
    name: "Guided Meditation",
    imageUrl: "/images/mental-health/meditation.png",
    icon: "🧘‍♀️",
    description: "A 10-minute guided session to calm the mind and reduce stress.",
    benefits: ["Reduces Stress", "Improves Focus", "Promotes Emotional Health"],
    instructions: [
      "Find a quiet, comfortable place to sit or lie down.",
      "Close your eyes and take a few deep breaths, in through your nose and out through your mouth.",
      "Bring your attention to your body. Notice the feeling of your body against the chair or floor.",
      "Follow the guidance of the audio track, allowing thoughts to come and go without judgment.",
      "When the session ends, gently bring your awareness back to the room and open your eyes."
    ]
  },
  {
    id: "mh-lib-2",
    name: "Gratitude Journaling",
    imageUrl: "/images/mental-health/journaling.png",
    icon: "✍️",
    description: "A short exercise to reflect on what you're thankful for, fostering a positive mindset.",
    benefits: ["Increases Positivity", "Improves Self-Esteem", "Enhances Empathy"],
    instructions: [
      "Open your journal or a piece of paper.",
      "Set a timer for 5 minutes.",
      "Write down 3-5 things you are grateful for today. They can be big or small.",
      "For each item, briefly write about why you are grateful for it.",
      "Read over your list and allow yourself to feel the positive emotions associated with it."
    ]
  }
];

export const findMentalHealthGuideById = (id: string): MentalHealthGuide | undefined => {
  return mockMentalHealthGuides.find((g) => g.id === id);
};
