import { issueToken, safeEqual, clientIp } from "./_auth.js";

// Best-effort brute-force protection (memory of a warm serverless instance).
const fails = new Map(); // ip -> { n, until }
const MAX = 5, LOCK_MS = 15 * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function alertTelegram(text) {
  try {
    const t = process.env.TELEGRAM_BOT_TOKEN, c = process.env.TELEGRAM_CHAT_ID;
    if (!t || !c) return;
    await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: c, text })
    });
  } catch {}
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  if (!process.env.ADMIN_PASSWORD)
    return res.status(503).json({ ok: false, error: "Server par ADMIN_PASSWORD set nahi hai (Vercel > Settings > Environment Variables)." });

  const ip = clientIp(req), now = Date.now();
  const st = fails.get(ip) || { n: 0, until: 0 };
  if (st.until > now)
    return res.status(429).json({ ok: false, error: "Bahut zyada galat try. Thodi der baad aayein.", retryAfter: Math.ceil((st.until - now) / 1000) });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const pw = String((body && body.password) || "").slice(0, 200);

  if (pw && safeEqual(pw, process.env.ADMIN_PASSWORD)) {
    fails.delete(ip);
    const { token, exp } = issueToken();
    return res.status(200).json({ ok: true, token, exp });
  }
  st.n += 1;
  if (st.n >= MAX) {
    st.until = now + LOCK_MS; st.n = 0;
    alertTelegram(`⚠️ SK Education admin login: ${MAX} galat password try (IP ${ip}). 15 min ke liye lock.`);
  }
  fails.set(ip, st);
  if (fails.size > 500) for (const [k, v] of fails) if (v.until < now && v.n === 0) fails.delete(k);
  await sleep(600); // slow down guessing
  return res.status(401).json({ ok: false, error: "Wrong password" });
}
