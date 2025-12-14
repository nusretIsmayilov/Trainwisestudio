import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  emoji: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const GoalCard = ({ emoji, title, subtitle, selected = false, onClick }: GoalCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 ease-out transform hover:-translate-y-1",
        "border-2",
        selected 
          ? "bg-emerald-50 border-emerald-500 shadow-lg scale-105" 
          : "bg-white hover:border-emerald-300 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl shadow-sm">
          {emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            selected ? "bg-emerald-500 border-emerald-500" : "bg-gray-200 border-gray-300"
        )}>
           {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </Card>
  );
};
