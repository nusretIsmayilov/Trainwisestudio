// src/components/system/UrlDebugger.tsx
// Component to help debug URL configuration issues

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { debugUrls } from '@/lib/debug';

export const UrlDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const runDebug = () => {
    const info = debugUrls();
    setDebugInfo(info);
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 URL Configuration Debugger
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDebug} className="w-full">
          Run URL Debug
        </Button>
        
        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current URL Info:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div><strong>Origin:</strong> {debugInfo.currentOrigin}</div>
                <div><strong>Host:</strong> {debugInfo.currentHost}</div>
                <div><strong>Protocol:</strong> {debugInfo.currentProtocol}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Environment Variables:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                <div><strong>VITE_APP_URL:</strong> {debugInfo.envVars.VITE_APP_URL || 'Not set'}</div>
                <div><strong>VITE_API_BASE_URL:</strong> {debugInfo.envVars.VITE_API_BASE_URL || 'Not set'}</div>
                <div><strong>Mode:</strong> {debugInfo.environment.mode}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Magic Link URL:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div><strong>Will use:</strong> {debugInfo.config.appUrl}</div>
                <div><strong>Hardcoded domain:</strong> {debugInfo.config.hardcodedDomain}</div>
                {debugInfo.config.appUrl.includes('localhost') && (
                  <div className="text-orange-600 font-semibold mt-2">
                    ⚠️ Warning: Using localhost URL for magic links!
                  </div>
                )}
                {debugInfo.config.appUrl.includes('trainwisestudio.com') && (
                  <div className="text-green-600 font-semibold mt-2">
                    ✅ Using production domain: trainwisestudio.com
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
