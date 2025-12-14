/**
 * Create a test Stripe checkout session for offer payment
 * Then test the sync function
 * 
 * This script:
 * 1. Creates a test offer in the database (or uses existing)
 * 2. Creates a Stripe test checkout session
 * 3. Tests the stripe-sync function with that session
 * 
 * Prerequisites:
 * - Stripe CLI installed: https://stripe.com/docs/stripe-cli
 * - Stripe test API key in environment
 * 
 * Usage:
 * STRIPE_SECRET_KEY=sk_test_... node test-create-offer-session.mjs <OFFER_ID>
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bhmdxxsdeekxmejnjwin.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key';

const offerId = process.argv[2];

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Please set STRIPE_SECRET_KEY environment variable');
  console.log('\nUsage:');
  console.log('  STRIPE_SECRET_KEY=sk_test_... node test-create-offer-session.mjs <OFFER_ID>');
  process.exit(1);
}

if (!offerId) {
  console.error('❌ Please provide an offer ID');
  console.log('\nUsage:');
  console.log('  STRIPE_SECRET_KEY=sk_test_... node test-create-offer-session.mjs <OFFER_ID>');
  console.log('\nTo get an offer ID:');
  console.log('  1. Go to Supabase Dashboard > Table Editor > coach_offers');
  console.log('  2. Copy an offer ID (UUID)');
  process.exit(1);
}

async function createTestSessionAndSync() {
  console.log('🧪 Creating test Stripe checkout session for offer payment...\n');
  console.log('Offer ID:', offerId);
  console.log('');

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  try {
    // First, get the offer details from Supabase
    console.log('📡 Fetching offer details from Supabase...');
    const offerResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/coach_offers?id=eq.${offerId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!offerResponse.ok) {
      const errorText = await offerResponse.text();
      console.error('❌ Failed to fetch offer:', errorText);
      return;
    }

    const offers = await offerResponse.json();
    if (!offers || offers.length === 0) {
      console.error('❌ Offer not found:', offerId);
      return;
    }

    const offer = offers[0];
    console.log('✅ Offer found:', {
      id: offer.id,
      price: offer.price,
      duration_months: offer.duration_months,
      status: offer.status,
    });
    console.log('');

    // Create a test checkout session
    console.log('📡 Creating Stripe test checkout session...');
    const amountCents = Math.round(Number(offer.price) * 100);
    const weeks = offer.duration_months || 1;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Coach Offer (Test)',
              description: `${weeks}-week coaching package`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      client_reference_id: `offer:${offer.id}`,
      success_url: `${SUPABASE_URL}/customer/messages?offer_status=paid&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SUPABASE_URL}/customer/messages?offer_status=cancel`,
    });

    console.log('✅ Test checkout session created!');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    console.log('');

    // Now test the sync function
    console.log('📡 Testing stripe-sync function...');
    const syncUrl = `${SUPABASE_URL}/functions/v1/stripe-sync?session_id=${session.id}`;
    console.log('Sync URL:', syncUrl);
    console.log('');

    const syncResponse = await fetch(syncUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    const syncResponseText = await syncResponse.text();
    console.log('📥 Sync Response Status:', syncResponse.status);
    console.log('📥 Sync Response Body:', syncResponseText);
    console.log('');

    if (syncResponse.ok) {
      const syncData = JSON.parse(syncResponseText);
      console.log('✅ Sync successful!');
      console.log('Response:', JSON.stringify(syncData, null, 2));
      
      if (syncData.status === 'accepted') {
        console.log('\n🎉 Offer status updated to accepted!');
      }
    } else {
      console.error('❌ Sync failed:', syncResponseText);
    }

    console.log('\n📝 Next steps:');
    console.log('1. Complete the payment at:', session.url);
    console.log('2. Or use Stripe test card: 4242 4242 4242 4242');
    console.log('3. After payment, the sync function should update the offer status');
    console.log('4. Check Supabase Edge Functions logs for stripe-sync');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Details:', error.message);
  }
}

createTestSessionAndSync();

