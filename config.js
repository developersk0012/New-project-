/* SK Education configuration (v2.3 — database shift)
   MAIN database  (db)     : educationqpp  -> courses, PDFs, users, accounts, chat, banners,
                                              ratings, enrollments, settings, Mod APKs / Websites
   TEST SERIES    (testDb) : testing-5ce76 -> ONLY testSeries, testMeta, testQs, testBoard,
                                              tsUsers, testReports
   The old simaji-ff970 database is no longer used anywhere.
*/

// Watchdog: agar Firebase SDK hi (gstatic.com se) load na ho paye — slow/blocked
// network, ad-blocker, school/office firewall — to pehle pura app silently
// "Loading..." pe hi atka reh jaata tha, kuch error nazar nahi aata tha.
// Ye check sabse pehle register hota hai, config.js ke baaki hisse fail
// hone par bhi ye chalta rahega, aur user ko ek saaf message dikhayega.
(function () {
  setTimeout(function () {
    if (typeof firebase === "undefined") {
      var b = document.createElement("div");
      b.setAttribute(
        "style",
        "position:fixed;left:10px;right:10px;bottom:14px;max-width:480px;margin:0 auto;" +
        "background:#1c2136;color:#fff;padding:14px 16px;border-radius:12px;font:600 13px/1.5 system-ui,sans-serif;" +
        "z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.4)"
      );
      b.innerHTML =
        "⚠️ The site could not load (could not connect to Firebase). " +
        "Check your internet connection, or turn off any VPN, ad-blocker or firewall and try again." +
        '<br><button type="button" style="margin-top:8px;border:0;border-radius:8px;padding:8px 14px;font-weight:700;background:#5b6cf0;color:#fff" onclick="location.reload()">🔄 Reload</button>';
      document.body.appendChild(b);
    }
  }, 6000);
})();

const firebaseConfig = {
  apiKey: "AIzaSyAbmbpaNMYqsJ5QxFrW2553EOK5lGjanJA",
  authDomain: "educationqpp.firebaseapp.com",
  databaseURL: "https://educationqpp-default-rtdb.firebaseio.com",
  projectId: "educationqpp",
  storageBucket: "educationqpp.firebasestorage.app",
  messagingSenderId: "758854659988",
  appId: "1:758854659988:web:30f11a045d666b07f2e981",
  measurementId: "G-KM7VG3ZPWY"
};

const testFirebaseConfig = {
  apiKey: "AIzaSyBJA-6ulrkajXAQZCNvR06_Lr-l9GxYPM8",
  authDomain: "testing-5ce76.firebaseapp.com",
  databaseURL: "https://testing-5ce76-default-rtdb.firebaseio.com",
  projectId: "testing-5ce76",
  storageBucket: "testing-5ce76.firebasestorage.app",
  messagingSenderId: "236048523039",
  appId: "1:236048523039:android:2b77e9729a8fe975f75a2a"
};

// db     = main database (educationqpp): everything except the test series.
// testDb = test-series database (testing-5ce76): testSeries / testMeta / testQs /
//          testBoard / tsUsers / testReports only.

// Firebase SDK missing (blocked/slow network)? Fail soft: db / testDb stay null instead of crashing every page.
let db = null, testDb = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  testDb = firebase.initializeApp(testFirebaseConfig, "testWeb").database(); // test series only
} catch (e) { console.warn("Firebase init failed:", e); }

const APP_LOGO = "icons/icon-192.png";
const LOGO_SM = "icons/logo-96.png";
const INSTAGRAM_URL = "https://www.instagram.com/x2r_satendra_kushwaha/";
const TELEGRAM_URL = "https://t.me/Unknownboy01112";
const WHATSAPP_NUMBER = "919153417231";
const WHATSAPP_TEXT = "HELLO SIR";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb8HmPi8V0tqX1Ojz61U";
const TELEGRAM_GROUP = "https://t.me/disha_online_classes_free_pdf";

const DEFAULT_BATCHES = {
  "1": {name:"Khazana Batch",access:"free",icon:"🏆",image:"https://i.ibb.co/7tJkXSRJ/IMG-20260820-221756-560.jpg",description:"Morning Batch - Complete Study Material"},
  "2": {name:"Disha Online Classes",access:"free",icon:"🌟",image:"https://i.ibb.co/pBGDQq8m/1771220242-10th-batch.webp",description:"Evening Batch - Expert Guidance"},
  "3": {name:"Target Board",access:"free",icon:"🎯",image:"https://i.ibb.co/KcDw1wwN/IMG-20260820-222646-987.jpg",description:"Weekend Batch - Board Exam Preparation"}
};

