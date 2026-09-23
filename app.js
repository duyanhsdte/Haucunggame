const CARDS=[
 {id:"care",icon:"❤️",name:"Quan tâm",desc:"Chăm sóc cảm xúc"},
 {id:"persuade",icon:"🗣️",name:"Thuyết phục",desc:"Lý lẽ & giao tiếp"},
 {id:"gift",icon:"🎁",name:"Tặng quà",desc:"Trao vật phẩm"},
 {id:"pressure",icon:"⚔️",name:"Uy áp",desc:"Thể hiện quyền lực"},
 {id:"free",icon:"🃏",name:"Tùy cơ",desc:"Hành động bất ngờ"}
];

const state={
 turn:1, selected:null,
 stats:{affection:42,trust:36,respect:51,intimacy:28,curiosity:64},
 tags:["Điềm tĩnh","Quan sát","Đang tò mò"],
 history:[],
 aiHistory:[]
};

const cardGrid=document.querySelector("#cardGrid");
const chatLog=document.querySelector("#chatLog");
const analysis=document.querySelector("#analysis");
const stats=document.querySelector("#stats");
const stateTags=document.querySelector("#stateTags");
const history=document.querySelector("#history");
const turnLabel=document.querySelector("#turnLabel");
const selectedCard=document.querySelector("#selectedCard");

function renderCards(){
 cardGrid.innerHTML=CARDS.map(c=>`<button class="action-card ${state.selected===c.id?"active":""}" data-id="${c.id}"><span class="icon">${c.icon}</span><strong>${c.name}</strong><span>${c.desc}</span></button>`).join("");
 cardGrid.querySelectorAll(".action-card").forEach(btn=>btn.onclick=()=>{
   state.selected=btn.dataset.id; renderCards();
   const c=CARDS.find(x=>x.id===state.selected); selectedCard.textContent=`Đã chọn: ${c.icon} ${c.name}`;
 });
}

function renderStats(){
 const labels={affection:"Thiện cảm",trust:"Tin tưởng",respect:"Tôn trọng",intimacy:"Thân mật",curiosity:"Tò mò"};
 stats.innerHTML=Object.entries(labels).map(([key,label])=>`<div class="stat"><div class="stat-row"><span>${label}</span><b>${state.stats[key]}</b></div><div class="bar"><div class="fill" style="width:${state.stats[key]}%"></div></div></div>`).join("");
 stateTags.innerHTML=state.tags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("");
}

