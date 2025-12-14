# SPA Routing Configuration for Different Hosting Providers

## Vercel
- Added `vercel.json` with rewrite rule to serve index.html for all routes
- This handles SPA routing automatically

## Netlify  
- Added `public/_redirects` file with catch-all rule
- Netlify will automatically use this for routing

## Apache
- Added `public/.htaccess` with mod_rewrite rules
- Ensures all non-file requests serve index.html

## Cloudflare Pages
- Manual configuration needed in dashboard:
  - Go to Pages → Settings → Functions → Redirects
  - Add redirect: Source: `/*`, Destination: `/index.html`, Status: 200

## Nginx
- Add this to your server block:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Deployment Steps
1. Commit these files to your repository
2. Redeploy your application
3. Test that `/update-password` loads your React app instead of 404
4. Verify Supabase recovery links work correctly

## Notes
- These files ensure all routes (like `/update-password`, `/customer/dashboard`, etc.) serve your React app
- The React Router will then handle client-side routing
- This fixes the 404 error you're seeing with Supabase recovery links
