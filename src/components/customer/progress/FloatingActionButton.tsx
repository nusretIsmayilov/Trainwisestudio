// src/components/customer/progress/FloatingActionButton.tsx
import { useState, useRef, useEffect } from 'react';
import { Plus, Weight, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWeightTracking } from '@/hooks/useWeightTracking';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { toast } from 'sonner';

// Helper component for the weight scroller
const WeightScroller = ({ onWeightChange, value }) => {
  const weights = Array.from({ length: 201 }, (_, i) => 30 + i); // 30-230
  const decimals = Array.from({ length: 10 }, (_, i) => i); // 0-9
  const wholeNumberRef = useRef<HTMLDivElement>(null);
  const decimalRef = useRef<HTMLDivElement>(null);

  const handleScroll = (type: 'whole' | 'decimal') => {
    const ref = type === 'whole' ? wholeNumberRef : decimalRef;
    const container = ref.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = 48; // py-2 (8px) + text-2xl height
    const index = Math.round(scrollTop / itemHeight);
    
    if (type === 'whole') {
      const newWeight = weights[index] || 70;
      const currentDecimal = Math.round((value * 10) % 10);
      const newValue = newWeight + currentDecimal / 10;
      console.log('Weight scroller - whole number changed:', { newWeight, currentDecimal, newValue });
      onWeightChange(newValue);
    } else {
      const newDecimal = decimals[index] || 0;
      const currentWhole = Math.floor(value);
      const newValue = currentWhole + newDecimal / 10;
      console.log('Weight scroller - decimal changed:', { newDecimal, currentWhole, newValue });
      onWeightChange(newValue);
    }
  };

  // Scroll to current value on mount
  useEffect(() => {
    if (wholeNumberRef.current) {
      const wholeIndex = weights.indexOf(Math.floor(value));
      if (wholeIndex !== -1) {
        wholeNumberRef.current.scrollTop = wholeIndex * 48;
      }
    }
    if (decimalRef.current) {
      const decimalIndex = decimals.indexOf(Math.round((value * 10) % 10));
      if (decimalIndex !== -1) {
        decimalRef.current.scrollTop = decimalIndex * 48;
      }
    }
  }, [value, weights, decimals]);

  return (
    <div className="flex justify-center items-center space-x-2 relative">
      <div className="absolute top-1/2 left-0 right-0 h-10 border-y-2 border-primary -translate-y-1/2 pointer-events-none z-10" />
      <div 
        ref={wholeNumberRef}
        className="h-40 overflow-y-scroll w-20 text-center custom-scrollbar"
        onScroll={() => handleScroll('whole')}
      >
        {weights.map((w) => (
          <div
            key={w}
            className={`py-2 text-2xl font-bold ${
              w === Math.floor(value) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {w}
          </div>
        ))}
      </div>
      <span className="text-2xl font-bold">.</span>
      <div 
        ref={decimalRef}
        className="h-40 overflow-y-scroll w-20 text-center custom-scrollbar"
        onScroll={() => handleScroll('decimal')}
      >
        {decimals.map((d) => (
          <div
            key={d}
            className={`py-2 text-2xl font-bold ${
              d === Math.round((value * 10) % 10) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <span className="text-xl">kg</span>
    </div>
  );
};

// Action items
const actionItems = [
  { label: 'Weight In', icon: <Weight className="h-5 w-5" />, action: () => null },
  { label: 'Progression Photo', icon: <Camera className="h-5 w-5" />, action: () => null },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(70.0);
  const [weightNotes, setWeightNotes] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Hooks for data management
  const { addWeightEntry, getLatestWeight, refetch: refetchWeight } = useWeightTracking();
  const { addProgressPhoto, refetch: refetchPhotos } = useProgressPhotos();

  const handlePhotoAction = () => {
    setIsOpen(false);
    setIsPhotoModalOpen(true);
  };
  
  const handleWeighInAction = () => {
    setIsOpen(false);
    setIsWeightModalOpen(true);
    // Set current weight to latest weight if available
    const latestWeight = getLatestWeight();
    if (latestWeight) {
      setCurrentWeight(latestWeight);
    }
  };
  
  const handleCameraClick = () => cameraInputRef.current?.click();
  const handleLibraryClick = () => fileInputRef.current?.click();

  const handleWeightSubmit = async () => {
    if (currentWeight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await addWeightEntry(currentWeight, weightNotes || undefined);
      toast.success('Weight recorded successfully!');
      setIsWeightModalOpen(false);
      setWeightNotes('');
      // Refresh weight data
      refetchWeight();
    } catch (error) {
      toast.error('Failed to record weight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSubmit = async (imageUrl: string) => {
    setIsSubmitting(true);
    try {
      await addProgressPhoto(imageUrl, photoNotes || undefined);
      toast.success('Progress photo added successfully!');
      setIsPhotoModalOpen(false);
      setPhotoNotes('');
      // Refresh photo data
      refetchPhotos();
    } catch (error) {
      toast.error('Failed to add photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      console.log('Processing file upload:', { name: file.name, size: file.size, type: file.type });
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) {
          console.log('File converted to base64, length:', imageUrl.length);
          await handlePhotoSubmit(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  // Attach handlers
  actionItems[0].action = handleWeighInAction;
  actionItems[1].action = handlePhotoAction;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end">
      <Button
        size="icon"
        className="rounded-full w-16 h-16 shadow-2xl z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Plus className="h-8 w-8" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col items-end space-y-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {actionItems.map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-sm bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-border/50">
                  {item.label}
                </span>
                <Button size="icon" className="rounded-full w-12 h-12 shadow-lg" onClick={item.action}>
                  {item.icon}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a Progression Photo</DialogTitle>
            <DialogDescription>
              Choose to take a new photo with your camera or select one from your library.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photo-notes">Notes (optional)</Label>
              <Textarea
                id="photo-notes"
                placeholder="Add any notes about this progress photo..."
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleCameraClick} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              📸 Take a Photo
            </Button>
            <Button 
              onClick={handleLibraryClick} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              🖼️ Select from Library
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              capture="user" 
              ref={cameraInputRef} 
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Weigh In Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Your Weight</DialogTitle>
            <DialogDescription>
              {getLatestWeight() ? (
                <>Your previous weight was <span className="font-bold">{getLatestWeight()}kg</span>.</>
              ) : (
                'Record your current weight to start tracking your progress.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="text-4xl font-extrabold mb-4">
              {currentWeight.toFixed(1)} <span className="text-base font-normal">kg</span>
            </div>
            <WeightScroller value={currentWeight} onWeightChange={setCurrentWeight} />
            
            <div className="w-full space-y-2">
              <Label htmlFor="weight-notes">Notes (optional)</Label>
              <Textarea
                id="weight-notes"
                placeholder="Add any notes about this weight entry..."
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                rows={2}
              />
            </div>
            
            {/* Alternative weight input for testing */}
            <div className="w-full space-y-2">
              <Label htmlFor="weight-input">Or enter weight manually:</Label>
              <Input
                id="weight-input"
                type="number"
                step="0.1"
                min="30"
                max="230"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 70)}
                placeholder="70.0"
              />
            </div>
            
            <Button 
              onClick={handleWeightSubmit} 
              className="mt-6 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Weight'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
