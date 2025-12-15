import { File, MessageSquare, Pin, BarChart2, Star } from 'lucide-react';

export const blogPosts = [
  {
    id: 1,
    title: 'Master Your Workouts with These Proven Fitness Tips',
    slug: 'master-your-workouts',
    category: 'Fitness',
    categoryIcon: '🏋️',
    author: {
      name: 'John Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb8ecca13?q=80&w=600&auto=format&fit=crop',
    },
    date: 'July 15, 2025',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1563824368560-a29774648750?q=80&w=1200',
    excerpt: 'Discover a wealth of fitness wisdom in our comprehensive collection of expert-backed fitness tips. Whether you’re a fitness newbie or a seasoned gym-goer, these valuable insights will elevate your workouts and maximize your results.',
    content: `
      <p>Discover a wealth of fitness wisdom in our comprehensive collection of expert-backed fitness tips. Whether you’re a fitness newbie or a seasoned gym-goer, these valuable insights will elevate your workouts and maximize your results. From training techniques and workout routines to injury prevention and recovery strategies, our fitness tips cover every aspect of your fitness journey. Get ready to unlock your true potential and achieve your fitness goals with confidence and success!</p>
      
      <h3>Effective Warm-ups</h3>
      <p>Before any workout, a proper warm-up is crucial. It prepares your muscles for activity, increases blood flow, and reduces the risk of injury. A good warm-up typically includes light cardio for 5-10 minutes followed by dynamic stretches.</p>
      
      <h3>The Power of Consistency</h3>
      <p>Consistency is more important than intensity. It’s better to have a consistent, moderate workout routine than sporadic, intense sessions. Building a habit is key to long-term success.</p>
      
      <h3>Nutrition is Key</h3>
      <p>Your diet plays a massive role in your fitness journey. Fuel your body with a balanced mix of protein, carbohydrates, and healthy fats. Hydration is also essential, so make sure you're drinking plenty of water throughout the day.</p>
      
      <h3>Listen to Your Body</h3>
      <p>Don't push through pain. Listen to your body and take rest days when needed. Overtraining can lead to burnout and injury, setting you back on your progress.</p>
      
      <h3>Track Your Progress</h3>
      <p>Keep a workout journal to track your progress. Log your sets, reps, and weights to see how you're improving over time. This can be a great motivator and help you stay on track.</p>
    `,
  },
  {
    id: 2,
    title: '5 Effective Ways to Boost Your Cardiovascular Endurance',
    slug: 'boost-cardiovascular-endurance',
    category: 'Fitness',
    categoryIcon: '🏃',
    author: {
      name: 'Sarah Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94efb9e11aa2?q=80&w=600&auto=format&fit=crop',
    },
    date: 'August 3, 2025',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200',
    excerpt: 'Learn five proven methods to increase your cardiovascular endurance, allowing you to perform longer and more intense workouts with ease.',
    content: `
      <p>Building cardiovascular endurance is a cornerstone of any effective fitness plan. It improves heart health, increases stamina, and boosts overall energy levels. Here are five simple yet powerful ways to boost your cardio capacity.</p>
      
      <h3>1. High-Intensity Interval Training (HIIT)</h3>
      <p>HIIT involves short bursts of intense exercise followed by brief recovery periods. This method is incredibly effective at improving endurance and burning calories in a short amount of time. Examples include sprint intervals, Tabata workouts, and cycling with varied resistance.</p>
      
      <h3>2. Consistent Running or Jogging</h3>
      <p>The simplest way to improve cardio is to run. Start with short, manageable distances and gradually increase your pace and duration. Aim for at least 3-4 sessions per week.</p>
      
      <h3>3. Incorporate Swimming</h3>
      <p>Swimming is a fantastic full-body workout that is low-impact and great for endurance. It strengthens your heart and lungs without putting stress on your joints.</p>
      
      <h3>4. Jump Rope</h3>
      <p>Jumping rope is not just for kids! It's an excellent cardio exercise that improves coordination, agility, and stamina. A 10-minute jump rope session can be as effective as a 30-minute jog.</p>
      
      <h3>5. Cycling</h3>
      <p>Whether you're on a stationary bike or cruising outdoors, cycling is a great way to build cardiovascular endurance. It's easy on the knees and can be adjusted to suit all fitness levels.</p>
    `,
  },
  {
    id: 3,
    title: 'How to Be Happy: 27 Habits to Add to Your Routine',
    slug: 'how-to-be-happy',
    category: 'Mental Health',
    categoryIcon: '🧠',
    author: {
      name: 'Arya Stark',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-cf8743191f61?q=80&w=600&auto=format&fit=crop',
    },
    date: 'July 20, 2025',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1594381830635-4db9d54e4c3b?q=80&w=1200',
    excerpt: 'Discover daily, monthly, and yearly habits to help you on your quest to find happiness. You can apply them to your daily life for a healthy mental lifestyle.',
    content: `
      <p>Happiness is a journey, not a destination. It's a state of mind that can be cultivated through intentional habits and practices. While everyone's path to happiness is unique, there are some universal habits that can help you on your quest.</p>
      
      <h3>Daily Habits</h3>
      <ul>
        <li>**Practice Gratitude:** Start and end your day by listing three things you're grateful for. This simple practice shifts your focus to the positive.</li>
        <li>**Move Your Body:** Physical activity is a powerful mood booster. A daily walk, yoga session, or workout can release endorphins and reduce stress.</li>
        <li>**Mindfulness Meditation:** Spend a few minutes each day focusing on your breath. This can help calm your mind and reduce feelings of anxiety.</li>
        <li>**Limit Social Media:** Unplugging from social media can reduce feelings of comparison and FOMO (Fear of Missing Out), allowing you to focus on your own life.</li>
        <li>**Get Enough Sleep:** Aim for 7-9 hours of quality sleep per night. Sleep deprivation can significantly impact your mood and emotional well-being.</li>
      </ul>
      
      <h3>Weekly Habits</h3>
      <ul>
        <li>**Learn Something New:** Dedicate time each week to learning a new skill or hobby. This keeps your mind engaged and gives you a sense of accomplishment.</li>
        <li>**Connect with Loved Ones:** Schedule a call or meet-up with friends or family. Strong social connections are a key predictor of happiness.</li>
        <li>**Tidy Your Space:** A clean and organized environment can have a positive effect on your mental clarity and reduce feelings of overwhelm.</li>
      </ul>
      
      <h3>Yearly Habits</h3>
      <ul>
        <li>**Set and Review Goals:** Take time to set personal and professional goals. Having a sense of purpose and direction can boost your motivation and happiness.</li>
        <li>**Travel or Explore:** Plan a trip to a new place, even if it's just a weekend getaway. New experiences and environments can revitalize your spirit.</li>
      </ul>
    `,
  },
];
