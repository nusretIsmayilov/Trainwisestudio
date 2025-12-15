import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/customer/programsoverview/TaskCard";
import HorizontalCalendar from "@/components/customer/programsoverview/HorizontalCalendar";
import SlideInDetail from "@/components/customer/programsoverview/SlideInDetail";
import { ScheduledProgramCard } from "@/components/customer/programsoverview/ScheduledProgramCard";
import { useCustomerPrograms } from "@/hooks/useCustomerPrograms";
import { isSameDay, parseISO, addDays } from "date-fns";
import { useTranslation } from 'react-i18next';
import AIPersonalizationPanel from "@/components/customer/programsoverview/AIPersonalizationPanel";
import { useAIPersonalization } from "@/hooks/useAIPersonalization";

type TabType = "active" | "scheduled";

export default function MyProgramsPage() {
  const [tab, setTab] = useState<TabType>("active");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const { t } = useTranslation();

  const { programs, activeProgram, scheduledPrograms, loading } = useCustomerPrograms();
  const { personalization, loading: aiLoading } = useAIPersonalization();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate daily schedule from active program
  const dailySchedule = useMemo(() => {
    if (!activeProgram?.plan?.schedule) return [];
    
    const schedule = activeProgram.plan.schedule;
    const startDate = activeProgram.scheduled_date ? parseISO(activeProgram.scheduled_date) : new Date();
    
    return schedule.map((day: any, index: number) => {
      const date = addDays(startDate, index);
      return {
        id: `${activeProgram.id}-${index}`,
        date,
        title: day.workout || day.nutrition || day.mindfulness || 'Daily Task',
        programTitle: activeProgram.name,
        programId: activeProgram.id,
        type: activeProgram.category === 'fitness' ? 'fitness' : 
              activeProgram.category === 'nutrition' ? 'nutrition' : 'mental',
        weekNumber: Math.floor(index / 7) + 1,
        status: 'pending' as const,
        content: [day.workout, day.nutrition, day.mindfulness].filter(Boolean),
        progress: 0,
        isAIGenerated: activeProgram.isAIGenerated,
      };
    });
  }, [activeProgram]);

  const programStartDate = useMemo(
    () => (activeProgram?.scheduled_date ? parseISO(activeProgram.scheduled_date) : undefined),
    [activeProgram]
  );

  const programEndDate = useMemo(
    () =>
      programStartDate && activeProgram?.plan?.weeks
        ? addDays(programStartDate, activeProgram.plan.weeks * 7 - 1)
        : undefined,
    [programStartDate, activeProgram]
  );

  const todayTasks = dailySchedule.filter((t) =>
    isSameDay(t.date, selectedDate)
  );
  
  // ✅ Handler to create a preview "task" from a scheduled program
  const handleScheduledProgramClick = (program: any) => {
    const task = {
      id: program.id,
      date: program.scheduled_date ? parseISO(program.scheduled_date) : new Date(),
      title: program.name,
      programTitle: program.name,
      programId: program.id,
      type: program.category === 'fitness' ? 'fitness' : 
            program.category === 'nutrition' ? 'nutrition' : 'mental',
      weekNumber: 1, // Placeholder
      status: "pending" as const,
      content: [program.description], // Placeholder
      progress: 0,
      isAIGenerated: program.isAIGenerated,
    };
    setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Loading Programs...</h1>
          <p className="text-muted-foreground">Please wait while we load your programs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      <AIPersonalizationPanel
        loading={aiLoading}
        insights={personalization?.insights || []}
        recommendations={personalization?.recommendations || []}
        plans={(programs || []).filter(program => program.isAIGenerated)}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto rounded-xl bg-card p-1 shadow-sm">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ✅ Conditionally render content based on the selected tab */}
      {tab === "active" && (
        <>
          {activeProgram && programStartDate && programEndDate ? (
            <HorizontalCalendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              schedule={dailySchedule}
              programStartDate={programStartDate}
              programEndDate={programEndDate}
            />
          ) : (
            <div className="p-4 text-center border border-dashed rounded-2xl text-muted-foreground">
              {t('programs.noActiveProgram')}
            </div>
          )}
          <div className="space-y-6">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground">
                {t('programs.noTasksToday')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "scheduled" && (
        <div className="space-y-6">
          {scheduledPrograms.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground">
              No scheduled programs.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledPrograms.map((program) => (
                <ScheduledProgramCard
                  key={program.id}
                  program={program}
                  onClick={() => handleScheduledProgramClick(program)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <SlideInDetail
        task={selectedTask}
        isMobile={isMobile}
        onClose={() => setSelectedTask(null)}
        // ✅ Pass prop to hide footer when viewing scheduled programs
        showFooter={tab === "active"} 
      />
    </div>
  );
}
