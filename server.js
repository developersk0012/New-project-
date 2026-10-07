const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { TelegramClient } = require('teleproto');
const { StringSession } = require('teleproto/sessions');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

const DATA = path.join(__dirname, 'data');
const SESSION_FILE = path.join(DATA, 'session.txt');
const SETTINGS_FILE = path.join(DATA, 'settings.json');
fs.mkdirSync(DATA, { recursive: true });

let client = null;
let auth = { apiId: null, apiHash: null, phone: null, phoneCodeHash: null, state: 'logged_out', error: null };
let loginLock = false;

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch { return {}; }
}
function writeSettings(x) { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(x, null, 2), { mode: 0o600 }); }
function saveSession() {
  if (!client) return;
  fs.writeFileSync(SESSION_FILE, client.session.save(), { mode: 0o600 });
}
function validCreds(apiId, apiHash) {
  return Number.isInteger(Number(apiId)) && Number(apiId) > 0 && /^[a-f0-9]{20,}$/i.test(String(apiHash));
}
function errorMessage(e) { return e?.message || e?.errorMessage || String(e); }
function makeId() { return BigInt('0x' + crypto.randomBytes(8).toString('hex')); }

async function newClient(apiId, apiHash, session='') {
  const c = new TelegramClient(new StringSession(session), Number(apiId), String(apiHash), {
    connectionRetries: 5,
    deviceModel: 'Quiz Publisher',
    appVersion: '1.0.0'
  });
  await c.connect();
  return c;
}

async function restoreFromEnv() {
  const s = readSettings();
  const apiId = process.env.TELEGRAM_API_ID || s.apiId;
  const apiHash = process.env.TELEGRAM_API_HASH || s.apiHash;
  if (!validCreds(apiId, apiHash) || !fs.existsSync(SESSION_FILE)) return;
  try {
    client = await newClient(apiId, apiHash, fs.readFileSync(SESSION_FILE, 'utf8').trim());
    if (await client.checkAuthorization()) {
      auth = { ...auth, apiId: Number(apiId), apiHash: String(apiHash), state: 'logged_in', error: null };
    } else {
      await client.disconnect(); client = null;
    }
  } catch (e) {
    client = null;
    auth.error = errorMessage(e);
  }
}

app.get('/api/status', async (req,res) => {
  const settings = readSettings();
  let me = null;
  if (client && auth.state === 'logged_in') {
    try { me = await client.getMe(); } catch {}
  }
  res.json({
    ok: true,
    state: auth.state,
    hasApi: !!(process.env.TELEGRAM_API_ID || settings.apiId),
    hasSession: fs.existsSync(SESSION_FILE),
    user: me ? { id: String(me.id), firstName: me.firstName || '', lastName: me.lastName || '', username: me.username || '' } : null,
    error: auth.error
  });
});

app.post('/api/login/start', async (req,res) => {
  if (loginLock) return res.status(409).json({ ok:false, error:'Login already in progress.' });
  const { apiId, apiHash, phone } = req.body || {};
  if (!validCreds(apiId, apiHash)) return res.status(400).json({ ok:false, error:'API ID/API Hash invalid.' });
  if (!phone || String(phone).length < 5) return res.status(400).json({ ok:false, error:'Phone number is required.' });

  loginLock = true;
  auth = { apiId:Number(apiId), apiHash:String(apiHash), phone:String(phone), phoneCodeHash:null, state:'sending_code', error:null };
  try {
    if (client) { try { await client.disconnect(); } catch {} }
    client = await newClient(apiId, apiHash, '');
    const sent = await client.sendCode({ apiId:Number(apiId), apiHash:String(apiHash) }, String(phone));
    auth.phoneCodeHash = sent.phoneCodeHash;
    auth.state = 'code_sent';
    writeSettings({ apiId:Number(apiId), apiHash:String(apiHash) });
    res.json({ ok:true, state:'code_sent', viaApp: !!sent.isCodeViaApp });
  } catch (e) {
    auth.state='error'; auth.error=errorMessage(e);
    try { if (client) await client.disconnect(); } catch {}
    client=null;
    res.status(400).json({ ok:false, error:auth.error });
  } finally { loginLock = false; }
});

app.post('/api/login/verify', async (req,res) => {
  if (!client || !auth.phoneCodeHash || !auth.phone) return res.status(400).json({ ok:false, error:'First request a login code.' });
  const code = String(req.body?.code || '').trim();
  const password = req.body?.password;
  if (!code) return res.status(400).json({ ok:false, error:'Telegram login code is required.' });
  try {
    auth.state='verifying';
    const result = await client.api.auth.signIn({
      phoneNumber: auth.phone,
      phoneCodeHash: auth.phoneCodeHash,
      phoneCode: code
    });
    auth.state='logged_in'; auth.error=null; saveSession();
    res.json({ ok:true, state:'logged_in', user: { id:String(result.user?.id || ''), firstName:result.user?.firstName || '', username:result.user?.username || '' } });
  } catch (e) {
    const msg = errorMessage(e);
    if (/SESSION_PASSWORD_NEEDED/i.test(msg)) {
      if (!password) { auth.state='need_2fa'; return res.status(401).json({ ok:false, need2fa:true, error:'Telegram 2FA password required.' }); }
      try {
        const result = await client.signInWithPassword({ apiId:auth.apiId, apiHash:auth.apiHash }, { password: async()=>String(password) });
        auth.state='logged_in'; auth.error=null; saveSession();
        res.json({ ok:true, state:'logged_in', user:{ id:String(result.id), firstName:result.firstName || '', username:result.username || '' } });
      } catch (e2) { auth.state='error'; auth.error=errorMessage(e2); res.status(400).json({ok:false,error:auth.error}); }
    } else {
      auth.state='error'; auth.error=msg; res.status(400).json({ ok:false, error:msg });
    }
  }
});

app.post('/api/logout', async (req,res) => {
  try { if (client) await client.logOut(); } catch {}
  client=null; auth={apiId:null,apiHash:null,phone:null,phoneCodeHash:null,state:'logged_out',error:null};
  try { fs.unlinkSync(SESSION_FILE); } catch {}
  res.json({ok:true});
});

async function getGroup(groupId) {
  if (!client || auth.state !== 'logged_in') throw new Error('Telegram account is not logged in.');
  if (!groupId) throw new Error('Group ID is required.');
  return await client.getEntity(String(groupId).trim());
}

function cleanQuestion(q) {
  const question = String(q?.question ?? '').trim();
  const options = Array.isArray(q?.options) ? q.options.map(x=>String(x).trim()).filter(Boolean) : [];
  const correct = Number(q?.correctOption);
  if (!question) throw new Error('Question is empty.');
  if (options.length < 2 || options.length > 10) throw new Error('Each quiz must have 2-10 options.');
  if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) throw new Error('correctOption is invalid.');
  return { question, options, correctOption:correct, explanation:String(q?.explanation || '').slice(0,200) };
}

async function sendQuiz(group, q) {
  const x=cleanQuestion(q);
  return await client.sendPoll(group, {
    question:x.question,
    answers:x.options,
    quiz:true,
    correctAnswers:x.correctOption,
    solution:x.explanation || undefined
  });
}

app.post('/api/test', async (req,res) => {
  try {
    const group=await getGroup(req.body?.groupId);
    const msg=await sendQuiz(group, req.body?.question);
    res.json({ok:true,messageId:msg?.id || null});
  } catch(e) { res.status(400).json({ok:false,error:errorMessage(e)}); }
});

app.post('/api/publish', async (req,res) => {
  try {
    const group=await getGroup(req.body?.groupId);
    const raw=Array.isArray(req.body?.questions) ? req.body.questions : [];
    if (!raw.length) throw new Error('No questions supplied.');
    const delay=Math.max(1000, Math.min(60000, Number(req.body?.delayMs || 3000)));
    let sent=0;
    for (const q of raw) {
      await sendQuiz(group,q);
      sent++;
      if (sent < raw.length) await new Promise(r=>setTimeout(r,delay));
    }
    res.json({ok:true,sent,total:raw.length});
  } catch(e) { res.status(400).json({ok:false,error:errorMessage(e)}); }
});

app.post('/api/check-group', async (req,res) => {
  try {
    const entity=await getGroup(req.body?.groupId);
    res.json({ok:true,title:entity?.title || entity?.username || 'Telegram chat',id:String(entity?.id || req.body.groupId)});
  } catch(e) { res.status(400).json({ok:false,error:errorMessage(e)}); }
});

const port=Number(process.env.PORT||3000);
app.listen(port, async()=>{
  console.log(`Quiz Publisher running on http://localhost:${port}`);
  await restoreFromEnv();
});
