import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Upload, X, Pencil, Camera } from 'lucide-react';
import { LibraryCategory, LibraryItem } from '@/mockdata/library/mockLibrary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CreationWrapperProps {
  children: React.ReactNode;
  category: LibraryCategory;
  isEditing: boolean;
  onBack: () => void;
  onSubmit: () => void;
  formData: Partial<LibraryItem>;
  onFormChange: (field: keyof LibraryItem, value: any) => void;
}

const CATEGORY_DETAILS: Record<LibraryCategory, { title: string, emoji: string, defaultHeroUrl: string, intro: string }> = {
  'exercise': {
    title: 'New Fitness Item',
    emoji: '💪',
    defaultHeroUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99d4db2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    intro: 'Design a powerful exercise, from movement cues to equipment requirements.',
  },
  'recipe': {
    title: 'New Recipe/Meal',
    emoji: '🍎',
    defaultHeroUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    intro: 'Craft a delicious meal, complete with ingredients, allergies, and step-by-step instructions.',
  },
  'mental health': {
    title: 'New Wellness Activity',
    emoji: '🧘',
    defaultHeroUrl: 'https://images.unsplash.com/photo-1557342777-a8a2d1d2b86a?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    intro: 'Build a guided meditation, breathing exercise, or mindful activity.',
  },
};

const LibraryCreationWrapper: React.FC<CreationWrapperProps> = ({ children, category, isEditing, onBack, onSubmit, formData, onFormChange }) => {
  const details = CATEGORY_DETAILS[category] || CATEGORY_DETAILS.exercise;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userImageUrl = (formData as any).heroImageUrl;
  const hasUserImage = !!userImageUrl;
  
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      onFormChange('heroImageUrl' as keyof LibraryItem, localUrl);
      event.target.value = '';
    }
  };

  const removeHeroImage = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFormChange('heroImageUrl' as keyof LibraryItem, null);
  };

  const currentTitle = formData.name || details.title;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      
      {/* 🌟 ACTION BUTTONS (MOVED TO TOP) */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Library
        </Button>
        <Button onClick={onSubmit} className="gap-2 bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4" /> {isEditing ? 'Save Changes' : 'Create Item'}
        </Button>
      </div>
      
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Hero Section - The Clickable Image Canvas */}
      <div 
        className={cn(
            "relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl bg-gray-200 dark:bg-gray-800 group cursor-pointer border-4 border-dashed border-transparent hover:border-primary/50 transition-all",
            !hasUserImage && "border-primary/30"
        )}
        onClick={triggerFileInput}
      >
        {/* Image Display or EMPTY STATE */}
        {hasUserImage ? (
            <img 
                src={userImageUrl} 
                alt={`${details.title} hero image`} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = details.defaultHeroUrl; }}
            />
        ) : (
             <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground/80">
                 <Upload className="h-12 w-12 mb-3 text-primary" />
                 <span className="text-lg font-semibold">Click to Upload Hero Image</span>
                 <span className="text-sm">Recommended aspect ratio 16:9</span>
             </div>
        )}
        
        {/* Overlay Gradient */}
        {hasUserImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/30 to-transparent"></div>
        )}
        
        {/* Click Indicator / Remove Button (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            {hasUserImage && (
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="rounded-full h-8 w-8 bg-black/50 hover:bg-black/80" 
                    onClick={removeHeroImage} 
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
            <Button 
                variant="default" 
                size="icon" 
                className="rounded-full h-8 w-8 bg-black/50 hover:bg-black/80 text-white" 
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }} 
            >
                <Camera className="h-4 w-4" />
            </Button>
        </div>

        {/* Content Overlay (Bottom Left - Title) */}
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full z-20">
          
          {/* TITLE FIELD (Click-to-Edit) */}
          <div 
            className="inline-block relative"
            onClick={(e) => { e.stopPropagation(); setIsTitleEditing(true); }}
            onBlur={() => setIsTitleEditing(false)}
          >
            {isTitleEditing ? (
              <Input 
                autoFocus
                value={formData.name || ''} 
                onChange={(e) => onFormChange('name', e.target.value)} 
                className="text-4xl md:text-5xl font-extrabold bg-transparent text-white border-primary w-full p-2 placeholder:text-gray-300"
                placeholder={details.title}
                onKeyDown={(e) => e.key === 'Enter' && setIsTitleEditing(false)}
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 group-hover:bg-black/10 group-hover:p-1 group-hover:rounded transition-colors">
                {currentTitle} {details.emoji}
                <Pencil className="h-5 w-5 ml-2 inline text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
          </div>
        </div>
      </div>

      {/* Primary Input Section */}
      <div className="bg-card p-6 md:p-8 rounded-2xl shadow-lg border border-border/50 space-y-8">
        
        {/* DEDICATED INTRODUCTION FIELD */}
        <div className="space-y-2">
            <Label htmlFor="introduction" className="text-xl font-bold flex items-center">
                Short Introduction / Description 📝
            </Label>
            <Textarea 
                id="introduction" 
                value={formData.introduction || ''} 
                onChange={(e) => onFormChange('introduction', e.target.value)} 
                placeholder={details.intro}
                className="min-h-[80px]"
            />
        </div>
        
        {/* Separator before dynamic content */}
        <div className="border-t border-border/50"></div> 

        {/* Dynamic Form Content (Passed as children) */}
        {children}
      </div>

    </motion.div>
  );
};

export default LibraryCreationWrapper;
