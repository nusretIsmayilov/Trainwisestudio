import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodayTasks } from "@/hooks/useTodayTasks";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { History } from "lucide-react";

export default function TodayTaskPage() {
  const navigate = useNavigate();
  const { activeTask, completeTask, loading } = useTodayTasks();

  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const steps = Array.isArray(activeTask?.content) ? activeTask.content : [];

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / steps.length) * 100);
  }, [checked, steps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!activeTask) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        No task scheduled for today
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customer/programs")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Today’s Task</h1>
          <p className="text-sm text-muted-foreground">{activeTask.title}</p>
        </div>
      </div>

      {/* Progress */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-right">
            {progress}% completed
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        {steps.map((step: string, index: number) => (
          <label
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted cursor-pointer"
          >
            <Checkbox
              checked={checked[index] || false}
              onCheckedChange={(val) =>
                setChecked((prev) => ({ ...prev, [index]: Boolean(val) }))
              }
            />
            <span
              className={
                checked[index] ? "line-through text-muted-foreground" : ""
              }
            >
              {step}
            </span>
          </label>
        ))}
      </div>

      {/* Complete */}
      <Button
        className="w-full h-12"
        disabled={progress < 100}
        onClick={async () => {
          await completeTask(activeTask.id);
          navigate("/customer/dashboard");
        }}
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        Complete Task
      </Button>
      <Button
          variant="outline"
          className="w-full h-12"
          onClick={() => navigate("/customer/history")}
        >
          <History className="w-5 h-5 mr-2" />
          View Task History
        </Button>
    </div>
  );
}
