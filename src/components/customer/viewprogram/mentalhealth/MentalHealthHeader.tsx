// src/components/customer/viewprogram/mentalhealth/MentalHealthHeader.tsx

import { typeConfig } from "@/mockdata/programs/mockprograms";
import { DetailedMentalHealthTask } from "@/mockdata/viewprograms/mockmentalhealthprograms";
import { Clock, BrainCircuit, ListChecks } from "lucide-react";

const Stat = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
      <Icon className="h-6 w-6" />
    </div>
    <p className="mt-2 text-sm font-semibold">{value}</p>
    <p className="text-xs opacity-70">{label}</p>
  </div>
);

export default function MentalHealthHeader({ task }: { task: DetailedMentalHealthTask }) {
  const config = typeConfig[task.type];

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-3xl shadow-xl">
      <img
        src={config.imageUrl}
        alt={task.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-8 text-white">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Your Program</span>
          <h1 className="mt-1 text-4xl font-bold tracking-tight drop-shadow-lg">{task.title}</h1>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
          <Stat icon={BrainCircuit} label="Activities" value={task.activities.length} />
          <Stat icon={Clock} label="Total Time" value={`${task.totalDurationMinutes} min`} />
          <Stat icon={ListChecks} label="Focus" value="Mindfulness" />
        </div>
      </div>
    </div>
  );
}
