const $ = id => document.getElementById(id);
let quiz = [];
let stopRequested = false;

function setStatus(text){ $("status").textContent = text; }

function validateQuestion(q){
  if(!q || typeof q.question !== "string" || !q.question.trim()) return "Question missing";
  if(!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 10) return "Options must be 2–10";
  if(q.options.some(x => typeof x !== "string" || !x.trim())) return "Empty option";
  if(!Number.isInteger(q.correctOption)) return "correctOption missing";
  if(q.correctOption < 0 || q.correctOption >= q.options.length) return "correctOption out of range";
  if(q.question.length > 300) return "Question > 300 chars";
  if(q.options.some(x => x.length > 100)) return "Option > 100 chars";
  return null;
}

function normalize(data){
  if(Array.isArray(data)) return {title:"Imported Quiz",questions:data};
  if(data && Array.isArray(data.questions)) return data;
  throw new Error("JSON must contain a questions array.");
}

function render(){
  const term = $("search").value.toLowerCase();
  const list = quiz.map((q,i)=>({...q,_i:i})).filter(q=>
    !term || q.question.toLowerCase().includes(term)
  );
  $("total").textContent = quiz.length;
  $("valid").textContent = quiz.filter(q=>!validateQuestion(q)).length;
  $("invalid").textContent = quiz.filter(q=>validateQuestion(q)).length;
  $("start").disabled = quiz.length===0 || quiz.some(q=>validateQuestion(q));
  $("preview").classList.toggle("empty", quiz.length===0);
  if(!quiz.length){$("preview").textContent="JSON upload करने के बाद preview यहाँ आएगा.";return;}
  $("preview").innerHTML = list.map(q=>{
    const err = validateQuestion(q);
    return `<div class="q ${err?'bad':''}">
      <div class="qhead"><span>Q${q._i+1}</span><span>${err||"VALID"}</span></div>
      <div class="qtext">${escapeHtml(q.question)}</div>
      ${q.options.map((o,i)=>`<div class="opt ${i===q.correctOption?'correct':''}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</div>`).join("")}
    </div>`;
  }).join("");
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function log(text, ok=true){
  const d=document.createElement("div");
  d.className="logLine "+(ok?"ok":"err");
  d.textContent = text;
  $("log").prepend(d);
}

$("jsonFile").addEventListener("change", async e=>{
  const file=e.target.files[0];
  if(!file)return;
  try{
    const data=normalize(JSON.parse(await file.text()));
    quiz=data.questions;
    $("fileMeta").textContent=`${file.name} • ${quiz.length} questions • ${data.title||"Untitled"}`;
    setStatus("JSON loaded");
    render();
  }catch(err){
    quiz=[];
    $("fileMeta").textContent="Invalid JSON: "+err.message;
    setStatus("JSON error");
    render();
  }
});

$("drop").addEventListener("dragover",e=>{e.preventDefault();$("drop").classList.add("drag")});
$("drop").addEventListener("dragleave",()=>$("drop").classList.remove("drag"));
$("drop").addEventListener("drop",e=>{
  e.preventDefault(); $("drop").classList.remove("drag");
  const f=e.dataTransfer.files[0];
  if(f){$("jsonFile").files=e.dataTransfer.files;$("jsonFile").dispatchEvent(new Event("change"))}
});

$("search").addEventListener("input",render);
$("clearLog").onclick=()=>$("log").innerHTML="";

$("saveSettings").onclick=()=>{
  localStorage.setItem("quizSettings",JSON.stringify({
    chatId:$("chatId").value,
    delayMs:$("delayMs").value,
    isAnonymous:$("isAnonymous").value,
    protectContent:$("protectContent").checked
  }));
  setStatus("Settings saved");
};

(function loadSettings(){
  try{
    const s=JSON.parse(localStorage.getItem("quizSettings")||"{}");
    if(s.chatId) $("chatId").value=s.chatId;
    if(s.delayMs) $("delayMs").value=s.delayMs;
    if(s.isAnonymous) $("isAnonymous").value=s.isAnonymous;
    if(typeof s.protectContent==="boolean") $("protectContent").checked=s.protectContent;
  }catch{}
})();

$("downloadTemplate").onclick=()=>{
  const sample={
    title:"My Telegram Quiz",
    questions:[
      {
        question:"Example question?",
        options:["Option A","Option B","Option C","Option D"],
        correctOption:0,
        explanation:"Optional explanation"
      }
    ]
  };
  const blob=new Blob([JSON.stringify(sample,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="quiz-template.json";
  a.click();
  URL.revokeObjectURL(a.href);
};

$("stop").onclick=()=>{
  stopRequested=true;
  setStatus("Stopping…");
  log("Stop requested. Current Telegram request will finish.",true);
};

$("start").onclick=async()=>{
  if(!quiz.length || quiz.some(q=>validateQuestion(q))) return;
  const token=$("botToken").value.trim();
  const chatId=$("chatId").value.trim();
  if(!token){alert("Bot Token भरें.");return}
  if(!chatId){alert("Group/Chat ID भरें.");return}

  stopRequested=false;
  $("start").disabled=true;
  $("stop").disabled=false;
  setStatus("Publishing…");
  log(`Publishing ${quiz.length} quiz polls to ${chatId}…`,true);

  // Send one question at a time so the server can respect Telegram limits and retry_after.
  // The current server endpoint receives the whole validated list.
  // A stop button cannot cancel a request already sent to the server.
  try{
    const r=await fetch("/api/send-quiz",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        botToken:token,
        chatId,
        questions:quiz,
        delayMs:Number($("delayMs").value)||1500,
        isAnonymous:$("isAnonymous").value==="true",
        protectContent:$("protectContent").checked
      })
    });
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"Server error");
    data.results.forEach(x=>{
      log(x.ok?`Q${x.index}: SENT (message ${x.message_id})`:`Q${x.index}: FAILED — ${x.error}`,x.ok);
    });
    setStatus(`Done: ${data.sent}/${data.total} sent`);
  }catch(err){
    setStatus("Publish error");
    log(err.message||"Publish error",false);
  }finally{
    $("start").disabled=false;
    $("stop").disabled=true;
    $("botToken").value="";
  }
};

render();