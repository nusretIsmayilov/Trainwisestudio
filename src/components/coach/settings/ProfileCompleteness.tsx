'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { CoachProfile } from '@/hooks/useCoachProfile';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProfileCompletenessProps {
  profile: CoachProfile;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  tip?: string;
}

export const calculateCompleteness = (profile: CoachProfile): number => {
  let score = 0;
  const total = 100;
  
  // Required fields (60 points)
  if (profile.full_name && profile.full_name.length >= 2) score += 20;
  if (profile.tagline && profile.tagline.length >= 10) score += 15;
  if (profile.bio && profile.bio.length > 100) score += 25;
  
  // Optional but important (40 points)
  if (profile.avatar_url) score += 10;
  if (profile.skills.length >= 3) score += 10;
  if (profile.certifications.length >= 1) score += 10;
  if (profile.socials.length >= 1) score += 5;
  if (profile.price_min_cents && profile.price_max_cents) score += 5;
  
  return Math.round((score / total) * 100);
};

const getProfileStrength = (percentage: number, t: any): { label: string; color: string } => {
  if (percentage >= 90) return { label: t('settings.excellent'), color: 'text-green-500' };
  if (percentage >= 70) return { label: t('settings.good'), color: 'text-blue-500' };
  if (percentage >= 50) return { label: t('settings.fair'), color: 'text-yellow-500' };
  return { label: t('settings.weak'), color: 'text-red-500' };
};

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ profile }) => {
  const { t } = useTranslation();
  const percentage = calculateCompleteness(profile);
  const strength = getProfileStrength(percentage, t);

  const items: CompletionItem[] = [
    {
      label: 'Full Name',
      completed: !!(profile.full_name && profile.full_name.length >= 2),
      tip: 'Your full name is required (minimum 2 characters)'
    },
    {
      label: 'Tagline',
      completed: !!(profile.tagline && profile.tagline.length >= 10),
      tip: 'Tagline must be at least 10 characters to help clients understand your value'
    },
    {
      label: t('settings.profilePhoto'),
      completed: !!profile.avatar_url,
      tip: t('settings.profilePhotoTip')
    },
    {
      label: t('settings.completeBio'),
      completed: profile.bio.length > 100,
      tip: t('settings.completeBioTip')
    },
    {
      label: t('settings.skills'),
      completed: profile.skills.length >= 3,
      tip: t('settings.skillsTip')
    },
    {
      label: t('settings.certifications'),
      completed: profile.certifications.length >= 1,
      tip: t('settings.certificationsTip')
    },
    {
      label: t('settings.socialLinks'),
      completed: profile.socials.length >= 1,
      tip: t('settings.socialLinksTip')
    },
    {
      label: t('settings.priceRange'),
      completed: !!(profile.price_min_cents && profile.price_max_cents),
      tip: t('settings.priceRangeTip')
    },
  ];

  const incompleteItems = items.filter(item => !item.completed);

  return (
    <Card className="shadow-md border-primary/20">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t('settings.profileStrength')}</h3>
            <p className="text-sm text-muted-foreground">
              <span className={cn('font-bold', strength.color)}>{strength.label}</span>
              {' • '}
              {percentage}% {t('settings.complete')}
            </p>
          </div>
          <div className="text-3xl font-bold text-primary">{percentage}%</div>
        </div>

        <Progress value={percentage} className="h-2" />

        {incompleteItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>{t('settings.completeProfileToStandOut')}</span>
            </div>
            <div className="space-y-1.5">
              {incompleteItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.tip && <span className="text-xs"> - {item.tip}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {percentage === 100 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{t('settings.profileCompleteMessage')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
