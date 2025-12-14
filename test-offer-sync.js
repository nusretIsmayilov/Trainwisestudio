/**
 * Test script for stripe-sync function with offer payment
 * 
 * Usage:
 * 1. Get a test checkout session ID from Stripe (or create one)
 * 2. Update the SESSION_ID below
 * 3. Run: node test-offer-sync.js
 * 
 * To get a test session ID:
 * - Go to Stripe Dashboard > Developers > Events
 * - Find a checkout.session.completed event for a payment mode session
 * - Copy the session ID (starts with cs_test_)
 * - Or create a new test checkout session via Stripe API
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bhmdxxsdeekxmejnjwin.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-anon-key';

// Replace this with a test checkout session ID from Stripe
// The session should have:
// - mode: 'payment'
// - client_reference_id: 'offer:YOUR_OFFER_ID'
const TEST_SESSION_ID = 'cs_test_...'; // Replace with actual test session ID

async function testOfferSync() {
  console.log('🧪 Testing stripe-sync function for offer payment...\n');
  
  if (TEST_SESSION_ID === 'cs_test_...') {
    console.error('❌ Please update TEST_SESSION_ID with a real Stripe test session ID');
    console.log('\nTo get a test session ID:');
    console.log('1. Complete a test offer payment in Stripe test mode');
    console.log('2. Go to Stripe Dashboard > Developers > Events');
    console.log('3. Find checkout.session.completed event');
    console.log('4. Copy the session ID (starts with cs_test_)');
    console.log('5. Update TEST_SESSION_ID in this script\n');
    return;
  }

  const functionUrl = `${SUPABASE_URL}/functions/v1/stripe-sync?session_id=${TEST_SESSION_ID}`;
  
  console.log('📡 Calling stripe-sync function...');
  console.log('URL:', functionUrl);
  console.log('Session ID:', TEST_SESSION_ID);
  console.log('');

  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        // Note: In production, you'd need to include the Authorization header with user token
        // For testing, the function might need service role key or proper auth
      },
    });

    const responseText = await response.text();
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 Response Body:', responseText);
    console.log('');

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Success!');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.status === 'accepted' || data.ok) {
        console.log('\n🎉 Offer payment sync successful!');
        console.log('Offer ID:', data.offerId);
        console.log('Status:', data.status);
        console.log('Status Changed:', data.statusChanged);
      }
    } else {
      console.error('❌ Error response:', responseText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testOfferSync();

