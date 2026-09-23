const CARDS=[
{id:"care",icon:"❤️",name:"Quan tâm",desc:"Chăm sóc cảm xúc"},
{id:"persuade",icon:"🗣️",name:"Thuyết phục",desc:"Lý lẽ & giao tiếp"},
{id:"gift",icon:"🎁",name:"Tặng quà",desc:"Trao vật phẩm"},
{id:"pressure",icon:"⚔️",name:"Uy áp",desc:"Thể hiện quyền lực"},
{id:"free",icon:"🃏",name:"Tùy cơ",desc:"Hành động bất ngờ"}
];

const RANKS=[
{id:"tunu",name:"Tú nữ",level:1,desc:"Phẩm vị khởi đầu"},
{id:"my_nhan",name:"Mỹ nhân",level:2,desc:"Được ban tước"},
{id:"tai_nhan",name:"Tài nhân",level:3,desc:"Địa vị cao hơn"},
{id:"tan",name:"Tần",level:4,desc:"Một bậc có danh vị"},
{id:"phi",name:"Phi",level:5,desc:"Địa vị quản lý cao"},
{id:"quy_phi",name:"Quý phi",level:6,desc:"Tước vị cực cao"},
{id:"hoang_quy_phi",name:"Hoàng quý phi",level:7,desc:"Chỉ dưới Hoàng hậu"},
{id:"hoang_hau",name:"Hoàng hậu",level:8,desc:"Chính cung"}
];

const DEFAULT_STATS={affection:42,trust:36,respect:51,intimacy:28,curiosity:64};
const DEFAULT_TAGS=["Điềm tĩnh","Quan sát","Đang tò mò"];
const state={activeCharacterId:null,characters:{}};

function makeCharacterState(character){
 return {rank:character.rank||"Tú nữ",stats:{...DEFAULT_STATS},tags:[...DEFAULT_TAGS],history:[],aiHistory:[],chat:[],turn:1,selected:null};
}
function getCharState(id){if(!state.characters[id])state.characters[id]=makeCharacterState(CHARACTER_DATABASE[id]);return state.characters[id]}
function activeCharacter(){return state.activeCharacterId?CHARACTER_DATABASE[state.activeCharacterId]:null}
function activeState(){return getCharState(state.activeCharacterId)}
function rankLevel(name){const r=RANKS.find(x=>x.name===name);return r?r.level:1}
function isOfficial(c){return c.rank!=="Tú nữ"||/trợ lý|đứng đầu|Phi,|quản lý|dạy .* tại Nữ Học Đường/i.test(c.role||"")}
function initials(name){return [...name.replace(/\s/g,"")].slice(0,2).join("")}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]})}
function saveState(){localStorage.setItem("haucung_state",JSON.stringify(state))}

const characterSelect=document.querySelector("#characterSelect");
const characterGrid=document.querySelector("#characterGrid");
const gameView=document.querySelector("#gameView");
const portrait=document.querySelector("#portrait");
const characterName=document.querySelector("#characterName");
const characterMeta=document.querySelector("#characterMeta");
const currentRank=document.querySelector("#currentRank");
const statusBadge=document.querySelector("#statusBadge");
const cardGrid=document.querySelector("#cardGrid");
const chatLog=document.querySelector("#chatLog");
const analysis=document.querySelector("#analysis");
const stats=document.querySelector("#stats");
const stateTags=document.querySelector("#stateTags");
const history=document.querySelector("#history");
const turnLabel=document.querySelector("#turnLabel");
const selectedCard=document.querySelector("#selectedCard");
const rankModal=document.querySelector("#rankModal");
const rankOptions=document.querySelector("#rankOptions");

