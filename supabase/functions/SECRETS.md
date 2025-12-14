# Supabase Edge Functions - Required Secrets

Add these secrets in your Supabase Dashboard: **Settings > Edge Functions > Secrets**

## Required Secrets

### Supabase Configuration
```
SUPABASE_URL
```
- **Description**: Your Supabase project URL
- **Example**: `https://bhmdxxsdeekxmejnjwin.supabase.co`
- **Where to find**: Supabase Dashboard > Settings > API > Project URL
- **Required by**: All functions that interact with Supabase database

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Description**: Supabase service role key (bypasses RLS)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard > Settings > API > service_role key (⚠️ Keep secret!)
- **Required by**: All functions that need database access

### Stripe Configuration
```
STRIPE_SECRET_KEY
```
- **Description**: Your Stripe secret key (use `sk_live_...` for production, `sk_test_...` for testing)
- **Example**: `sk_live_51AbCdEf...`
- **Where to find**: Stripe Dashboard > Developers > API keys
- **Required by**: All Stripe-related functions

```
STRIPE_WEBHOOK_SECRET
```
- **Description**: Stripe webhook signing secret
- **Example**: `whsec_1234567890abcdef...`
- **Where to find**: 
  1. Stripe Dashboard > Developers > Webhooks
  2. Create endpoint: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
  3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
  4. Copy the "Signing secret"
- **Required by**: `stripe-webhook` function only

```
STRIPE_PRICE_USD
```
- **Description**: Stripe Price ID for USD subscription
- **Example**: `***REMOVED***`
- **Where to find**: Stripe Dashboard > Products > Your Product > Pricing
- **Required by**: Stripe checkout functions
- **Note**: Has fallback default, but should be set for production

```
STRIPE_PRICE_NOK
```
- **Description**: Stripe Price ID for Norwegian Krone subscription
- **Example**: `***REMOVED***`
- **Where to find**: Stripe Dashboard > Products > Your Product > Pricing
- **Required by**: Stripe checkout functions
- **Note**: Has fallback default, but should be set for production

```
STRIPE_PRICE_SEK
```
- **Description**: Stripe Price ID for Swedish Krona subscription
- **Example**: `***REMOVED***`
- **Where to find**: Stripe Dashboard > Products > Your Product > Pricing
- **Required by**: Stripe checkout functions
- **Note**: Has fallback default, but should be set for production

```
STRIPE_PRICE_DKK
```
- **Description**: Stripe Price ID for Danish Krone subscription
- **Example**: `***REMOVED***`
- **Where to find**: Stripe Dashboard > Products > Your Product > Pricing
- **Required by**: Stripe checkout functions
- **Note**: Has fallback default, but should be set for production

```
STRIPE_PRICE_EUR
```
- **Description**: Stripe Price ID for Euro subscription
- **Example**: `price_...`
- **Where to find**: Stripe Dashboard > Products > Your Product > Pricing
- **Required by**: Stripe checkout functions
- **Note**: Must be configured (no default fallback)

### Application Configuration
```
PUBLIC_APP_URL
```
- **Description**: Your application's public URL (for redirects)
- **Example**: `https://trainwisestudio.com` or `https://www.trainwisestudio.com`
- **Default**: `https://trainwisestudio.com` (if not set)
- **Required by**: Stripe checkout functions (for success/cancel URLs)

## Optional Secrets (for AI Features)

```
OPENAI_KEY
```
- **Description**: OpenAI API key for AI plan generation
- **Example**: `sk-proj-...`
- **Where to find**: https://platform.openai.com/api-keys
- **Required by**: `ai-generate-plan`, `ai-generate-plans`, `ai-trend-recommendations`
- **Note**: Functions will use fallback plans if not provided

```
GEMINI_API_KEY
```
- **Description**: Google Gemini API key for AI plan generation (alternative to OpenAI)
- **Example**: `AIza...`
- **Where to find**: https://makersuite.google.com/app/apikey
- **Required by**: `ai-generate-plan`, `ai-generate-plans`, `ai-trend-recommendations`
- **Note**: Functions will use fallback plans if not provided. If both OPENAI_KEY and GEMINI_API_KEY are set, Gemini is preferred.

## Quick Setup Checklist

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (live or test)
- [ ] `STRIPE_WEBHOOK_SECRET` - Create webhook in Stripe first, then copy secret
- [ ] `STRIPE_PRICE_USD` - USD price ID from Stripe
- [ ] `STRIPE_PRICE_EUR` - EUR price ID from Stripe (if offering)
- [ ] `STRIPE_PRICE_NOK` - NOK price ID from Stripe (if offering)
- [ ] `STRIPE_PRICE_SEK` - SEK price ID from Stripe (if offering)
- [ ] `STRIPE_PRICE_DKK` - DKK price ID from Stripe (if offering)
- [ ] `PUBLIC_APP_URL` - Your production domain
- [ ] `OPENAI_KEY` - (Optional) For AI features
- [ ] `GEMINI_API_KEY` - (Optional) For AI features

## How to Add Secrets

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **Edge Functions** > **Secrets**
3. Click **Add new secret**
4. Enter the secret name (e.g., `STRIPE_SECRET_KEY`)
5. Enter the secret value
6. Click **Save**
7. Repeat for all required secrets

## Testing Secrets

After adding secrets, test your functions:

```bash
# Test health endpoint
curl https://<your-project-ref>.supabase.co/functions/v1/health \
  -H "Authorization: Bearer <anon-key>"

# Test with Supabase CLI
supabase functions serve
```

## Security Notes

⚠️ **Never commit secrets to git!**
- Secrets are stored securely in Supabase
- Only accessible to Edge Functions at runtime
- Use different keys for development and production
- Rotate keys regularly

