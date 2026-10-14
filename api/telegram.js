export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return res.status(503).json({ok:false,error:'Telegram environment variables missing'});
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const type = body.type || 'message';
    if (type === 'error') return res.status(200).json({ok:true,ignored:true}); // errors go to /api/report-error
    const userName = String(body.userName || 'User').slice(0,100);
    const messageText = String(body.messageText || '').slice(0,3500);
    if (type === 'photo' && body.photoUrl) {
      const caption = `📚 SK Education • Class 10th\n\n💬 New Photo\n👤 ${userName}`;
      const form = new URLSearchParams({chat_id: chatId, photo: String(body.photoUrl), caption});
      const r = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form});
      const j = await r.json();
      if (!r.ok || !j.ok) return res.status(502).json({ok:false,error:j?.description||'Telegram photo send failed'});
      return res.status(200).json({ok:true,result:j.result});
    }
    const text = `📚 SK Education • Class 10th\n\n💬 New Message\n👤 ${userName}\n\n${messageText}`;
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,...(process.env.SITE_URL?{reply_markup:{inline_keyboard:[[{text:'Open admin panel',web_app:{url:process.env.SITE_URL.replace(/\/$/,'')+'/ss.html'}}]]}}:{})})});
    const j = await r.json();
    if (!r.ok || !j.ok) return res.status(502).json({ok:false,error:j?.description||'Telegram send failed'});
    return res.status(200).json({ok:true,result:j.result});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ok:false,error:e?.message||'Telegram error'});
  }
}
