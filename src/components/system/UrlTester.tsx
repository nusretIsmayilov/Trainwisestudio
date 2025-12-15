// src/components/system/UrlTester.tsx
// Component to test and verify magic link URLs

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sendMagicLink, sendPasswordResetLink } from '@/lib/supabase/actions';

export const UrlTester = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testMagicLink = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing magic link URL...');
      const result = await sendMagicLink(testEmail);
      setResults(prev => ({ ...prev, magicLink: result }));
      console.log('Magic link result:', result);
    } catch (error) {
      console.error('Magic link test error:', error);
      setResults(prev => ({ ...prev, magicLink: { error: error.message } }));
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordReset = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing password reset URL...');
      const result = await sendPasswordResetLink(testEmail);
      setResults(prev => ({ ...prev, passwordReset: result }));
      console.log('Password reset result:', result);
    } catch (error) {
      console.error('Password reset test error:', error);
      setResults(prev => ({ ...prev, passwordReset: { error: error.message } }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 URL Tester
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Email:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test@example.com"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testMagicLink} 
            disabled={isLoading}
            variant="outline"
          >
            Test Magic Link
          </Button>
          <Button 
            onClick={testPasswordReset} 
            disabled={isLoading}
            variant="outline"
          >
            Test Password Reset
          </Button>
        </div>
        
        {results && (
          <div className="space-y-4">
            {results.magicLink && (
              <div>
                <h4 className="font-semibold mb-2">Magic Link Result:</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>{JSON.stringify(results.magicLink, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {results.passwordReset && (
              <div>
                <h4 className="font-semibold mb-2">Password Reset Result:</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>{JSON.stringify(results.passwordReset, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This will send actual emails. Check your email for the magic link and verify the URL.</p>
          <p><strong>Expected URLs:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Magic Link: <code>https://trainwisestudio.com/onboarding/step-1</code></li>
            <li>Password Reset: <code>https://trainwisestudio.com/update-password</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
