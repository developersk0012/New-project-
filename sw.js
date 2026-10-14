/* SK Education service worker — v7 (fast)
   - HTML: network first but only waits 2.5s, then falls back to cache (no more long white screens)
   - CSS/JS/icons: instant from cache, refreshed in the background (stale-while-revalidate)
   - Firebase SDK (gstatic, versioned): cache-first
   - Firebase REST data + /api: never touched here (data.js has its own cache) */
const CACHE = "sk-education-v24";
const CORE = [
  "./", "index.html", "control.html", "login.html", "signup.html", "courses.html", "my-courses.html", "profile.html", "chat.html", "mod-apks.html", "mod-websites.html", "site-view.html", "test-series.html", "test-play.html", "quiz-parser.js", "ts.js",
  "style.css", "data.js", "config.js", "nav.js", "tg.js", "manifest.json",
  "icons/icon-192.png", "icons/logo-96.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function offlinePage() {
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;text-align:center;padding:40px 20px"><h3>No internet</h3><p>Check your connection and try again.</p><button onclick="location.reload()" style="padding:10px 22px">Retry</button>', { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
function timeoutFetch(req, ms) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout")), ms);
    fetch(req).then(r => { clearTimeout(t); res(r); }, err => { clearTimeout(t); rej(err); });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Firebase SDK files are versioned + immutable: cache-first
  if (url.hostname === "www.gstatic.com" && url.pathname.indexOf("/firebasejs/") === 0) {
    event.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.indexOf("/api/") === 0) return;

  // HTML + JS + CSS are network-first, so a new deploy is never mixed with old cached scripts
  const isHTML = req.mode === "navigate" || /\.(html?|js|css)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (isHTML) {
    // Network first. Only if THIS exact page is cached do we give up waiting after 2.5s.
    // We never answer a different page (e.g. index.html) for control.html / error-handler.html.
    event.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(r => { if (r && r.status === 200) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; });
        if (!hit) return net.catch(() => offlinePage());
        return Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))]).catch(() => hit);
      })
    );
    return;
  }
  // static assets: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r && r.status === 200) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }))
  );
});
