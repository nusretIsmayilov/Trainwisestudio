// src/components/customer/library/LibraryDetailView.tsx

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { LibraryItem } from './LibraryCard';

// Import your existing detail components
import ExerciseGuide from './exercises/ExerciseGuide';
import RecipeDetails from './recipe/RecipeDetails';
import MentalHealthGuide from './mentalexercise/MentalHealthGuide';

interface LibraryDetailViewProps {
  item: LibraryItem | null;
  onClose: () => void;
  isMobile: boolean;
}

export default function LibraryDetailView({ item, onClose, isMobile }: LibraryDetailViewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (item) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [item]);

  const renderContent = () => {
    if (!item) return null;
    switch (item.type) {
      case 'fitness':
        return <ExerciseGuide guide={item.data} />;
      case 'nutrition':
        return <RecipeDetails recipe={item.data} />;
      case 'mental':
        return <MentalHealthGuide guide={item.data} />;
      default:
        return <p>Item type not supported.</p>;
    }
  };

  if (!item) return null;

  const detailContent = (
    <div className="h-full overflow-y-auto p-4 md:p-6 bg-card">
      {renderContent()}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={!!item} onOpenChange={(open) => !open && onClose()} closeThreshold={0.4}>
        <DrawerContent className="h-[90%] rounded-t-3xl border-none bg-card pt-4">
          {detailContent}
        </DrawerContent>
      </Drawer>
    );
  }

  const desktopSlideIn = (
    <>
      <div
        onClick={onClose}
        className={cn("fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity", isVisible ? "opacity-100" : "opacity-0")}
      />
      <div
        className={cn("fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-card shadow-2xl transition-transform duration-300 ease-in-out", isVisible ? "translate-x-0" : "translate-x-full")}
      >
        {detailContent}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );

  return createPortal(desktopSlideIn, document.body);
}
