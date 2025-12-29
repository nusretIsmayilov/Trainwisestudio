// src/components/customer/dashboard/TodaysProgram.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Star,
  Flame,
  Salad,
  BrainCircuit,
  PlayCircle,
  Users,
} from "lucide-react";
import { ComponentType } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerPrograms } from "@/hooks/useCustomerPrograms";
import { useAccessLevel } from "@/contexts/AccessLevelContext";
import { supabase } from "@/integrations/supabase/client";

// --- Data Layer (Now fetched from backend) ---
interface ProgramItem {
  id: string;
  type: "fitness" | "nutrition" | "mental";
  time: string;
  details: {
    title: string;
    exercises?: Array<{ name: string; sets: string }>;
    meal?: string;
    duration?: string;
    image: string;
  };
}

// --- Configuration (Unchanged) ---
const programConfig: {
  [key: string]: {
    Icon: ComponentType<{ className?: string }>;
    buttonClass: string;
    title: string;
  };
} = {
  fitness: {
    Icon: Flame,
    buttonClass: "bg-slate-800 hover:bg-slate-900",
    title: "Fitness",
  },
  nutrition: {
    Icon: Salad,
    buttonClass: "bg-teal-700 hover:bg-teal-800",
    title: "Nutrition",
  },
  mental: {
    Icon: BrainCircuit,
    buttonClass: "bg-indigo-700 hover:bg-indigo-800",
    title: "Mindfulness",
  },
};

