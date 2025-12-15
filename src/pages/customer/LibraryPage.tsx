// src/pages/customer/LibraryPage.tsx

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Lock, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentPlan } from "@/hooks/usePaymentPlan";
import { useAccessLevel } from "@/contexts/AccessLevelContext";

import LibraryCard, { LibraryItem } from "@/components/customer/library/LibraryCard";
import LibraryDetailView from "@/components/customer/library/LibraryDetailView";

type LibraryTab = 'all' | 'fitness' | 'nutrition' | 'mental';

export default function LibraryPage() {
  const { profile } = useAuth();
  const { planStatus } = usePaymentPlan();
  const { accessLevel, hasCoach, hasPaymentPlan } = useAccessLevel();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [programLibraryItems, setProgramLibraryItems] = useState<LibraryItem[]>([]);

   useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchLibraryItems = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        if (hasPaymentPlan) {
          // Full access: Get all library items from assigned coach
          const { data } = await supabase
            .from('library_items')
            .select('id, category, name, hero_image_url, details')
            .eq('coach_id', profile.coach_id)
            .order('updated_at', { ascending: false })
            .limit(100);
            
          const mapped = (data || []).map((row: any) => ({
            id: row.id,
            type: row.category === 'exercise' ? 'fitness' : row.category === 'recipe' ? 'nutrition' : 'mental',
            name: row.name,
            imageUrl: row.hero_image_url,
            data: row.details || {},
          })) as LibraryItem[];
          
          setLibraryItems(mapped);
        } else if (hasCoach) {
          // Limited access: Get only library items assigned to user's programs
          const { data: programEntries } = await supabase
            .from('program_entries')
            .select('library_item_id')
            .eq('user_id', profile.id)
            .not('library_item_id', 'is', null);

          if (programEntries && programEntries.length > 0) {
            const libraryItemIds = programEntries.map(entry => entry.library_item_id).filter(Boolean);
            
            const { data } = await supabase
              .from('library_items')
              .select('id, category, name, hero_image_url, details')
              .in('id', libraryItemIds)
              .eq('coach_id', profile.coach_id)
              .order('updated_at', { ascending: false });
              
            const mapped = (data || []).map((row: any) => ({
              id: row.id,
              type: row.category === 'exercise' ? 'fitness' : row.category === 'recipe' ? 'nutrition' : 'mental',
              name: row.name,
              imageUrl: row.hero_image_url,
              data: row.details || {},
            })) as LibraryItem[];
            
            setProgramLibraryItems(mapped);
          }
        }
      } catch (error) {
        console.error('Error fetching library items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryItems();
  }, [profile, planStatus.hasActivePlan]);

  const filteredItems = useMemo(() => {
    const itemsToFilter = planStatus.hasActivePlan ? libraryItems : programLibraryItems;
    return itemsToFilter
      .filter(item => {
        if (activeTab === 'all') return true;
        return item.type === activeTab;
      })
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeTab, libraryItems, programLibraryItems, planStatus.hasActivePlan]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground text-lg">Loading your content...</p>
        </div>
      </div>
    );
  }

  // Free users without coach - hide library access
  if (!profile?.coach_id) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Library Access Required</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            You need to be assigned to a coach to access the library. Find a coach from the "My Coach" section to get started with your fitness journey.
          </p>
          <Button asChild className="mt-4">
            <a href="/customer/my-coach">Find a Coach</a>
          </Button>
        </div>
      </div>
    );
  }

  // Users with coach but no payment plan - limited access
  if (!planStatus.hasActivePlan) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground text-lg">Content assigned to your programs</p>
        </div>

        {/* Upgrade prompt */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Unlock Full Library Access</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You're currently seeing only content assigned to your programs. Upgrade to a paid plan to access your coach's complete library of exercises, recipes, and wellness guides.
            </p>
            <Button className="mt-2">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>

        {/* Limited content */}
        {filteredItems.length > 0 ? (
          <>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 space-y-4">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search your assigned content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base rounded-full"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="fitness">Fitness</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                  <TabsTrigger value="mental">Mental Health</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <LibraryCard key={`${item.type}-${item.id}`} item={item} onClick={() => setSelectedItem(item)} />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Assigned Content Yet</h3>
            <p className="text-muted-foreground">
              Your coach hasn't assigned any library content to your programs yet. Check back later or contact your coach.
            </p>
          </Card>
        )}

        <LibraryDetailView 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isMobile={isMobile}
        />
      </div>
    );
  }

  // Full access: Users with payment plan and coach
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground text-lg">Explore exercises, recipes, and wellness guides from your coach.</p>
      </div>

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for an exercise or recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-full"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="flex justify-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="mental">Mental Health</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <LibraryCard key={`${item.type}-${item.id}`} item={item} onClick={() => setSelectedItem(item)} />
        ))}
      </div>

      {filteredItems.length === 0 && (
         <div className="p-8 text-center border border-dashed rounded-2xl text-gray-500">
           <p>No items found for your search.</p>
         </div>
      )}

      <LibraryDetailView 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
