// src/pages/customer/MyCoach.tsx
import { useState, useEffect } from 'react';
import useMediaQuery from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import from the strictly separated directories
import CurrentCoachTab from '@/components/customer/mycoach/CurrentCoachTab';
import ExplorerTab from '@/components/customer/coaches/ExplorerTab';
import CoachBioDrawer from '@/components/customer/mycoach/CoachBioDrawer';
import { SharedFilesDrawerContent } from '@/components/customer/mycoach/UnifiedSharedFiles';
import SmartFeedbackSystem from '@/components/customer/mycoach/SmartFeedbackSystem';
import AICoachProgramSelector from '@/components/customer/mycoach/AICoachProgramSelector';
import TrialCountdown from '@/components/customer/TrialCountdown';

// UI Components
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { User, Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MyCoach = () => {
    const { user, profile } = useAuth();
    const [hasCurrentCoach, setHasCurrentCoach] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('myCoach');
    const { t } = useTranslation();

    const [isBioDrawerOpen, setIsBioDrawerOpen] = useState(false);
    const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [feedbackPopup, setFeedbackPopup] = useState({
        isVisible: false,
        message: '',
        requested: false,
    });

    // Check if user has a coach or accepted request
    useEffect(() => {
        const checkCoachStatus = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Check if user has coach_id in profile
                const hasCoachId = !!profile?.coach_id;
                
                // Also check for accepted requests (use maybeSingle to handle no results gracefully)
                const { data: acceptedRequest, error: requestError } = await supabase
                    .from('coach_requests')
                    .select('id')
                    .eq('customer_id', user.id)
                    .eq('status', 'accepted')
                    .maybeSingle();

                // Only log if it's a real error, not just "no results"
                if (requestError && requestError.code !== 'PGRST116') {
                    console.error('Error checking coach requests:', requestError);
                }

                const hasCoach = hasCoachId || !!acceptedRequest;
                setHasCurrentCoach(hasCoach);
                
                // Don't force tab switching - let users navigate freely
            } catch (error) {
                console.error('Error checking coach status:', error);
                setHasCurrentCoach(false);
            } finally {
                setLoading(false);
            }
        };

        // Add a small delay to prevent rapid re-renders
        const timeoutId = setTimeout(checkCoachStatus, 100);
        return () => clearTimeout(timeoutId);
    }, [user?.id, profile?.coach_id]); // Only depend on essential values

    const showPopup = (message: string, requested = false) => {
        setFeedbackPopup({ isVisible: true, message, requested });
        setTimeout(() => {
            setFeedbackPopup(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    };

    const handleFeedbackRequest = () => {
        if (feedbackPopup.requested) {
            showPopup(`You already requested feedback. Your coach will reach out soon.`, true);
        } else {
            showPopup("Feedback requested! Your coach will reach out soon.", true);
        }
    };

    const handleNewCoachRequestSent = (coachName: string) => {
        showPopup(`Your request for ${coachName} has been sent! We'll process the switch shortly.`);
        if (hasCurrentCoach) {
            setActiveTab('myCoach');
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
            <div className="px-2">
                <h1 className="text-3xl font-bold text-foreground">{t('mycoach.coachingHub')} 🚀</h1>
                <p className="mt-1 text-lg text-muted-foreground">{t('mycoach.description')}</p>
            </div>

            {/* Trial Countdown */}
            <TrialCountdown />

            <Tabs
                defaultValue="myCoach"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                {/* 1. TAB LIST: Fixed tab visibility and styling */}
                <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-secondary/50 dark:bg-secondary/20 rounded-xl">
                    <TabsTrigger
                        value="myCoach"
                        className="data-[state=active]:bg-background/80 data-[state=active]:shadow-md data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/50 rounded-lg h-10 transition-all"
                    >
                        <User className="w-4 h-4 mr-2"/> {t('mycoach.myCoach')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="explore"
                        className="data-[state=active]:bg-background/80 data-[state=active]:shadow-md data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border/50 rounded-lg h-10 transition-all"
                    >
                        <Search className="w-4 h-4 mr-2"/> {t('mycoach.exploreHistory')}
                    </TabsTrigger>
                </TabsList>

                {/* 2. TAB CONTENT */}

                {/* --- CONTENT 1: MY COACH --- */}
                <TabsContent value="myCoach" className="mt-6 space-y-6">
                    {/* AI Coach Program Selector - Show when no coach or always available */}
                    <AICoachProgramSelector 
                        onProgramGenerated={(programId, category) => {
                            console.log('Program generated:', programId, category);
                            // Optionally refresh or navigate to program
                        }}
                    />
                    
                    {hasCurrentCoach ? (
                        <CurrentCoachTab
                            isMobile={isMobile}
                            onViewBio={() => setIsBioDrawerOpen(true)}
                            onRequestFeedback={handleFeedbackRequest}
                            onViewSharedFiles={() => setIsFilesDrawerOpen(true)}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold mb-2">{t('mycoach.noCoach')}</h3>
                            <p className="text-muted-foreground mb-4">{t('mycoach.findCoachFromTab')}</p>
                            <button 
                                onClick={() => setActiveTab('explore')}
                                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {t('mycoach.goToExplore')}
                            </button>
                        </div>
                    )}
                </TabsContent>

                {/* --- CONTENT 2: EXPLORE & HISTORY --- */}
                <TabsContent value="explore" className="mt-6">
                    <ExplorerTab
                        onNewCoachRequestSent={handleNewCoachRequestSent}
                    />
                </TabsContent>
            </Tabs>


            {/* MODAL/DRAWER LAYERS (Non-Tab Overlays) */}

            {/* Coach Bio Modal/Drawer */}
            {isMobile ? (
                <Drawer open={isBioDrawerOpen} onOpenChange={setIsBioDrawerOpen}>
                    <DrawerContent><CoachBioDrawer /></DrawerContent>
                </Drawer>
            ) : (
                <Sheet open={isBioDrawerOpen} onOpenChange={setIsBioDrawerOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md"><CoachBioDrawer /></SheetContent>
                </Sheet>
            )}

            {/* Shared Files Drawer for Mobile */}
            {isMobile && (
                <Drawer open={isFilesDrawerOpen} onOpenChange={setIsFilesDrawerOpen}>
                    <DrawerContent><SharedFilesDrawerContent /></DrawerContent>
                </Drawer>
            )}

            {/* Smart Feedback System - Global */}
            <SmartFeedbackSystem
                message={feedbackPopup.message}
                isVisible={feedbackPopup.isVisible}
                onDismiss={() => setFeedbackPopup(prev => ({ ...prev, isVisible: false }))}
                type="success"
            />
        </div>
    );
};

export default MyCoach;
