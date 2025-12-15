// src/components/customer/viewprogram/shared/GuideDrawer.tsx

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ChevronUp } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface GuideDrawerProps {
  guideData: { name: string } | null;
  isMobile: boolean;
  triggerText: string;
  children: React.ReactNode;
}

export default function GuideDrawer({
  guideData,
  isMobile,
  triggerText,
  children,
}: GuideDrawerProps) {
  const originalPaddingRef = useRef<string>("");

  // Apply bottom padding on mobile when drawer exists
  useEffect(() => {
    if (!isMobile || !guideData) return;

    const scrollContainer = document.querySelector('[data-guide-scroll="true"]') as HTMLElement;
    if (!scrollContainer) return;

    // Store original padding
    const currentPadding = scrollContainer.style.paddingBottom;
    originalPaddingRef.current = currentPadding;

    // Apply new padding with safe area
    scrollContainer.style.paddingBottom = "calc(15vh + 4rem + env(safe-area-inset-bottom))";

    // Resize listener to ensure padding persists
    const handleResize = () => {
      if (window.innerWidth < 768 && guideData) {
        scrollContainer.style.paddingBottom = "calc(15vh + 4rem + env(safe-area-inset-bottom))";
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      scrollContainer.style.paddingBottom = originalPaddingRef.current;
    };
  }, [isMobile, guideData]);

  if (!guideData) return null;

  // On desktop and larger → render normally
  if (!isMobile) {
    return <>{children}</>;
  }

  // On iPad and below → bottom drawer
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="fixed bottom-0 left-0 right-0 z-50 h-[15vh] px-4">
          <div className="flex items-center justify-between w-full h-full max-w-md mx-auto bg-card border-t rounded-t-2xl shadow-xl cursor-pointer active:scale-95 transition-transform">
            <div className="flex items-center gap-3 overflow-hidden px-4">
              <span className="font-bold text-lg flex-shrink-0">{triggerText}</span>
              <span className="font-semibold text-muted-foreground truncate">
                {guideData.name}
              </span>
            </div>
            <div className="flex flex-col items-center text-primary animate-pulse pr-4">
              <ChevronUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </DrawerTrigger>

      {/* ✅ Expanded drawer (80% height) */}
      <DrawerContent className="h-[80vh] rounded-t-3xl border-none bg-background pt-4">
        <div className="overflow-y-auto p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
