'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader and CardTitle as they are now used in CardContent
import { Button } from '@/components/ui/button';
import { LibraryItem } from '@/mockdata/library/mockLibrary';
import { Dumbbell, Utensils, Feather, Trash2, Pencil, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LibraryCardProps {
  item: LibraryItem;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onView?: (item: LibraryItem) => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ item, onEdit, onDelete, onView }) => {
  
  const getDetails = () => {
    let icon, primaryDetail, secondaryTag;
    
    switch (item.category) {
      case 'exercise':
        icon = <Dumbbell className="h-4 w-4" />;
        primaryDetail = item.muscleGroup || 'Full Body';
        secondaryTag = item.isCustom ? 'Custom Workout' : 'Standard Exercise';
        break;
      case 'recipe':
        icon = <Utensils className="h-4 w-4" />;
        primaryDetail = item.allergies || 'Allergy Free';
        secondaryTag = item.isCustom ? 'Custom Recipe' : 'Meal Plan';
        break;
      case 'mental health':
        icon = <Feather className="h-4 w-4" />;
        primaryDetail = item.content?.[0]?.type === 'soundfile' ? 'Audio Session' : 'Guided Text';
        secondaryTag = item.isCustom ? 'My Activity' : 'Meditation';
        break;
    }
    return { icon, primaryDetail, secondaryTag };
  };

  const { icon, primaryDetail, secondaryTag } = getDetails();

  // Use hero image if available, otherwise fallback to category-based placeholder
  const imageUrl = (item as any).hero_image_url || (item.category === 'exercise'
    ? "https://images.unsplash.com/photo-1549476483-e8893d56a337?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    : item.category === 'recipe' 
      ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      : "https://images.unsplash.com/photo-1517436034114-1e2b6e159046?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="col-span-1 group"
    >
      <Card className="rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20 cursor-pointer flex flex-col h-full">
        
        {/* Top Image Section (Fixed Height) */}
        <div className="relative h-48 w-full bg-muted flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover" 
          />

          {/* Category Tag (Top Left Bubble) */}
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
            {icon} {item.category.replace('mental health', 'Wellness')}
          </div>
          
          {/* Action Overlay */}
          <div className='absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
             {onView && (
               <Button variant="ghost" size="icon" className='h-8 w-8 bg-background/70 hover:bg-background/90 text-blue-600' onClick={(e) => { e.stopPropagation(); onView(item); }}>
                 <Eye className="h-4 w-4" />
               </Button>
             )}
             <Button variant="ghost" size="icon" className='h-8 w-8 bg-background/70 hover:bg-background/90 text-primary' onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
               <Pencil className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="icon" className='h-8 w-8 bg-background/70 hover:bg-background/90 text-destructive' onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
               <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Content Section (Fixed Height to ensure card size consistency) */}
        <CardContent className="p-4 space-y-2 flex flex-col justify-between flex-grow" style={{ minHeight: '130px' }}>
          <div>
            <div className='flex items-start justify-between mb-1'>
              {/* Using text-lg and font-bold for CardTitle equivalent */}
              <h3 className="text-xl font-bold leading-tight line-clamp-2 pr-2">{item.name}</h3>
              
              {/* Secondary Tag */}
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5',
                item.isCustom ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'
              )}>
                {secondaryTag}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
              {item.introduction}
            </p>
          </div>

          {/* Footer Detail (Aligned to bottom of content area) */}
          <div className='pt-2 text-sm font-semibold text-foreground/80 border-t border-border/70 mt-auto'>
            {primaryDetail}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LibraryCard;
