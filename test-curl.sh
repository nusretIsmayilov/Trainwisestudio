#!/bin/bash

# Test script for stripe-sync function
# Usage: ./test-curl.sh <SESSION_ID> [ANON_KEY]

SESSION_ID=$1
ANON_KEY=$2

# Default Supabase URL (update if different)
SUPABASE_URL="https://bhmdxxsdeekxmejnjwin.supabase.co"

# Default anon key (you can get this from Supabase Dashboard > Settings > API)
# Or pass it as second argument
if [ -z "$ANON_KEY" ]; then
  echo "⚠️  Please provide your Supabase anon key:"
  echo "   Get it from: Supabase Dashboard > Settings > API > Project API keys > anon/public"
  echo ""
  echo "Usage: ./test-curl.sh <SESSION_ID> <ANON_KEY>"
  echo "   OR: ANON_KEY=your-key ./test-curl.sh <SESSION_ID>"
  exit 1
fi

if [ -z "$SESSION_ID" ]; then
  echo "⚠️  Please provide a Stripe test session ID"
  echo ""
  echo "To get a session ID:"
  echo "  1. Complete a test offer payment"
  echo "  2. Copy session_id from redirect URL (starts with cs_test_)"
  echo "  3. OR go to Stripe Dashboard > Events > checkout.session.completed"
  echo ""
  echo "Usage: ./test-curl.sh <SESSION_ID> <ANON_KEY>"
  exit 1
fi

echo "🧪 Testing stripe-sync function..."
echo "Session ID: $SESSION_ID"
echo "Supabase URL: $SUPABASE_URL"
echo ""

curl -X GET \
  "${SUPABASE_URL}/functions/v1/stripe-sync?session_id=${SESSION_ID}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo ""
echo "✅ Test complete! Check the response above."