function addMessage(type,speaker,text){
 const el=document.createElement("div"); el.className=`message ${type}`;
 el.innerHTML=`<div class="speaker">${speaker}</div><div>${escapeHtml(text)}</div>`;
 chatLog.appendChild(el); chatLog.scrollTop=chatLog.scrollHeight;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

function getApiKey(){
 const saved=localStorage.getItem("gemini_api_key");
 return saved || (typeof GEMINI_API_KEY!=="undefined" ? GEMINI_API_KEY : "");
}

function fallbackAnalyze(text,card){
 const lower=text.toLowerCase();
 const d={affection:0,trust:0,respect:0,intimacy:0,curiosity:0};
 let note="Mộ Dung Yên đang quan sát cách bệ hạ hành động.";
 if(card==="care"){d.affection=6;d.trust=5;d.intimacy=2;note="Nàng cảm nhận được sự quan tâm thật lòng."}
 if(card==="persuade"){d.respect=5;d.trust=2;d.curiosity=2;note="Lý lẽ rõ ràng làm nàng đánh giá cao năng lực đối thoại."}
 if(card==="gift"){d.affection=5;d.respect=1;note="Nàng vui vì được nhớ tới."}
 if(card==="pressure"){d.respect=5;d.trust=-4;d.affection=-2;note="Uy quyền tạo sức nặng nhưng có thể khiến nàng giữ khoảng cách."}
 if(card==="free"){d.curiosity=6;d.affection=2;note="Hành động khó đoán khiến nàng tò mò."}
 if(/xin lỗi|thật lòng|tin nàng|tin tưởng/.test(lower)) d.trust+=4;
 if(/cảm ơn|quan tâm|nghỉ|mệt|ăn|ngủ/.test(lower)) d.affection+=3;
 if(/mệnh lệnh|im đi|phải làm|cấm/.test(lower)){d.trust-=3;d.respect+=2;}
 return {d,note,intent:card==="care"?"Quan tâm / chăm sóc":card==="gift"?"Trao giá trị / tạo thiện cảm":card==="pressure"?"Thể hiện quyền lực":card==="persuade"?"Tác động bằng lý lẽ":"Thăm dò / tùy cơ",reply:"Mộ Dung Yên suy nghĩ một lúc rồi đáp lại, vẫn giữ vẻ bình tĩnh thường ngày.",event:null};
}

async function analyzeWithGemini(text,card){
 const key=getApiKey();
 if(!key) throw new Error("NO_API_KEY");
 const cardInfo=CARDS.find(x=>x.id===card);
 const recent=state.aiHistory.slice(-8);
 const prompt=`
Người chơi đang nhập vai một vị hoàng đế trong game hậu cung lịch sử giả tưởng.
NPC hiện tại: Mộ Dung Yên.
Tính cách: điềm tĩnh, lý trí, quan sát sắc bén, kín đáo, có lòng tự trọng; thích văn thư, calligraphy, sách vở và muốn có giá trị riêng ngoài gia đình.
Bối cảnh hiện tại: một cuộc trò chuyện riêng trong cung.

Thẻ hành động: ${cardInfo.name} — ${cardInfo.desc}
Hành động/lời nói của người chơi:
${text}

Chỉ số hiện tại của NPC:
${JSON.stringify(state.stats)}

Trạng thái:
${JSON.stringify(state.tags)}

Lịch sử gần đây:
${JSON.stringify(recent)}

Hãy đóng vai người quản trò. Phân tích ý định và tác động của hành động đối với NPC. Kết quả phải hợp lý với tính cách, lịch sử và bối cảnh; không cộng điểm vô lý. Cho phép điểm âm. Không tự ý kết thúc câu chuyện.
`;
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,{
   method:"POST",
   headers:{"Content-Type":"application/json","x-goog-api-key":key},
   body:JSON.stringify({
     systemInstruction:{parts:[{text:"Bạn là AI Game Master cho game Hậu Cung. Trả về JSON đúng schema, ngắn gọn, bằng tiếng Việt. NPC phải nhất quán và có cảm xúc tự nhiên."}]},
     contents:[{role:"user",parts:[{text:prompt}]}],
     generationConfig:{
       temperature:0.9,
       responseMimeType:"application/json",
       responseSchema:{
         type:"OBJECT",
         properties:{
           affection_delta:{type:"INTEGER"},
           trust_delta:{type:"INTEGER"},
           respect_delta:{type:"INTEGER"},
           intimacy_delta:{type:"INTEGER"},
           curiosity_delta:{type:"INTEGER"},
           intent:{type:"STRING"},
           note:{type:"STRING"},
           reply:{type:"STRING"},
           event:{type:"STRING"}
         },
         required:["affection_delta","trust_delta","respect_delta","intimacy_delta","curiosity_delta","intent","note","reply","event"]
       }
     }
   })
 });
 if(!response.ok){
   const body=await response.text();
   throw new Error(`Gemini ${response.status}: ${body.slice(0,300)}`);
 }
 const data=await response.json();
 const raw=data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"";
 if(!raw) throw new Error("Gemini returned empty response");
 const parsed=JSON.parse(raw);
 return {
   d:{
     affection:Number(parsed.affection_delta)||0,
     trust:Number(parsed.trust_delta)||0,
     respect:Number(parsed.respect_delta)||0,
     intimacy:Number(parsed.intimacy_delta)||0,
     curiosity:Number(parsed.curiosity_delta)||0
   },
   intent:parsed.intent||"Hành động có chủ đích",
   note:parsed.note||"",
   reply:parsed.reply||"Mộ Dung Yên im lặng suy nghĩ.",
   event:parsed.event||null
 };
}

