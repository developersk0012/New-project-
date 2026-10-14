/* SK Education — fast data layer (no Firebase SDK needed).
   Courses / PDFs / banners are read over plain HTTPS (REST) and cached in localStorage
   (stale-while-revalidate): 2nd visit onwards pages paint instantly from cache while
   fresh data is fetched quietly in the background. */
(function () {
  var DB_MAIN = "https://educationqpp-default-rtdb.firebaseio.com"; // courses, pdfs, banners, mod apks/sites, settings
  var DB_TEST = "https://testing-5ce76-default-rtdb.firebaseio.com"; // test series only (testMeta, testSeries)
  var VER = "10"; // bump to invalidate every user's cache
  var TTL = { batches: 5 * 60e3, pdfs: 5 * 60e3, banners: 10 * 60e3, thumbs: 5 * 60e3, modApks: 3 * 60e3, modSites: 3 * 60e3, testMeta: 2 * 60e3, testSeries: 2 * 60e3, joinPopup: 10 * 60e3 };
  var inflight = {}, mem = {};

  function cget(k) { try { return JSON.parse(localStorage.getItem("skc" + VER + ":" + k)); } catch (e) { return null; } }
  function cset(k, d) {
    try { localStorage.setItem("skc" + VER + ":" + k, JSON.stringify({ t: Date.now(), d: d })); }
    catch (e) { try { Object.keys(localStorage).filter(function (x) { return /^skc/.test(x) && x.indexOf("skc" + VER) !== 0; }).forEach(function (x) { localStorage.removeItem(x); }); } catch (e2) {} }
  }
  function norm(raw) {
    var o = {};
    if (!raw || typeof raw !== "object") return o;
    Object.keys(raw).forEach(function (k) { var v = raw[k]; if (v && typeof v === "object") o[k] = v; });
    return o;
  }
  function sdk(base, path) { // fallback: Firebase SDK (websocket) if plain HTTPS fetch fails
    return new Promise(function (resolve, reject) {
      var h = null;
      try { h = base === DB_MAIN ? db : testDb; } catch (e) {}
      if (!h) return reject(new Error("SDK not ready"));
      var to = setTimeout(function () { reject(new Error("SDK timeout")); }, 9000);
      h.ref(path).once("value").then(function (s) { clearTimeout(to); resolve(s.val()); }, function (e) { clearTimeout(to); reject(e); });
    });
  }
  function rest(base, path, ms) {
    var key = base + path;
    if (inflight[key]) return inflight[key];
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 9000);
    var p = fetch(base + "/" + path + ".json", ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { clearTimeout(to); delete inflight[key]; return j; }, function (e) { clearTimeout(to); delete inflight[key]; throw e; });
    return (inflight[key] = p);
  }

  /* swr(): onData(data, fromCache) is called with cache first (if any), then with fresh data
     (only when it differs). Returned promise resolves with the first usable data. */
  function swr(name, base, path, map, onData) {
    var c = cget(name), first = true;
    return new Promise(function (resolve, reject) {
      function give(d, fromCache) {
        if (first) { first = false; resolve(d); }
        if (onData) { try { onData(d, fromCache); } catch (e) { console.error(e); } }
      }
      if (c && c.d != null) give(c.d, true);
      if (c && Date.now() - c.t < TTL[name]) return; // fresh enough — no network at all
      rest(base, path, 7000).catch(function (e1) {
        SKData.lastError = "REST " + path + ": " + (e1 && e1.message || e1);
        return sdk(base, path);
      }).then(function (raw) {
        var d = map(norm(raw));
        cset(name, d);
        if (!c || JSON.stringify(c.d) !== JSON.stringify(d)) give(d, false);
        else if (first) give(d, false);
      }).catch(function (e) {
        SKData.lastError = (SKData.lastError ? SKData.lastError + " | " : "") + "SDK: " + (e && e.message || e);
        if (first) { first = false; reject(e); } else console.warn("Background refresh failed", e);
      });
    });
  }

  var slimPdf = function (x) {
    return { b: String(x.batch_id), c: x.category_id || "", a: x.access || "free", t: x.type || "pdf",
      ti: x.title || "", d: x.description || "", f: x.file_path || "", th: x.thumbnail || "" };
  };

  /* object -> array of {id,...} (only active), pinned first, then newest */
  function modMap(r) {
    return Object.keys(r).map(function (k) { var o = r[k]; o.id = k; return o; })
      .filter(function (x) { return x.active !== false && x.name; })
      .sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")); });
  }

  window.SKData = {
    batches: function (cb) { return swr("batches", DB_MAIN, "batches", function (r) { return r; }, cb); },
    banners: function (cb) { return swr("banners", DB_MAIN, "banners", function (r) { return Object.values(r).filter(function (x) { return x && x.image; }); }, cb); },
    /* admin-set thumbnail overrides: settings/courseThumbs/<batchId> = { url } -> { batchId: url } */
    thumbs: function (cb) { return swr("thumbs", DB_MAIN, "settings/courseThumbs", function (r) { var o = {}; Object.keys(r).forEach(function (k) { if (r[k].url) o[k] = r[k].url; }); return o; }, cb); },
    /* Mod APKs / Mod Websites (admin-managed, main database): newest + pinned first, hidden ones removed */
    modApks: function (cb) { return swr("modApks", DB_MAIN, "modApks", modMap, cb); },
    modSites: function (cb) { return swr("modSites", DB_MAIN, "modSites", modMap, cb); },
    testMeta: function (cb) { return swr("testMeta", DB_TEST, "testMeta", function (r) {
      return Object.keys(r).map(function (k) { var o = r[k]; o.id = k; return o; }).filter(function (x) { return x.active !== false && x.cls && x.subject; })
        .sort(function (a, b) { return String(b.createdAt || "").localeCompare(String(a.createdAt || "")); }); }, cb); },
    testSeries: function (cb) { return swr("testSeries", DB_TEST, "testSeries", function (r) { return r; }, cb); },
    joinPopup: function (cb) { return swr("joinPopup", DB_MAIN, "settings/joinPopup", function (r) { return r.main || {}; }, cb); },
    VER: VER,
    lastError: "",
    /* all PDFs, slimmed to needed fields (a few bytes each) */
    pdfs: function (cb) {
      return swr("pdfs", DB_MAIN, "pdfs", function (r) {
        return Object.values(r).filter(function (x) { return x && x.batch_id != null; }).map(slimPdf);
      }, cb);
    },
    /* start downloading in background so the next page opens instantly */
    prefetch: function () {
      var go = function () { SKData.pdfs().catch(function () {}); };
      if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1200);
    },
    cacheAge: function (n) { var c = cget(n); return c ? Date.now() - c.t : Infinity; },
    clear: function () { Object.keys(localStorage).filter(function (x) { return /^skc/.test(x); }).forEach(function (x) { localStorage.removeItem(x); }); }
  };
})();

