import { useNavigate } from "react-router-dom";
import { ScheduledTask, typeConfig } from "@/mockdata/programs/mockprograms";
import { CheckCircle2, PlayCircle, Clock, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TaskCard({ task, onClick }: { task: ScheduledTask; onClick: () => void }) {
  const navigate = useNavigate();
  const config = typeConfig[task.type];
  const isCompleted = task.status === "completed";
  const isPending = task.status === "pending" || task.status === "in-progress";

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (task.detailedProgramId) {
      // Navigate to program view for tasks with detailedProgramId
      navigate(`/customer/program/${task.type}/${task.detailedProgramId}`);
    } else {
      // For other types, we still open the detail slide-in
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer w-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl group min-h-[260px] bg-card"
    >
      {/* Background Image */}
      <img
        src={config.imageUrl}
        alt={task.title}
        className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="relative flex flex-col justify-between h-full p-6 text-white">
        {/* Top Section: Category & Status */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-white/10 backdrop-blur-sm border-0 text-white font-semibold"
            >
              {config.emoji} {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
            </Badge>
            {task.isAIGenerated && (
              <Badge className="bg-emerald-500/20 text-emerald-100 border-0 gap-1">
                <Bot className="w-3 h-3" />
                AI
              </Badge>
            )}
          </div>
          {isCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-300" />}
        </div>
        
        {/* Middle Section: Title & Program */}
        <div className="space-y-2 mt-2">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
            {task.title}
          </h3>
          <p className="text-sm font-medium opacity-80">{task.programTitle}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{task.content.length} items</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Button */}
        {isPending && (
          <div className="pt-3">
            <Button 
              onClick={handleButtonClick}
              className="font-semibold text-slate-900 rounded-full bg-white hover:bg-slate-200 h-11 px-6 shadow-lg flex items-center justify-center"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {task.status === "in-progress" ? "Resume" : "Start"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
