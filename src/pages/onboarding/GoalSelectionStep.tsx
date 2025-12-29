// src/pages/onboarding/GoalSelectionStep.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ EKLENDİ
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { MultiSelectButton } from "@/components/onboarding/MultiSelectButton";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ✅ EKLENDİ
import { supabase } from "@/integrations/supabase/client"; // ✅ EKLENDİ
import { useAuth } from "@/contexts/AuthContext"; // ✅ EKLENDİ

const goals = [
  { id: "get-fit", emoji: "💪", title: "Get Fit", category: "fitness" },
  {
    id: "build-muscle",
    emoji: "🏋️",
    title: "Build Muscle",
    category: "fitness",
  },
  {
    id: "get-stronger",
    emoji: "💥",
    title: "Get Stronger",
    category: "fitness",
  },
  { id: "burn-fat", emoji: "🔥", title: "Burn Fat", category: "fitness" },
  { id: "get-toned", emoji: "✨", title: "Get Toned", category: "fitness" },
  {
    id: "eat-healthier",
    emoji: "🥗",
    title: "Eat Healthier",
    category: "nutrition",
  },
  {
    id: "weight-loss",
    emoji: "⚖️",
    title: "Weight Loss",
    category: "nutrition",
  },
  {
    id: "improve-habits",
    emoji: "🎯",
    title: "Improve Habits",
    category: "nutrition",
  },
  {
    id: "more-energy",
    emoji: "⚡",
    title: "More Energy",
    category: "nutrition",
  },
  {
    id: "reduce-cravings",
    emoji: "🍃",
    title: "Reduce Cravings",
    category: "nutrition",
  },
  {
    id: "reduce-stress",
    emoji: "🧘",
    title: "Reduce Stress",
    category: "mental",
  },
  {
    id: "improve-sleep",
    emoji: "😴",
    title: "Improve Sleep",
    category: "mental",
  },
  {
    id: "build-mindfulness",
    emoji: "🌸",
    title: "Build Mindfulness",
    category: "mental",
  },
  {
    id: "emotional-balance",
    emoji: "🌈",
    title: "Emotional Balance",
    category: "mental",
  },
  { id: "boost-focus", emoji: "🎯", title: "Boost Focus", category: "mental" },
];

const GoalSelectionStep = () => {
  const { state, updateState, loading } = useOnboarding();
  const { user } = useAuth(); // ✅ EKLENDİ
  const navigate = useNavigate();

  // ✅ YENİ STATE’LER (mevcut state’lere dokunulmadı)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // ✅ ROLE KONTROLÜ (ilk açılışta)
  useEffect(() => {
    if (!user) return;

    const checkRole = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Role check error:", error);
        setCheckingRole(false);
        return;
      }

      if (!profile.role) {
        // 🔥 İlk kez gelen kullanıcı → modal aç
        setShowRoleModal(true);
      } else if (profile.role === "coach") {
        // Coach bu sayfada olmamalı
        navigate("/coach/onboarding", { replace: true });
        return;
      }

      setCheckingRole(false);
    };

    checkRole();
  }, [user, navigate]);

  // ✅ ROLE SEÇME HANDLER’I
  const handleSelectRole = async (role: "customer" | "coach") => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    if (error) {
      console.error("Role update error:", error);
      alert("Something went wrong. Please try again.");
      return;
    }

    if (role === "customer") {
      // Modal kapanır, onboarding devam eder
      setShowRoleModal(false);
    } else {
      navigate("/coach/onboarding", { replace: true });
    }
  };

  // 🔒 Role kontrolü bitmeden içerik render edilmesin
  if (checkingRole) {
    return null;
  }

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = state.goals;
    if (currentGoals.includes(goalId)) {
      const newGoals = currentGoals.filter((id) => id !== goalId);
      updateState("goals", newGoals);
    } else if (currentGoals.length < 8) {
      const newGoals = [...currentGoals, goalId];
      updateState("goals", newGoals);
    }
  };

  return (
    <OnboardingContainer
      title="What brings you to TrainWise?"
      subtitle="Select up to 8 goals that matter most to you. This helps us personalize your journey from day one."
      currentStep={1}
      totalSteps={5}
      showBack={false}
      onNext={() => navigate("/onboarding/step-2")}
      nextDisabled={state.goals.length === 0 || loading}
      isLoading={loading}
      forceLightMode={true}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-end">
          <div className="text-sm font-medium text-gray-600 bg-white/60 px-3 py-1 rounded-full">
            {state.goals.length}/8 selected
          </div>
        </div>

        <GoalSection
          title="Fitness Goals"
          goals={goals.filter((g) => g.category === "fitness")}
          onToggle={handleGoalToggle}
          selectedGoals={state.goals}
        />
        <GoalSection
          title="Nutrition Goals"
          goals={goals.filter((g) => g.category === "nutrition")}
          onToggle={handleGoalToggle}
          selectedGoals={state.goals}
        />
        <GoalSection
          title="Mental Wellness Goals"
          goals={goals.filter((g) => g.category === "mental")}
          onToggle={handleGoalToggle}
          selectedGoals={state.goals}
        />
      </div>

      {/* ✅ ROLE SEÇİM MODAL’I */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full space-y-6">
            <h2 className="text-xl font-bold text-center">
              How do you want to use TrainWise?
            </h2>

            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => handleSelectRole("customer")}
              >
                I am a Customer
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSelectRole("coach")}
              >
                I am a Coach
              </Button>
            </div>
          </div>
        </div>
      )}
    </OnboardingContainer>
  );
};

const GoalSection = ({
  title,
  goals,
  onToggle,
  selectedGoals,
}: {
  title: string;
  goals: Array<{ id: string; emoji: string; title: string; category: string }>;
  onToggle: (id: string) => void;
  selectedGoals: string[];
}) => (
  <Card className="bg-white/60 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {goals.map((goal) => (
          <MultiSelectButton
            key={goal.id}
            selected={selectedGoals.includes(goal.id)}
            onClick={() => onToggle(goal.id)}
          >
            <span className="text-lg mr-2">{goal.emoji}</span>
            {goal.title}
          </MultiSelectButton>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default GoalSelectionStep;
