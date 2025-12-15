# Supabase Configuration for trainwisestudio.com

## CRITICAL: Fix Magic Link Redirects

The magic links are still redirecting to `localhost:3000` because **Supabase dashboard settings override the code**. You MUST update these settings in your Supabase dashboard.

## Step-by-Step Fix

### 1. Go to Supabase Dashboard
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### 2. Update Authentication Settings
1. Go to **Authentication** → **URL Configuration**
2. Update the following settings:

#### Site URL
```
https://trainwisestudio.com
```

#### Redirect URLs (Add ALL of these)
```
https://trainwisestudio.com/onboarding/step-1
https://trainwisestudio.com/update-password
https://trainwisestudio.com/customer/dashboard
https://trainwisestudio.com/coach/dashboard
```

### 3. Update Email Templates
1. Go to **Authentication** → **Email Templates**
2. Update **Confirm signup** template:

**Subject:**
```
Confirm your signup - TrainWiseStudio
```

**Body:**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

3. Update **Magic Link** template:

**Subject:**
```
Your magic link - TrainWiseStudio
```

**Body:**
```html
<h2>Your magic link</h2>

<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log in</a></p>
```

4. Update **Reset Password** template:

**Subject:**
```
Reset your password - TrainWiseStudio
```

**Body:**
```html
<h2>Reset your password</h2>

<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
```

### 4. Verify Settings
After updating, your Supabase dashboard should show:

- **Site URL**: `https://trainwisestudio.com`
- **Redirect URLs**: Multiple URLs all pointing to `trainwisestudio.com`

### 5. Test the Fix
1. Try the "Get Started" flow again
2. Check the magic link in your email
3. The URL should now be: `https://trainwisestudio.com/onboarding/step-1#access_token=...`

## Why This Happens

Supabase has **two levels** of URL configuration:

1. **Code Level** (what we fixed): `config.appUrl` in our code
2. **Dashboard Level** (what we need to fix): Supabase dashboard settings

The dashboard settings **override** the code settings, which is why you're still getting localhost URLs.

## Alternative: Force URL in Code

If you can't access the Supabase dashboard, we can force the URL in the code:
