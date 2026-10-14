/* SK Education — Test Series shared helpers (subjects, best scores, leaderboard UI, count-up, confetti) */
const TS_CLASSES = {
  "10": { label: "Class 10th", tag: "Bihar Board • Matric", grad: "linear-gradient(135deg,#5B7CFA,#8B5CF6)", subjects: [
    ["physics", "Physics", "⚛️", "#5B7CFA"], ["chemistry", "Chemistry", "🧪", "#F5A524"], ["biology", "Biology", "🧬", "#34B47C"],
    ["hindi", "Hindi", "📖", "#EC4899"], ["sanskrit", "Sanskrit", "🕉️", "#F97316"], ["math", "Math", "📐", "#06B6D4"]] },
  "12": { label: "Class 12th", tag: "Bihar Board • Intermediate", grad: "linear-gradient(135deg,#F97316,#EC4899)", subjects: [
    ["hindi", "Hindi", "📖", "#EC4899"], ["english", "English", "🔤", "#8B5CF6"], ["math", "Math", "📐", "#06B6D4"],
    ["physics", "Physics", "⚛️", "#5B7CFA"], ["chemistry", "Chemistry", "🧪", "#F5A524"], ["biology", "Biology", "🧬", "#34B47C"]] }
};
const TS_BUILTIN = { "10": 1, "12": 1 };
const TS_PAL = ["#5B7CFA", "#F5A524", "#34B47C", "#EC4899", "#F97316", "#06B6D4", "#8B5CF6", "#EF4444"];
function tsGrad(c) { return "linear-gradient(135deg," + c + "," + c + "bb 45%,#8B5CF6)"; }
/* admin-managed series (testSeries/<id>) are merged into TS_CLASSES; { deleted:true } hides a built-in one */
function tsApplySeries(map) {
  map = map || {};
  Object.keys(map).sort(function (a, b) { return String((map[a] || {}).createdAt || "").localeCompare(String((map[b] || {}).createdAt || "")); }).forEach(function (k) {
    const s = map[k]; if (!s || typeof s !== "object") return;
    if (s.deleted) { delete TS_CLASSES[k]; return; }
    const base = TS_CLASSES[k] || {}, col = /^#[0-9a-f]{6}$/i.test(s.color || "") ? s.color : null;
    let raw = s.subjects; if (raw && !Array.isArray(raw)) raw = Object.values(raw);
    const subs = Array.isArray(raw) ? raw.filter(x => x && x.key && x.name).map(x => [String(x.key), String(x.name), x.emoji || "📝", /^#[0-9a-f]{6}$/i.test(x.color || "") ? x.color : "#5B7CFA", tsParseSubs(x.subs)]) : (base.subjects || []);
    delete TS_CLASSES[k];
    TS_CLASSES[k] = { label: s.label || base.label || k, tag: s.tag != null ? s.tag : (base.tag || ""), grad: col ? tsGrad(col) : (base.grad || tsGrad("#5B7CFA")), emoji: s.emoji || base.emoji || "", custom: !TS_BUILTIN[k], subjects: subs };
  });
}
/* subcategories of a subject (e.g. Hindi -> Poetry / Prose / Grammar): stored as subs:[{key,name}] -> [[key,name],...] */
function tsParseSubs(raw) {
  if (raw && !Array.isArray(raw)) raw = Object.values(raw);
  return Array.isArray(raw) ? raw.filter(x => x && x.key && x.name).map(x => [String(x.key), String(x.name)]) : [];
}
function tsSubsOf(cls, key) { const s = tsSubject(cls, key); return s[4] || []; }
function tsSubName(cls, key, sk) { const f = tsSubsOf(cls, key).find(x => x[0] === sk); return f ? f[1] : ""; }
/* whole-quiz time in minutes (admin sets it per test; default = 1 min per question, at least 5) */
function durOf(meta, n) {
  const d = Math.round(+meta.duration); if (d > 0) return Math.min(600, d);
  n = Math.max(1, n || meta.count || 1); return Math.max(5, n);
}
function tsSubject(cls, key) { const c = TS_CLASSES[cls]; return c && c.subjects.find(s => s[0] === key) || [key, key, "📝", "#5B7CFA"]; }
function tsBest() { try { return JSON.parse(localStorage.getItem("sk_ts_best") || "{}"); } catch (e) { return {}; } }
function tsSaveBest(id, score, total, time) {
  const b = tsBest(), p = b[id];
  if (!p || score > p.score || (score === p.score && time < p.time)) { b[id] = { score, total, time }; try { localStorage.setItem("sk_ts_best", JSON.stringify(b)); } catch (e) {} }
}
function fmtDur(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
function avatar(name, size) {
  const n = String(name || "?").trim(), h = [...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `<span class="lb-av" style="width:${size || 38}px;height:${size || 38}px;background:linear-gradient(135deg,hsl(${h} 70% 55%),hsl(${(h + 50) % 360} 70% 45%))">${esc(n.charAt(0).toUpperCase())}</span>`;
}
/* rows: [{uid,name,main,sub}] already sorted best-first */
function lbHtml(rows, meId, emptyText) {
  if (!rows.length) return `<div class="state"><b>No scores yet</b>${esc(emptyText || "Take the test first to appear on the leaderboard!")}</div>`;
  const medal = ["🥇", "🥈", "🥉"], top = rows.slice(0, 3), rest = rows.slice(3);
  const order = top.length === 3 ? [1, 0, 2] : top.map((_, i) => i);
  const pod = `<div class="lb-podium">${order.map(i => { const r = top[i]; return `<div class="lb-pod p${i + 1}${r.uid === meId ? " me" : ""}"><div class="lb-crown">${medal[i]}</div>${avatar(r.name, i === 0 ? 58 : 48)}<b>${esc(r.name)}</b><small>${esc(r.main)}</small><div class="lb-bar" style="--h:${i === 0 ? 92 : i === 1 ? 70 : 56}px"><span>${i + 1}</span></div></div>`; }).join("")}</div>`;
  const list = rest.map((r, i) => `<div class="lb-row${r.uid === meId ? " me" : ""}" style="animation-delay:${Math.min(i, 12) * 40}ms"><span class="lb-rank">${i + 4}</span>${avatar(r.name, 36)}<div class="lb-name"><b>${esc(r.name)}${r.uid === meId ? " (You)" : ""}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</div><span class="lb-score">${esc(r.main)}</span></div>`).join("");
  return pod + (list ? `<div class="lb-list">${list}</div>` : "");
}
function countUp(el, to, ms, fmt) {
  const t0 = performance.now(); fmt = fmt || (v => Math.round(v));
  (function f(t) { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(f); })(t0);
}
function confetti(cv) {
  if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const x = cv.getContext("2d"), W = cv.width = cv.offsetWidth, H = cv.height = cv.offsetHeight, cols = ["#5B7CFA", "#8B5CF6", "#34B47C", "#F5A524", "#EC4899", "#06B6D4"];
  const ps = Array.from({ length: 90 }, () => ({ x: W / 2, y: H * .3, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3, s: 4 + Math.random() * 5, c: cols[Math.random() * cols.length | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4 }));
  let t0 = performance.now();
  (function f(t) {
    x.clearRect(0, 0, W, H); const el = t - t0;
    ps.forEach(p => { p.vy += .28; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - el / 2800); x.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); x.restore(); });
    if (el < 2800) requestAnimationFrame(f); else x.clearRect(0, 0, W, H);
  })(t0);
}

/* leaderboard identity = the logged-in account (same on every device), not the random device id */
function tsUid() { return accountKey(localStorage.getItem("sk_login_id") || getUserId()); }
