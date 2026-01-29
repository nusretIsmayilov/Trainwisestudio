// src/components/customer/dashboard/DailyCheckIn.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Check,
  Droplets,
  Battery,
  Smile,
  Moon,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentPlan } from "@/hooks/usePaymentPlan";
import { useDailyCheckins } from "@/hooks/useDailyCheckins";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const sleepOptions = [
  {
    value: 1,
    emoji: "😴",
    labelKey: "sleep.option.1.label",
    feedbackKey: "sleep.option.1.feedback",
  },
  {
    value: 2,
    emoji: "🥱",
    labelKey: "sleep.option.2.label",
    feedbackKey: "sleep.option.2.feedback",
  },
  {
    value: 3,
    emoji: "😐",
    labelKey: "sleep.option.3.label",
    feedbackKey: "sleep.option.3.feedback",
  },
  {
    value: 4,
    emoji: "😌",
    labelKey: "sleep.option.4.label",
    feedbackKey: "sleep.option.4.feedback",
  },
  {
    value: 5,
    emoji: "🤩",
    labelKey: "sleep.option.5.label",
    feedbackKey: "sleep.option.5.feedback",
  },
];

const energyOptions = [
  { value: 1, emoji: "🪫", feedbackKey: "energy.option.1.feedback" },
  { value: 2, emoji: "🔋", feedbackKey: "energy.option.2.feedback" },
  { value: 3, emoji: "⚡️", feedbackKey: "energy.option.3.feedback" },
  { value: 4, emoji: "🚀", feedbackKey: "energy.option.4.feedback" },
];

const moodOptions = [
  { value: 1, emoji: "😩", feedbackKey: "mood.option.1.feedback" },
  { value: 2, emoji: "😕", feedbackKey: "mood.option.2.feedback" },
  { value: 3, emoji: "😐", feedbackKey: "mood.option.3.feedback" },
  { value: 4, emoji: "😊", feedbackKey: "mood.option.4.feedback" },
  { value: 5, emoji: "😁", feedbackKey: "mood.option.5.feedback" },
];

const DailyCheckIn = () => {
  const { profile } = useAuth();
  const { planStatus } = usePaymentPlan();
  const { checkins, upsertToday } = useDailyCheckins();

  const { t } = useTranslation();

  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [mood, setMood] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has access to daily check-ins
  const hasCoach = Boolean(profile?.coach_id);
  const hasActivePlan = planStatus.hasActivePlan;
  const canAccessCheckIn = hasCoach || hasActivePlan;

  // Check if user already checked in today
  const today = new Date().toISOString().slice(0, 10);
  const todayCheckin = checkins.find((checkin) => checkin.date === today);
  const checkedIn = Boolean(todayCheckin);

  useEffect(() => {
    if (itemRefs.current[activeStep]) {
      itemRefs.current[activeStep]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeStep]);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newActiveStep = Math.round(scrollLeft / clientWidth);
      if (newActiveStep !== activeStep) setActiveStep(newActiveStep);
    }, 150);
  };

  const handleLogCheckIn = async () => {
    if (!canAccessCheckIn) {
      toast.error("Daily check-ins require a coach or active subscription");
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertToday({
        water_liters: water * 0.3,
        sleep_hours: sleep,
        energy: energy,
        mood: mood,
      });

      toast.success("Check-in saved successfully!");
      // Refresh page to show updated data
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast.error("Failed to save check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = water > 0 && sleep > 0 && energy > 0 && mood > 0;

  if (checkedIn) {
    return (
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          {t("daily.check.in")}
        </h2>{" "}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
          {" "}
          <CardContent className="p-6 text-center flex flex-col items-center gap-2">
            {" "}
            <Check className="w-10 h-10 bg-white/20 text-white rounded-full p-2" />{" "}
            <h3 className="text-xl font-bold">
              {t('thanks.for.checking')}
            </h3>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {" "}
      <h2 className="text-xl font-bold text-foreground mb-4">
        {" "}
        {t("daily.check.in")}
      </h2>{" "}
      <div className="space-y-4">
        {" "}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex lg:grid lg:grid-cols-2 gap-4 overflow-x-auto snap-x snap-mandatory p-2 -m-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {" "}
          <div
            ref={(el) => (itemRefs.current[0] = el)}
            className="min-w-full flex-shrink-0 snap-center lg:min-w-0 p-1"
          >
            {" "}
            <WaterModule
              value={water}
              onChange={(val) => {
                setWater(val);
                setTimeout(() => setActiveStep(1), 1000);
              }}
            />{" "}
          </div>{" "}
          <div
            ref={(el) => (itemRefs.current[1] = el)}
            className="min-w-full flex-shrink-0 snap-center lg:min-w-0 p-1"
          >
            {" "}
            <SleepModule
              value={sleep}
              onChange={(val) => {
                setSleep(val);
                setTimeout(() => setActiveStep(2), 1000);
              }}
            />{" "}
          </div>
          <div
            ref={(el) => (itemRefs.current[2] = el)}
            className="min-w-full flex-shrink-0 snap-center lg:min-w-0 p-1"
          >
            <EnergyModule
              value={energy}
              onChange={(val) => {
                setEnergy(val);
                setTimeout(() => setActiveStep(3), 1000);
              }}
              trend={0}
            />
          </div>{" "}
          <div
            ref={(el) => (itemRefs.current[3] = el)}
            className="min-w-full flex-shrink-0 snap-center lg:min-w-0 p-1"
          >
            <MoodModule value={mood} onChange={setMood} />{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex lg:hidden justify-center gap-2">
          {" "}
          {Array.from({ length: 4 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeStep === i ? "bg-orange-500 scale-125" : "bg-muted",
              )}
            />
          ))}{" "}
        </div>
        <div className="pt-2 flex justify-center">
          <Button
            onClick={handleLogCheckIn}
            disabled={!isComplete || isSubmitting || !canAccessCheckIn}
            size="lg"
            className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 font-bold disabled:bg-muted"
          >
            {isSubmitting
              ? t("saving")
              : isComplete
                ? t("log.TodaysCheck.in")
                : t("complete.all.items")}
          </Button>
        </div>{" "}
      </div>{" "}
    </div>
  );
};

// --- Modular Check-in Components ---

const WaterModule = ({ value, onChange }) => {
  const { t } = useTranslation();
  const totalLiters = (value * 0.3).toFixed(1);
  const feedback =
    value === 0
      ? t("water.intake.tap_to_log")
      : value < 8
        ? t("water.intake.current", {
            total: totalLiters,
            goal: 2.5,
          })
        : t("water.goalReached");
  return (
    <CheckInModule
      icon={<Droplets className="text-blue-500" />}
      title={t("water.intake")}
      feedback={feedback}
    >
      {" "}
      {/* FIX: Removed max-w- class to allow flexbox to use available space */}{" "}
      <div className="flex flex-wrap gap-1.5 justify-center mx-auto">
        {" "}
        {Array.from({ length: 8 }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1 === value ? i : i + 1)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110",
              i < value
                ? "bg-blue-500 text-white"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Droplets size={16} />{" "}
          </button>
        ))}{" "}
      </div>{" "}
    </CheckInModule>
  );
};

