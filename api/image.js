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
      return new Response("Failed to fetch image", { status: response.status });
    }

    const headers = new Headers({
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // 1 day + revalidate 1 week
    });

    return new Response(response.body, { headers });
  } catch (err) {
    return new Response("Image proxy failed", { status: 500 });
  }
}
