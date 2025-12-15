// src/pages/onboarding/PreferencesStep.tsx
import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { MultiSelectButton } from '@/components/onboarding/MultiSelectButton';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// --- Data updated with IDs and Emojis for a more visual experience ---
const allergies = [
    { id: 'dairy', label: 'Dairy', icon: '🥛' },
    { id: 'gluten', label: 'Gluten', icon: '🍞' },
    { id: 'nuts', label: 'Nuts', icon: '🥜' },
    { id: 'eggs', label: 'Eggs', icon: '🥚' },
    { id: 'soy', label: 'Soy', icon: '🌱' },
    { id: 'fish', label: 'Fish', icon: '🐟' },
    { id: 'shellfish', label: 'Shellfish', icon: '🦞' },
    { id: 'lactose', label: 'Lactose', icon: '🧀' },
];
const trainingOptions = [
    { id: 'strength', label: 'Strength', icon: '💪' },
    { id: 'cardio', label: 'Cardio', icon: '🏃‍♂️' },
    { id: 'endurance', label: 'Endurance', icon: '🚴‍♀️' },
    { id: 'weights', label: 'Weights', icon: '🏋️' },
    { id: 'calisthenics', label: 'Calisthenics', icon: '🤸' },
    { id: 'hiit', label: 'HIIT', icon: '🔥' },
    { id: 'outdoor', label: 'Outdoor', icon: '🌲' },
    { id: 'running', label: 'Running', icon: '👟' },
];
const injuries = [
    { id: 'lower-back', label: 'Lower back', icon: '🤕' },
    { id: 'neck', label: 'Neck', icon: '🧣' },
    { id: 'knee', label: 'Knee', icon: '🦵' },
    { id: 'shoulder', label: 'Shoulder', icon: '🙋‍♂️' },
    { id: 'wrist-elbow', label: 'Wrist/Elbow', icon: '💪' },
];
const meditationOptions = [
  { value: 'never', label: 'Never tried it', emoji: '🤔' },
  { value: 'beginner', label: 'Just started', emoji: '🌱' },
  { value: 'sometimes', label: 'Practice sometimes', emoji: '🧘' },
  { value: 'regular', label: 'Regular practice', emoji: '🧠' },
  { value: 'experienced', label: 'Very experienced', emoji: '🕉️' },
];

const PreferencesStep = () => {
  const { state, updateState, loading } = useOnboarding();
  const navigate = useNavigate();
  const { preferences } = state;

  const handleMultiSelect = (field, value) => {
    const currentValues = preferences[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    updateState('preferences', { ...preferences, [field]: newValues });
  };

  return (
    <OnboardingContainer
      title="Customize Your Experience"
      subtitle="Your preferences help us build a plan you'll love."
      currentStep={3}
      totalSteps={5}
      onBack={() => navigate('/onboarding/step-2')}
      onNext={() => navigate('/onboarding/step-4')}
      isLoading={loading}
      forceLightMode={true}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <PreferenceSection title="Do you have any food allergies?">
          <MultiSelectGrid items={allergies} selected={preferences.allergies} onSelect={(item) => handleMultiSelect('allergies', item.id)} />
        </PreferenceSection>
        
        <PreferenceSection title="What kind of training do you enjoy?">
          <MultiSelectGrid items={trainingOptions} selected={preferences.trainingLikes} onSelect={(item) => handleMultiSelect('trainingLikes', item.id)} />
        </PreferenceSection>
        
        <PreferenceSection title="Is there anything you want to avoid?">
          <MultiSelectGrid items={trainingOptions} selected={preferences.trainingDislikes} onSelect={(item) => handleMultiSelect('trainingDislikes', item.id)} />
        </PreferenceSection>

        <PreferenceSection title="Any past injuries to be mindful of?">
          <MultiSelectGrid items={injuries} selected={preferences.injuries} onSelect={(item) => handleMultiSelect('injuries', item.id)} />
        </PreferenceSection>

        <PreferenceSection title="How experienced are you with meditation?">
          <RadioGroup value={preferences.meditationExperience} onValueChange={(val) => updateState('preferences', {...preferences, meditationExperience: val})} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meditationOptions.map(opt => (
              <Label key={opt.value} className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:shadow-lg has-[:checked]:scale-105 bg-white hover:border-emerald-300">
                <RadioGroupItem value={opt.value} />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-semibold text-gray-800">{opt.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </PreferenceSection>
      </div>
    </OnboardingContainer>
  );
};

// --- Reusable Sub-components for this page ---

const PreferenceSection = ({ title, children }) => (
  <Card className="bg-white/60 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <div className="mt-4">{children}</div>
    </CardContent>
  </Card>
);

const MultiSelectGrid = ({ items, selected, onSelect }) => (
  <div className="flex flex-wrap gap-3">
    {items.map(item => (
      <MultiSelectButton
        key={item.id}
        selected={selected.includes(item.id)}
        onClick={() => onSelect(item)}
      >
        <span className="text-lg mr-2">{item.icon}</span>
        {item.label}
      </MultiSelectButton>
    ))}
  </div>
);

export default PreferencesStep;
