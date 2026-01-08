Based on the error log you provided, it seems like the deployment is attempting to run `npx wrangler deploy` without specifying that this is a static site.

Here is the corrected configuration to fix the error:

### Option 1: Standard Cloudflare Pages (Recommended)
If you are connecting your GitHub repo to Cloudflare Pages via the dashboard, you do **not** need to run `wrangler deploy` yourself. Cloudflare handles this automatically.

**Correct Settings:**
1.  **Build Command:** `npm run build`
    *   *Change this if you currently have `npm run build && npx wrangler deploy` or similar.*
2.  **Build Output Directory:** `dist`
    *   *Cloudflare will automatically upload this folder after the build completes.*

### Option 2: Using Wrangler CLI (What caused the error)
If you specifically want to deploy using the command line (Wrangler), the error happened because Wrangler didn't know where your files were. You must point it to the `dist` folder.

**Correct Command:**
```bash
npx wrangler pages deploy dist
```
*Note: You will need to create a project in Cloudflare Pages first or follow the interactive prompts.*

### Summary of Fix
The error `[ERROR] Missing entry-point` occurred because `npx wrangler deploy` looks for a Worker script (`src/index.ts`) by default. Since you are building a static React website, you simply need to let Cloudflare upload the `dist` folder.

**Action:** Go to your Cloudflare Pages settings -> **Builds & deployments** -> **Build configurations** and ensure:
*   **Build command:** `npm run build`
*   **Build output directory:** `dist`
