const $=id=>document.getElementById(id);
let quiz=[];

function setStatus(s){$("status").textContent=s}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

window.addEventListener("error",e=>{
 const a=JSON.parse(localStorage.getItem("quizRuntimeErrors")||"[]");
 a.push({time:new Date().toISOString(),message:e.message||"Unknown error",stack:e.error?.stack||""});
 localStorage.setItem("quizRuntimeErrors",JSON.stringify(a.slice(-20)));
});

function cleanJsonText(raw){
 let s=String(raw||"").replace(/^\uFEFF/,"").trim();
 // Accept accidental Markdown fences too.
 if(s.startsWith("```")) s=s.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
 return s;
}

function parseQuizJson(raw){
 const s=cleanJsonText(raw);
 if(!s) throw new Error("JSON file is empty.");
 let data;
 try{data=JSON.parse(s)}
 catch(e){
   const m=String(e.message).match(/position\s+(\d+)/i);
   const pos=m?Number(m[1]):-1;
   const context=pos>=0?s.slice(Math.max(0,pos-45),Math.min(s.length,pos+45)):s.slice(0,150);
   throw new Error(`${e.message}${pos>=0?` | Around position ${pos}: ${JSON.stringify(context)}`:""}`);
 }
 if(Array.isArray(data)) data={title:"Imported Quiz",questions:data};
 if(!data||!Array.isArray(data.questions)) throw new Error("JSON में 'questions' array नहीं मिला.");
 return data;
}

function validate(q){
 if(!q||typeof q.question!=="string"||!q.question.trim()) return "Question missing";
 if(q.question.length>300) return "Question > 300 characters";
 if(!Array.isArray(q.options)||q.options.length<2||q.options.length>10) return "Options must be 2–10";
 if(q.options.some(x=>typeof x!=="string"||!x.trim())) return "Empty option";
 if(q.options.some(x=>x.length>100)) return "Option > 100 characters";
 if(!Number.isInteger(q.correctOption)) return "correctOption must be a number";
 if(q.correctOption<0||q.correctOption>=q.options.length) return "correctOption out of range";
 return null;
}

function render(){
 const term=$("search").value.toLowerCase();
 $("total").textContent=quiz.length;
 const good=quiz.filter(q=>!validate(q)).length;
 $("valid").textContent=good;$("invalid").textContent=quiz.length-good;
 $("start").disabled=!quiz.length||good!==quiz.length;
 const list=quiz.map((q,i)=>({...q,_i:i})).filter(q=>!term||q.question.toLowerCase().includes(term));
 $("preview").innerHTML=list.length?list.map(q=>{
   const err=validate(q);
   return `<div class="q ${err?"bad":""}"><div class="qhead"><span>Q${q._i+1}</span><span>${escapeHtml(err||"VALID")}</span></div>
   <div class="qtext">${escapeHtml(q.question)}</div>
   ${q.options.map((o,i)=>`<div class="opt ${i===q.correctOption?"correct":""}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</div>`).join("")}</div>`;
 }).join(""):"<div class='empty'>No matching question.</div>";
}

async function loadFile(file){
 if(!file)return;
 try{
   if(!/\.json$/i.test(file.name)) throw new Error("Only .json files are allowed.");
   const raw=await file.text();
   const data=parseQuizJson(raw);
   quiz=data.questions;
   $("fileMeta").textContent=`${file.name} • ${quiz.length} questions`;
   setStatus("JSON valid");
   render();
 }catch(e){
   quiz=[];render();setStatus("JSON error");
   $("fileMeta").textContent="❌ "+e.message;
   location.hash="json-error";
   alert("JSON Error:\\n\\n"+e.message+"\\n\\nDetailed error: error.html");
 }
}

$("jsonFile").onchange=e=>loadFile(e.target.files[0]);
$("drop").ondragover=e=>{e.preventDefault();$("drop").classList.add("drag")};
$("drop").ondragleave=()=>$("drop").classList.remove("drag");
$("drop").ondrop=e=>{e.preventDefault();$("drop").classList.remove("drag");loadFile(e.dataTransfer.files[0])};
$("search").oninput=render;
$("clearLog").onclick=()=>$("log").innerHTML="";

$("saveSettings").onclick=()=>{
 localStorage.setItem("quizSettings",JSON.stringify({
  chatId:$("chatId").value,delayMs:$("delayMs").value,
  isAnonymous:$("isAnonymous").value,protectContent:$("protectContent").checked
 }));
 setStatus("Settings saved");
};

try{
 const s=JSON.parse(localStorage.getItem("quizSettings")||"{}");
 if(s.chatId)$("chatId").value=s.chatId;
 if(s.delayMs)$("delayMs").value=s.delayMs;
 if(s.isAnonymous)$("isAnonymous").value=s.isAnonymous;
 if(typeof s.protectContent==="boolean")$("protectContent").checked=s.protectContent;
}catch{}

$("downloadTemplate").onclick=()=>{
 const sample={title:"My Telegram Quiz",questions:[{question:"Test question?",options:["Option A","Option B","Option C","Option D"],correctOption:0,explanation:"Optional"}]};
 const b=new Blob([JSON.stringify(sample,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="quiz-template.json";a.click();URL.revokeObjectURL(a.href);
};

$("stop").onclick=()=>setStatus("Stop requested (current server request cannot be cancelled)");

$("start").onclick=async()=>{
 const token=$("botToken").value.trim(),chatId=$("chatId").value.trim();
 if(!token)return alert("Bot Token भरें.");
 if(!chatId)return alert("Group/Chat ID भरें.");
 if(!quiz.length||quiz.some(validate))return alert("पहले सभी questions valid करें.");
 $("start").disabled=true;$("stop").disabled=false;setStatus("Publishing...");
 try{
  const r=await fetch("/api/send-quiz",{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({botToken,chatId,questions:quiz,delayMs:Number($("delayMs").value)||1500,isAnonymous:$("isAnonymous").value==="true",protectContent:$("protectContent").checked})});
  const data=await r.json();
  if(!r.ok)throw new Error(data.error||"Server error");
  data.results.forEach(x=>{
   const d=document.createElement("div");d.className="logLine "+(x.ok?"ok":"err");
   d.textContent=x.ok?`Q${x.index}: SENT • message ${x.message_id}`:`Q${x.index}: FAILED • ${x.error}`;
   $("log").prepend(d);
  });
  setStatus(`Done ${data.sent}/${data.total}`);
 }catch(e){setStatus("Publish error");alert("Publish error:\\n"+e.message)}
 finally{$("start").disabled=false;$("stop").disabled=true;$("botToken").value=""}
};

render();