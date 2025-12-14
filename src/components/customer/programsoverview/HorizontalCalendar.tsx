import {
  format,
  isSameDay,
  isPast,
  isToday,
  startOfWeek,
  differenceInWeeks,
  eachDayOfInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { ScheduledTask, typeConfig } from "@/mockdata/programs/mockprograms";
import { useState, useMemo, useLayoutEffect, useRef, memo } from "react";

// Helper: group dates by week number
const groupDatesByWeek = (dates: Date[], programStartDate: Date) => {
  const grouped: { [week: number]: Date[] } = {};
  dates.forEach((date) => {
    const weekNumber =
      differenceInWeeks(
        startOfWeek(date, { weekStartsOn: 1 }),
        startOfWeek(programStartDate, { weekStartsOn: 1 })
      ) + 1;
    if (!grouped[weekNumber]) grouped[weekNumber] = [];
    grouped[weekNumber].push(date);
  });
  return grouped;
};

// Calendar day component
const CalendarDay = memo(function CalendarDay({
  id,
  date,
  tasks,
  selectedDate,
  setSelectedDate,
}: {
  id: string;
  date: Date;
  tasks: ScheduledTask[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}) {
  const hasMissedTasks = isPast(date) && !isToday(date) && tasks.some((t) => t.status === "missed");
  const distinctTasks = useMemo(
    () => Array.from(new Map(tasks.map((t) => [t.type, t])).values()),
    [tasks]
  );

  return (
    <button
      id={id}
      onClick={() => setSelectedDate(date)}
      className={cn(
        "p-2 rounded-xl min-w-[60px] text-center flex-shrink-0 flex flex-col items-center justify-center h-24 border-2 transition-transform duration-200",
        isSameDay(date, selectedDate)
          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
          : "bg-card hover:bg-muted border-transparent text-card-foreground",
        isToday(date) && !isSameDay(date, selectedDate) ? "border-primary" : "",
        hasMissedTasks && !isSameDay(date, selectedDate) ? "bg-muted text-muted-foreground border-border" : ""
      )}
    >
      <div className="text-xs font-medium uppercase opacity-70">{format(date, "EEE")}</div>
      <div className="text-lg font-bold">{format(date, "d")}</div>
      <div className="flex justify-center items-center gap-1.5 mt-1 h-4">
        {distinctTasks.map((task) => {
          const isTaskMissed = isPast(task.date) && !isToday(task.date) && task.status === "missed";
          return (
            <span key={task.id} className={cn("text-sm", isTaskMissed && "opacity-40 grayscale")}>
              {typeConfig[task.type].emoji}
            </span>
          );
        })}
      </div>
    </button>
  );
});

export default function HorizontalCalendar({
  selectedDate,
  setSelectedDate,
  schedule,
  programStartDate,
  programEndDate,
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  schedule: ScheduledTask[];
  programStartDate: Date;
  programEndDate: Date;
}) {
  const [visibleWeek, setVisibleWeek] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalWeeks = useMemo(
    () => differenceInWeeks(programEndDate, programStartDate) + 1,
    [programStartDate, programEndDate]
  );

  const groupedDates = useMemo(() => {
    if (!programStartDate || !programEndDate) return {};
    const allDates = eachDayOfInterval({ start: programStartDate, end: programEndDate });
    return groupDatesByWeek(allDates, programStartDate);
  }, [programStartDate, programEndDate]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, ScheduledTask[]> = {};
    schedule.forEach((task) => {
      const key = format(task.date, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [schedule]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Scroll to today's date
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    const todayId = `date-${format(new Date(), "yyyy-MM-dd")}`;
    const todayEl = document.getElementById(todayId);
    if (!todayEl) return;

    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = todayEl.getBoundingClientRect();

    const scrollLeft =
      container.scrollLeft +
      elementRect.left -
      containerRect.left -
      container.offsetWidth / 2 +
      elementRect.width / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [groupedDates]);

  // IntersectionObserver to detect visible week
  useLayoutEffect(() => {
    if (!scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const week = entry.target.getAttribute("data-week");
            if (week) {
              setVisibleWeek(Number(week));
              break;
            }
          }
        }
      },
      { root: scrollRef.current, threshold: 0.5 }
    );

    const weekElements = scrollRef.current.querySelectorAll("[data-week]");
    weekElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [groupedDates]);

  return (
    <div className="w-full space-y-4">
      <div className="text-center font-semibold text-foreground px-2">
        Week {visibleWeek || 1} of {totalWeeks || 1}
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto gap-2 py-2 scrollbar-hide-tablet scroll-smooth -mx-4 px-4",
          !isMobile && "snap-x snap-mandatory"
        )}
      >
        {Object.entries(groupedDates).map(([weekNumber, dates]) => (
          <div
            key={`week-${weekNumber}`}
            data-week={weekNumber}
            className={cn("flex gap-2 justify-center", !isMobile ? "snap-start min-w-full" : "")}
          >
            {dates.map((date) => (
              <CalendarDay
                key={date.toString()}
                id={`date-${format(date, "yyyy-MM-dd")}`}
                date={date}
                tasks={tasksByDate[format(date, "yyyy-MM-dd")] || []}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
