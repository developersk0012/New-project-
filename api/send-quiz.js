export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST required" });
  }

  const {
    botToken,
    chatId,
    questions,
    delayMs = 1500,
    protectContent = false,
    isAnonymous = true
  } = req.body || {};

  if (!botToken?.trim()) return res.status(400).json({ok:false,error:"Bot Token is required."});
  if (!chatId?.trim()) return res.status(400).json({ok:false,error:"Group/Chat ID is required."});
  if (!Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ok:false,error:"No quiz questions supplied."});
  }

  const delay = Math.max(500, Math.min(Number(delayMs) || 1500, 30000));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const results = [];

  for (let i=0; i<questions.length; i++) {
    const q = questions[i];

    if (!q || typeof q.question !== "string" ||
        !Array.isArray(q.options) || q.options.length < 2 ||
        q.options.length > 10 || !Number.isInteger(q.correctOption) ||
        q.correctOption < 0 || q.correctOption >= q.options.length) {
      results.push({index:i+1,ok:false,error:"Invalid question/options/correctOption."});
      continue;
    }

    const payload = {
      chat_id: chatId,
      question: q.question.slice(0,300),
      options: q.options.map(x => String(x).slice(0,100)),
      type: "quiz",
      correct_option_id: q.correctOption,
      is_anonymous: Boolean(isAnonymous),
      protect_content: Boolean(protectContent)
    };

    if (q.explanation) payload.explanation = String(q.explanation).slice(0,200);

    try {
      const tg = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPoll`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const data = await tg.json();

      if (!data.ok) {
        results.push({
          index:i+1, ok:false,
          error:data.description || "Telegram API error",
          retry_after:data.parameters?.retry_after || null
        });
        if (data.parameters?.retry_after) {
          await sleep(Math.min(Number(data.parameters.retry_after)*1000,60000));
        }
      } else {
        results.push({index:i+1,ok:true,message_id:data.result?.message_id ?? null});
      }
    } catch (e) {
      results.push({index:i+1,ok:false,error:e?.message || "Network error"});
    }

    if (i < questions.length-1) await sleep(delay);
  }

  const sent = results.filter(x=>x.ok).length;
  return res.status(200).json({
    ok: sent === questions.length,
    total: questions.length,
    sent,
    failed: questions.length-sent,
    results
  });
}