const SleepModule = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <CheckInModule
      icon={<Moon className="text-indigo-500" />}
      title={t("module.sleep.title")}
      feedback={
        value > 0
          ? t(sleepOptions[value - 1].feedbackKey)
          : t("module.sleep.empty")
      }
    >
      <EmojiSlider
        options={sleepOptions}
        value={value}
        onChange={onChange}
        showLabels
      />
    </CheckInModule>
  );
};

const EnergyModule = ({ value, onChange, trend }) => {
  const { t } = useTranslation();

  const trendIcon =
    trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : null;

  const trendText = trend === "up" ? t("module.energy.trend_up") : "";

  return (
    <CheckInModule
      icon={<Battery className="text-green-500" />}
      title={t("module.energy.title")}
      feedback={
        value > 0
          ? t(energyOptions[value - 1].feedbackKey)
          : t("module.energy.empty")
      }
      trend={{
        icon: trendIcon,
        text: trendText,
      }}
    >
      <EmojiSlider options={energyOptions} value={value} onChange={onChange} />
    </CheckInModule>
  );
};

const MoodModule = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <CheckInModule
      icon={<Smile className="text-yellow-500" />}
      title={t("module.mood.title")}
      feedback={
        value > 0
          ? t(moodOptions[value - 1].feedbackKey)
          : t("module.mood.empty")
      }
    >
      <EmojiSlider options={moodOptions} value={value} onChange={onChange} />
    </CheckInModule>
  );
};

// --- Reusable Building Blocks ---

interface CheckInModuleProps {
  icon: React.ReactNode;
  title: string;
  feedback: string;
  trend?: { icon: React.ReactNode; text: string };
  children: React.ReactNode;
}

const CheckInModule: React.FC<CheckInModuleProps> = ({
  icon,
  title,
  feedback,
  trend,
  children,
}) => (
  <Card className="bg-card shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    {" "}
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
        {icon} {title}
        {trend?.text && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {trend.icon} {trend.text}
          </span>
        )}{" "}
      </CardTitle>{" "}
    </CardHeader>{" "}
    <CardContent className="flex-1 flex flex-col justify-center p-4">
      {" "}
      <div className="max-w-xs mx-auto w-full">{children} </div>
      <FeedbackMessage text={feedback} />{" "}
    </CardContent>{" "}
  </Card>
);

const EmojiSlider = ({ options, value, onChange, showLabels = false }) => (
  <div className="relative flex justify-between items-center pt-2 w-full">
    {" "}
    {options.map((option) => (
      <div key={option.value} className="flex flex-col items-center gap-1">
        {" "}
        {showLabels && (
          <span className="text-xs font-medium text-muted-foreground h-4">
            {option.label}
          </span>
        )}{" "}
        <button
          onClick={() => onChange(option.value)}
          className="transition-transform duration-200 ease-out hover:scale-125"
        >
          {" "}
          <span
            className={cn(
              "text-3xl transition-all duration-200",
              value === option.value
                ? "opacity-100 scale-110"
                : "opacity-40 grayscale hover:opacity-75",
            )}
          >
            {option.emoji}{" "}
          </span>{" "}
        </button>{" "}
      </div>
    ))}{" "}
  </div>
);

const FeedbackMessage = ({ text }) => (
  <p
    key={text}
    className="text-xs text-muted-foreground italic text-center mt-3 h-8 animate-fade-in"
  >
    {text}{" "}
  </p>
);

export default DailyCheckIn;
