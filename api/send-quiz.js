// Vercel serverless function: talks to the Telegram Bot API.
// Token comes from the panel's Settings, or from the TELEGRAM_BOT_TOKEN env var as fallback.

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, description: "Sirf POST allowed hai." });
  }

  const b = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const token = (b.token || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(b.chat_id || process.env.TELEGRAM_CHAT_ID || "").trim();

  if (!/^\d+:[\w-]{20,}$/.test(token)) {
    return res.status(400).json({ ok: false, description: "Bot Token sahi format mein nahi hai." });
  }

  try {
    if (b.action === "getMe") {
      return await forward(res, token, "getMe", {});
    }

    if (!chatId) return res.status(400).json({ ok: false, description: "Group ID missing hai." });
    const opts = b.options;
    if (!b.question || !Array.isArray(opts) || opts.length < 2 || opts.length > 10) {
      return res.status(400).json({ ok: false, description: "Question ya options galat hain." });
    }
    const cid = Number(b.correct_option_id);
    if (!Number.isInteger(cid) || cid < 0 || cid >= opts.length) {
      return res.status(400).json({ ok: false, description: "correct_option_id galat hai." });
    }

    const payload = {
      chat_id: chatId,
      question: String(b.question).slice(0, 300),
      options: opts.map((o) => String(o).slice(0, 100)),
      type: "quiz",
      correct_option_id: cid,
      is_anonymous: b.is_anonymous === true
    };
    if (b.explanation) payload.explanation = String(b.explanation).slice(0, 200);

    return await forward(res, token, "sendPoll", payload);
  } catch (e) {
    return res.status(502).json({ ok: false, description: "Telegram tak nahi pahunch paye: " + e.message });
  }
};

async function forward(res, token, method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  // Telegram's own response (including retry_after on 429) is passed through to the panel.
  return res.status(200).json(data);
}

function safeParse(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
