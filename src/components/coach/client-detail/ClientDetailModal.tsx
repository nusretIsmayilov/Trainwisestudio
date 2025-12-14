// src/components/coach/client-detail/ClientDetailModal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import ClientDetailView from "./ClientDetailView";
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function ClientDetailModal({
  client,
  isMobile,
  onClose,
  loading = false,
}: {
  client: any | null,
  isMobile: boolean,
  onClose: () => void,
  loading?: boolean,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (client || loading) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [client, loading]);

  // Show modal if we have a selectedClientId (even if customer data is still loading)
  const shouldShowModal = client || loading;
  
  if (!shouldShowModal) return null;

  // For mobile, the Drawer component handles its own layout correctly.
  if (isMobile) {
    return (
      <Drawer open={!!client || loading} onOpenChange={(open) => !open && onClose()} closeThreshold={0.4}>
        <DrawerContent className="h-[90%] rounded-t-3xl border-none bg-background pt-4">
          <ClientDetailView client={client} onClose={onClose} loading={loading} />
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
        <ClientDetailView client={client} onClose={onClose} loading={loading} />
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
