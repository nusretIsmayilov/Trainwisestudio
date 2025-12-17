// src/components/customer/programsoverview/ProgramDetailView.tsx

import { useNavigate, useParams } from "react-router-dom";
import { useRef, useMemo, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ScheduledTask, typeConfig } from "@/mockdata/programs/mockprograms";
import {
  findDetailedTaskById,
  DetailViewItem,
} from "@/mockdata/viewprograms/mockdetailedviews";
import { findProgramByIdAndType } from "@/mockdata/viewprograms/programFinder";

import { PlayCircle } from "lucide-react";
import { useTodayTasks } from "@/hooks/useTodayTasks";

const TaskListItem = ({ item }: { item: DetailViewItem }) => {
  return (
    <li className="flex items-center gap-4 p-3 bg-card rounded-xl shadow-sm border">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">{item.details}</p>
      </div>
    </li>
  );
};

const SimpleTaskListItem = ({ name }: { name: string }) => {
  return (
    <li className="flex items-center gap-4 p-3 bg-card rounded-xl shadow-sm border">
      <div className="h-16 w-16 rounded-lg bg-muted" />
      <p className="font-semibold text-foreground">{name}</p>
    </li>
  );
};

export default function ProgramDetailView({
  task, // ⛔ legacy – artık ana kaynak değil
  onClose,
  showFooter = true,
}: {
  task: ScheduledTask | null;
  onClose?: () => void;
  showFooter?: boolean;
}) {
  const navigate = useNavigate();
  const { id, type } = useParams<{ id?: string; type?: string }>();
  const touchStartY = useRef<number | null>(null);

  // ✅ BUGÜNÜN TASK’I (SUPABASE)
  const { tasks: todayTasks, loading } = useTodayTasks();
  const todayTask = todayTasks[0] ?? null;

  // --- Legacy redirect logic (bozulmadı) ---
  useEffect(() => {
    if (!task && id && !type) {
      const types = ["fitness", "nutrition", "mental"];
      for (const t of types) {
        const program = findProgramByIdAndType(t, id);
        if (program) {
          navigate(`/program/${t}/${id}`, { replace: true });
          return;
        }
      }
      navigate("/customer/programs", { replace: true });
    }
  }, [task, id, type, navigate]);

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // ❌ Bugün task yoksa
  if (!todayTask) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        No task scheduled for today
      </div>
    );
  }

  const config = typeConfig[todayTask.type];

  const detailedContent = useMemo(() => {
    if (todayTask.detailed_program_id) {
      return findDetailedTaskById(todayTask.detailed_program_id)?.content;
    }
    return null;
  }, [todayTask]);

  const handleStartClick = () => {
    if (todayTask.detailed_program_id) {
      navigate(
        `/program/${todayTask.type}/${todayTask.detailed_program_id}`
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY =
        touchStartY.current - e.changedTouches[0].clientY;
      if (deltaY > 80 && onClose) {
        onClose();
      }
    }
    touchStartY.current = null;
  };

  return (
    <div
      className="flex flex-col h-full bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="relative h-40 md:h-56 pt-6 max-w-md mx-auto w-full">
          <img
            src={config.imageUrl}
            alt={todayTask.title}
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl" />
          <div className="absolute bottom-4 left-4 text-white">
            <Badge
              variant="secondary"
              className="mb-2 bg-white/20 backdrop-blur-sm border-0 text-white"
            >
              {todayTask.program_title} – Week {todayTask.week_number}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
              {config.emoji} {todayTask.title}
            </h2>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 pt-4">
          <div className="max-w-md w-full mx-auto">
            <h3 className="font-semibold text-lg text-foreground mb-4">
              {showFooter ? "Today's Plan:" : "Program Preview:"}
            </h3>

            {detailedContent ? (
              <ul className="space-y-3">
                {detailedContent.map((item, i) => (
                  <TaskListItem key={i} item={item} />
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {todayTask.content.map((name: string, i: number) => (
                  <SimpleTaskListItem key={i} name={name} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      {showFooter && (
        <div className="p-4 border-t bg-card/60 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-md w-full mx-auto">
            <Button
              onClick={handleStartClick}
              size="lg"
              className="w-full h-12 font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center"
              disabled={!todayTask.detailed_program_id}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
