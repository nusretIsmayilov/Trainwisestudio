import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiSelectButtonProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const MultiSelectButton = ({ children, selected = false, onClick, disabled = false }: MultiSelectButtonProps) => {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto px-4 py-2 text-sm font-semibold transition-all",
        selected 
          ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" 
          : "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-400",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </Button>
  );
};
