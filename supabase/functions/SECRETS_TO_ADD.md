# Secrets to Add to Supabase Edge Functions

Copy and paste these into Supabase Dashboard > Settings > Edge Functions > Secrets

## Step-by-Step Instructions

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **Edge Functions** > **Secrets**
3. For each secret below, click **"Add new secret"** and enter:

---

## Secret 1: SUPABASE_URL
**Name:** `SUPABASE_URL`  
**Value:** `https://bhmdxxsdeekxmejnjwin.supabase.co`

---

## Secret 2: SUPABASE_SERVICE_ROLE_KEY
**Name:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** *(Get from Supabase Dashboard > Settings > API > service_role key)*

---

## Secret 3: STRIPE_SECRET_KEY
**Name:** `STRIPE_SECRET_KEY`  
**Value:** `<your-stripe-secret-key>`

---

## Secret 4: STRIPE_WEBHOOK_SECRET
**Name:** `STRIPE_WEBHOOK_SECRET`  
**Value:** `<your-stripe-webhook-secret>`

---

## Secret 5: STRIPE_PRICE_USD
**Name:** `STRIPE_PRICE_USD`  
**Value:** `<your-stripe-price-usd-id>`

---

## Secret 6: STRIPE_PRICE_EUR
**Name:** `STRIPE_PRICE_EUR`  
**Value:** `<your-stripe-price-eur-id>`

---

## Secret 7: STRIPE_PRICE_NOK
**Name:** `STRIPE_PRICE_NOK`  
**Value:** `<your-stripe-price-nok-id>`

---

## Secret 8: STRIPE_PRICE_SEK
**Name:** `STRIPE_PRICE_SEK`  
**Value:** `<your-stripe-price-sek-id>`

---

## Secret 9: STRIPE_PRICE_DKK
**Name:** `STRIPE_PRICE_DKK`  
**Value:** `<your-stripe-price-dkk-id>`

---

## Secret 10: PUBLIC_APP_URL
**Name:** `PUBLIC_APP_URL`  
**Value:** `https://trainwisestudio.com`

---

## Optional: OPENAI_KEY (for AI features)
**Name:** `OPENAI_KEY`  
**Value:** *(Your OpenAI API key if you want AI plan generation)*

---

## Optional: GEMINI_API_KEY (for AI features)
**Name:** `GEMINI_API_KEY`  
**Value:** *(Your Gemini API key if you want AI plan generation)*

---

## Quick Copy-Paste Format

If Supabase allows bulk import, use this format:

```
SUPABASE_URL=https://bhmdxxsdeekxmejnjwin.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PRICE_USD=<your-stripe-price-usd-id>
STRIPE_PRICE_EUR=<your-stripe-price-eur-id>
STRIPE_PRICE_NOK=<your-stripe-price-nok-id>
STRIPE_PRICE_SEK=<your-stripe-price-sek-id>
STRIPE_PRICE_DKK=<your-stripe-price-dkk-id>
PUBLIC_APP_URL=https://trainwisestudio.com
```

**Note:** You still need to get `SUPABASE_SERVICE_ROLE_KEY` from your Supabase Dashboard.

