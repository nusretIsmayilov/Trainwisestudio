// src/components/customer/mycoach/SmartFeedbackSystem.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertCircle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FeedbackType = 'success' | 'info' | 'warning' | 'error';

interface SmartFeedbackSystemProps {
    message: string;
    isVisible: boolean;
    onDismiss: () => void;
    type?: FeedbackType;
    actionLabel?: string;
    onAction?: () => void;
    autoClose?: boolean;
    duration?: number;
}

const getIcon = (type: FeedbackType) => {
    switch (type) {
        case 'success': return CheckCircle;
        case 'warning': return AlertCircle;
        case 'error': return X;
        case 'info':
        default: return Info;
    }
};

const getStyles = (type: FeedbackType) => {
    switch (type) {
        case 'success':
            return {
                container: 'border-green-500/50 bg-green-50/90 dark:bg-green-900/20 backdrop-blur-md',
                icon: 'text-green-600 dark:text-green-400',
                text: 'text-green-900 dark:text-green-100'
            };
        case 'warning':
            return {
                container: 'border-yellow-500/50 bg-yellow-50/90 dark:bg-yellow-900/20 backdrop-blur-md',
                icon: 'text-yellow-600 dark:text-yellow-400',
                text: 'text-yellow-900 dark:text-yellow-100'
            };
        case 'error':
            return {
                container: 'border-red-500/50 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md',
                icon: 'text-red-600 dark:text-red-400',
                text: 'text-red-900 dark:text-red-100'
            };
        case 'info':
        default:
            return {
                container: 'border-blue-500/50 bg-blue-50/90 dark:bg-blue-900/20 backdrop-blur-md',
                icon: 'text-blue-600 dark:text-blue-400',
                text: 'text-blue-900 dark:text-blue-100'
            };
    }
};

const SmartFeedbackSystem: React.FC<SmartFeedbackSystemProps> = ({
    message,
    isVisible,
    onDismiss,
    type = 'success',
    actionLabel,
    onAction,
    autoClose = true,
    duration = 5000
}) => {
    const Icon = getIcon(type);
    const styles = getStyles(type);

    React.useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(() => {
                onDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, onDismiss]);

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8
                    }}
                    className={cn(
                        "fixed inset-x-0 z-[100] mx-auto w-[calc(100%-2rem)] max-w-md",
                        "rounded-2xl shadow-2xl border-2",
                        "transform-gpu",
                        styles.container
                    )}
                    style={{
                        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)'
                    }}
                >
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "flex-shrink-0 w-6 h-6 mt-0.5",
                                styles.icon
                            )}>
                                <Icon className="w-full h-full" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium leading-relaxed",
                                    styles.text
                                )}>
                                    {message}
                                </p>

                                {actionLabel && onAction && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onAction}
                                        className={cn(
                                            "mt-2 h-8 px-3 text-xs font-medium",
                                            "hover:bg-white/20 dark:hover:bg-black/20",
                                            styles.text
                                        )}
                                    >
                                        <Zap className="w-3 h-3 mr-1" />
                                        {actionLabel}
                                    </Button>
                                )}
                            </div>

                            <button
                                onClick={onDismiss}
                                className={cn(
                                    "flex-shrink-0 p-1 rounded-full transition-colors",
                                    "hover:bg-white/20 dark:hover:bg-black/20",
                                    "focus:outline-none focus:ring-2 focus:ring-white/50",
                                    styles.text
                                )}
                                aria-label="Dismiss notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar for auto-close */}
                    {autoClose && (
                        <motion.div
                            className="absolute bottom-0 left-0 h-1 bg-current rounded-b-2xl opacity-30"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

// Hook for easier usage (Unchanged)
export const useSmartFeedback = () => {
    const [feedback, setFeedback] = React.useState<{
        isVisible: boolean;
        message: string;
        type: FeedbackType;
        actionLabel?: string;
        onAction?: () => void;
    }>({
        isVisible: false,
        message: '',
        type: 'success'
    });

    const showFeedback = React.useCallback((
        message: string,
        type: FeedbackType = 'success',
        actionLabel?: string,
        onAction?: () => void
    ) => {
        setFeedback({
            isVisible: true,
            message,
            type,
            actionLabel,
            onAction
        });
    }, []);

    const hideFeedback = React.useCallback(() => {
        setFeedback(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        feedback,
        showFeedback,
        hideFeedback
    };
};

export default SmartFeedbackSystem;
