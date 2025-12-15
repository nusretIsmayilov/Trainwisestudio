import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UrlDebugger } from './UrlDebugger';
import { UrlTester } from './UrlTester';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export const DiagnosticPanel = () => {
  const { user, profile, loading } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    results.push({
      name: 'Environment Variables',
      status: supabaseUrl && supabaseKey ? 'success' : 'error',
      message: supabaseUrl && supabaseKey ? 'Environment variables configured' : 'Missing Supabase environment variables',
      details: `URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`
    });

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      results.push({
        name: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? `Connection failed: ${error.message}` : 'Connected to Supabase',
        details: error ? error.details : 'Database accessible'
      });
    } catch (err) {
      results.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }

    // Check authentication state
    results.push({
      name: 'Authentication State',
      status: loading ? 'warning' : (user ? 'success' : 'info'),
      message: loading ? 'Loading authentication...' : (user ? 'User authenticated' : 'No user session'),
      details: user ? `User ID: ${user.id}` : 'Not logged in'
    });

    // Check profile data
    results.push({
      name: 'Profile Data',
      status: profile ? 'success' : (loading ? 'warning' : 'error'),
      message: profile ? 'Profile loaded successfully' : (loading ? 'Loading profile...' : 'No profile data'),
      details: profile ? `Role: ${profile.role}, Onboarding: ${profile.onboarding_complete}` : 'Profile not available'
    });

    // Check API connectivity (Supabase Edge Functions)
    try {
      const { config } = await import('@/lib/config');
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${config.api.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'apikey': config.supabase.anonKey,
        },
      });
      results.push({
        name: 'Supabase Edge Functions',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Edge Functions accessible' : `API returned ${response.status}`,
        details: `Status: ${response.status}`
      });
    } catch (err) {
      results.push({
        name: 'Supabase Edge Functions',
        status: 'error',
        message: 'Edge Functions not accessible',
        details: err instanceof Error ? err.message : 'Connection failed'
      });
    }

    // Check localStorage
    const hasAuthData = localStorage.getItem('sb-' + supabaseUrl?.split('//')[1]?.split('.')[0] + '-auth-token');
    results.push({
      name: 'Local Storage',
      status: hasAuthData ? 'success' : 'info',
      message: hasAuthData ? 'Authentication data found in localStorage' : 'No authentication data in localStorage',
      details: hasAuthData ? 'Session data available' : 'No stored session'
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user, profile, loading]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info': return <Badge variant="outline">Info</Badge>;
    }
  };

  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Diagnostics</span>
            <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
              {isRunning ? 'Running...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {diagnostics.filter(d => d.status === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {errorCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorCount} critical issue{errorCount > 1 ? 's' : ''} found. 
                {errorCount === 1 && diagnostics.find(d => d.status === 'error')?.name === 'Environment Variables' && 
                  ' Please configure your Supabase environment variables.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Diagnostic Results */}
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(diagnostic.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{diagnostic.name}</span>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {diagnostic.message}
                  </p>
                  {diagnostic.details && (
                    <p className="text-xs text-muted-foreground">
                      {diagnostic.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Setup Instructions */}
          {errorCount > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>To fix the routing issues, you need to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the project root</li>
                  <li>Add your Supabase credentials:</li>
                  <pre className="bg-blue-100 p-2 rounded text-xs mt-2">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000`}
                  </pre>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* URL Debugger - Only in development */}
      {import.meta.env.DEV && (
        <div className="mt-6 space-y-6">
          <UrlDebugger />
          <UrlTester />
        </div>
      )}
    </div>
  );
};
