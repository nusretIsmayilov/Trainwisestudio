import React from 'react';
import { MultiSelectButton } from './MultiSelectButton';

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

const PREDEFINED_SKILLS = [
  // Fitness
  'Strength Training',
  'HIIT',
  'Yoga',
  'Pilates',
  'Bodybuilding',
  'Endurance',
  'Weight Loss',
  'Functional Training',
  
  // Nutrition
  'Meal Planning',
  'Sports Nutrition',
  'Weight Management',
  'Dietary Restrictions',
  'Supplements',
  'Macro Coaching',
  
  // Mental Health
  'Mindfulness',
  'Stress Management',
  'Motivation Coaching',
  'Habit Formation',
  'Work-Life Balance',
  'Goal Setting',
  
  // Specializations
  'Injury Rehabilitation',
  'Senior Fitness',
  'Youth Training',
  'Competition Prep',
  'Posture Correction',
  'Athletic Performance'
];

export const SkillsSelector: React.FC<SkillsSelectorProps> = ({
  selectedSkills,
  onSkillsChange,
}) => {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 8) {
      onSkillsChange([...selectedSkills, skill]);
    }
    // If already at 8 skills and trying to add another, do nothing
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select up to 8 skills that best represent your expertise
        </p>
        <div className="text-sm text-muted-foreground">
          {selectedSkills.length}/8 selected
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PREDEFINED_SKILLS.map((skill) => (
          <MultiSelectButton
            key={skill}
            selected={selectedSkills.includes(skill)}
            onClick={() => toggleSkill(skill)}
            disabled={!selectedSkills.includes(skill) && selectedSkills.length >= 8}
          >
            {skill}
          </MultiSelectButton>
        ))}
      </div>
    </div>
  );
};