# Script to create _shared.ts files in each function directory

$sharedFiles = @{
    'cors.ts' = @'
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}
'@
    'supabase.ts' = @'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
'@
    'stripe.ts' = @'
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

export function createStripeClient(): Stripe {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });
}

export const PRICE_IDS = {
  usd: Deno.env.get('STRIPE_PRICE_USD') || '***REMOVED***',
  nok: Deno.env.get('STRIPE_PRICE_NOK') || '***REMOVED***',
  sek: Deno.env.get('STRIPE_PRICE_SEK') || '***REMOVED***',
  dkk: Deno.env.get('STRIPE_PRICE_DKK') || '***REMOVED***',
};

export function getAppUrl(): string {
  return Deno.env.get('PUBLIC_APP_URL') || 'https://trainwisestudio.com';
}
'@
}

# Functions that need different combinations of shared files
$functionNeeds = @{
    'stripe-webhook' = @('cors.ts', 'supabase.ts', 'stripe.ts')
    'stripe-checkout' = @('cors.ts', 'stripe.ts')
    'stripe-offer-checkout' = @('cors.ts', 'supabase.ts', 'stripe.ts')
    'stripe-customer-portal' = @('cors.ts', 'stripe.ts')
    'stripe-subscription' = @('cors.ts', 'supabase.ts', 'stripe.ts')
    'stripe-sync' = @('cors.ts', 'supabase.ts', 'stripe.ts')
    'ai-generate-plan' = @('cors.ts', 'supabase.ts')
    'ai-generate-plans' = @('cors.ts', 'supabase.ts')
    'ai-trend-recommendations' = @('cors.ts')
    'contracts' = @('cors.ts', 'supabase.ts')
    'contract-extension' = @('cors.ts', 'supabase.ts')
    'program-complete' = @('cors.ts', 'supabase.ts')
    'program-completion-status' = @('cors.ts', 'supabase.ts')
    'coach-payouts' = @('cors.ts', 'supabase.ts')
    'automated-messages' = @('cors.ts', 'supabase.ts')
    'geolocation' = @('cors.ts')
    'health' = @('cors.ts')
}

foreach ($func in $functionNeeds.Keys) {
    $funcDir = "supabase\functions\$func"
    if (Test-Path $funcDir) {
        $sharedContent = ""
        foreach ($file in $functionNeeds[$func]) {
            $sharedContent += $sharedFiles[$file] + "`n`n"
        }
        $sharedContent | Out-File -FilePath "$funcDir\_shared.ts" -Encoding utf8
        Write-Host "Created _shared.ts for $func"
    }
}

