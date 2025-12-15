import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { syncCheckoutSession } from '@/lib/stripe/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const TestOfferSync = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      console.log('[Test] Calling syncCheckoutSession with:', sessionId);
      const syncResult = await syncCheckoutSession(sessionId);
      console.log('[Test] Sync result:', syncResult);
      setResult(syncResult);
      
      if (syncResult?.status === 'accepted' || syncResult?.ok) {
        toast.success('✅ Offer sync successful! Status: ' + (syncResult.status || 'accepted'));
        toast.info('💡 Go to Messages page to see the updated offer status. The badge should change from "Pending" to "Accepted".', {
          duration: 5000
        });
      } else {
        toast.info('Sync completed. Check result below.');
      }
    } catch (error) {
      console.error('[Test] Sync error:', error);
      setResult({ error: error instanceof Error ? error.message : String(error) });
      toast.error('Sync failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Offer Payment Sync</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Use this page to manually test the stripe-sync function with a session ID from Stripe.
            <br />
            Get the session ID from the redirect URL after payment, or from Stripe Dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sessionId" className="text-sm font-medium">
              Stripe Session ID
            </label>
            <Input
              id="sessionId"
              placeholder="cs_test_..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSync();
                }
              }}
            />
          </div>

          <Button 
            onClick={handleSync} 
            disabled={loading || !sessionId.trim()}
            className="w-full"
          >
            {loading ? 'Syncing...' : 'Sync Offer Payment'}
          </Button>

          {result && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.status === 'accepted' && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    ✅ Offer status updated to "Accepted" in database!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                    The offer card should update automatically via realtime subscription. If it doesn't, refresh the messages page.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/customer/messages')}
                    className="w-full border-green-300 dark:border-green-700"
                  >
                    Go to Messages Page
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2">How to use:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Complete a test offer payment (or get session ID from Stripe Dashboard)</li>
              <li>Copy the session_id from the redirect URL (starts with cs_test_)</li>
              <li>Paste it above and click "Sync Offer Payment"</li>
              <li>Check the result and Supabase Edge Functions logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOfferSync;

