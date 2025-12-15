import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AwaitingOfferMessageProps {
  clientName: string;
  onSendOffer?: () => void;
}

const AwaitingOfferMessage: React.FC<AwaitingOfferMessageProps> = ({ 
  clientName, 
  onSendOffer 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <Card className="shadow-lg rounded-xl border-yellow-200 bg-yellow-50 max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
            Awaiting Offer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-yellow-700 text-sm">
            The customer <strong>{clientName}</strong> is awaiting an offer. Please send it before accessing this tab.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onSendOffer}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Send Offer
            </Button>
            <Button 
              variant="outline" 
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AwaitingOfferMessage;
