export async function onRequest(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    // Basic environment check
    const checks = {
      has_supabase_url: !!env.SUPABASE_URL,
      has_supabase_key: !!env.SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV || 'unknown',
      cf_pages: !!env.CF_PAGES,
      cf_pages_url: env.CF_PAGES_URL || 'unknown',
      cf_pages_branch: env.CF_PAGES_BRANCH || 'unknown',
    };

    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'System Operational',
      checks,
      region: request.cf?.colo || 'unknown',
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
