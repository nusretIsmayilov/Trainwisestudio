import { useNavigate } from 'react-router-dom';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const RoleSelectionStep = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCustomer = () => {
    // hiçbir şey yapma
    navigate('/onboarding/step-1');
  };

  const handleCoach = async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ role: 'coach' })
      .eq('id', user.id);

    navigate('/onboarding/coach-step-1');
  };

  return (
    <OnboardingContainer
      title="Who are you?"
      subtitle="This helps us set up the right experience for you."
      currentStep={0}
      totalSteps={5}
      showBack={false}
      onNext={() => {}}
      nextDisabled={true}
    >
      <div className="max-w-md mx-auto space-y-4">
        <Button className="w-full" onClick={handleCustomer}>
          I’m a Customer
        </Button>

        <Button variant="outline" className="w-full" onClick={handleCoach}>
          I’m a Coach
        </Button>
      </div>
    </OnboardingContainer>
  );
};

export default RoleSelectionStep;
