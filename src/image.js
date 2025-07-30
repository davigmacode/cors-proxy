export default async function handler(req, res) {
  const imgUrl = req.query.url;

  if (!imgUrl) {
    return res.status(400).send('Missing ?url=');
  }

  try {
    const response = await fetch(decodeURIComponent(imgUrl));
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send("Failed to fetch image.");
  }
}
