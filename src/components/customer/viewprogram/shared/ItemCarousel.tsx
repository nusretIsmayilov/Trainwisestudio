// src/components/customer/viewprogram/shared/ItemCarousel.tsx

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CarouselItem {
  id: string;
  imageUrl: string;
  label: string;
  isCompleted: boolean;
}

interface ItemCarouselProps {
  items: CarouselItem[];
  selectedItemId: string;
  onSelectItem: (id: string) => void;
}

export default function ItemCarousel({ items, selectedItemId, onSelectItem }: ItemCarouselProps) {
  return (
    <div className="relative">
      {/* Added pt-3 so ring at top won't get cut off */}
      <div className="flex space-x-4 overflow-x-auto overflow-y-visible pt-3 pb-6 scrollbar-hide-tablet -mx-4 px-4">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 flex flex-col items-center px-2 overflow-visible"
            >
              <button
                onClick={() => onSelectItem(item.id)}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-full transition-all duration-200 focus:outline-none mb-2 overflow-visible",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                    : "ring-0"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-cover bg-center rounded-full",
                    isSelected && "p-1.5"
                  )}
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full pointer-events-none" />

                {item.isCompleted && (
                  <div className="absolute inset-0 bg-primary/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Check className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
              </button>

              <span className="text-center text-xs font-semibold text-foreground max-w-[80px] leading-tight">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
