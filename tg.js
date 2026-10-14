/* SK Education — Telegram Mini App (WebApp) integration.
   Safe to load everywhere: outside Telegram it only defines openExternal() and haptic(). */
(function () {
  var ctx = false;
  try { ctx = /tgWebApp/.test(location.hash + location.search) || !!sessionStorage.getItem("sk_tg"); } catch (e) {}
  window.haptic = function () {};
  window.TG = null; window.IN_TG = false;

  window.openExternal = function (url) {
    var TG = window.TG;
    if (window.IN_TG && TG) {
      try {
        if (/^https?:\/\/(t\.me|telegram\.me)\//i.test(url) && TG.openTelegramLink) return TG.openTelegramLink(url);
        if (TG.openLink) return TG.openLink(url);
      } catch (e) {}
    }
    window.open(url, "_blank", "noopener");
  };
  window.tgSyncColors = function () {};

  var booted = false;
  function boot() {
    if (booted) return;
    var TG = window.Telegram && window.Telegram.WebApp;
    if (!TG) return;
    booted = true;
    window.TG = TG;
    // initData can be empty for some launch modes: still tell Telegram we are ready (else its spinner never stops)
    window.IN_TG = !!(TG.initData || (TG.platform && TG.platform !== "unknown"));
    try { TG.ready(); } catch (e) {}
    if (!window.IN_TG) return;
    run(TG);
  }
  // Telegram script is loaded on demand (only inside Telegram) and never blocks the page
  if (window.Telegram && window.Telegram.WebApp) boot();
  else if (ctx) {
    var s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-web-app.js";
    s.onload = boot; s.onerror = function () {};
    document.head.appendChild(s);
  }

  function run(TG) {

  try { sessionStorage.setItem("sk_tg", "1"); } catch (e) {}
  var root = document.documentElement;
  root.classList.add("tg");
  if (TG.platform) root.classList.add("tg-" + TG.platform); // tg-ios / tg-android / tg-tdesktop / tg-weba

  // One Mini App, two panels: t.me/<bot>/<app>?startapp=admin opens the admin panel.
  var sp = (TG.initDataUnsafe && TG.initDataUnsafe.start_param) || "";
  if (sp === "admin" && !/control\.html$/.test(location.pathname) && !sessionStorage.getItem("tg_start_done")) {
    sessionStorage.setItem("tg_start_done", "1");
    location.replace("control.html");
    return;
  }

  try { TG.ready(); TG.expand(); if (TG.disableVerticalSwipes) TG.disableVerticalSwipes(); } catch (e) {}

  // Real visible height (keyboard / bottom sheet aware) -> --vh used by .app in style.css
  function setVh() {
    var h = TG.viewportStableHeight || TG.viewportHeight || window.innerHeight;
    root.style.setProperty("--vh", h + "px");
  }
  setVh();
  try { TG.onEvent("viewportChanged", function (e) { if (!e || e.isStateStable) setVh(); }); } catch (e) {}

  // Header / background / bottom bar follow the app theme so there is no colour seam.
  window.tgSyncColors = function () {
    try {
      var cs = getComputedStyle(root);
      var s = (cs.getPropertyValue("--surface") || "").trim(), b = (cs.getPropertyValue("--bg") || "").trim();
      if (/^#/.test(s) && TG.setHeaderColor) TG.setHeaderColor(s);
      if (/^#/.test(b) && TG.setBackgroundColor) TG.setBackgroundColor(b);
      if (/^#/.test(s) && TG.setBottomBarColor) TG.setBottomBarColor(s);
    } catch (e) {}
  };

  // Native haptics on taps
  window.haptic = function (kind) {
    try {
      var H = TG.HapticFeedback; if (!H) return;
      if (kind === "ok" || kind === "error" || kind === "warning") H.notificationOccurred(kind === "ok" ? "success" : kind);
      else H.selectionChanged();
    } catch (e) {}
  };
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("button,a,.nav-item,.feature,.course-card")) window.haptic();
  }, { passive: true });

  function afterDom() {
    setTimeout(window.tgSyncColors, 0);
    // Telegram's own Back button replaces the in-page back arrow on inner pages
    var isRoot = /(\/|index\.html|login\.html|signup\.html|control\.html)$/.test(location.pathname);
    if (TG.BackButton) {
      if (isRoot) TG.BackButton.hide();
      else {
        TG.BackButton.show();
        TG.BackButton.onClick(function () { if (history.length > 1) history.back(); else location.href = "index.html"; });
      }
    }
    if (!isRoot) root.classList.add("tg-inner");
    try { if (window.themeInit && !localStorage.getItem("sk_theme")) themeInit(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", afterDom); else afterDom();

  // Links that open in a new tab must go through Telegram's own browser.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[target=_blank]");
    if (a && a.href) { e.preventDefault(); window.openExternal(a.href); }
  });
  }
})();