const CATEGORIES = {science:"Science",math:"Mathematics",hindi:"Hindi",sanskrit:"Sanskrit",sst:"Social Studies"};
const CATEGORY_ICONS = {science:"🔬",math:"📐",hindi:"📝",sanskrit:"🕉️",sst:"🌍"};

const TELEGRAM_GROUP_10 = TELEGRAM_GROUP;
function getCategory(){ return "10"; }
function setCategory(){ /* Class 12th removed — only 10th is available now */ }
function categoryLabel(){ return "10th"; }
// Courses/PDFs ab main database (educationqpp / db) se aate hain.
function coursesDb(){ return db; }

function withTimeout(promise, ms=8000){
  return Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error("Database request timed out")),ms))
  ]);
}

function getUserId(){
  let id=localStorage.getItem("sk_user_id");
  if(!id){
    id=(crypto.randomUUID?crypto.randomUUID():"uid_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    localStorage.setItem("sk_user_id",id);
  }
  return id;
}
function getUserName(){ return localStorage.getItem("sk_user_name")||""; }
function getUserLoginId(){ return localStorage.getItem("sk_login_id")||""; }
const SESSION_DAYS=30;
function setSession(loginId,name){
  localStorage.setItem("sk_login_id",loginId);
  localStorage.setItem("sk_user_name",name||loginId);
  localStorage.setItem("sk_logged_in","1");
  localStorage.setItem("sk_login_at",String(Date.now()));
}
function logoutSession(){
  ["sk_logged_in","sk_login_id","sk_user_name","sk_password_hash","sk_login_at"].forEach(k=>localStorage.removeItem(k));
  sessionStorage.removeItem("sk_admin");sessionStorage.removeItem("sk_admin_token");sessionStorage.removeItem("sk_admin_exp");
}
function isLoggedIn(){
  if(localStorage.getItem("sk_logged_in")!=="1"||!getUserName())return false;
  const at=+localStorage.getItem("sk_login_at")||0;
  if(!at){localStorage.setItem("sk_login_at",String(Date.now()));return true} // old sessions: start the 30-day clock now
  if(Date.now()-at>SESSION_DAYS*864e5){logoutSession();return false}
  return true;
}

/* ---------- password security ---------- */
// New accounts: salted PBKDF2-SHA256 (per-user random salt). Old SHA-256 accounts still log in and are upgraded automatically.
const PW_ITER=120000;
const b64e=buf=>btoa(String.fromCharCode(...new Uint8Array(buf)));
async function pbkdf2(pw,saltB64,iter){
  const salt=Uint8Array.from(atob(saltB64),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveBits"]);
  return b64e(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:iter},key,256));
}
async function makePasswordRecord(pw){
  const salt=b64e(crypto.getRandomValues(new Uint8Array(16)));
  return {passwordHash:await pbkdf2(pw,salt,PW_ITER),salt,iter:PW_ITER,algo:"pbkdf2-sha256"};
}
function safeEq(a,b){a=String(a||"");b=String(b||"");let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
async function checkPassword(pw,acc){
  if(acc&&acc.algo==="pbkdf2-sha256"&&acc.salt)return{ok:safeEq(await pbkdf2(pw,acc.salt,acc.iter||PW_ITER),acc.passwordHash),legacy:false};
  return{ok:safeEq(await hashPassword(pw),acc&&acc.passwordHash),legacy:true};
}
const COMMON_PW=["123456","1234567","12345678","123456789","password","qwerty","111111","000000","abc123","iloveyou","123123","password1","skeducation"];
/* User ID: anything is allowed (letters, digits, symbols, any language) except spaces. 4-24 characters. */
function idIssue(id){
  id=String(id==null?"":id);
  if(!id)return"Enter a User ID.";
  if(/\s/.test(id))return"User ID cannot contain spaces.";
  if(/[\u0000-\u001f\u007f]/.test(id))return"User ID contains an invalid character.";
  var n=[...id].length;
  if(n<4||n>24)return"User ID must be 4-24 characters.";
  return"";
}
function passwordIssue(pw,id,name){
  if(pw.length<6)return"Password must be at least 6 characters.";
  if(COMMON_PW.includes(pw.toLowerCase()))return"This password is too common. Choose another one.";
  if(pw.toLowerCase()===String(id).toLowerCase()||pw.toLowerCase()===String(name).toLowerCase())return"Password must not be the same as your name or ID.";
  if(!/[A-Za-z]/.test(pw)||!/\d/.test(pw))return"Password must contain both letters and numbers.";
  return"";
}
function passwordStrength(pw){let n=0;if(pw.length>=6)n++;if(pw.length>=10)n++;if(/[A-Z]/.test(pw)&&/[a-z]/.test(pw))n++;if(/\d/.test(pw))n++;if(/[^A-Za-z0-9]/.test(pw))n++;return Math.min(4,Math.max(pw?1:0,n-1))}

/* Login lockout (this device): 5 wrong tries on one ID, or 12 on the device -> wait, doubling each time */
function lockGet(n){try{return JSON.parse(localStorage.getItem("sk_lk_"+n)||"{}")}catch(e){return{}}}
function lockLeft(names){let m=0;names.forEach(n=>{const s=lockGet(n);if(s.until>Date.now())m=Math.max(m,s.until-Date.now())});return Math.ceil(m/1000)}
function lockFail(n,limit){
  const s=lockGet(n),now=Date.now();
  if(s.t&&now-s.t>3600e3){s.c=0;s.k=0}
  s.c=(s.c||0)+1;s.t=now;
  if(s.c>=limit){s.k=(s.k||0)+1;s.c=0;s.until=now+Math.min(30*60e3,30e3*Math.pow(2,s.k))}
  try{localStorage.setItem("sk_lk_"+n,JSON.stringify(s))}catch(e){}
}
function lockClear(n){localStorage.removeItem("sk_lk_"+n)}
function fmtWait(sec){return sec>=60?Math.ceil(sec/60)+" minute":sec+" second"}

/* only http(s) links are ever opened / embedded (blocks javascript:, data:, etc.) */
function safeUrl(u){
  try{u=String(u||"").trim();if(u&&!/^[a-z][a-z0-9+.-]*:/i.test(u))u="https://"+u;const x=new URL(u);return(x.protocol==="https:"||x.protocol==="http:")?x.href:""}catch(e){return""}
}
function hostOf(u){try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return""}}

