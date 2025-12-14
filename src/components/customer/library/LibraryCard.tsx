// src/components/customer/library/LibraryCard.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LibraryItem {
  id: string;
  type: 'fitness' | 'nutrition' | 'mental';
  name: string;
  imageUrl: string;
  data: any; // Holds the original data object
}

interface LibraryCardProps {
  item: LibraryItem;
  onClick: () => void;
}

const typeConfig = {
  fitness: { emoji: "🏋️‍♂️", label: "Fitness", badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  nutrition: { emoji: "🥗", label: "Nutrition", badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  mental: { emoji: "🧠", label: "Mental Health", badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
};

export default function LibraryCard({ item, onClick }: LibraryCardProps) {
  const config = typeConfig[item.type];

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer w-full overflow-hidden rounded-2xl group shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      <div className="relative flex flex-col justify-end h-full p-4 text-white min-h-[180px]">
        <Badge className={cn("w-fit", config.badgeClass)}>
          {config.emoji} {config.label}
        </Badge>
        <h3 className="mt-2 text-lg font-bold tracking-tight drop-shadow-md">
          {item.name}
        </h3>
      </div>
    </div>
  );
}
