// src/mockdata/mycoach/coachData.ts (UPDATED)

import { File, MessageSquare, Pin, BarChart2, Star } from 'lucide-react';

/*
 * TODO: Backend Integration Notes
 * - `coachInfo`: Fetch from a coach profile table. The single coach's data is likely stored here.
 * - `feedbackHistory`: Join the `feedback` and `program_logs` tables to pull feedback left by the coach on a client's program entries.
 * - `sharedFiles`: Query the `files` table for files shared with the current user.
 * - `dailyMessage`: Fetch a specific daily message for the current user from a `daily_messages` table.
 * - `coachStats`, `coachTrainings`, `coachPhotos`: Fetch these from a new `coach_activity` table or similar.
 */

export const coachInfo = {
    name: 'Sophia Miller',
    bio: 'A certified fitness and nutrition coach with a passion for helping people build sustainable, healthy habits. My goal is to empower you to take control of your well-being through personalized programs and continuous support. I believe in a holistic approach, blending physical training with mental resilience.',
    specialties: ['Fitness', 'Nutrition', 'Mental Health'],
    profileImageUrl: 'https://images.unsplash.com/photo-1594381830635-4db9d54e4c3b?q=80&w=1200',
    email: 'sophia.miller@trainwise.com',
};

export const dailyMessage = {
    id: 1,
    title: 'Morning Motivation',
    content: "Remember, every small step forward is progress. You've got this! ✨",
};

export const feedbackHistory = [
    {
        id: 1,
        date: '2025-09-05',
        type: 'Program Feedback',
        title: 'Full Body Strength Session',
        message: 'Great work on increasing your reps! Keep pushing on the overhead press. You’re doing fantastic!',
        icon: MessageSquare,
    },
    {
        id: 2,
        date: '2025-09-04',
        type: 'Check-in',
        title: 'Weekly Program Check-in',
        message: "Hey Hanna! On a scale of 1-10, how is your program feeling this week? Any feedback on your energy levels or motivation?",
        rating: null,
        comment: null,
        icon: Pin,
    },
    {
        id: 3,
        date: '2025-09-02',
        type: 'Pinpoint',
        title: 'Cardio Intervals',
        message: 'Next week, let’s try increasing the intensity on your interval runs. You can add 15 seconds to each high-intensity sprint. Let me know how it feels!',
        icon: BarChart2,
    },
];

export const sharedFiles = [
    {
        id: 1,
        name: 'Your Welcome Guide.pdf',
        description: 'An introduction to the platform and your journey.',
        date: '2025-08-20',
        icon: File,
    },
    {
        id: 2,
        name: 'First Program Assigned.pdf',
        description: 'A summary of your first assigned program.',
        date: '2025-08-21',
        icon: File,
    },
    {
        id: 3,
        name: 'Goal Setting Workbook.pdf',
        description: 'Direct file for setting your long-term goals.',
        date: '2025-08-23',
        icon: File,
    },
];

export const coachStats = {
    level: 'Beginner',
    hours: '120 hrs',
    caloriesThisWeek: 160.5,
    timeThisWeek: '1:03:30',
    weeklyData: [50, 80, 60, 100, 75, 90, 120] // Example data for bar chart
};

export const coachTrainings = [
    {
        id: 1,
        title: 'Bulgarian Squat',
        daysAgo: 2,
        image: 'https://images.unsplash.com/photo-1571019614242-2979f87e35b9?q=80&w=600'
    },
    {
        id: 2,
        title: 'Keep-fit Exercise',
        daysAgo: 4,
        image: 'https://images.unsplash.com/photo-1546483875-cf778c109731?q=80&w=600'
    },
    {
        id: 3,
        title: 'Weighted Abs',
        daysAgo: 5,
        image: 'https://images.unsplash.com/photo-1603517203390-3b6b6d51c72f?q=80&w=600'
    },
];

export const coachPhotos = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=600'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1599058917212-d75685827616?q=80&w=600'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1574680096145-af4b574a13e5?q=80&w=600'
    },
];

// --- NEW DATA STRUCTURES ---

export interface Coach {
    id: number;
    name: string;
    profileImageUrl: string | null;
    bio: string;
    specialties: string[];
    rating: number;
    reviews: number;
    yearsExperience: number;
}

export const allCoaches: Coach[] = [
    {
        id: 101,
        name: 'Alex Johnson',
        profileImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef057e5e11?q=80&w=600', // Placeholder URL
        bio: 'A former professional athlete and certified strength & conditioning specialist with a passion for high-intensity interval training and endurance sports.',
        specialties: ['HIIT', 'Endurance', 'Strength Training'],
        rating: 4.9,
        reviews: 212,
        yearsExperience: 10,
    },
    {
        id: 102,
        name: 'Sarah Chen',
        profileImageUrl: 'https://images.unsplash.com/photo-1590487988256-9ef24123da62?q=80&w=600', // Placeholder URL
        bio: 'Sarah focuses on holistic wellness, specializing in mindful movement, yoga, and stress management for busy professionals.',
        specialties: ['Yoga', 'Mindfulness', 'Stress Management'],
        rating: 4.8,
        reviews: 155,
        yearsExperience: 7,
    },
    {
        id: 103,
        name: 'David Lee',
        profileImageUrl: 'https://images.unsplash.com/photo-1590485721102-140b2f5b5f88?q=80&w=600', // Placeholder URL
        bio: 'Expert in weight loss and bodybuilding. David provides structured, progressive programs with a strong focus on measurable results.',
        specialties: ['Weight Loss', 'Bodybuilding', 'Macro Counting'],
        rating: 4.7,
        reviews: 301,
        yearsExperience: 12,
    },
];
