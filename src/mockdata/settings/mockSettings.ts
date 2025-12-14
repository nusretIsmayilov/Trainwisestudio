export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

export interface SocialLink {
  id: string;
  platform: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Website';
  url: string;
}

export interface CoachProfile {
  name: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  certifications: Certification[];
  socials: SocialLink[];
}

export interface CoachAccount {
  id?: string;
  email: string;
  phone: string;
  payoutMethod: 'paypal' | 'stripe' | 'PayPal' | 'Stripe';
  payoutDetails: string; // e.g., last 4 digits of account/IBAN
  preferredLanguage: 'English' | 'Spanish' | 'German';
}

export const mockProfile: CoachProfile = {
  name: 'Jane Doe',
  tagline: 'Elite Performance Coach | Fitness & Wellness',
  bio: 'With over 10 years of experience, I specialize in functional strength training and sustainable nutrition plans tailored for busy professionals. My goal is to transform not just your body, but your entire lifestyle.',
  profileImageUrl: 'https://placehold.co/100x100/A0E7E5/030712?text=JD',
  certifications: [
    { id: 'c1', name: 'NASM Certified Personal Trainer', issuer: 'NASM', year: 2018 },
    { id: 'c2', name: 'Precision Nutrition L1', issuer: 'PN', year: 2020 },
  ],
  socials: [
    { id: 's1', platform: 'Instagram', url: 'https://instagram.com/janedoefit' },
    { id: 's2', platform: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' },
  ],
};

export const mockAccount: CoachAccount = {
  email: 'jane.doe@coachplatform.com',
  phone: '+1 (555) 123-4567',
  payoutMethod: 'PayPal',
  payoutDetails: 'jane.doe@example.com',
  preferredLanguage: 'English',
};
