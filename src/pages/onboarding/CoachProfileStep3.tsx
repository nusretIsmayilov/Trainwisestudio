import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";

const CoachProfileStep3 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useOnboarding();
  const coach = state.coachProfile;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!user || loading) return;

    console.log("COACH PROFILE STATE →", coach);

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "coach",
          full_name: coach.fullName,
          tagline: coach.tagline,
          bio: coach.bio,
          skills: coach.skills,
          certifications: coach.certifications,
          socials: coach.socials,
          price_min_cents: coach.priceMin ? Number(coach.priceMin) * 100 : null,
          price_max_cents: coach.priceMax ? Number(coach.priceMax) * 100 : null,
          onboarding_complete: true,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        setErrorMsg(profileError.message);
        setLoading(false);
        return;
      }

      navigate("/coach/dashboard", { replace: true });
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("Unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <OnboardingContainer
      title="You're ready to go 🚀"
      subtitle="Review everything and publish your coach profile."
      currentStep={3}
      totalSteps={3}
      showBack
      onNext={() => {}}
      nextDisabled={true}
      isLoading={loading}
    >
      <div className="max-w-xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Your coach profile will be saved</li>
              <li>Clients will be able to view your profile</li>
              <li>You’ll land on your coach dashboard</li>
            </ul>
          </CardContent>
        </Card>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <div className="flex justify-end">
          <Button type="button" onClick={handleFinish} disabled={loading}>
            Finish & Go to Dashboard
          </Button>
        </div>
      </div>
    </OnboardingContainer>
  );
};

export default CoachProfileStep3;
