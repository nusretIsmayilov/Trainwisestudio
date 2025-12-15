# Deployment Guide

This guide will help you deploy the Harmony Stride application to production.

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- Domain name for your application
- Hosting platform (Vercel, Netlify, Railway, etc.)

## Environment Variables

### Frontend (.env)

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App Configuration (CRITICAL for magic links)
# Note: trainwisestudio.com is hardcoded in production, but you can override with:
VITE_APP_URL=https://trainwisestudio.com
```

**Note:** The frontend automatically uses Supabase Edge Functions. No separate API configuration needed.

### Supabase Edge Functions Secrets

Set these in your Supabase project dashboard (Settings > Edge Functions > Secrets):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs for different currencies
STRIPE_PRICE_USD=***REMOVED***
STRIPE_PRICE_NOK=***REMOVED***
STRIPE_PRICE_SEK=***REMOVED***
STRIPE_PRICE_DKK=***REMOVED***

# Supabase Configuration (for service role access)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# App Configuration
PUBLIC_APP_URL=https://trainwisestudio.com

# AI Configuration (Optional)
OPENAI_KEY=sk-...
GEMINI_API_KEY=...
```

## Supabase Configuration

### 1. Update Site URL

In your Supabase dashboard:
1. Go to Authentication > URL Configuration
2. Set **Site URL** to: `https://trainwisestudio.com`
3. Add **Redirect URLs**:
   - `https://trainwisestudio.com/onboarding/step-1`
   - `https://trainwisestudio.com/update-password`

### 2. Email Templates

Update email templates in Supabase:
1. Go to Authentication > Email Templates
2. Update **Confirm signup** template to use your domain
3. Update **Reset password** template to use your domain

## Deployment Steps

### Frontend Deployment (Vercel/Netlify)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your platform:**
   - **Vercel**: Connect your GitHub repo and set environment variables
   - **Netlify**: Deploy from build folder and set environment variables

3. **Set environment variables** in your hosting platform's dashboard

### Supabase Edge Functions Deployment

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login and link your project:**
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

3. **Deploy all functions:**
   ```bash
   supabase functions deploy
   ```

   Or deploy individually:
   ```bash
   supabase functions deploy stripe-webhook
   supabase functions deploy stripe-checkout
   # ... etc
   ```

4. **Configure Stripe Webhook:**
   - In Stripe Dashboard, go to Developers > Webhooks
   - Add endpoint: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy webhook secret and set as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

See `supabase/functions/README.md` for detailed deployment instructions.

### Legacy Backend Deployment (No longer needed)

The separate backend has been replaced with Supabase Edge Functions. If you need to deploy the old backend:
   ```bash
   cd backend
   npm install
   ```

2. **Deploy to your platform:**
   - **Railway**: Connect GitHub repo, set environment variables
   - **Render**: Create web service, set environment variables
   - **Heroku**: Create app, set config vars

3. **Set environment variables** in your platform's dashboard

### Database Migration

1. **Run migrations:**
   ```bash
   npx supabase db push
   ```

2. **Verify tables are created** in Supabase dashboard

## Stripe Configuration

### 1. Webhook Setup

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-api-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Price Configuration

Update price IDs in your backend environment variables with your actual Stripe price IDs.

## Testing

### 1. Test Authentication Flow

1. Visit your production URL
2. Test "Get Started" flow with a new email
3. Check email for magic link
4. Verify redirect works correctly
5. Test password reset flow

### 2. Test Payment Flow

1. Test subscription creation
2. Verify webhook handling
3. Test payment success/cancel redirects

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure CORS properly for your domains
3. **Rate Limiting**: Consider adding rate limiting to API endpoints
4. **HTTPS**: Ensure all communication uses HTTPS
5. **Supabase RLS**: Review Row Level Security policies

## Monitoring

1. **Error Tracking**: Set up error monitoring (Sentry, etc.)
2. **Analytics**: Add analytics tracking
3. **Logs**: Monitor application logs
4. **Performance**: Set up performance monitoring

## Troubleshooting

### Common Issues

1. **Magic links still pointing to localhost**: 
   - Set `VITE_APP_URL` environment variable to your production domain
   - Check browser console for URL debug information
   - Verify Supabase redirect URLs match your domain

2. **Magic links not working**: 
   - Check Supabase redirect URLs in dashboard
   - Ensure `VITE_APP_URL` is set correctly
   - Verify email templates use correct domain

3. **CORS errors**: Verify CORS configuration

4. **Environment variables**: Ensure all required variables are set

5. **Database errors**: Check Supabase connection and RLS policies

### Debug Magic Link URLs

Open browser console and look for:
- `🔍 URL Debug Information` - Shows current URL configuration
- `⚠️ Using localhost URL for magic links` - Warning about localhost usage
- `❌ Production build is using localhost!` - Critical error in production

### Debug Mode

For debugging, you can temporarily enable debug mode by setting:
```env
VITE_DEBUG=true
```

## Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Backup**: Regular database backups
3. **Monitoring**: Monitor application health
4. **Security**: Regular security audits

## Support

If you encounter issues:
1. Check the logs in your hosting platform
2. Verify environment variables are set correctly
3. Test locally with production environment variables
4. Check Supabase and Stripe dashboards for errors
