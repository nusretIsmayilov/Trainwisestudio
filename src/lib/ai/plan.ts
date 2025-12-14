import { config } from '@/lib/config';
import { supabase } from '@/integrations/supabase/client';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': config.supabase.anonKey,
  };
}

async function postToFunction<T>(functionName: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${config.api.baseUrl}/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = text || `Request failed: ${response.status}`;
    
    // Try to parse JSON error response
    try {
      const errorJson = JSON.parse(text);
      if (errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // If not JSON, use the text as-is
    }
    
    throw new Error(errorMessage);
  }
  
  return await response.json() as T;
}

export async function generateAIPersonalPlan(params: { userId: string }): Promise<{ plan: any }> {
  return await postToFunction('ai-generate-plan', params);
}

export async function generateAIMultiPlans(params: { userId: string }): Promise<{ items: Array<{ category: string; programId: string; status: 'ready' | 'processing' }> }> {
  return await postToFunction('ai-generate-plans', params);
}

export async function generateWeeklyAIFeedback(params: { userId: string; weekOf: string }): Promise<{ status: string }> {
  // This endpoint doesn't exist in the backend, keeping for compatibility
  return Promise.resolve({ status: 'not implemented' });
}


