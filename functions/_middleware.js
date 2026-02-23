export async function onRequest(context) {
  try {
    // Hardcoded fallback for environment variables
    // This is a workaround since Cloudflare Dashboard is not allowing variable configuration
    if (!context.env.SUPABASE_URL) {
      context.env.SUPABASE_URL = 'https://fwewzwhakwcctpstxvum.supabase.co';
    }
    if (!context.env.SUPABASE_ANON_KEY) {
      context.env.SUPABASE_ANON_KEY = '.eyJpc3MiOiJzdXBhYmFzeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9ZSIsInJlZiI6ImZ3ZXd6d2hha3djY3Rwc3R4dnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzA3MzYsImV4cCI6MjA4NTUwNjczNn0.f0DcVPlpFUpsAWQZJQE9U6Z1eAbcYwQjmPtRr8K3NDk';
    }

    const response = await context.next();
    const { request } = context;
    const url = new URL(request.url);

    // Add CORS headers to API routes
    if (url.pathname.startsWith('/api/')) {
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return newResponse;
    }

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
