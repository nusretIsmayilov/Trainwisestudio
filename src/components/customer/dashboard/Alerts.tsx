// src/components/customer/mycoach/TodaysMessage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dailyMessage } from '@/mockdata/mycoach/coachData';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

const TodaysMessage = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="todays-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
          // Slide to dismiss behavior for mobile/tablet
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(event, info) => {
            // Check if the card was dragged more than 50px horizontally
            if (Math.abs(info.point.x) > 50) {
              handleDismiss();
            }
          }}
          className="relative cursor-pointer"
        >
          <Card className="shadow-md rounded-2xl">
            <CardHeader className="relative pb-2">
              <CardTitle className="text-base md:text-lg font-semibold">
                {dailyMessage.title}
              </CardTitle>
              {/* Exit button for desktop */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'absolute top-2 right-2',
                  // Hide on screens smaller than "sm" (iPad and below)
                  'hidden sm:inline-flex' 
                )}
                onClick={handleDismiss}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dailyMessage.content}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TodaysMessage;
