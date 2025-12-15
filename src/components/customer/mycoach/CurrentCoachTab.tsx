// src/components/customer/mycoach/CurrentCoachTab.tsx
import { useState, useEffect } from 'react';
import ModernCoachDashboard from './ModernCoachDashboard';
import EnhancedCoachUpdates from './EnhancedCoachUpdates';
import UnifiedSharedFiles from './UnifiedSharedFiles';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { File, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CurrentCoachTabProps {
    isMobile: boolean;
    onViewBio: () => void;
    onRequestFeedback: () => void;
    onViewSharedFiles: () => void; // Added for mobile file access
}

const CurrentCoachTab: React.FC<CurrentCoachTabProps> = ({ isMobile, onViewBio, onRequestFeedback, onViewSharedFiles }) => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [coach, setCoach] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoachData = async () => {
            if (!profile?.coach_id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Fetch coach profile data
                const { data: coachData, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, bio, avatar_url, skills, certifications, socials')
                    .eq('id', profile.coach_id)
                    .eq('role', 'coach')
                    .single();

                if (error) {
                    console.error('Error fetching coach data:', error);
                    return;
                }

                setCoach({
                    id: coachData.id,
                    name: coachData.full_name || 'Your Coach',
                    bio: coachData.bio || 'Dedicated to helping you achieve your health and fitness goals.',
                    specialties: coachData.skills || ['Fitness', 'Nutrition'],
                    profileImageUrl: coachData.avatar_url || '',
                    skills: coachData.skills || [],
                    certifications: coachData.certifications || [],
                    socials: coachData.socials || [],
                });
            } catch (error) {
                console.error('Error fetching coach data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoachData();
    }, [profile?.coach_id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your coach information...</p>
                </div>
            </div>
        );
    }

    if (!coach) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Coach Assigned</h3>
                <p className="text-muted-foreground">You don't have a coach assigned yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Mobile View: Files button is placed here */}
            {isMobile && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-dashed border-primary/20 hover:bg-primary/5 transition-all"
                        onClick={onViewSharedFiles}
                    >
                        <File className="w-4 h-4 mr-2" /> View All Shared Files
                    </Button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    <ModernCoachDashboard 
                        coach={coach}
                        isMobile={isMobile}
                        onViewBio={onViewBio}
                        onRequestFeedback={onRequestFeedback}
                        onViewSharedFiles={onViewSharedFiles}
                    />
                    <EnhancedCoachUpdates />
                </div>

                {/* Shared Files Column (Desktop/Tablet) */}
                <div className={cn(
                    "lg:col-span-1",
                    isMobile ? 'hidden' : 'block'
                )}>
                    <UnifiedSharedFiles />
                </div>
            </div>

            {/* Chat Button - Only visible on this tab */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <Button
                    onClick={() => navigate('/customer/chat')}
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
                >
                    <MessageCircle className="w-6 h-6" />
                </Button>
            </motion.div>
        </div>
    );
};

export default CurrentCoachTab;