/* ---------- Maintenance mode ("Website OFF" in Admin) ----------
   Checked on every user page with a tiny HTTPS request (no Firebase SDK), cached flag shows the
   screen instantly, re-checked every 45 s and when the app comes back to the foreground. */
(function () {
  var p = location.pathname;
  if (/(ss|error-handler)\.html$/.test(p)) return; // admin can always get in
  var URL_ = "https://educationqpp-default-rtdb.firebaseio.com/settings/maintenance.json";
  var box = null, cur = null;
  try { cur = JSON.parse(localStorage.getItem("sk_maint") || "null"); } catch (e) {}

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function paint() {
    if (!document.body) return;
    if (cur && cur.enabled) {
      if (!box) {
        box = document.createElement("div");
        box.id = "maintScreen";
        box.setAttribute("role", "alert");
        box.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:#0B0E15;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif";
        document.body.appendChild(box);
        document.documentElement.style.overflow = "hidden";
      }
      box.innerHTML = '<div style="max-width:340px"><img src="icons/icon-192.png" width="96" height="96" alt="" style="border-radius:50%;margin-bottom:16px" onerror="this.style.display=\'none\'">' +
        '<h1 style="font-size:21px;margin:0 0 8px">The website is under maintenance 🛠️</h1>' +
        '<p style="margin:0 0 18px;color:#aab2c5;font-size:14.5px;line-height:1.6">' + esc((cur.reason || "").trim() || "Please come back in a little while.") + '</p>' +
        '<button id="maintRetry" type="button" style="border:0;border-radius:12px;padding:12px 26px;font-size:15px;font-weight:700;color:#fff;background:#4f6df5">Check again</button></div>';
      var b = document.getElementById("maintRetry");
      if (b) b.onclick = function () { b.textContent = "Checking..."; check(true); };
    } else if (box) {
      box.remove(); box = null; document.documentElement.style.overflow = "";
    }
  }
  function check(manual) {
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch(URL_ + "?t=" + Date.now(), ctl ? { signal: ctl.signal, cache: "no-store" } : { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        clearTimeout(to);
        cur = { enabled: !!(j && (j.enabled === true || j.enabled === "true")), reason: (j && j.reason) || "" };
        try { localStorage.setItem("sk_maint", JSON.stringify(cur)); } catch (e) {}
        paint();
        if (manual && cur.enabled) { var b = document.getElementById("maintRetry"); if (b) b.textContent = "Check again"; }
      })
      .catch(function () { clearTimeout(to); if (manual) { var b = document.getElementById("maintRetry"); if (b) b.textContent = "Check again"; } });
  }
  function start() { paint(); check(); setInterval(function () { if (!document.hidden) check(); }, 45000); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) check(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
