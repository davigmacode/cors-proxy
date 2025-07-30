export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing ?url=", { status: 400 });
  }

  try {
    const response = await fetch(decodeURIComponent(url));

    if (!response.ok) {
      return new Response("Failed to fetch image", {
        status: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    // 1 day + revalidate 1 week
    headers.set("Cache-Control", "public, max-age=31536000, stale-while-revalidate=604800");

    return new Response(response.body, { headers });
  } catch (err) {
    return new Response("Image proxy failed", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
