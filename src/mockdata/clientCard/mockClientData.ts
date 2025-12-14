// src/mockdata/clientCard/mockClientData.ts
import { format, subDays } from 'date-fns';

// ---------- Generators ----------
const generateDailyData = (days: number) => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = subDays(today, days - 1 - i);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      water: +(Math.random() * 1.5 + 1.5).toFixed(1), // 1.5–3.0 L
      energy: Math.floor(Math.random() * 5) + 1, // 1–5
      sleep: +(Math.random() * 2 + 6).toFixed(1), // 6–8 h
      mood: Math.floor(Math.random() * 5) + 1, // 1–5
      stress: Math.floor(Math.random() * 5) + 1, // 1–5
      anxiety: Math.floor(Math.random() * 5) + 1, // 1–5
      meditationTime: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 5 : 0,
      yogaTime: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 15 : 0,
      portionsTracked: +(Math.random() * 10 + 5).toFixed(1), // 5–15
      ateElse: Math.random() > 0.3,
    });
  }
  return data;
};

const generateWeightData = (months: number) => {
  const data = [];
  const today = new Date();
  let currentWeight = 68.8;
  for (let i = 0; i < months * 4; i++) {
    const date = subDays(today, (months * 4 - 1 - i) * 7);
    currentWeight += (Math.random() - 0.5) * 0.4; // +/- 0.2 kg per week
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      weight: +currentWeight.toFixed(1),
    });
  }
  return data;
};

const generateFitnessData = (weeks: number) => {
  const progression = [];
  let adherence = 80;
  for (let i = 0; i < weeks; i++) {
    adherence += (Math.random() - 0.5) * 5; // +/- 2.5%
    adherence = Math.min(100, Math.max(60, adherence));
    progression.push({
      week: i + 1,
      adherence: +adherence.toFixed(1),
    });
  }
  return {
    adherence: +(adherence.toFixed(1)),
    progression,
  };
};

// ---------- Trend Calculation ----------
const calculateTrends = (data: any[]) => {
  const latest = data.slice(-14);
  const getTrend = (key: string) => {
    if (latest.length < 2) return '→';
    const mid = Math.floor(latest.length / 2);
    const first = latest.slice(0, mid).reduce((sum, d) => sum + d[key], 0) / mid;
    const second = latest.slice(mid).reduce((sum, d) => sum + d[key], 0) / (latest.length - mid);
    const diff = second - first;
    if (Math.abs(diff) < 0.2) return '→';
    return diff > 0 ? '↑' : '↓';
  };
  return {
    mood: getTrend('mood'),
    sleep: getTrend('sleep'),
    energy: getTrend('energy'),
    stress: getTrend('stress'),
  };
};

// ---------- Data Assembly ----------
const allDailyData = generateDailyData(180);
const allWeightData = generateWeightData(6);
const fitnessData = generateFitnessData(12);
const trends = calculateTrends(allDailyData);

export const mockClientData = {
  id: 'client_123',
  name: 'Jessica Lee',
  plan: 'Premium',
  status: 'On Track',
  color: 'bg-green-500',
  profilePicture: 'https://i.pravatar.cc/150?u=jessica-lee',
  personalInfo: {
    age: 32,
    gender: 'Female',
    height: '170 cm',
    weight: '65 kg',
  },
  goals: ['Fat Reduction', 'Increased Energy'],
  preferences: {
    injuries: ['Knee (old injury)'],
    allergies: ['Peanuts'],
    likes: ['Spicy food', 'HIIT workouts'],
    dislikes: ['Running', 'Boring exercises'],
    preferredProgramType: ['Fitness'],
  },
  insights: {
    programProgress: '75%',
    avgDailyCheckIn: '95%',
    adherence: '92%',
    nextFollowUp: 'Sep 25',
  },
  stats: {
    caloriesBurned: '2100 kcal',
    macros: 'P: 120g, C: 200g, F: 55g',
    minutesMeditated: '30 min',
  },
  programFill: {
    fitness: 85,
    nutrition: 78,
    mentalHealth: 92,
  },
  dailyCheckIn: allDailyData,
  weightTrend: allWeightData,
  fitness: fitnessData,
  progressPhotos: [
    {
      url: 'https://images.unsplash.com/photo-1549476317-09f19318b76c?q=80&w=1974&auto=format&fit=crop',
      date: '2025-07-01',
      isNewest: false,
    },
    {
      url: 'https://images.unsplash.com/photo-1549476317-09f19318b76c?q=80&w=1974&auto=format&fit=crop',
      date: '2025-08-01',
      isNewest: false,
    },
    {
      url: 'https://images.unsplash.com/photo-1549476317-09f19318b76c?q=80&w=1974&auto=format&fit=crop',
      date: '2025-09-01',
      isNewest: true,
    },
  ],
  trends,
  nutrition: {
    adherence: 85,
    adherenceMessage: 'Maintains consistent meal tracking.',
    portionsPerDay: 7.2,
    portionMessage: 'Average portions tracked daily.',
    micronutrientStatus: {
      fiber: 'adequate',
      iron: 'low',
      vitamin_d: 'adequate',
    },
  },
  mentalHealth: {
    avgStress: 2.5,
    stressTrend: trends.stress,
    avgAnxiety: 2.1,
    anxietyTrend: trends.stress,
    meditationTime: 15,
    meditationTrend: '↑',
    meditationValue: 'Consistent daily practice.',
    yogaTime: 30,
    yogaTrend: '→',
    yogaValue: 'Occasional sessions, consistent duration.',
  },
};