function renderCharacterSelect(){
 characterGrid.innerHTML=CHARACTER_ROSTER.map(function(c,i){
  const official=isOfficial(c);
  return '<button class="character-card '+(official?"official":"")+'" data-id="'+c.id+'">'+
   '<span class="card-seal">印</span><div class="card-avatar">'+escapeHtml(initials(c.name))+'</div>'+
   '<h3 class="card-name">'+escapeHtml(c.name)+'</h3>'+
   '<span class="card-rank">'+escapeHtml(getCharState(c.id).rank)+'</span>'+
   '<div class="card-core">'+escapeHtml(c.core)+'</div>'+
   '<div class="card-role">'+escapeHtml(c.role||"Chưa giữ chức vụ đặc biệt.")+'</div>'+
   '<span class="card-number">#'+String(i+1).padStart(2,"0")+'</span></button>';
 }).join("");
 characterGrid.querySelectorAll(".character-card").forEach(function(btn){btn.onclick=function(){openCharacter(btn.dataset.id)}});
}

function openCharacter(id){
 state.activeCharacterId=id;
 const c=activeCharacter(),s=activeState();
 characterSelect.classList.add("hidden");gameView.classList.remove("hidden");
 renderCharacter();renderChat();renderHistory();renderCards();renderStats();
 if(!s.chat.length){addChat("npc",c.name,initialGreeting(c));saveState()}
}
function initialGreeting(c){
 if(c.id==="chu_mong_dao")return "Bệ hạ hôm nay muốn bàn chuyện hậu cung, hay lại định tự mình ôm hết mọi việc?";
 if(c.id==="tran_nhuoc_lan")return "Bệ hạ tới rồi. Hôm nay người muốn nghe chuyện trong cung, hay chỉ muốn nói chuyện một lát?";
 if(c.id==="bach_tu_yen")return "Bệ hạ muốn luyện cung, hay lại muốn thử xem hôm nay ai bắn chuẩn hơn?";
 if(c.id==="vuong_tu_anh")return "Bệ hạ có chuyện gì cứ nói thẳng. Đừng vòng vo.";
 return c.name+" khẽ hành lễ. Bệ hạ muốn nói chuyện với thiếp về chuyện gì?";
}
function renderCharacter(){
 const c=activeCharacter(),s=activeState();
 portrait.textContent=initials(c.name).slice(0,1);
 characterName.textContent=c.name;
 characterMeta.textContent=(c.family?c.family+" · ":"")+(c.role||c.core);
 currentRank.textContent=s.rank;
 statusBadge.textContent=isOfficial(c)?"Đang giữ chức":"Đang trò chuyện";
}
function addChat(type,speaker,text,persist){
 const el=document.createElement("div");el.className="message "+type;
 el.innerHTML='<div class="speaker">'+escapeHtml(speaker)+'</div><div>'+escapeHtml(text)+'</div>';
 chatLog.appendChild(el);chatLog.scrollTop=chatLog.scrollHeight;
 if(persist!==false)activeState().chat.push({type:type,speaker:speaker,text:text});
}
function renderChat(){
 chatLog.innerHTML="";
 activeState().chat.slice(-30).forEach(function(m){addChat(m.type,m.speaker,m.text,false)});
 chatLog.scrollTop=chatLog.scrollHeight;
}
function renderCards(){
 const s=activeState();
 cardGrid.innerHTML=CARDS.map(function(c){return '<button class="action-card '+(s.selected===c.id?"active":"")+'" data-id="'+c.id+'"><span class="icon">'+c.icon+'</span><strong>'+c.name+'</strong><span>'+c.desc+'</span></button>'}).join("");
 cardGrid.querySelectorAll(".action-card").forEach(function(btn){btn.onclick=function(){
   activeState().selected=btn.dataset.id;renderCards();
   const c=CARDS.find(function(x){return x.id===activeState().selected});
   selectedCard.textContent="Đã chọn: "+c.icon+" "+c.name;
 }});
}
function renderStats(){
 const s=activeState(),labels={affection:"Thiện cảm",trust:"Tin tưởng",respect:"Tôn trọng",intimacy:"Thân mật",curiosity:"Tò mò"};
 stats.innerHTML=Object.entries(labels).map(function(entry){
  const key=entry[0],label=entry[1],v=s.stats[key];
  return '<div class="stat"><div class="stat-row"><span>'+label+'</span><b>'+v+'</b></div><div class="bar"><div class="fill" style="width:'+v+'%"></div></div></div>';
 }).join("");
 stateTags.innerHTML=s.tags.map(function(t){return '<span class="tag">'+escapeHtml(t)+'</span>'}).join("");
}
function renderHistory(){
 history.innerHTML=activeState().history.slice(0,10).map(function(h){return '<div class="history-item"><b>Lượt '+h.turn+" · "+escapeHtml(h.card)+'</b><br>'+escapeHtml(h.text)+'</div>'}).join("");
 turnLabel.textContent="Lượt "+activeState().turn;
}
function getApiKey(){
 const saved=localStorage.getItem("gemini_api_key");
 return saved||(typeof GEMINI_API_KEY!=="undefined"?GEMINI_API_KEY:"");
}
function fallbackAnalyze(text,card){
 const lower=text.toLowerCase(),d={affection:0,trust:0,respect:0,intimacy:0,curiosity:0},c=activeCharacter();
 let note=c.name+" đang quan sát cách bệ hạ hành động.";
 if(card==="care"){d.affection=6;d.trust=5;d.intimacy=2;note="Nàng cảm nhận được sự quan tâm thật lòng."}
 if(card==="persuade"){d.respect=5;d.trust=2;d.curiosity=2;note="Lý lẽ rõ ràng làm nàng đánh giá cao năng lực đối thoại."}
 if(card==="gift"){d.affection=5;d.respect=1;note="Nàng vui vì được nhớ tới."}
 if(card==="pressure"){d.respect=5;d.trust=-4;d.affection=-2;note="Uy quyền tạo sức nặng nhưng có thể khiến nàng giữ khoảng cách."}
 if(card==="free"){d.curiosity=6;d.affection=2;note="Hành động khó đoán khiến nàng tò mò."}
 if(/xin lỗi|thật lòng|tin nàng|tin tưởng/.test(lower))d.trust+=4;
 if(/cảm ơn|quan tâm|nghỉ|mệt|ăn|ngủ/.test(lower))d.affection+=3;
 if(/mệnh lệnh|im đi|phải làm|cấm/.test(lower)){d.trust-=3;d.respect+=2}
 return {d:d,intent:card==="care"?"Quan tâm / chăm sóc":card==="gift"?"Trao giá trị / tạo thiện cảm":card==="pressure"?"Thể hiện quyền lực":card==="persuade"?"Tác động bằng lý lẽ":"Thăm dò / tùy cơ",note:note,reply:c.name+" suy nghĩ một lúc rồi đáp lại, vẫn giữ vẻ "+(c.speech?.split("。")[0]||"điềm tĩnh")+" thường ngày.",event:null,memory_updates:[]};
}
async function analyzeWithGemini(text,card){
 const key=getApiKey();if(!key)throw new Error("NO_API_KEY");
 const c=activeCharacter(),s=activeState(),cardInfo=CARDS.find(function(x){return x.id===card});
 const prompt="CANON NHÂN VẬT:\n"+JSON.stringify(c)+
 "\n\nPHẨM VỊ HIỆN TẠI:\n"+s.rank+
 "\n\nBỘ NHỚ DÀI HẠN:\n"+JSON.stringify(memoryForAI(c.id))+
 "\n\nNgười chơi nhập vai Hoàng đế trong game hậu cung lịch sử giả tưởng."+
 "\nNPC hiện tại: "+c.name+
 "\nKhông được trái CANON. Sử dụng PHẨM VỊ HIỆN TẠI nếu đã được phong. Không tự ý thay đổi vai trò quản lý, quan hệ hay lịch sử."+
 "\n\nThẻ hành động: "+cardInfo.name+" — "+cardInfo.desc+
 "\nHành động/lời nói:\n"+text+
 "\n\nChỉ số hiện tại:\n"+JSON.stringify(s.stats)+
 "\n\nTrạng thái:\n"+JSON.stringify(s.tags)+
 "\n\nLịch sử gần đây:\n"+JSON.stringify(s.aiHistory.slice(-8))+
 "\n\nHãy đóng vai Game Master. Phân tích ý định và tác động hợp lý với tính cách, phẩm vị, lịch sử và bối cảnh. Cho phép điểm âm. Không tự ý kết thúc câu chuyện.";
 const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(GEMINI_MODEL)+":generateContent",{
  method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
  body:JSON.stringify({systemInstruction:{parts:[{text:"Bạn là AI Game Master cho game Hậu Cung. Trả JSON đúng schema, ngắn gọn, bằng tiếng Việt. NPC nhất quán và có cảm xúc tự nhiên."}]},
  contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.9,response_mime_type:"application/json",response_schema:{
   type:"OBJECT",properties:{
    affection_delta:{type:"INTEGER"},trust_delta:{type:"INTEGER"},respect_delta:{type:"INTEGER"},intimacy_delta:{type:"INTEGER"},curiosity_delta:{type:"INTEGER"},
    intent:{type:"STRING"},note:{type:"STRING"},reply:{type:"STRING"},event:{type:"STRING"},
    memory_updates:{type:"ARRAY",items:{type:"OBJECT",properties:{text:{type:"STRING"},importance:{type:"INTEGER"}},required:["text","importance"]}}
   },required:["affection_delta","trust_delta","respect_delta","intimacy_delta","curiosity_delta","intent","note","reply","event","memory_updates"]
  }}}
 });
 if(!response.ok){const body=await response.text();throw new Error("Gemini "+response.status+": "+body.slice(0,300))}
 const data=await response.json(),raw=data.candidates?.[0]?.content?.parts?.map(function(p){return p.text||""}).join("")||"";
 if(!raw)throw new Error("Gemini returned empty response");
 const p=JSON.parse(raw);
 return {d:{affection:Number(p.affection_delta)||0,trust:Number(p.trust_delta)||0,respect:Number(p.respect_delta)||0,intimacy:Number(p.intimacy_delta)||0,curiosity:Number(p.curiosity_delta)||0},intent:p.intent||"Hành động có chủ đích",note:p.note||"",reply:p.reply||c.name+" im lặng suy nghĩ.",event:p.event||null,memory_updates:Array.isArray(p.memory_updates)?p.memory_updates:[]};
}
function applyResult(result){
 const s=activeState();
 Object.entries(result.d).forEach(function(entry){const k=entry[0],v=entry[1];s.stats[k]=Math.max(0,Math.min(100,s.stats[k]+v))});
 if(s.stats.trust>=45&&!s.tags.includes("Tin tưởng tăng"))s.tags.push("Tin tưởng tăng");
 if(s.stats.affection>=50&&!s.tags.includes("Thiện cảm tăng"))s.tags.push("Thiện cảm tăng");
 if(s.stats.intimacy>=40&&!s.tags.includes("Quan hệ tiến triển"))s.tags.push("Quan hệ tiến triển");
 renderStats();
}
function renderAnalysis(result,card){
 const c=CARDS.find(function(x){return x.id===card}),labels={affection:"Thiện cảm",trust:"Tin tưởng",respect:"Tôn trọng",intimacy:"Thân mật",curiosity:"Tò mò"};
 const rows=Object.entries(result.d).filter(function(x){return x[1]}).map(function(x){const k=x[0],v=x[1];return '<div class="delta"><span>'+labels[k]+'</span><b class="'+(v>0?"plus":"minus")+'">'+(v>0?"+":"")+v+"</b></div>"}).join("");
 analysis.classList.remove("empty");
 analysis.innerHTML='<div class="result-title">'+c.icon+" "+c.name+'</div><div><b>Ý định:</b> '+escapeHtml(result.intent)+'</div><div style="margin-top:10px"><b>Hiệu ứng</b>'+(rows||"<div class='analysis-note'>Không có chỉ số thay đổi.</div>")+'</div><div class="analysis-note">'+escapeHtml(result.note)+'</div>'+(result.event?'<div class="analysis-note"><b>🌙 Event:</b> '+escapeHtml(result.event)+"</div>":"");
}
async function submitAction(text,card){
 const c=activeCharacter(),s=activeState();
 addChat("player","Bệ hạ",text);
 analysis.classList.remove("empty");
 analysis.innerHTML='<div class="result-title">🤖 AI đang phân tích...</div><div class="analysis-note">Đang xem xét '+escapeHtml(c.name)+", phẩm vị, chỉ số và ký ức riêng.</div>";
 let result,mode="AI";
 try{result=await analyzeWithGemini(text,card)}
 catch(err){
  if(err.message==="NO_API_KEY"){
   const entered=prompt("Dán Gemini API key để bật AI thật cho local test:");
   if(entered?.trim()){localStorage.setItem("gemini_api_key",entered.trim());result=await analyzeWithGemini(text,card)}
   else{result=fallbackAnalyze(text,card);mode="Fallback"}
  }else{console.error(err);result=fallbackAnalyze(text,card);mode="Fallback";result.note+=" AI thật không phản hồi nên game tạm dùng bộ phân tích local."}
 }
 addChat("npc",c.name,result.reply);applyResult(result);addCharacterMemories(c.id,result.memory_updates,s.turn);renderAnalysis(result,card);
 s.history.unshift({turn:s.turn,card:CARDS.find(function(x){return x.id===card}).name,text:text});
 s.aiHistory.push({role:"player",card:card,text:text,result:result});s.turn++;s.selected=null;
 selectedCard.textContent="Chưa chọn thẻ";document.querySelector("#actionInput").value="";
 renderCards();renderHistory();renderCharacter();renderCharacterSelect();saveState();
 if(mode==="Fallback")console.warn("Gemini unavailable; fallback used.");
}
function openRankModal(){
 const c=activeCharacter(),s=activeState(),current=rankLevel(s.rank);
 document.querySelector("#rankModalTitle").textContent="Phong tước cho "+c.name;
 document.querySelector("#rankModalDesc").textContent="Phẩm vị hiện tại: "+s.rank+". Bệ hạ có thể ban một phẩm vị cao hơn.";
 rankOptions.innerHTML=RANKS.map(function(r){
  const disabled=r.level<=current;
  return '<button class="rank-option '+(r.name===s.rank?"current ":"")+(disabled?"disabled":"")+'" data-rank="'+escapeHtml(r.name)+'" '+(disabled?"disabled":"")+'><strong>'+r.name+'</strong><span>'+r.desc+'</span></button>';
 }).join("");
 rankOptions.querySelectorAll(".rank-option:not([disabled])").forEach(function(btn){btn.onclick=function(){
  const next=btn.dataset.rank;s.rank=next;rankModal.classList.add("hidden");renderCharacter();renderCharacterSelect();saveState();
  analysis.classList.remove("empty");analysis.innerHTML='<div class="result-title">📜 Sắc phong</div><div>Bệ hạ đã phong <b>'+escapeHtml(c.name)+'</b> lên <b>'+escapeHtml(next)+'</b>.</div><div class="analysis-note">Phẩm vị được lưu riêng cho nhân vật này.</div>';
 }});
 rankModal.classList.remove("hidden");
}

document.querySelector("#actionForm").onsubmit=async function(e){e.preventDefault();const input=document.querySelector("#actionInput"),text=input.value.trim(),card=activeState().selected;if(!text||!card)return;await submitAction(text,card)};
document.querySelector("#haremBtn").onclick=function(){gameView.classList.add("hidden");characterSelect.classList.remove("hidden");renderCharacterSelect()};
document.querySelector("#promoteBtn").onclick=openRankModal;
document.querySelector("#closeRankModal").onclick=function(){rankModal.classList.add("hidden")};
rankModal.onclick=function(e){if(e.target===rankModal)rankModal.classList.add("hidden")};
document.querySelector("#resetBtn").onclick=function(){localStorage.removeItem("haucung_state");localStorage.removeItem("haucung_memory_v1");localStorage.removeItem("gemini_api_key");location.reload()};

try{const saved=JSON.parse(localStorage.getItem("haucung_state")||"null");if(saved?.characters)Object.assign(state,saved)}catch{}
renderCharacterSelect();
if(state.activeCharacterId&&CHARACTER_DATABASE[state.activeCharacterId])openCharacter(state.activeCharacterId);