function applyResult(result){
 Object.entries(result.d).forEach(([k,v])=>state.stats[k]=Math.max(0,Math.min(100,state.stats[k]+v)));
 if(state.stats.trust>=45&&!state.tags.includes("Tin tưởng tăng"))state.tags.push("Tin tưởng tăng");
 if(state.stats.affection>=50&&!state.tags.includes("Thiện cảm tăng"))state.tags.push("Thiện cảm tăng");
 if(state.stats.intimacy>=40&&!state.tags.includes("Quan hệ tiến triển"))state.tags.push("Quan hệ tiến triển");
 renderStats();
}

function renderAnalysis(result,card){
 const c=CARDS.find(x=>x.id===card);
 const labels={affection:"Thiện cảm",trust:"Tin tưởng",respect:"Tôn trọng",intimacy:"Thân mật",curiosity:"Tò mò"};
 const rows=Object.entries(result.d).filter(([,v])=>v).map(([k,v])=>`<div class="delta"><span>${labels[k]}</span><b class="${v>0?"plus":"minus"}">${v>0?"+":""}${v}</b></div>`).join("");
 analysis.classList.remove("empty");
 analysis.innerHTML=`<div class="result-title">${c.icon} ${c.name}</div><div><b>Ý định:</b> ${escapeHtml(result.intent)}</div><div style="margin-top:10px"><b>Hiệu ứng</b>${rows||"<div class='analysis-note'>Không có chỉ số thay đổi.</div>"}</div><div class="analysis-note">${escapeHtml(result.note)}</div>${result.event?`<div class="analysis-note"><b>🌙 Event:</b> ${escapeHtml(result.event)}</div>`:""}`;
}

async function submitAction(text,card){
 addMessage("player","Bệ hạ",text);
 analysis.classList.remove("empty");
 analysis.innerHTML="<div class='result-title'>🤖 AI đang phân tích...</div><div class='analysis-note'>Đang xem xét lời nói, thẻ hành động, chỉ số và lịch sử của Mộ Dung Yên.</div>";
 let result;
 let mode="AI";
 try{
   result=await analyzeWithGemini(text,card);
 }catch(err){
   if(err.message==="NO_API_KEY"){
     const entered=prompt("Dán Gemini API key để bật AI thật cho bản local test:");
     if(entered?.trim()){
       localStorage.setItem("gemini_api_key",entered.trim());
       result=await analyzeWithGemini(text,card);
     }else{
       result=fallbackAnalyze(text,card); mode="Fallback";
     }
   }else{
     console.error(err);
     result=fallbackAnalyze(text,card); mode="Fallback";
     result.note += " AI thật không phản hồi nên game tạm dùng bộ phân tích local.";
   }
 }
 addMessage("npc","Mộ Dung Yên",result.reply);
 applyResult(result);
 renderAnalysis(result,card);
 state.history.unshift({turn:state.turn,card:CARDS.find(x=>x.id===card).name,text});
 state.aiHistory.push({role:"player",card,text,result});
 history.innerHTML=state.history.slice(0,8).map(h=>`<div class="history-item"><b>Lượt ${h.turn} · ${escapeHtml(h.card)}</b><br>${escapeHtml(h.text)}</div>`).join("");
 state.turn++; turnLabel.textContent=`Lượt ${state.turn}`;
 state.selected=null; selectedCard.textContent="Chưa chọn thẻ";
 document.querySelector("#actionInput").value="";
 renderCards();
 localStorage.setItem("haucung_state",JSON.stringify(state));
 if(mode==="Fallback") console.warn("Gemini unavailable; fallback used.");
}

document.querySelector("#actionForm").onsubmit=async e=>{
 e.preventDefault();
 const input=document.querySelector("#actionInput");
 const text=input.value.trim();
 if(!text||!state.selected)return;
 const card=state.selected;
 await submitAction(text,card);
};

document.querySelector("#resetBtn").onclick=()=>{
 localStorage.removeItem("haucung_state");
 localStorage.removeItem("gemini_api_key");
 location.reload();
};

const saved=localStorage.getItem("haucung_state");
if(saved){try{Object.assign(state,JSON.parse(saved));}catch{}}
renderCards();renderStats();
addMessage("npc","Mộ Dung Yên","Bệ hạ muốn nói chuyện với thiếp về chuyện gì?");
