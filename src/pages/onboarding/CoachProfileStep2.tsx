import { useNavigate } from "react-router-dom";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";

const SKILLS = [
  "Strength Training",
  "HIIT",
  "Yoga",
  "Pilates",
  "Bodybuilding",
  "Endurance",
  "Weight Loss",
  "Functional Training",
  "Meal Planning",
  "Sports Nutrition",
  "Weight Management",
  "Dietary Restrictions",
  "Supplements",
  "Macro Coaching",
  "Mindfulness",
  "Stress Management",
  "Motivation Coaching",
  "Habit Formation",
  "Work-Life Balance",
  "Goal Setting",
  "Injury Rehabilitation",
  "Senior Fitness",
  "Youth Training",
  "Competition Prep",
  "Posture Correction",
  "Athletic Performance",
];

const CoachProfileStep2 = () => {
  const navigate = useNavigate();
  const { state, updateState } = useOnboarding();
  const coach = state.coachProfile;

  const updateCoach = (patch: Partial<typeof coach>) => {
    updateState("coachProfile", {
      ...coach,
      ...patch,
    });
  };

  /** Skill toggle (min 3, max 8) */
  const toggleSkill = (skill: string) => {
    const skills = coach.skills;

    if (skills.includes(skill)) {
      updateCoach({
        skills: skills.filter((s) => s !== skill),
      });
    } else {
      if (skills.length >= 8) return;
      updateCoach({
        skills: [...skills, skill],
      });
    }
  };

  const addCert = (value: string) => {
    if (!value.trim()) return;
    updateCoach({
      certifications: [...coach.certifications, value.trim()],
    });
  };

  return (
    <OnboardingContainer
      title="Your expertise"
      subtitle="Help clients understand what you specialize in."
      currentStep={2}
      totalSteps={3}
      showBack
      onNext={() => {}}
      nextDisabled={coach.skills.length < 3}
    >
      <div className="max-w-3xl mx-auto space-y-8">

        {/* SKILLS */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Skills & Specialties *</h3>
              <span className="text-sm text-muted-foreground">
                {coach.skills.length}/8 selected
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {SKILLS.map((skill) => {
                const selected = coach.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition
                      ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CERTIFICATIONS */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-semibold">Certifications</h3>

            <Input
              placeholder="e.g. NASM CPT"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCert(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />

            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {coach.certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* SOCIALS */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-semibold">Social links (optional)</h3>

            <Input
              placeholder="Instagram URL"
              value={coach.socials.instagram ?? ""}
              onChange={(e) =>
                updateCoach({
                  socials: { ...coach.socials, instagram: e.target.value },
                })
              }
            />

            <Input
              placeholder="Website URL"
              value={coach.socials.website ?? ""}
              onChange={(e) =>
                updateCoach({
                  socials: { ...coach.socials, website: e.target.value },
                })
              }
            />

            <Input
              placeholder="YouTube URL"
              value={coach.socials.youtube ?? ""}
              onChange={(e) =>
                updateCoach({
                  socials: { ...coach.socials, youtube: e.target.value },
                })
              }
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => navigate("/onboarding/coach-step-3")}>
            Continue
          </Button>
        </div>
      </div>
    </OnboardingContainer>
  );
};

export default CoachProfileStep2;
