// src/components/customer/viewprogram/CoachMessage.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";

export default function CoachMessage({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
        className="relative overflow-hidden rounded-2xl bg-card p-4 shadow-md border"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
            <Lightbulb className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">A Tip From Your Coach</h3>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