// --- Main Component ---
const TodaysProgram = () => {
  const { user } = useAuth();
  const { activeProgram, loading } = useCustomerPrograms();
  const { hasCoach, hasPaymentPlan } = useAccessLevel();
  const [agendaItems, setAgendaItems] = useState<ProgramItem[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchTodaysPrograms = async () => {
      if (!user || !activeProgram) {
        setLoadingPrograms(false);
        return;
      }

      try {
        setLoadingPrograms(true);

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Fetch program entries for today
        const { data: entries } = await supabase
          .from("program_entries")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .order("created_at", { ascending: true });

        if (entries && entries.length > 0) {
          const programs: ProgramItem[] = entries.map((entry, index) => {
            const plan = activeProgram.plan;
            const schedule = plan.schedule || {};
            const daySchedule = schedule[today] || {};

            // Determine program type based on entry type
            let type: "fitness" | "nutrition" | "mental" = "fitness";
            if (entry.type === "nutrition") type = "nutrition";
            if (entry.type === "mental_health") type = "mental";

            // Get exercises for fitness programs
            const exercises =
              entry.type === "fitness" && entry.data?.exercises
                ? entry.data.exercises.map((ex: any) => ({
                    name: ex.name || "Exercise",
                    sets: ex.sets || "3x10",
                  }))
                : undefined;

            return {
              id: entry.id,
              type,
              time: "Morning", // Default time since scheduled_time doesn't exist
              details: {
                title:
                  entry.notes ||
                  `${type.charAt(0).toUpperCase() + type.slice(1)} Program`,
                exercises,
                meal: entry.type === "nutrition" ? entry.data?.meal : undefined,
                duration: "30 min", // Default duration
                image: getDefaultImage(type),
              },
            };
          });

          setAgendaItems(programs);
        } else {
          // No programs for today, show empty state
          setAgendaItems([]);
        }
      } catch (error) {
        console.error("Error fetching today's programs:", error);
        setAgendaItems([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchTodaysPrograms();
  }, [user, activeProgram]);

  const getDefaultImage = (type: string) => {
    switch (type) {
      case "fitness":
        return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200";
      case "nutrition":
        return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800";
      case "mental":
        return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800";
      default:
        return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200";
    }
  };

  if (loading || loadingPrograms) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="px-2 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-56" />
        </div>
        {/* Primary Program Skeleton */}
        <Card className="relative w-full overflow-hidden border-0 shadow-xl rounded-3xl">
          <Skeleton className="h-[350px] w-full rounded-3xl" />
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        </Card>
      </div>
    );
  }

  // Since this component is only shown to users with access, we don't need upgrade prompts
  const hasPartialAccess = hasCoach && !hasPaymentPlan;

  if (agendaItems.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="px-2">
          <h2 className="text-2xl font-bold text-foreground">
            Today's Focus 💪
          </h2>
        </div>
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">
            No programs scheduled for today
          </h3>
          <p className="text-muted-foreground">
            Check back tomorrow or contact your coach for new programs.
          </p>
        </Card>
      </div>
    );
  }

  const primaryProgram = agendaItems[0];
  const secondaryPrograms = agendaItems.slice(1);
  const primaryConfig = programConfig[primaryProgram.type];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="px-2">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="text-2xl font-bold text-foreground">Today's Focus 💪</h2>
      </div>

      {/* Primary Program Card (Full Width) */}
      <Card className="relative w-full overflow-hidden border-0 shadow-xl rounded-3xl group">
        {" "}
        <img
          src={primaryProgram.details.image}
          alt={primaryProgram.details.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        {/* Refined gradient for better text visibility */}{" "}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />{" "}
        <CardContent className="relative flex flex-col justify-end min-h-[350px] p-6 text-white md:flex-row md:items-end md:justify-between">
          {/* Main content block with constrained width */}{" "}
          <div className="space-y-4 max-w-lg">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-white/10 backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-yellow-300" />
                Main Goal{" "}
              </span>{" "}
              <p className="text-xs font-medium opacity-80">
                {primaryProgram.time}
              </p>{" "}
            </div>{" "}
            <h3 className="text-4xl font-bold tracking-tight">
              {primaryProgram.details.title}{" "}
            </h3>
            {/* Modernized "Chip" layout for exercises */}{" "}
            {primaryProgram.type === "fitness" &&
              Array.isArray(primaryProgram.details.exercises) && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {primaryProgram.details.exercises.map((ex) => (
                    <li
                      key={ex.name}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 backdrop-blur-sm"
                    >
                      {ex.name}
                      <span className="ml-1.5 font-mono text-xs opacity-70">
                        {ex.sets}
                      </span>
                    </li>
                  ))}
                </ul>
              )}{" "}
            <div className="pt-3">
              {" "}
              <Button
                className={`font-semibold text-white rounded-full h-11 px-6 ${primaryConfig.buttonClass}`}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Program{" "}
              </Button>{" "}
            </div>{" "}
          </div>
          {/* Duration Stat - visible only on desktop */}{" "}
          <div className="hidden md:flex flex-col items-center ml-6">
            <span className="flex items-center gap-2 px-3 py-1 font-semibold text-white rounded-full bg-white/10 backdrop-blur-sm">
              <Clock className="w-4 h-4" /> {primaryProgram.details.duration}
            </span>{" "}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Programs Section */}
      {secondaryPrograms.length > 0 && (
        <div className="pt-6">
          <h3 className="mb-4 text-xl font-bold text-foreground px-2">
            Later Today
          </h3>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {" "}
            {secondaryPrograms.map((item) => {
              const config = programConfig[item.type];
              return (
                <Card
                  key={item.id}
                  className="relative w-full overflow-hidden border-0 shadow-lg rounded-3xl group"
                >
                  {" "}
                  <img
                    src={item.details.image}
                    alt={item.details.title}
                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />{" "}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />{" "}
                  <CardContent className="relative flex flex-col justify-end min-h-[220px] p-4 text-white space-y-2">
                    {" "}
                    <div className="flex items-center justify-between text-xs">
                      {" "}
                      <span className="flex items-center gap-2 px-2.5 py-1 font-semibold rounded-full bg-white/10 backdrop-blur-sm">
                        {" "}
                        <config.Icon className="w-3.5 h-3.5" />
                        {config.title}{" "}
                      </span>{" "}
                      <p className="font-medium opacity-80">{item.time}</p>{" "}
                    </div>{" "}
                    <h4 className="text-lg font-bold">{item.details.title}</h4>{" "}
                    <Button
                      size="sm"
                      className={`w-full font-semibold text-white rounded-lg ${config.buttonClass}`}
                    >
                      Begin{" "}
                    </Button>{" "}
                  </CardContent>{" "}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Coach Access Notice */}
      {hasPartialAccess && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Coach Access</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            You have access to programs through your coach. Upgrade for full
            program access and insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodaysProgram;
