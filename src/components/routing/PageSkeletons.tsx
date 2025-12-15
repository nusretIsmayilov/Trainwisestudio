import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dashboard skeleton with welcome header and cards
export const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
    {/* Welcome header skeleton */}
    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64 bg-primary/20" />
          <Skeleton className="h-4 w-48 bg-primary/20" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full bg-primary/20" />
      </div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Content cards skeleton */}
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Programs list skeleton
export const ProgramsSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
    
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border-border/50 overflow-hidden">
          <Skeleton className="h-32 w-full rounded-none" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Library grid skeleton
export const LibrarySkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
    
    {/* Category tabs skeleton */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
      ))}
    </div>
    
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="border-border/50 overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Progress page skeleton
export const ProgressSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
    <Skeleton className="h-8 w-40" />
    
    {/* Stats row */}
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4 text-center">
            <Skeleton className="h-10 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Chart skeleton */}
    <Card className="border-border/50">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
    
    {/* Photo grid skeleton */}
    <Card className="border-border/50">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Messages skeleton
export const MessagesSkeleton = () => (
  <div className="flex h-[calc(100vh-8rem)] animate-in fade-in duration-300">
    {/* Conversations list */}
    <div className="w-80 border-r border-border/50 p-4 space-y-3 hidden md:block">
      <Skeleton className="h-10 w-full rounded-lg mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Chat area */}
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex-1 py-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

// Settings skeleton
export const SettingsSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
    <Skeleton className="h-8 w-32" />
    
    {/* Profile section */}
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Generic page skeleton (fallback)
export const GenericPageSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
