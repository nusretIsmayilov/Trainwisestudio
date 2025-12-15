// src/components/customer/mycoach/ModernCoachDashboard.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Star, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import useMediaQuery from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';
import { useRealTimeMotivation } from '@/hooks/useRealTimeMotivation';
import { useNavigate } from 'react-router-dom';

interface CoachInfo {
    name: string;
    bio: string;
    specialties: string[];
    profileImageUrl?: string;
    email?: string;
}

interface ModernCoachDashboardProps {
    coach: CoachInfo;
    isMobile: boolean;
    onViewBio: () => void;
    onRequestFeedback: () => void;
    onViewSharedFiles: () => void;
}

const ModernCoachDashboard: React.FC<ModernCoachDashboardProps> = ({ 
    coach, 
    isMobile, 
    onViewBio, 
    onRequestFeedback, 
    onViewSharedFiles 
}) => {
    const [isDailyMessageVisible, setIsDailyMessageVisible] = useState(true);
    const { profile } = useAuth();
    const { planStatus } = usePaymentPlan();
    const { motivationMessage, loading: motivationLoading } = useRealTimeMotivation();
    const navigate = useNavigate();

    const handleDismissMessage = () => {
        setIsDailyMessageVisible(false);
    };

    return (
        <div className="space-y-6">
            {/* Modern Hero Coach Header (Glassmorphism + Prominent Avatar) */}
            <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent z-0" />
                <Card className="border-0 shadow-xl bg-card/70 backdrop-blur-md relative z-10">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-24 h-24 ring-4 ring-primary/20 shadow-xl">
                                    <AvatarImage src={coach.profileImageUrl} alt={coach.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl">
                                        <User className="w-12 h-12" />
                                    </AvatarFallback>
                                </Avatar>
                                {/* Online Status with Subtle Pulse Animation */}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background">
                                    <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 pt-1">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground mb-1">{coach.name}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-base font-medium">Your Personal Coach</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {coach.specialties.map((specialty, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors py-1.5 px-3"
                                        >
                                            {specialty}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={onViewBio}
                                        className="shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        View Full Bio
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-primary hover:bg-primary/5 border-primary/20"
                                        onClick={() => navigate('/customer/chat')}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Message Coach
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Message (Swipe Dismissible on Mobile) - gated to paying plan or active coach contract */}
            <AnimatePresence>
                {isDailyMessageVisible && (planStatus.hasActivePlan || Boolean(profile?.coach_id)) && motivationMessage && (
                    <motion.div
                        key="todays-message"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
                        drag={isMobile ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(event, info) => {
                            if (Math.abs(info.point.x) > 50) {
                                handleDismissMessage();
                            }
                        }}
                        className={cn("relative", isMobile ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
                    >
                        <Card className="shadow-lg rounded-2xl border-l-4 border-primary/80 bg-gradient-to-r from-accent/5 to-secondary/5 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">{motivationMessage.emoji}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{motivationMessage.title}</h3>
                                                <p className="text-xs text-muted-foreground">Today's motivation</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {motivationMessage.content}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className='ml-4 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 p-2 h-auto'
                                        onClick={handleDismissMessage}
                                        aria-label="Dismiss message"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModernCoachDashboard;
