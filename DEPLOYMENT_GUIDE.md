# Deployment Guide: Connecting Cloudflare Pages to Supabase + Convex

Your website is built with Vite and uses Supabase + Convex. When deploying to Cloudflare Pages (or Vercel/Netlify), the environment variables stored in your local `.env` file are **not** automatically uploaded. You must manually configure them in your hosting provider's dashboard.

## 1. Get Your Supabase Credentials

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`Queen_of_hills`).
3.  Go to **Project Settings** (cog icon) -> **API**.
4.  Copy the following values:
    *   **Project URL** (`https://xyz.supabase.co`)
    *   **anon public** key (`eyJhbG...`)

## 2. Configure Cloudflare Pages

1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **Workers & Pages** -> Select your project (`Queen_of_hills`).
3.  Go to **Settings** -> **Environment variables**.
4.  Click **Add variable** (or "Edit variables" if some exist).
5.  Add the following variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Paste your Project URL here. |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Paste your anon public key here. |
| `VITE_CONVEX_URL` | `https://bold-caiman-308.convex.cloud` | Your Convex deployment URL. |
| `VITE_USE_LOCAL_DB` | `false` | **CRITICAL**: Set to `false` to force the app to use Supabase instead of mock data. |

6.  Click **Save**.

## 3. Trigger a Re-deployment

Environment variables only take effect during the *build process*. Changing them does not update the live site immediately.

1.  Go to the **Deployments** tab in Cloudflare.
2.  Click the three dots `...` next to your latest deployment -> **Retry deployment**.
    *   *Alternatively, push a small commit to your GitHub repository (e.g., updating a README) to trigger a new build automatically.*

## Troubleshooting

*   **"No items found in this category"**: This usually means the app is still using the local mock DB (which is empty in production) because `VITE_USE_LOCAL_DB` is not set to `false`, or the Supabase connection failed.
*   **Console Errors**: Open your browser's Developer Tools (F12) -> Console. If you see 401 or 403 errors from Supabase, check that your `VITE_SUPABASE_ANON_KEY` is correct.
