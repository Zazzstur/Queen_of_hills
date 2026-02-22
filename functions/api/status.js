export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server-side API is working',
    env_check: {
      has_supabase_url: !!context.env.SUPABASE_URL,
      has_supabase_key: !!context.env.SUPABASE_ANON_KEY
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
