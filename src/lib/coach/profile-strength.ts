export interface ProfileStrengthData {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  missingItems: string[];
  recommendations: string[];
  completedItems: string[];
}

export interface ProfileStrengthCriteria {
  hasBio: boolean;
  hasAvatar: boolean;
  hasSkills: boolean;
  hasCertifications: boolean;
  hasSocialLinks: boolean;
  hasPricing: boolean;
  hasExperience: boolean;
  hasSpecialties: boolean;
  hasTestimonials: boolean;
  hasPortfolio: boolean;
}

export function calculateProfileStrength(criteria: ProfileStrengthCriteria): ProfileStrengthData {
  const items = [
    { key: 'hasBio', label: 'Professional Bio', weight: 15 },
    { key: 'hasAvatar', label: 'Profile Photo', weight: 10 },
    { key: 'hasSkills', label: 'Skills & Expertise', weight: 15 },
    { key: 'hasCertifications', label: 'Certifications', weight: 20 },
    { key: 'hasSocialLinks', label: 'Social Media Links', weight: 10 },
    { key: 'hasPricing', label: 'Pricing Information', weight: 15 },
    { key: 'hasExperience', label: 'Experience Details', weight: 10 },
    { key: 'hasSpecialties', label: 'Specialties', weight: 5 },
    { key: 'hasTestimonials', label: 'Client Testimonials', weight: 0 }, // Bonus points
    { key: 'hasPortfolio', label: 'Portfolio/Work Samples', weight: 0 }, // Bonus points
  ];

  let score = 0;
  let maxScore = 0;
  const completedItems: string[] = [];
  const missingItems: string[] = [];

  items.forEach(item => {
    maxScore += item.weight;
    if (criteria[item.key as keyof ProfileStrengthCriteria]) {
      score += item.weight;
      completedItems.push(item.label);
    } else {
      missingItems.push(item.label);
    }
  });

  const percentage = Math.round((score / maxScore) * 100);
  
  let level: ProfileStrengthData['level'] = 'beginner';
  if (percentage >= 90) level = 'expert';
  else if (percentage >= 70) level = 'advanced';
  else if (percentage >= 50) level = 'intermediate';

  const recommendations = generateRecommendations(criteria, percentage);

  return {
    score,
    maxScore,
    percentage,
    level,
    missingItems,
    recommendations,
    completedItems
  };
}

function generateRecommendations(criteria: ProfileStrengthCriteria, percentage: number): string[] {
  const recommendations: string[] = [];

  if (!criteria.hasBio) {
    recommendations.push('Add a compelling professional bio that highlights your expertise and approach');
  }

  if (!criteria.hasCertifications) {
    recommendations.push('Include relevant certifications and credentials to build trust');
  }

  if (!criteria.hasPricing) {
    recommendations.push('Set clear pricing to help clients understand your value');
  }

  if (!criteria.hasSkills) {
    recommendations.push('List your key skills and areas of expertise');
  }

  if (!criteria.hasSocialLinks) {
    recommendations.push('Connect your social media profiles to showcase your work');
  }

  if (!criteria.hasAvatar) {
    recommendations.push('Upload a professional profile photo to build personal connection');
  }

  if (percentage < 50) {
    recommendations.push('Focus on completing the essential profile sections first');
  }

  if (percentage >= 70 && !criteria.hasTestimonials) {
    recommendations.push('Add client testimonials to showcase your success stories');
  }

  if (percentage >= 80 && !criteria.hasPortfolio) {
    recommendations.push('Create a portfolio section to demonstrate your work');
  }

  return recommendations;
}

export function getProfileStrengthColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

export function getProfileStrengthBgColor(percentage: number): string {
  if (percentage >= 90) return 'bg-green-100';
  if (percentage >= 70) return 'bg-blue-100';
  if (percentage >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function getProfileStrengthIcon(level: ProfileStrengthData['level']): string {
  switch (level) {
    case 'expert': return '🏆';
    case 'advanced': return '⭐';
    case 'intermediate': return '📈';
    case 'beginner': return '🌱';
    default: return '📊';
  }
}
