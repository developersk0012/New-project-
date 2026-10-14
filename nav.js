/* SK Education — shared UI helpers (icons, nav, drawer, install, admin-message popup) */
const ICONS={
 home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 book:'<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
 chat:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z"/>',
 user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
 users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 chart:'<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
 trash:'<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
 send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
 star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
 back:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
 enrolled:'<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/>',
 broadcast:'<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
 reply:'<path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
 copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
 camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
 plane:'<path d="m22 3-9.5 18-2.5-8-8-2.5z"/><path d="M22 3 10 13"/>',
 message:'<path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-5 4V5a1 1 0 0 1 1-1z"/>',
 android:'<path d="M5 16V9h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M8 5 6.5 3M16 5l1.5-2"/><path d="M7 9a5 5 0 0 1 10 0"/><path d="M9 21v-3M15 21v-3"/>',
 download:'<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
 external:'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 shield:'<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 pin:'<path d="M12 17v5"/><path d="M8 3h8l-1 6 3 4H6l3-4z"/>',
 eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A17 17 0 0 0 2 12s3.6 6 10 6a9.7 9.7 0 0 0 4-.9"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
 test:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v3H9z"/><path d="m9 13 2 2 4-4"/>',
 trophy:'<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 flag:'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
function icon(n,s){s=s||20;return `<svg class="svg-ico" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||""}</svg>`}

function nav(page){location.href=page}
function openDrawer(){document.getElementById("drawerBack")?.classList.add("open")}
function closeDrawer(){document.getElementById("drawerBack")?.classList.remove("open")}
function doLogout(){
  try{logoutSession()}finally{location.replace("signup.html")}
}
function openSocial(url){openExternal(url)}
async function openShare(){
  const url=await shareUrl();
  if(navigator.share&&!window.IN_TG){try{await navigator.share({title:"SK Education",text:"SK Education - Free Education Material",url})}catch(e){}}
  else{try{await navigator.clipboard?.writeText(url)}catch(e){}toast("Website link copied")}
}
function setupInstall(){
  if(window.IN_TG)return; // Telegram Mini App: no PWA install banner
  let deferred=null,b=document.getElementById("installBanner"),btn=document.getElementById("installBtn"),x=document.getElementById("installClose");
  if(!b||window.matchMedia("(display-mode:standalone)").matches||navigator.standalone===true)return;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;if(localStorage.getItem("sk_install_dismissed")!=="1")b.style.display="flex"});
  window.addEventListener("appinstalled",()=>{b.style.display="none";deferred=null;localStorage.removeItem("sk_install_dismissed")});
  btn?.addEventListener("click",async()=>{
    if(deferred){deferred.prompt();const choice=await deferred.userChoice.catch(()=>null);deferred=null;if(choice?.outcome==="accepted")b.style.display="none"}
    else alert("Android Chrome: ⋮ menu → Install app / Add to Home screen.\niPhone Safari: Share ➜ Add to Home Screen.");
  });
  x?.addEventListener("click",()=>{b.style.display="none";localStorage.setItem("sk_install_dismissed","1")});
}
function registerServiceWorker(){
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(err=>console.warn("SW registration failed:",err)));
}
registerServiceWorker();
function requireLogin(){if(!isLoggedIn()){location.replace("signup.html");return false}return true}
function requireApp(){return requireLogin()}
function openSheet(id){document.getElementById(id)?.classList.add("open")}
function closeSheet(id){document.getElementById(id)?.classList.remove("open")}
function openSocialMenu(){openSocial(INSTAGRAM_URL)}
/* ---- Error capture v2: JS errors, promise rejections, failed scripts/CSS, failed /api calls, breadcrumbs, auto-heal ---- */
const _origFetch=window.fetch.bind(window);
let _unloading=false;
["pagehide","beforeunload"].forEach(ev=>window.addEventListener(ev,()=>{_unloading=true}));
const _crumbs=[];
function crumb(t){_crumbs.push(new Date().toTimeString().slice(0,8)+" "+String(t).slice(0,90));if(_crumbs.length>12)_crumbs.shift()}
crumb("open "+location.pathname+location.search);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("button,a,[onclick]");if(b)crumb("tap "+(b.id||(b.textContent||"").trim().replace(/\s+/g," ").slice(0,28)||b.tagName))},true);
(function(){const ce=console.error;console.error=function(){try{crumb("console.error "+[].map.call(arguments,x=>x&&x.message||x).join(" "))}catch(e){}return ce.apply(console,arguments)}})();
window.fetch=function(i,o){
  const u=typeof i==="string"?i:(i&&i.url)||"",api=/\/api\//.test(u)&&!/report-error/.test(u);
  return _origFetch(i,o).then(r=>{
    if(api){crumb("api "+r.status+" "+u.replace(location.origin,"").split("?")[0]);if(r.status>=500)saveWebsiteError(new Error("API "+r.status+" "+u.split("?")[0]),"api","fetch")}
    return r;
  },e=>{
    if(api&&navigator.onLine&&!_unloading&&document.visibilityState!=="hidden")saveWebsiteError(new Error("Network error: "+u.split("?")[0]+" ("+(e&&e.message)+")"),"api","fetch");
    throw e;
  });
};
const _TG_IGNORE=/ResizeObserver loop|^Script error\.?(\s|$)|Non-Error promise rejection|AbortError|chrome-extension|moz-extension|safari-extension/i;
let _tgSent=0,_tgBusy=false;
/* a stale cached script after a deploy -> clear caches and reload once, automatically */
function selfHeal(msg,src){
  try{
    if(!/is not a function|is not defined|is not a constructor|Unexpected token|Unexpected identifier/i.test(msg))return false;
    if(src&&src.indexOf(location.origin)!==0&&!/^[^:]*\.(js|html)/.test(src))return false;
    if(sessionStorage.getItem("sk_healed"))return false;
    sessionStorage.setItem("sk_healed","1");crumb("auto-heal: cache cleared, reloading");
    setTimeout(async()=>{try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch(e){}location.reload()},900);
    return true;
  }catch(e){return false}
}
function reportErrorToTelegram(item,force){
  try{
    if(_tgBusy||/error-handler\.html$/.test(location.pathname)&&!force)return;
    if(!force&&(_tgSent>=8||_TG_IGNORE.test(item.message+" "+item.source)))return;
    const sig=(item.message+"|"+item.source).slice(0,180),key="sk_err_sent",now=Date.now();
    const seen=JSON.parse(localStorage.getItem(key)||"{}");
    if(!force&&seen[sig]&&now-seen[sig]<30*60e3)return;   // same error: once per 30 min
    seen[sig]=now;Object.keys(seen).forEach(k=>{if(now-seen[k]>6*3600e3)delete seen[k]});
    localStorage.setItem(key,JSON.stringify(seen));
    _tgSent++;_tgBusy=true;
    const who=(typeof getUserName==="function"&&getUserName())||"Guest";
    return _origFetch("/api/report-error",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({
      type:force?"test":"error",kind:item.type,code:item.code,count:item.count,userName:who,
      page:location.pathname+location.search,message:item.message,stack:item.stack,source:item.source,
      device:navigator.userAgent,online:navigator.onLine,viewport:innerWidth+"x"+innerHeight,
      ver:(window.SKData&&SKData.VER)||"",crumbs:item.crumbs,
      inTelegram:!!(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initData)
    })}).then(r=>r.json()).catch(()=>({ok:false})).finally(()=>{_tgBusy=false});
  }catch(e){_tgBusy=false}
}
function saveWebsiteError(error,type="error",source=""){
  try{
    const key="sk_website_errors",list=JSON.parse(localStorage.getItem(key)||"[]");
    const item={message:String(error?.message||error||"Unknown error").slice(0,500),stack:String(error?.stack||"").slice(0,1500),type,code:error&&error.code?String(error.code):"",time:new Date().toISOString(),source:source||location.href,page:location.pathname+location.search,crumbs:_crumbs.slice(),count:1};
    const i=list.findIndex(x=>x.message===item.message&&x.source===item.source);
    if(i>-1){item.count=(list[i].count||1)+1;if(Date.now()-new Date(list[i].time).getTime()<3000)return;list.splice(i,1)}
    list.push(item);localStorage.setItem(key,JSON.stringify(list.slice(-100)));
    if(!selfHeal(item.message,item.source))reportErrorToTelegram(item);else reportErrorToTelegram(item);
  }catch(e){}
}
let _errToastAt=0;
function showErrorToast(){
  if(/(error-handler)\.html$/.test(location.pathname)||Date.now()-_errToastAt<15000)return;
  _errToastAt=Date.now();
  try{toast("Something went wrong. Please reload the page.","error")}catch(e){}
}
window.addEventListener("error",e=>{
  const t=e.target;
  if(t&&t!==window&&t.tagName){ // failed <script> / <link rel=stylesheet>
    if(/telegram\.org\/js\//.test(t.src||""))return; // Telegram ka apna script (blocked/slow network) — site ka error nahi
    if(t.tagName==="SCRIPT"||(t.tagName==="LINK"&&/stylesheet/.test(t.rel)))saveWebsiteError(new Error("File failed to load: "+(t.src||t.href)),"resource",t.tagName);
    return;
  }
  saveWebsiteError(e.error||e.message,"javascript",e.filename?`${e.filename}:${e.lineno}:${e.colno}`:"window");
  if(e.filename)showErrorToast();
},true);
window.addEventListener("unhandledrejection",e=>{saveWebsiteError(e.reason,"promise","unhandledrejection");showErrorToast()});
window.sendTestError=()=>reportErrorToTelegram({message:"Test alert from Error Handler page",stack:"",type:"test",source:"error-handler.html",count:1,crumbs:_crumbs.slice()},true);

/* ---- Replace emoji glyphs in shared chrome with SVG icons ---- */
function enhanceUI(){
  const navMap={"HOME":"home","MY COURSES":"book","TEST SERIES":"test","CHAT":"chat","PROFILE":"user"};
  document.querySelectorAll(".bottom-nav .nav-item").forEach(b=>{
    const label=(b.lastChild?.textContent||"").trim().toUpperCase(),n=navMap[label],s=b.querySelector("span");
    if(n&&s){s.innerHTML=icon(n,22);if(n==="chat"&&!b.querySelector(".nav-badge"))s.insertAdjacentHTML("beforeend",'<i class="nav-badge" id="navChatBadge" hidden></i>')}
  });
  const btnMap={"←":"back","☰":"menu","🏠":"home"};
  document.querySelectorAll(".icon-btn").forEach(b=>{const n=btnMap[b.textContent.trim()];if(n)b.innerHTML=icon(n,19)});
  document.querySelectorAll("[data-icon]").forEach(e=>{e.innerHTML=icon(e.dataset.icon,+e.dataset.size||18)});
  updateThemeButtons();
}

/* ---- "Admin ne SMS bheja" popup + unread badge (runs on every user page except chat) ---- */
function hideAdminPopup(){document.getElementById("adminMsgModal")?.remove()}
function showAdminPopup(text,ts){
  if(document.getElementById("adminMsgModal"))return;
  const m=document.createElement("div");m.className="modal-back open pop";m.id="adminMsgModal";
  m.innerHTML=`<div class="pop-card" role="dialog" aria-modal="true" style="--p1:#8B5CF6;--p2:#EC4899"><div class="pop-hero"><button type="button" class="pop-x" id="msgX" aria-label="Close">&#10005;</button><div class="pop-ico">${icon("bell",34)}</div></div><div class="pop-body"><h3>The admin sent you a message</h3><p>${esc(String(text).slice(0,140))}</p></div><div class="pop-actions"><button type="button" class="pop-go" id="msgOpen">${icon("chat",18)} Chat kholein</button><button type="button" class="pop-no" id="msgIgnore">Ignore</button></div></div>`;
  document.body.appendChild(m);
  const ign=()=>{try{localStorage.setItem("sk_msg_ignored",ts)}catch(e){}hideAdminPopup()};
  document.getElementById("msgIgnore").onclick=ign;document.getElementById("msgX").onclick=ign;
  m.addEventListener("click",e=>{if(e.target===m)ign()});
  document.getElementById("msgOpen").onclick=()=>nav("chat.html");
}
function initAdminMsgPopup(){
  let tdb=null;try{tdb=testDb}catch(e){}
  if(!tdb||!isLoggedIn()||/(chat|login|signup|ss)\.html$/.test(location.pathname))return;
  const base=tdb.ref("chats/"+getUserId()),st={};let t=null;
  const recompute=()=>{
    const unread=st.last_sender==="admin"&&!!st.last_timestamp&&(!st.user_read_until||st.last_timestamp>st.user_read_until);
    const b=document.getElementById("navChatBadge");if(b)b.hidden=!unread;
    if(!unread){hideAdminPopup();return}
    if(localStorage.getItem("sk_msg_ignored")===st.last_timestamp)return;
    showAdminPopup(st.last_message||"",st.last_timestamp);
  };
  ["last_sender","last_message","last_timestamp","user_read_until"].forEach(k=>base.child(k).on("value",s=>{st[k]=s.val();clearTimeout(t);t=setTimeout(recompute,400)}));
}
document.addEventListener("DOMContentLoaded",()=>{themeInit();enhanceUI();try{initAdminMsgPopup()}catch(e){console.warn("msg popup",e)}});

/* ---- v2.2: styled dialogs (sheet on phones, centered card on desktop) ----
   skDialog({kind:"danger|warn|info|success", title, text, chips:[{n,label,tone}], ok, cancel, hideCancel}) -> Promise<boolean> */
const DLG_ICON={danger:"trash",warn:"flag",info:"check",success:"check",leave:"logout"};
function skDialog(o){
  o=o||{};
  return new Promise(res=>{
    const kind=o.kind||"info",m=document.createElement("div");
    m.className="modal-back open dlg";
    const chips=(o.chips||[]).map(c=>`<div class="dlg-chip ${c.tone||""}"><b>${esc(c.n)}</b><small>${esc(c.label)}</small></div>`).join("");
    m.innerHTML=`<div class="dlg-card ${kind}" role="alertdialog" aria-modal="true" aria-labelledby="dlgT"><div class="dlg-ico">${icon(o.icon||DLG_ICON[kind]||"check",26)}</div><h3 id="dlgT">${esc(o.title||"")}</h3>${o.text?`<p class="dlg-text">${esc(o.text)}</p>`:""}${chips?`<div class="dlg-chips">${chips}</div>`:""}${o.note?`<div class="dlg-note">${esc(o.note)}</div>`:""}<div class="dlg-actions">${o.hideCancel?"":`<button type="button" class="dlg-no" data-r="0">${esc(o.cancel||"Cancel")}</button>`}<button type="button" class="dlg-yes" data-r="1">${esc(o.ok||"OK")}</button></div></div>`;
    const done=v=>{document.removeEventListener("keydown",key);m.classList.add("out");setTimeout(()=>m.remove(),160);res(v)};
    const key=e=>{if(e.key==="Escape")done(false)};
    m.addEventListener("click",e=>{const b=e.target.closest("button[data-r]");if(b)done(b.dataset.r==="1");else if(e.target===m&&!o.locked)done(false)});
    document.addEventListener("keydown",key);
    document.body.appendChild(m);
    const y=m.querySelector(".dlg-yes");if(y)setTimeout(()=>y.focus({preventScroll:true}),30);
  });
}
function askConfirm(title,text,okLabel,opts){
  return skDialog(Object.assign({kind:"danger",title,text,ok:okLabel||"Delete",cancel:"Cancel"},opts||{}));
}

/* ---- v2.2: Telegram join popup (home: respects the quiet period; profile: opts.force shows it on every open) ---- */
function skJoinPopup(opts){
  opts=opts||{};
  const K="sk_join",DEF={enabled:true,url:"https://t.me/disha_online_classes_12",title:"Join us on Telegram",text:"Join our Telegram channel for free PDFs, notes and the latest updates."};
  let st={};try{st=JSON.parse(localStorage.getItem(K)||"{}")}catch(e){}
  const quiet=st.a==="join"?30*864e5:st.a==="ignore"?864e5:0;
  if(!opts.force&&quiet&&Date.now()-st.t<quiet)return;
  const show=cfg=>{
    cfg=Object.assign({},DEF,cfg||{});const url=safeUrl(cfg.url);
    if(cfg.enabled===false||!url||document.getElementById("joinModal"))return;
    const m=document.createElement("div");m.className="modal-back open pop";m.id="joinModal";
    m.innerHTML=`<div class="pop-card" role="dialog" aria-modal="true" style="--p1:#2AABEE;--p2:#1D6FE0"><div class="pop-hero"><button type="button" class="pop-x" id="joinX" aria-label="Close">&#10005;</button><div class="pop-ico">${icon("plane",34)}</div></div><div class="pop-body"><h3>${esc(cfg.title||DEF.title)}</h3><p>${esc(cfg.text||DEF.text)}</p></div><div class="pop-actions"><button type="button" class="pop-go" id="joinYes">${icon("plane",18)} Join Telegram</button><button type="button" class="pop-no" id="joinNo">Not now</button></div></div>`;
    const done=a=>{try{localStorage.setItem(K,JSON.stringify({a,t:Date.now()}))}catch(e){}m.remove()};
    m.addEventListener("click",e=>{if(e.target===m)done("ignore")});
    document.body.appendChild(m);
    document.getElementById("joinNo").onclick=()=>done("ignore");document.getElementById("joinX").onclick=()=>done("ignore");
    document.getElementById("joinYes").onclick=()=>{done("join");openExternal(url)};
  };
  let fired=false;const go=c=>{if(!fired){fired=true;show(c)}};
  SKData.joinPopup(c=>go(c)).then(go).catch(()=>go(null));
  setTimeout(()=>go(null),2500);
}

/* ---- v1.4: offline notice + accessible labels ---- */
(function(){
  function bar(){
    let b=document.getElementById("offlineBar");
    if(!b){b=document.createElement("div");b.id="offlineBar";b.className="offline-bar";b.textContent="No internet — showing saved data";document.body.appendChild(b)}
    return b;
  }
  function sync(){bar().classList.toggle("show",navigator.onLine===false)}
  window.addEventListener("online",sync);window.addEventListener("offline",sync);
  document.addEventListener("DOMContentLoaded",()=>{
    sync();
    document.querySelectorAll(".nav-item").forEach(b=>{if(!b.getAttribute("aria-label"))b.setAttribute("aria-label",(b.lastChild?.textContent||"").trim())});
    document.querySelectorAll(".icon-btn:not([aria-label])").forEach(b=>b.setAttribute("aria-label",b.querySelector("svg")?"Button":"Button"));
  });
})();

/* ---- daily visit marker: every logged-in user page counts the user as "came today" (throttled, runs after first paint) ---- */
document.addEventListener("DOMContentLoaded",()=>{
  try{ if(isLoggedIn()&&!/(ss|login|signup|error-handler)\.html$/.test(location.pathname)) idle(()=>registerUser().catch(()=>{}),2500); }catch(e){}
});
