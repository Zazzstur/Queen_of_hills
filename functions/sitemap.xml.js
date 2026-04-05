import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// Import urlHelpers manually since we can't easily import from src in Cloudflare Pages functions without proper bundling if it's not setup.
// Wait, Cloudflare Pages functions support ES modules but maybe not importing outside of functions/ unless it's handled by Vite.
// Vite does bundle functions if using @cloudflare/vite-plugin or similar, but by default it doesn't.
// Let's just copy the logic.

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
    const { env, request } = context;
    const url = new URL(request.url);
    // Hardcode the production domain to ensure consistency regardless of how the worker is invoked
    const baseUrl = "https://toils.in";
    
    // The VITE_CONVEX_URL is usually available in env if configured in Cloudflare Pages
    const convexUrl = env.VITE_CONVEX_URL || "https://bold-caiman-308.convex.cloud";
    
    const client = new ConvexHttpClient(convexUrl);
    
    // Fetch routes using the generated API
    const routes = await client.query(api.routes.getRoutes);
    
    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/sight-seeing', priority: '0.9', changefreq: 'daily' },
      { path: '/direct-travel', priority: '0.9', changefreq: 'daily' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' }
    ];
    
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    // Add dynamic routes
    if (routes && Array.isArray(routes)) {
      const addedUrls = new Set();
      for (const route of routes) {
        const routeUrl = generateRouteUrl(route);
        
        // Prevent duplicates
        if (addedUrls.has(routeUrl)) continue;
        addedUrls.add(routeUrl);

        // Using created_at or current date for lastmod
        const lastMod = route.created_at ? new Date(route.created_at).toISOString() : new Date().toISOString();
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${routeUrl}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }
    }
    
    xml += '</urlset>';
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(`Error generating sitemap: ${error.message}`, { status: 500 });
  }
}
