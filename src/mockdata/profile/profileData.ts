// src/mockdata/profile/profileData.ts

export const customerProfile = {
  id: 'cust_12345',
  personalInfo: {
    fullName: 'Juliette Karapetyan',
    username: '@juliet.ux',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200',
    role: 'UX/UI Designer',
    experience: '4+ years of experience',
    location: 'Yerevan, Armenia',
    joinedDate: 'Joined April 2023',
    email: 'juliette.k@example.com',
    phoneNumber: '+374 12 345 678',
  },
  goals: [
    'Gain 5 lbs of muscle mass',
    'Improve cardiovascular endurance',
    'Learn to cook 10 new healthy recipes',
    'Practice daily mindfulness meditation for 15 minutes',
  ],
  preferences: {
    theme: 'system',
    notifications: {
      newMessages: true,
      coachFeedback: true,
      progressReminders: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: 'minimal',
    },
  },
  payment: {
    currentPlan: {
      name: 'Pro Plan',
      price: '$29.99',
      billingCycle: 'monthly',
      nextBillingDate: '2025-10-08',
    },
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expiry: '12/26',
    },
    history: [
      { id: 1, date: '2025-09-08', description: 'Pro Plan Subscription', amount: '$29.99', status: 'Completed' },
      { id: 2, date: '2025-08-08', description: 'Pro Plan Subscription', amount: '$29.99', status: 'Completed' },
      { id: 3, date: '2025-07-08', description: 'Pro Plan Subscription', amount: '$29.99', status: 'Completed' },
    ],
  },
  
};
