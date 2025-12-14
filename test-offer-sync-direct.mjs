/**
 * Direct test of stripe-sync function using Supabase CLI
 * 
 * This script directly invokes the edge function locally or remotely
 * 
 * Prerequisites:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref YOUR_PROJECT_REF
 * 
 * Usage:
 * node test-offer-sync-direct.mjs <SESSION_ID> [--local]
 * 
 * Example:
 * node test-offer-sync-direct.mjs cs_test_a1YyoZyyObVex6hlWdnOvvBfoyccNdfDdBRsA6KX7DnRCf23yAsumvyW8x
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bhmdxxsdeekxmejnjwin.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key';

const sessionId = process.argv[2];
const useLocal = process.argv.includes('--local');

if (!sessionId) {
  console.error('❌ Please provide a Stripe session ID');
  console.log('\nUsage: node test-offer-sync-direct.mjs <SESSION_ID> [--local]');
  console.log('\nExample:');
  console.log('  node test-offer-sync-direct.mjs cs_test_a1YyoZyyObVex6hlWdnOvvBfoyccNdfDdBRsA6KX7DnRCf23yAsumvyW8x');
  process.exit(1);
}

async function testOfferSync() {
  console.log('🧪 Testing stripe-sync function for offer payment...\n');
  console.log('Session ID:', sessionId);
  console.log('Mode:', useLocal ? 'Local' : 'Remote');
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Get user session (you might need to be authenticated)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.warn('⚠️  Auth warning:', authError.message);
      console.log('Note: Function might require authentication\n');
    }

    const functionUrl = useLocal 
      ? `http://localhost:54321/functions/v1/stripe-sync?session_id=${sessionId}`
      : `${SUPABASE_URL}/functions/v1/stripe-sync?session_id=${sessionId}`;

    console.log('📡 Calling:', functionUrl);
    console.log('');

    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('✅ Using authenticated request');
    } else {
      console.log('⚠️  Using unauthenticated request (might fail)');
    }
    console.log('');

    const response = await fetch(functionUrl, {
      method: 'GET',
      headers,
    });

    const responseText = await response.text();
    console.log('📥 Response Status:', response.status, response.statusText);
    console.log('📥 Response Body:', responseText);
    console.log('');

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Success!');
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (data.status === 'accepted' || data.ok) {
          console.log('\n🎉 Offer payment sync successful!');
          if (data.offerId) {
            console.log('Offer ID:', data.offerId);
            console.log('Status:', data.status);
            console.log('Status Changed:', data.statusChanged);
          }
        } else if (data.plan_expiry) {
          console.log('\n✅ Subscription sync successful!');
          console.log('Plan Expiry:', new Date(data.plan_expiry * 1000).toISOString());
        }
      } catch (parseError) {
        console.log('⚠️  Response is not JSON, but status is OK');
      }
    } else {
      console.error('❌ Error response:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        // Not JSON, that's fine
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testOfferSync();

