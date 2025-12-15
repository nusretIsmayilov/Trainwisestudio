// src/components/customer/programsoverview/ScheduledProgramCard.tsx

import { Program, typeConfig } from "@/mockdata/programs/mockprograms";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, Bot } from "lucide-react";
import { format, parseISO } from "date-fns";

export function ScheduledProgramCard({
  program,
  onClick,
}: {
  program: Program;
  onClick: () => void;
}) {
  const config = typeConfig[program.type] || typeConfig.fitness; // Fallback to fitness config
  const startDate = parseISO(program.startDate!);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer w-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl group min-h-[260px] bg-card"
    >
      {/* Background Image with blur and grayscale */}
      <img
        src={program.imageUrl}
        alt={program.title}
        className="absolute inset-0 object-cover w-full h-full transition-all duration-500 ease-in-out group-hover:scale-105 filter grayscale"
      />
      {/* Darker Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

      <div className="relative flex flex-col justify-between h-full p-6 text-white">
        {/* Top Section: Category */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-white/10 backdrop-blur-sm border-0 text-white font-semibold"
            >
              {config.emoji} {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
            </Badge>
            {program.isAIGenerated && (
              <Badge className="bg-emerald-500/20 text-emerald-100 border-0 gap-1">
                <Bot className="w-3 h-3" />
                AI
              </Badge>
            )}
          </div>
          <Lock className="w-6 h-6 text-white/50" />
        </div>

        {/* Middle Section: Title & Availability */}
        <div className="space-y-3 mt-2">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
            {program.title}
          </h3>
          <div className="flex items-center gap-2 text-sm font-medium opacity-90 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 w-fit">
            <Calendar className="w-4 h-4" />
            <span>Available from {format(startDate, "MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Bottom Section: Placeholder to maintain height */}
        <div className="pt-3 h-11">
           {/* Intentionally empty to align with TaskCard's button space */}
        </div>
      </div>
    </div>
  );
}