async function hashPassword(pw){
  const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(pw));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function accountKey(userId){
  return String(userId||"").trim().toLowerCase().replace(/[.#$/\[\]\s]/g,"_");
}
function accountsRef(userId){ return db.ref("accounts/"+accountKey(userId)); }

function esc(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function toast(msg,type="ok"){
  let el=document.getElementById("toast");
  if(!el){el=document.createElement("div");el.id="toast";document.body.appendChild(el)}
  el.className="toast "+type;el.textContent=msg;el.classList.add("show");
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2800);
}
async function apiPost(url,body){
  try{
    const r=await fetch(url,{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); // keepalive: page redirect ke baad bhi request poori hoti hai
    if(!r.ok) throw new Error("API "+r.status);
    return await r.json();
  }catch(e){console.warn("API unavailable:",e);return {ok:false}}
}
// Signup/login fail hone par user ko asli wajah (slow network / permission) batane ke liye
function authFailMsg(err){
  const m=String(err&&err.message||err||"")+" "+String(err&&err.code||"");
  if(/timed out/i.test(m))return "⏳ The network or server is slow. Please try again in a little while.";
  if(/permission[_ ]denied/i.test(m))return "🔒 The server did not allow this. Ask the admin to create an ID and password for you.";
  if(!navigator.onLine)return "📵 No internet. Check your connection.";
  return "";
}
function notifyTelegram(type,payload){return apiPost("/api/telegram",{type,...payload});}
function isImageUrl(url){return /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(url||"")||/ibb\.co|imgbb\.com/i.test(url||"");}

function skYmd(d){const z=n=>String(n).padStart(2,"0");d=d||new Date();return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate())}
async function registerUser(force){
  // Marks the user as "seen". Throttled: at most once per 10 min per device (and always once per new day).
  const today=skYmd(),last=+localStorage.getItem("sk_reg_t")||0,dayDone=localStorage.getItem("sk_day")===today;
  if(!force&&dayDone&&Date.now()-last<600000)return;
  if(!db)return;
  localStorage.setItem("sk_reg_t",String(Date.now())); // set first so parallel calls don't double write
  try{
    const uid=getUserId(),name=getUserName(),loginId=getUserLoginId(),now=new Date().toISOString();
    const ref=db.ref("users/"+uid),upd={name,loginId,lastSeen:now};
    upd["days/"+today]=1; // daily activity log used by Admin > Daily Activity
    if(localStorage.getItem("sk_first_done")!=="1"){
      const old=(await withTimeout(ref.once("value"))).val()||{};
      upd.userId=uid;upd.firstSeen=old.firstSeen||now;upd.blocked=old.blocked===true;
      await withTimeout(ref.update(upd));
      localStorage.setItem("sk_first_done","1");
    }else await withTimeout(ref.update(upd));
    localStorage.setItem("sk_day",today);
  }catch(e){localStorage.removeItem("sk_reg_t");throw e}
}
async function isBlocked(){
  const uid=getUserId();
  const [a,b]=await Promise.all([
    withTimeout(db.ref("users/"+uid+"/blocked").once("value")),
    withTimeout(db.ref("blocked_users/"+uid).once("value"))
  ]);
  return a.val()===true||b.val()===true;
}
function watchBlocked(){
  const uid=getUserId();
  ["users/"+uid+"/blocked","blocked_users/"+uid].forEach(path=>{
    db.ref(path).on("value",s=>{
      if(s.val()===true){
        logoutSession();
        alert("🚫 The admin has blocked your account.");
        location.href="signup.html";
      }
    });
  });
}
function loadBatches(onUpdate){
  // Cache first (instant), fresh data in background. onUpdate(data) fires only if data changed.
  return SKData.batches(function(d,fromCache){ window.BATCHES=d; if(!fromCache&&onUpdate)onUpdate(d); })
    .then(function(d){window.BATCHES=d;return d})
    .catch(function(err){console.warn("Courses unavailable, using defaults:",err);window.BATCHES=DEFAULT_BATCHES;return DEFAULT_BATCHES});
}
function loadMaintenance(){return withTimeout(db.ref("settings/maintenance").once("value")).then(s=>s.val()||{enabled:false}).catch(()=>({enabled:false}));}
function saveEnrollment(batchId,batch,kind){
  const uid=getUserId(),now=new Date().toISOString(),cat=getCategory()||"10";
  return withTimeout(db.ref(`enrollments/${uid}/${cat}_${batchId}`).set({batchId,category:cat,name:batch.name,icon:batch.icon,image:batch.image,type:kind||"enroll",status:"enrolled",createdAt:now}));
}
function shareUrl(){return withTimeout(db.ref("settings/domain").once("value")).then(s=>s.val()||location.origin).catch(()=>location.origin);}

function themeInit(){
  const t=localStorage.getItem("sk_theme")||(window.TG&&window.TG.colorScheme)||"dark";
  document.documentElement.dataset.theme=t;
}
function toggleTheme(){
  const t=document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=t;
  localStorage.setItem("sk_theme",t);
  updateThemeButtons();
  if(window.tgSyncColors)window.tgSyncColors();
}
function updateThemeButtons(){
  document.querySelectorAll(".sk-theme-toggle").forEach(b=>{
    const light=document.documentElement.dataset.theme==="light";
    if(typeof icon==="function")b.innerHTML=icon(light?"moon":"sun",19);else b.textContent=light?"🌙":"☀️";
    b.title=light?"Dark mode":"Light mode";
    b.setAttribute("aria-label",b.title);
  });
}
document.addEventListener("DOMContentLoaded",themeInit);

/* Chat helpers shared by admin + user pages */
function isoMax(a,b){return (a||"")>(b||"")?a:b}
async function refreshChatMeta(chatRef){
  // After a message is deleted, keep the chat-list preview (last_message etc.) in sync.
  const snap=await chatRef.child("messages").once("value"),ms=Object.values(snap.val()||{});
  if(!ms.length)return chatRef.update({last_message:null,last_sender:null,last_timestamp:null});
  ms.sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp)));
  const l=ms[ms.length-1];
  return chatRef.update({last_message:l.text||"Photo",last_sender:l.sender,last_timestamp:l.timestamp});
}
function timeAgoShort(iso){
  if(!iso)return "";
  const d=new Date(iso),now=new Date(),sec=(now-d)/1000;
  if(d.toDateString()===now.toDateString())return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  if(sec<172800)return "Yesterday";
  return d.toLocaleDateString([],{day:"numeric",month:"short"});
}

