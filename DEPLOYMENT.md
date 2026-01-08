# Deployment Guide: Cloudflare Pages

## Automatic Configuration (wrangler.json)

A `wrangler.json` file has been added to the repository. This file allows `npx wrangler deploy` to work out-of-the-box by specifying the build output directory (`./dist`) as static assets.

This resolves errors where the deployment command fails with "Missing entry-point".

## Recommended Configuration (Git Integration)

When connecting this repository to Cloudflare Pages via the dashboard, use the following settings:

*   **Framework Preset:** `Vite`
*   **Build Command:** `npm run build`
*   **Build Output Directory:** `dist`

### Why these settings?
*   This project is built with **Vite**.
*   The `package.json` defines `"build": "vite build"`, which is executed by `npm run build`.
*   Vite compiles the production-ready application into the `dist` folder by default.

---

## Troubleshooting Deployment Errors

If you encounter an error like `[ERROR] Missing entry-point to Worker script`, it means the deployment tool (Wrangler) thinks you are trying to deploy a Cloudflare Worker instead of a static site.

### Cause
This usually happens if you run `npx wrangler deploy` without arguments, or if the "Build Command" in Cloudflare is set to run `wrangler deploy` manually.

### Fix

**Option 1: Dashboard (Easiest)**
Ensure your "Build Command" is strictly `npm run build`. Do **not** add `wrangler deploy` to this command. Cloudflare Pages automatically handles the upload of the `dist` folder after the build command finishes.

**Option 2: CLI (Manual)**
If you are deploying manually from your terminal, use the specific Pages command pointing to your output folder:

```bash
# First, build the project
npm run build

# Then, deploy the 'dist' folder
npx wrangler pages deploy dist
```

## Why is my "Website Link" missing?

If you see "Workers Builds" in your dashboard but no website link (URL), you likely created a **Worker** instead of a **Pages** project.

### Solution

**Option 1: Use the new Deploy Script (Recommended)**
We have added a direct deployment script to `package.json`. Run this command in your terminal or CI/CD:

```bash
npm run deploy
```

This command (`npm run build && npx wrangler pages deploy dist`) forces Cloudflare to deploy your site as a **Pages** project, which will automatically generate a `*.pages.dev` URL.

**Option 2: Cloudflare Dashboard**
1.  Go to the Cloudflare Dashboard.
2.  Navigate to **Workers & Pages**.
3.  Click **Create Application** -> **Pages** (Not Workers!).
4.  Connect your Git repository.
5.  Use the settings below:
    *   **Build Command:** `npm run build`
    *   **Build Output:** `dist`

**Option 3: Wrangler Configuration (Applied)**
We have added a `wrangler.json` file to the repository. This explicitly tells `wrangler` to treat the `dist` folder as the site assets. Now, running `npx wrangler deploy` (after building) should succeed.
