import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

const sanitizeSlug = (str) => {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

const generateRouteUrl = (route, capacity = null) => {
  const cleanType = sanitizeSlug(route.type || 'route');
  const cleanOrigin = sanitizeSlug(route.origin);
  const cleanDest = sanitizeSlug(route.destination);

  let url = `/route/${cleanType}_${cleanOrigin}-${cleanDest}`;
  if (capacity) {
    url += `/${sanitizeSlug(capacity)}`;
  }
  return url;
};

export async function onRequest(context) {
  try {
    const { request, env, params } = context;
    const url = new URL(request.url);
    const { id } = params;

    // Check if the ID looks like an old Convex ID (usually alphanumeric, 32 chars)
    // Slugs will have underscores or hyphens
    if (id && !id.includes('_') && !id.includes('-') && id.length > 20) {
      const convexUrl = env.VITE_CONVEX_URL || "https://bold-caiman-308.convex.cloud";
      const client = new ConvexHttpClient(convexUrl);
      
      // Fetch all routes and find the matching one
      const routes = await client.query(api.routes.getRoutes);
      const route = routes.find(r => String(r.id) === String(id) || String(r._id) === String(id));
      
      if (route) {
        // Build the new URL
        const capacity = url.searchParams.get('capacity') || route.capacity;
        const newUrlPath = generateRouteUrl(route, capacity);
        
        const newUrl = new URL(newUrlPath, url.origin);
        
        // Return 301 redirect
        return new Response(null, {
          status: 301,
          headers: {
            'Location': newUrl.toString(),
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    // If it's not an old ID or route not found, let Cloudflare Pages continue 
    // to serve the React SPA (next middleware/static asset)
    return env.ASSETS.fetch(request);
  } catch (error) {
    // On error, just fallback to serving the SPA to not break the site
    console.error("Redirect error:", error);
    return context.env.ASSETS.fetch(context.request);
  }
}
