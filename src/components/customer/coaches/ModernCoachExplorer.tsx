// src/components/customer/coaches/ModernCoachExplorer.tsx
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircleUserRound, Zap, MessageSquare, Star, Send, Search, Filter, History, Loader2, Clock, Eye, Bot } from 'lucide-react';
import { useAIPlanGeneration } from '@/hooks/useAIPlanGeneration';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEnhancedCoaches, EnhancedCoach } from '@/hooks/useEnhancedCoaches';
import { useRealTimeCoachData, RealTimeCoachData } from '@/hooks/useRealTimeCoachData';
import { CoachDetailModal } from './CoachDetailModal';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { useNavigate } from 'react-router-dom';

// Define the available filter options
type FilterOption = 'All' | 'Fitness' | 'Nutrition' | 'Mental Health';
const FILTER_OPTIONS: FilterOption[] = ['All', 'Fitness', 'Nutrition', 'Mental Health'];

interface CoachCardProps {
    coach: RealTimeCoachData;
    onRequest: (coach: RealTimeCoachData) => void;
    onViewDetails: (coach: RealTimeCoachData) => void;
    index: number;
    requestStatus?: 'pending' | 'accepted' | 'rejected' | null;
    isRequestLoading?: boolean;
}

const ModernCoachCard: React.FC<CoachCardProps> = ({ coach, onRequest, onViewDetails, index, requestStatus, isRequestLoading }) => (
    <motion.div
        // Prevent repeated mount animations that can cause jitter when parent re-renders
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="group"
    >
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 z-0" />
            <CardContent className="relative p-6 z-10">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10 shadow-md">
                            {coach.profileImageUrl ? (
                                <img
                                    src={coach.profileImageUrl}
                                    alt={coach.name}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <CircleUserRound className="w-8 h-8 text-primary/70" />
                            )}
                        </div>
                        <div className="pointer-events-none absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {coach.name}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-foreground/80">{coach.rating.toFixed(1)}</span>
                                <span>({coach.reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className='font-medium'>{coach.yearsExperience}+ Years Exp.</span>
                            </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {coach.bio}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {coach.skills.slice(0, 3).map((skill, idx) => (
                                <Badge 
                                    key={idx} 
                                    variant="secondary"
                                    className="text-xs bg-primary/10 text-primary py-1.5 px-3 rounded-full font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                    {skill}
                                </Badge>
                            ))}
                            {coach.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs text-muted-foreground py-1.5 px-3">
                                    +{coach.skills.length - 3} more
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => onViewDetails(coach)} 
                                variant="outline"
                                size="sm"
                                className="gap-2 flex-1"
                            >
                                <Eye className="w-4 h-4" />
                                View Details
                            </Button>
                            <Button 
                                onClick={() => onRequest(coach)} 
                                size="sm"
                                className="gap-2 flex-1"
                                disabled={requestStatus === 'pending' || requestStatus === 'accepted' || isRequestLoading}
                                variant={requestStatus === 'rejected' ? 'outline' : 'default'}
                            >
                                {isRequestLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {requestStatus === 'pending' && 'Request Sent'}
                                {requestStatus === 'accepted' && 'Already Your Coach'}
                                {requestStatus === 'rejected' && 'Request Again'}
                                {!requestStatus && 'Send Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

const CoachHistorySection = () => (
    <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-br from-accent/5 to-secondary/5">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <History className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Coach History</h3>
                        <p className="text-sm text-muted-foreground">Previous coaching relationships</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-primary/5">
                    View All
                </Button>
            </div>
            <div className="border-2 border-dashed rounded-xl p-8 text-center bg-card">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                    No previous coaches on record. This will be your first coaching journey!
                </p>
            </div>
        </CardContent>
    </Card>
);

interface ModernCoachExplorerProps {
    onNewCoachRequestSent: (coachName: string) => void;
}

const ModernCoachExplorer: React.FC<ModernCoachExplorerProps> = ({ onNewCoachRequestSent }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { planStatus } = usePaymentPlan();
    const { coaches: realTimeCoaches, loading: realTimeLoading } = useRealTimeCoachData();
    const { sendRequest, getRequestStatus } = useEnhancedCoaches();
    const { generateThreePlans, loading: aiLoading } = useAIPlanGeneration();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<RealTimeCoachData | null>(null);
    const [isRequestLoading, setIsRequestLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

    const handleRequest = async (coach: RealTimeCoachData) => {
        const requestStatus = getRequestStatus(coach.id);
        if (requestStatus === 'pending' || requestStatus === 'accepted') {
            return;
        }
        
        setIsRequestLoading(true);
        try {
            await sendRequest(coach.id);
            toast.success(`Request sent to ${coach.name}!`);
            onNewCoachRequestSent(coach.name);
        } catch (error) {
            console.error('Request error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to send request. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsRequestLoading(false);
        }
    };

    const handleViewDetails = (coach: RealTimeCoachData) => {
        setSelectedCoach(coach);
        setIsDetailModalOpen(true);
    };


    const mapSkillToCategory = (skill: string): FilterOption => {
        const fitnessSkills = ['strength training', 'hiit', 'yoga', 'pilates', 'bodybuilding', 'endurance', 'weight loss', 'functional training'];
        const nutritionSkills = ['meal planning', 'sports nutrition', 'weight management', 'dietary restrictions', 'supplements', 'macro coaching'];
        const mentalHealthSkills = ['mindfulness', 'stress management', 'motivation coaching', 'habit formation', 'work-life balance', 'goal setting'];
        
        const lowerSkill = skill.toLowerCase();
        if (fitnessSkills.some(s => lowerSkill.includes(s))) return 'Fitness';
        if (nutritionSkills.some(s => lowerSkill.includes(s))) return 'Nutrition';
        if (mentalHealthSkills.some(s => lowerSkill.includes(s))) return 'Mental Health';
        return 'Fitness'; // Default
    };

    const filteredCoaches = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return realTimeCoaches.filter(coach => {
            // Only filter by name, not bio or skills
            const matchesSearch = coach.name.toLowerCase().includes(term);
            const matchesFilter = activeFilter === 'All' ||
                                 coach.skills.some(skill => mapSkillToCategory(skill) === activeFilter);
            return matchesSearch && matchesFilter;
        });
    }, [realTimeCoaches, searchTerm, activeFilter]);

    if (realTimeLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const handleAICoach = async () => {
        // Prevent action if no active plan
        if (!planStatus.hasActivePlan) {
            toast.error('AI Coach requires an active subscription or trial. Please upgrade to access this feature.');
            return;
        }

        if (!user) {
            toast.error('Please log in to generate your AI plan.');
            return;
        }

        try {
            await generateThreePlans();
            toast.success('Your AI plans have been generated and saved!');
            // Navigate to programs page to see the generated plans
            navigate('/customer/programs');
        } catch (error) {
            console.error('AI plan generation error:', error);
            
            // Check if error is about subscription
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorText = typeof error === 'string' ? error : errorMessage;
            
            if (errorText.includes('subscription') || errorText.includes('trial') || errorText.includes('active subscription')) {
                toast.error('AI Coach requires an active subscription or trial. Please upgrade to access this feature.');
            } else {
                toast.error('Failed to generate AI plan. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* AI Coach Highlight */}
            <Card className="border-2 border-emerald-300/40 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300">
                                AI Coach
                            </span>
                        </div>
                        <p className="mt-1 text-emerald-700 dark:text-emerald-300 text-lg font-semibold">
                            {planStatus.hasActivePlan 
                                ? 'Get a personalized plan powered by AI.' 
                                : 'Get a personalized plan powered by AI. Requires active subscription.'
                            }
                        </p>
                    </div>
                    <Button 
                        onClick={handleAICoach} 
                        disabled={aiLoading || !planStatus.hasActivePlan}
                        className={cn(
                            planStatus.hasActivePlan 
                                ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600' 
                                : 'bg-emerald-600/60 hover:bg-emerald-700/70 dark:bg-emerald-500/50 dark:hover:bg-emerald-600/60 cursor-not-allowed pointer-events-none',
                            aiLoading && 'pointer-events-none'
                        )}
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : planStatus.hasActivePlan ? (
                            'Generate AI Plan'
                        ) : (
                            'Upgrade Required'
                        )}
                    </Button>
                </CardContent>
            </Card>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search coaches by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 h-12"
                    />
                </div>
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsFilterOpen(true)}
                        className="gap-2 h-12 px-6"
                    >
                        <Filter className="w-4 h-4" />
                        Filter: {activeFilter}
                    </Button>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Filter Coaches</DialogTitle>
                            <DialogDescription>
                                Choose a specialty to filter coaches by their expertise.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-3 py-4">
                            {FILTER_OPTIONS.map((option) => (
                                <Button
                                    key={option}
                                    variant={activeFilter === option ? "default" : "outline"}
                                    onClick={() => {
                                        setActiveFilter(option);
                                        setIsFilterOpen(false);
                                    }}
                                    className="justify-start"
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Results */}
            <div className="grid gap-6">
                {filteredCoaches.length > 0 ? (
                    <>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''}
                            {searchTerm && ` matching "${searchTerm}"`}
                            {activeFilter !== 'All' && ` in ${activeFilter}`}
                        </div>
                        {filteredCoaches.map((coach, index) => (
                            <ModernCoachCard
                                key={coach.id}
                                coach={coach}
                                onRequest={handleRequest}
                                onViewDetails={handleViewDetails}
                                index={index}
                                requestStatus={getRequestStatus(coach.id)}
                                isRequestLoading={isRequestLoading}
                            />
                        ))}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No coaches found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search terms or filters to find coaches.
                        </p>
                    </div>
                )}
            </div>

            <Separator className="my-8" />
            <CoachHistorySection />


            {/* Coach Detail Modal */}
            <CoachDetailModal
                coach={selectedCoach}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onRequest={handleRequest}
                requestStatus={selectedCoach ? getRequestStatus(selectedCoach.id) : null}
            />
        </div>
    );
};

export default ModernCoachExplorer;