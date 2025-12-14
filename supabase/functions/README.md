# Supabase Edge Functions

This directory contains all Supabase Edge Functions that replace the separate backend server.

## Functions

### Stripe Functions
- **stripe-webhook**: Handles Stripe webhook events (checkout completion, subscription updates)
- **stripe-checkout**: Creates Stripe checkout sessions for platform subscriptions
- **stripe-offer-checkout**: Creates Stripe checkout sessions for coach offers
- **stripe-customer-portal**: Creates Stripe customer portal sessions
- **stripe-subscription**: Manages subscription actions (cancel, resume, etc.)
- **stripe-sync**: Syncs checkout session data after payment

### AI Functions
- **ai-generate-plan**: Generates a single AI-powered health plan
- **ai-generate-plans**: Generates three AI plans (fitness, nutrition, mental health)
- **ai-trend-recommendations**: Generates personalized recommendations based on trends

### Contract Functions
- **contracts**: Manages contract lifecycle (expire, renew, sign)
- **contract-extension**: Handles contract extension requests and checks
- **program-complete**: Completes programs and triggers payouts
- **program-completion-status**: Gets program completion status

### Coach Functions
- **coach-payouts**: Manages coach payout settings, balance, and requests
- **automated-messages**: Sends automated messages and fetches templates

### Utility Functions
- **geolocation**: Fetches user geolocation data
- **health**: Health check endpoint

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref <your-project-ref>`

### Environment Variables

Set these secrets in your Supabase project dashboard (Settings > Edge Functions > Secrets):

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_USD=price_...
STRIPE_PRICE_NOK=price_...
STRIPE_PRICE_SEK=price_...
STRIPE_PRICE_DKK=price_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
PUBLIC_APP_URL=https://trainwisestudio.com
OPENAI_KEY=sk-... (optional)
GEMINI_API_KEY=... (optional)
```

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Individual Function

```bash
supabase functions deploy <function-name>
```

### Example: Deploy Stripe Webhook

```bash
supabase functions deploy stripe-webhook
```

## Stripe Webhook Configuration

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test a function
curl -X POST http://localhost:54321/functions/v1/health \
  -H "Authorization: Bearer <anon-key>"
```

## Frontend Integration

The frontend automatically uses Supabase Edge Functions via the `config.api.baseUrl` which points to:
`https://<project-ref>.supabase.co/functions/v1`

All API calls include authentication headers:
- `Authorization: Bearer <session-token>`
- `apikey: <anon-key>`

