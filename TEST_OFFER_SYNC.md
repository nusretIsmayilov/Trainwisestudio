# Testing stripe-sync Function for Offer Payments

## Option 1: Using Supabase CLI (Easiest)

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref bhmdxxsdeekxmejnjwin`

### Steps

1. **Get a test Stripe checkout session ID:**
   - Go to your Stripe Dashboard > Developers > Events
   - Find a `checkout.session.completed` event for a payment mode session
   - Copy the session ID (starts with `cs_test_`)
   - OR complete a test offer payment and copy the session ID from the redirect URL

2. **Invoke the function:**
   ```bash
   supabase functions invoke stripe-sync --method GET --query "session_id=YOUR_SESSION_ID"
   ```

3. **Check the logs:**
   ```bash
   supabase functions logs stripe-sync
   ```

## Option 2: Using Node.js Script

### Prerequisites
- Node.js installed
- Stripe test API key

### Steps

1. **Install dependencies:**
   ```bash
   npm install stripe @supabase/supabase-js
   ```

2. **Set environment variables:**
   ```bash
   export STRIPE_SECRET_KEY=sk_test_...
   export VITE_SUPABASE_URL=https://bhmdxxsdeekxmejnjwin.supabase.co
   export VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Run the test script:**
   ```bash
   # Option A: Test with existing session ID
   node test-offer-sync-direct.mjs cs_test_YOUR_SESSION_ID
   
   # Option B: Create new test session and test
   node test-create-offer-session.mjs YOUR_OFFER_ID
   ```

## Option 3: Using cURL

### Steps

1. **Get your Supabase anon key** from your project settings

2. **Get a test session ID** from Stripe Dashboard

3. **Call the function:**
   ```bash
   curl -X GET \
     "https://bhmdxxsdeekxmejnjwin.supabase.co/functions/v1/stripe-sync?session_id=cs_test_YOUR_SESSION_ID" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Content-Type: application/json"
   ```

## What to Look For

### Success Response:
```json
{
  "ok": true,
  "offerId": "837d0a6b-d951-483a-952c-4e3ce8b2af65",
  "status": "accepted",
  "statusChanged": true
}
```

### Expected Logs in Supabase:
- `[API] /api/stripe/sync` - Function called
- `[API] stripe-sync processing offer payment` - Offer detected
- `[API] stripe-sync updating offer status to accepted` - Status update
- `[API] stripe-sync offer payment completed` - Success

### Check Database:
After successful sync, verify in Supabase:
- `coach_offers.status` should be `accepted`
- `profiles.coach_id` should be set
- `profiles.plan` should be updated
- `payouts` table should have a new entry
- `contracts` table should have a new entry

## Troubleshooting

### "Session not found" error
- Make sure the session ID is correct
- Session must be in `payment` mode (not `subscription`)
- Session must have `client_reference_id` starting with `offer:`

### "Offer not found" error
- Check that the offer ID in `client_reference_id` exists in `coach_offers` table
- Offer must not be deleted

### "Unauthorized" error
- Check that your Supabase anon key is correct
- For local testing, you might need to use service role key (not recommended for production)

### Function not updating offer
- Check Supabase Edge Functions logs for errors
- Verify the migration `20251112093000_relax_offer_expiry_validation.sql` has been applied
- Check that RLS policies allow updates to `coach_offers`

