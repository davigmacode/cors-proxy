export const config = { runtime: 'edge' };

export default async function handler(req) {
  const target = process.env.TARGET_API;

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '');
  const query = url.search;

  const targetUrl = `${target}${path}${query}`;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    });

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: {
        'Content-Type': proxyRes.headers.get("content-type") || "application/json",
        'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy failed" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
