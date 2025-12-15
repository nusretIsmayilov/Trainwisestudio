// src/components/customer/programsoverview/SlideInDetail.tsx

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import ProgramDetailView from "./ProgramDetailView";
import { ScheduledTask } from '@/mockdata/programs/mockprograms';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function SlideInDetail({
  task,
  isMobile,
  onClose,
  showFooter, // ✅ ADDED PROP
}: {
  task: ScheduledTask | null,
  isMobile: boolean,
  onClose: () => void,
  showFooter?: boolean, // ✅ ADDED PROP TYPE
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (task) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [task]);

  if (!task) return null;

  // For mobile, the Drawer component handles its own layout correctly.
  if (isMobile) {
    return (
      <Drawer open={!!task} onOpenChange={(open) => !open && onClose()} closeThreshold={0.4}>
        <DrawerContent className="h-[90%] rounded-t-3xl border-none bg-background pt-4">
          <ProgramDetailView task={task} showFooter={showFooter} /> {/* ✅ PASS PROP */}
        </DrawerContent>
      </Drawer>
    );
  }

  const desktopSlideIn = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Sliding Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ProgramDetailView task={task} showFooter={showFooter} /> {/* ✅ PASS PROP */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );

  return createPortal(desktopSlideIn, document.body);
}
