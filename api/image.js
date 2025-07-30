export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response('Missing ?url=', { status: 400 });
  }

  try {
    const imgRes = await fetch(url);
    const headers = new Headers({
      'Content-Type': imgRes.headers.get("content-type") || "image/jpeg",
      'Cache-Control': 'public, max-age=3600',
    });

    return new Response(imgRes.body, { headers, status: imgRes.status});
  } catch (e) {
    return new Response("Failed to fetch image", { status: 500 });
  }
}
