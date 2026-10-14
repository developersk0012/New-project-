// Website errors -> Telegram. Uses a SEPARATE bot if ERROR_BOT_TOKEN + ERROR_CHAT_ID are set,
// otherwise falls back to the main bot (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID).
const hits = new Map(); // ip -> [timestamps]

function device(ua = "") {
  const os = /Android ([\d.]+)/.exec(ua)?.[0] || (/iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : "Other");
  const br = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung" : /Chrome\//.test(ua) ? "Chrome " + (/Chrome\/(\d+)/.exec(ua)?.[1] || "") : /Safari/.test(ua) ? "Safari" : "Browser";
  return `${os} • ${br}`;
}
const s = (v, n) => String(v ?? "").slice(0, n);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const token = process.env.ERROR_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.ERROR_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(503).json({ ok: false, error: "Bot env missing (ERROR_BOT_TOKEN/ERROR_CHAT_ID)" });

  const ip = String(req.headers["x-forwarded-for"] || "?").split(",")[0].trim(), now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 10 * 60e3);
  if (list.length >= 15) return res.status(429).json({ ok: false, error: "Too many reports" });
  list.push(now); hits.set(ip, list);
  if (hits.size > 500) hits.clear();

  let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
  const trail = Array.isArray(b.crumbs) ? b.crumbs.slice(-8).map(x => "  › " + s(x, 90)).join("\n") : "";
  const stack = s(b.stack, 700).split("\n").slice(0, 5).join("\n");
  const text = [
    b.type === "test" ? "🧪 SK Education • TEST ALERT" : "🚨 SK Education • Website Error",
    `⏰ ${when}`,
    `📄 ${s(b.page, 120)}`,
    `👤 ${s(b.userName || "Guest", 60)}`,
    "",
    `❗ ${s(b.message, 400)}`,
    `🏷️ ${s(b.kind || "error", 20)}${b.code ? " • " + s(b.code, 40) : ""}${b.count > 1 ? " • x" + Number(b.count) : ""}`,
    b.source ? `📍 ${s(b.source, 160)}` : "",
    `📱 ${device(b.device)}${b.inTelegram ? " • Telegram App" : ""}${b.online === false ? " • OFFLINE" : ""}`,
    b.ver ? `🔢 data v${s(b.ver, 10)} • ${s(b.viewport, 20)}` : "",
    trail ? "\n🧭 Last actions:\n" + trail : "",
    stack ? "\n🧵 " + stack : "",
  ].filter(x => x !== "").join("\n").slice(0, 3900);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true })
    });
    const j = await r.json();
    if (!r.ok || !j.ok) return res.status(502).json({ ok: false, error: j?.description || "Telegram failed" });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ ok: false, error: e?.message || "error" }); }
}
