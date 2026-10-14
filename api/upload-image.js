export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Both names are supported. IMGBB_API_KEY is the name documented for Vercel.
    const key = process.env.IMGBB_API_KEY || process.env.SK_EDUCATION_IMGBB_KEY;
    if (!key) {
      return res.status(503).json({
        ok: false,
        error: "IMGBB_API_KEY is missing. Add it to the Vercel project Environment Variables and redeploy."
      });
    }

    const contentType = String(req.headers["content-type"] || "").split(";")[0].toLowerCase();
    if (!contentType.startsWith("image/")) {
      return res.status(400).json({ ok: false, error: "Only image uploads are allowed" });
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      return res.status(400).json({ ok: false, error: "Empty image received" });
    }
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({ ok: false, error: "Image must be smaller than 10MB" });
    }

    // ImgBB accepts base64 image data. Using URLSearchParams avoids multipart/FormData
    // compatibility problems in Vercel serverless functions.
    const body = new URLSearchParams({ image: buffer.toString("base64") });
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      }
    );

    const raw = await response.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = null;
    }

    if (!response.ok || !result?.success || !result?.data?.url) {
      console.error("ImgBB response:", response.status, raw);
      return res.status(502).json({
        ok: false,
        error: result?.error?.message || `ImgBB upload failed (${response.status})`
      });
    }

    return res.status(200).json({ ok: true, url: result.data.url });
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Upload failed"
    });
  }
}
