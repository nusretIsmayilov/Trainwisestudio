import { useNavigate } from "react-router-dom";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { format } from "date-fns";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskHistoryPage() {
  const navigate = useNavigate();
  const { history, loading } = useTaskHistory();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/customer/today-task")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl font-semibold">Task History</h1>
        </div>

        <div className="text-center py-20 text-muted-foreground">
          No completed tasks yet
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customer/today-task")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <h1 className="text-xl font-semibold">Task History</h1>
      </div>

      <ul className="space-y-3">
        {history.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between rounded-xl border bg-card p-4"
          >
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(task.completed_at), "PPP • HH:mm")}
              </p>
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm capitalize">{task.type}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
