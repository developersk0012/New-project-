import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

app.post("/api/send-quiz", async (req, res) => {
  const {
    botToken,
    chatId,
    questions,
    delayMs = 1500,
    protectContent = false,
    isAnonymous = true
  } = req.body || {};

  if (!clean(botToken)) {
    return res.status(400).json({ ok: false, error: "Bot Token is required." });
  }
  if (!clean(chatId)) {
    return res.status(400).json({ ok: false, error: "Group/Chat ID is required." });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ ok: false, error: "No quiz questions supplied." });
  }

  const safeDelay = Math.max(500, Math.min(Number(delayMs) || 1500, 30000));
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    if (
      !q ||
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.length > 10 ||
      !Number.isInteger(q.correctOption) ||
      q.correctOption < 0 ||
      q.correctOption >= q.options.length
    ) {
      results.push({
        index: i + 1,
        ok: false,
        error: "Invalid question/options/correctOption."
      });
      continue;
    }

    const payload = {
      chat_id: chatId,
      question: q.question.slice(0, 300),
      options: q.options.map(x => String(x).slice(0, 100)),
      type: "quiz",
      correct_option_id: q.correctOption,
      is_anonymous: Boolean(isAnonymous),
      protect_content: Boolean(protectContent)
    };

    if (q.explanation) {
      payload.explanation = String(q.explanation).slice(0, 200);
    }

    try {
      const tg = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPoll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await tg.json();

      if (!data.ok) {
        results.push({
          index: i + 1,
          ok: false,
          error: data.description || "Telegram API error",
          retry_after: data.parameters?.retry_after || null
        });

        // Respect Telegram's RetryAfter response instead of trying to bypass it.
        if (data.parameters?.retry_after) {
          await sleep(Math.min(Number(data.parameters.retry_after) * 1000, 60000));
        }
      } else {
        results.push({
          index: i + 1,
          ok: true,
          message_id: data.result?.message_id ?? null
        });
      }
    } catch (err) {
      results.push({
        index: i + 1,
        ok: false,
        error: err?.message || "Network error"
      });
    }

    if (i < questions.length - 1) {
      await sleep(safeDelay);
    }
  }

  const sent = results.filter(x => x.ok).length;
  const failed = results.length - sent;

  res.json({
    ok: failed === 0,
    total: questions.length,
    sent,
    failed,
    results
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Telegram Quiz Publisher running on http://localhost:${port}/seema.html`);
});