// src/components/customer/mycoach/EnhancedCoachUpdates.tsx
import { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, History, X, MessageCircle, MapPin, BarChart3, Send, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import useMediaQuery from '@/hooks/use-media-query';
import { useRealTimeCheckIns } from '@/hooks/useRealTimeCheckIns';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';

const emojiRatings = ['😞', '😕', '😐', '🙂', '😃', '😁', '🤩'];

const getUpdateIcon = (type: string) => {
    switch (type) {
        case 'Program Feedback': return MessageCircle;
        case 'Check-in': return MapPin;
        case 'Pinpoint': return BarChart3;
        default: return MessageCircle;
    }
};

const getUpdateColor = (type: string) => {
    switch (type) {
        case 'Program Feedback': return 'from-blue-500/10 to-blue-600/5';
        case 'Check-in': return 'from-green-500/10 to-green-600/5';
        case 'Pinpoint': return 'from-purple-500/10 to-purple-600/5';
        default: return 'from-gray-500/10 to-gray-600/5';
    }
};

const EnhancedCoachUpdates = () => {
    const { profile } = useAuth();
    const { planStatus } = usePaymentPlan();
    const { activePins, history, loading, respondToCheckIn } = useRealTimeCheckIns();
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [submittedIds, setSubmittedIds] = useState<string[]>([]);
    const [dismissedInfoId, setDismissedInfoId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleSubmit = async (id: string) => {
        setIsSubmitting(id);
        try {
            const response = responses[id] || '';
            await respondToCheckIn(id, response);
            setSubmittedIds((prev) => [...prev, id]);
            setResponses(prev => { delete prev[id]; return { ...prev }; });
            setRatings(prev => { delete prev[id]; return { ...prev }; });
        } catch (error) {
            console.error('Error submitting response:', error);
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleDismissInfo = (id: string) => {
        setDismissedInfoId(id);
    };

    if (!planStatus.hasActivePlan && !profile?.coach_id) {
        return (
            <Card className="shadow-xl border-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Coach Updates (Premium)</h3>
                    <p className="text-muted-foreground">
                        Upgrade to a <strong>Premium Plan</strong> to see your coach's personalized updates!
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const recentUpdates = activePins
        .filter((pin) => pin.id !== dismissedInfoId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Coach Inbox</h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {/* TODO: Implement history view */}}
                >
                    <History className="w-4 h-4 mr-2" />
                    View History ({history.length})
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {recentUpdates
                    .filter((pin) => !submittedIds.includes(pin.id))
                    .map((pin, index) => {
                        const isCheckIn = pin.type === 'checkin';
                        const isInfo = pin.type === 'program';
                        const Icon = getUpdateIcon('Check-in');
                        const colorGradient = getUpdateColor('Check-in');

                        return (
                            <motion.div
                                key={pin.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={isInfo ? { opacity: 0, x: isMobile ? 300 : -300, transition: { duration: 0.3 } } : { opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                drag={isInfo && isMobile ? 'x' : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(event, info) => {
                                    if (isInfo && isMobile && Math.abs(info.point.x) > 50) {
                                        handleDismissInfo(pin.id);
                                    }
                                }}
                                className={cn(
                                    "relative",
                                    isInfo && isMobile && "cursor-grab active:cursor-grabbing"
                                )}
                            >
                                <Card className="shadow-lg rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    <div className={cn("absolute inset-0 bg-gradient-to-br", colorGradient)} />
                                    <div className="relative bg-card/70 backdrop-blur-sm p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <CardTitle className="text-lg font-semibold truncate">
                                                        {pin.title}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {new Date(pin.created_at).toLocaleDateString()} • <span className="font-medium text-primary">Check-in</span>
                                                    </p>
                                                </div>
                                            </div>
                                            {isInfo && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-60 hover:opacity-100 transition-opacity ml-4 p-2 h-auto flex-shrink-0"
                                                    onClick={() => handleDismissInfo(pin.id)}
                                                    aria-label="Dismiss information"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/50 pl-4 py-1">
                                                {pin.content}
                                            </p>

                                            {/* Interactive Feedback Section */}
                                            {isCheckIn && (
                                                <div className="pt-2 space-y-4 border-t border-border/50">
                                                    {isCheckIn && (
                                                        <div className="space-y-3">
                                                            <p className="font-medium text-sm text-foreground">How are you feeling today?</p>
                                                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                                                {emojiRatings.map((emoji, index) => {
                                                                    const ratingValue = index + 1;
                                                                    const isSelected = ratings[pin.id] === ratingValue;
                                                                    return (
                                                                        <motion.button
                                                                            key={ratingValue}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setRatings((prev) => ({ ...prev, [pin.id]: ratingValue }))
                                                                            }
                                                                            initial={false}
                                                                            animate={{ scale: isSelected ? 1.2 : 1, opacity: isSelected ? 1 : 0.6 }}
                                                                            whileHover={{ scale: isSelected ? 1.2 : 1.1, opacity: 1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            className={cn(
                                                                                "text-3xl p-2 rounded-full transition-all duration-200",
                                                                                isSelected ? 'bg-primary/10' : 'hover:bg-accent/5'
                                                                            )}
                                                                            aria-label={`Rate ${ratingValue} out of ${emojiRatings.length}`}
                                                                        >
                                                                            {emoji}
                                                                        </motion.button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <Textarea
                                                        value={responses[pin.id] || ''}
                                                        onChange={(e) =>
                                                            setResponses((prev) => ({ ...prev, [pin.id]: e.target.value }))
                                                        }
                                                        placeholder="Add details about your feeling (optional)..."
                                                        className="min-h-[80px] bg-background/50 backdrop-blur-sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSubmit(pin.id)}
                                                        disabled={
                                                            (isCheckIn && ratings[pin.id] === undefined && !responses[pin.id]?.trim()) ||
                                                            isSubmitting === pin.id
                                                        }
                                                        className="w-full sm:w-auto"
                                                    >
                                                        {isSubmitting === pin.id ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4 mr-2" />
                                                        )}
                                                        {isSubmitting === pin.id ? 'Submitting...' : 'Submit Check-in'}
                                                    </Button>
                                                </div>
                                            )}

                                            {submittedIds.includes(pin.id) && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Check-in submitted!
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
            </AnimatePresence>

            {recentUpdates.length === 0 && (
                <Card className="shadow-lg border-0 rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">All caught up!</h4>
                        <p className="text-muted-foreground text-sm">No new updates or pending check-ins. You're on track!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EnhancedCoachUpdates;
