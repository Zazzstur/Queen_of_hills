# Cloudflare Deployment Troubleshooting Guide

If your project is failing to deploy to Cloudflare Pages, follow these steps to diagnose and fix the issue.

## 1. Run Diagnostic Script
We have added a diagnostic script to check for common configuration errors.
Run this locally:

```bash
npm run diagnose
```

This will check:
- Node.js version
- `wrangler.toml` configuration
- Environment variables presence
- Build output directory

## 2. Fix Common Issues

### Build Failures
If the build fails on Cloudflare:
1.  **Check Environment Variables**:
    - Go to **Cloudflare Dashboard** > **Pages** > **Your Project** > **Settings** > **Environment variables**.
    - Ensure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_CONVEX_URL` are set for **Production** and **Preview** environments.
    - *Note*: `wrangler.toml` vars are for Functions (server-side). Client-side vars (starting with `VITE_`) must be set in the dashboard for the build process.

2.  **Check Build Command**:
    - Ensure the Build Command in dashboard is `npm run build`.
    - Ensure Output Directory is `dist`.

3.  **Check Logs**:
    - Open the deployment details in Cloudflare Dashboard.
    - Look for "Build" tab logs.
    - If you see "Command not found", check `package.json` scripts.
    - If you see syntax errors, fix them locally first.

### Runtime Errors (Functions)
If the deployment succeeds but the site errors out:
1.  Check the status endpoint: `https://your-project.pages.dev/api/status`
2.  If it returns 500 or 404, check `functions/_middleware.js` and `wrangler.toml` vars.

## 3. Verify Local Build
Always ensure the project builds locally before pushing:

```bash
npm run build
```

If this fails, the deployment will definitely fail.

## 4. Syntax Errors
We fixed a critical syntax error in `src/components/admin/StopsManagement.jsx`. 
Ensure you commit and push this fix.

```bash
git add .
git commit -m "Fix syntax errors and add diagnostic tools"
git push
```

## 5. Workaround: Hardcoded Credentials (Current Solution)
Since you experienced issues adding Environment Variables in the Cloudflare Dashboard (due to the "static assets" restriction), we have implemented a workaround:

-   **Modified `functions/_middleware.js`**: We injected the `SUPABASE_URL` and `SUPABASE_ANON_KEY` directly into the request context if they are missing.
-   **Why**: This ensures that even if Cloudflare Pages doesn't pass the variables to the Functions runtime, the application will still work using the hardcoded fallbacks.
-   **Security Note**: These keys are "Anonymous" and safe to be exposed in client-side code, so hardcoding them in the server-side functions is an acceptable workaround for this project.

If you later manage to enable Environment Variables in the dashboard, the code will prioritize those over the hardcoded values.
