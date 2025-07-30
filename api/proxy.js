export const config = { runtime: 'edge' };

export default async function handler(req) {
  const target = process.env.TARGET_API;
  if (!target) {
    return new Response("TARGET_API env not set", { status: 500 });
  }

  const { pathname, search } = new URL(req.url);
  const sanitizedSearch = search.replace(/(^|\?|&)path=[^&]*/g, "").replace(/&&/, "&").replace(/\?&/, "?");
  const targetPath = pathname.replace(/^\/api/, "");
  const targetUrl = `${target}${targetPath}${sanitizedSearch}`;
  console.log(targetUrl);

  // CORS preflight support
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    // Fix: convert req.headers to plain object
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      redirect: "manual",
    });

    const proxyHeaders = new Headers(proxyRes.headers);
    proxyHeaders.set("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN || "*");
    proxyHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    proxyHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: proxyHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Proxy failed",
      detail: err.message,
      targetUrl,
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
