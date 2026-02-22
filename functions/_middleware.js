export async function onRequest(context) {
  try {
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
