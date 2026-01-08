# Deployment Guide: Cloudflare Pages

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
