// src/components/customer/mycoach/RequestFeedbackFab.tsx
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquarePlus, Send } from 'lucide-react';

// The component now accepts a prop to handle the request
const RequestFeedbackFab = ({ isMobile, onRequestFeedback }) => {
    const fabButton = (
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 z-50 transition-all hover:scale-105">
            <MessageSquarePlus className="w-6 h-6" />
        </Button>
    );

    const handleAction = () => {
        onRequestFeedback();
    };

    // Note: The logic for Popover is identical for mobile and desktop for this single action,
    // which simplifies the UI but maintains a clean pattern.
    return (
        <Popover>
            <PopoverTrigger asChild>
                {fabButton}
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 mb-2 shadow-lg" side="top" align="end">
                <Button className="w-full justify-start h-12" onClick={handleAction}>
                    <Send className="mr-2 h-4 w-4" />
                    Request Feedback
                </Button>
            </PopoverContent>
        </Popover>
    );
};

export default RequestFeedbackFab;