/* ---------- v1.4 helpers ---------- */
// Run non-critical work after the page has painted (keeps first load fast)
function idle(fn,timeout){ if(window.requestIdleCallback)requestIdleCallback(fn,{timeout:timeout||2500}); else setTimeout(fn,600); }
// Enrollment cache: My Courses paints instantly, then refreshes from the database
function getEnrCache(){ try{return JSON.parse(localStorage.getItem("sk_enr_"+getUserId())||"null")}catch(e){return null} }
function setEnrCache(v){ try{localStorage.setItem("sk_enr_"+getUserId(),JSON.stringify(v||{}))}catch(e){} }
function loadEnrollments(onData){
  const c=getEnrCache(); if(c&&onData)onData(c,true);
  return withTimeout(db.ref("enrollments/"+getUserId()).once("value"),9000).then(s=>{const v=s.val()||{};setEnrCache(v);if(onData)onData(v,false);return v});
}
const _saveEnrollment=saveEnrollment;
saveEnrollment=function(batchId,batch,kind){
  return _saveEnrollment(batchId,batch,kind).then(r=>{
    const c=getEnrCache()||{},cat=getCategory()||"10";
    c[cat+"_"+batchId]={batchId,category:cat,name:batch.name,icon:batch.icon,image:batch.image,type:kind||"enroll",status:"enrolled"};
    setEnrCache(c);return r;
  });
};
function stateHtml(title,text,btn){ return `<div class="state"><b>${esc(title)}</b>${esc(text||"")}${btn||""}</div>`; }
function retryBtn(){
  const why=(window.SKData&&SKData.lastError)?'<br><small style="opacity:.6;font-size:10.5px;word-break:break-all">'+esc(String(SKData.lastError).slice(0,160))+'</small>':"";
  return why+'<br><button type="button" class="primary" onclick="try{SKData.clear()}catch(e){}location.reload()">Try again</button>';
}
const SKELS={
  list:n=>'<div class="skel-list">'+'<div class="skel"></div>'.repeat(n||4)+'</div>',
  grid:n=>'<div class="skel-grid">'+'<div class="skel"></div>'.repeat(n||6)+'</div>',
  row:()=>'<div class="skel-row"><div class="skel"></div><div class="skel"></div></div>'
};

