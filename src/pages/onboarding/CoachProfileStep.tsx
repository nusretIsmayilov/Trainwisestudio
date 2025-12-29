import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';

const CoachProfileStep = () => {
  const navigate = useNavigate();
  const { state, updateState } = useOnboarding();
  const coach = state.coachProfile;

  const updateCoach = (patch: Partial<typeof coach>) => {
    updateState('coachProfile', {
      ...coach,
      ...patch,
    });
  };

  const handleNext = () => {
    navigate('/onboarding/coach-step-2');
  };

  const isValid =
    coach.fullName.trim() &&
    coach.tagline.trim() &&
    coach.bio.trim();

  return (
    <OnboardingContainer
      title="Create your coach profile"
      subtitle="This information will be shown to potential clients."
      currentStep={1}
      totalSteps={3}
      showBack
      onNext={() => {}}
      nextDisabled={!isValid}
    >
      <div className="max-w-2xl mx-auto space-y-6">

        <Card>
          <CardContent className="space-y-4 pt-6">
            <Input
              placeholder="Full name"
              value={coach.fullName}
              onChange={(e) =>
                updateCoach({ fullName: e.target.value })
              }
            />

            <Input
              placeholder="Tagline (e.g. Helping busy people lose fat)"
              value={coach.tagline}
              onChange={(e) =>
                updateCoach({ tagline: e.target.value })
              }
            />

            <Textarea
              placeholder="Tell clients about yourself, your approach, and who you help"
              rows={6}
              value={coach.bio}
              onChange={(e) =>
                updateCoach({ bio: e.target.value })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-semibold">Pricing (monthly)</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min price ($)"
                value={coach.priceMin}
                onChange={(e) =>
                  updateCoach({ priceMin: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Max price ($)"
                value={coach.priceMax}
                onChange={(e) =>
                  updateCoach({ priceMax: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={!isValid}>
            Continue
          </Button>
        </div>

      </div>
    </OnboardingContainer>
  );
};

export default CoachProfileStep;
