// src/components/customer/progress/PhotoProgressCard.tsx
import { Button } from '@/components/ui/button';
import { Camera, Maximize, GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhotoEntry {
  id: string;
  date: string;
  imageUrl: string;
  notes?: string;
}

export default function PhotoProgressCard({ photos }: { photos: PhotoEntry[] }) {
  const sortedPhotos = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestPhoto = sortedPhotos[0];
  const olderPhotos = sortedPhotos.slice(1);
  const hasPhotos = photos && photos.length > 0;

  return (
    <motion.div 
      className="bg-card dark:bg-[#0d1218] p-4 sm:p-6 rounded-2xl border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Progress Photos</h3>
        <Button variant="outline" size="sm" className="gap-2"><Camera className="h-4 w-4" />Add New</Button>
      </div>
      
      {/* No Photos State */}
      {!hasPhotos && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">No Progress Photos Yet</h4>
          <p className="text-muted-foreground max-w-md mx-auto">
            Do a weigh-in or progression photo to track your progress and see how your body changes over time.
          </p>
        </div>
      )}
      
      {/* Latest Photo Section */}
      {latestPhoto && (
        <div className="mb-6 rounded-xl overflow-hidden relative group max-w-sm mx-auto">
          <img 
            src={latestPhoto.imageUrl} 
            alt={`Latest progress photo taken on ${latestPhoto.date}`} 
            className="w-full aspect-[3/4] object-cover max-h-64" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/256x341/6b7280/fff?text=Photo+Not+Found';
            }}
          />
          <div className="absolute top-0 left-0 p-2 bg-background/50 backdrop-blur-sm rounded-br-lg text-xs font-semibold text-foreground/80">
            Latest: {new Date(latestPhoto.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Photo Snapshots Section */}
      {olderPhotos.length > 0 && (
        <>
          <h4 className="text-lg font-semibold mb-3">Snapshots</h4>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide-tablet">
              {olderPhotos.map((photo) => (
                <div key={photo.id} className="flex-shrink-0 w-20 group relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={`Progress photo on ${photo.date}`} 
                    className="aspect-[3/4] w-full object-cover rounded-lg max-h-24" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/80x107/6b7280/fff?text=Photo+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 rounded-lg">
                    <Button variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20 mb-1">
                      <Maximize className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                      <GitCompare className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {new Date(photo.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              ))}
            </div>
        </>
      )}
    </motion.div>
  );
}