/* ---------- v1.5: course thumbnails, subject content kinds, shared course card ---------- */
window.THUMBS = {};
// Thumbnail = admin override (Admin > Courses) first, else the course's own image, else logo.
function thumbOf(id,b){ return (window.THUMBS&&THUMBS[id])||(b&&b.image)||APP_LOGO; }
function loadThumbs(onUpdate){
  return SKData.thumbs(function(d){window.THUMBS=d||{};if(onUpdate)onUpdate()})
    .then(function(d){window.THUMBS=d||{};return d}).catch(function(){return {}});
}
// PDF / Video / DPP. Material type "dpp" is used if present; otherwise a title containing "DPP" counts as DPP.
const KINDS={pdf:{label:"PDF",ico:"📄",btn:"⬇ Open PDF"},video:{label:"Video",ico:"🎥",btn:"▶ Watch"},dpp:{label:"DPP",ico:"📝",btn:"📝 Open DPP"}};
function matKind(x){
  const t=String(x&&x.t||"").toLowerCase();
  if(t==="dpp")return "dpp";
  if(t==="video")return "video";
  if(/\bdpp\b/i.test(String(x&&x.ti||"")))return "dpp";
  return "pdf";
}
function thumbHtml(id,b,eager){
  return `<div class="thumb"><img src="${esc(thumbOf(id,b))}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" alt="" onerror="this.onerror=null;this.src='${APP_LOGO}';this.classList.add('fb')"></div>`;
}
// One course card used by All Courses + My Courses. en = enrolled?
function courseCard(id,b,en,i){
  const href="batch.html?batch="+encodeURIComponent(id);
  return `<article class="ccard${en?" is-enr":""}">${thumbHtml(id,b,i<2)}${en?'<span class="enr-badge">✓ Enrolled</span>':""}<div class="cbody"><h3>${esc(b.icon||"📚")} ${esc(b.name||"Course")}</h3><p>${esc(b.description||"Study material")}</p><div class="actions-row"><a class="primary" href="${href}">${en?"Continue":"Open"}</a>${en?"":`<button type="button" class="secondary" data-enroll="${esc(id)}">Enroll</button>`}</div></div></article>`;
}
