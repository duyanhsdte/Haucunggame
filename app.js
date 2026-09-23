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
 history:[]
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
 const labels={affection:["Thiện cảm","affection"],trust:["Tin tưởng","trust"],respect:["Tôn trọng","respect"],intimacy:["Thân mật","intimacy"],curiosity:["Tò mò","curiosity"]};
 stats.innerHTML=Object.entries(labels).map(([key,[label]])=>`<div class="stat"><div class="stat-row"><span>${label}</span><b>${state.stats[key]}</b></div><div class="bar"><div class="fill" style="width:${state.stats[key]}%"></div></div></div>`).join("");
 stateTags.innerHTML=state.tags.map(t=>`<span class="tag">${t}</span>`).join("");
}

function addMessage(type,speaker,text){
 const el=document.createElement("div"); el.className=`message ${type}`;
 el.innerHTML=`<div class="speaker">${speaker}</div><div>${escapeHtml(text)}</div>`;
 chatLog.appendChild(el); chatLog.scrollTop=chatLog.scrollHeight;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

function analyze(text,card){
 const lower=text.toLowerCase();
 let d={affection:0,trust:0,respect:0,intimacy:0,curiosity:0};
 let note="Mộ Dung Yên đang quan sát cách bệ hạ hành động.";
 if(card==="care"){d.affection=6;d.trust=5;d.intimacy=2;note="Nàng cảm nhận được sự quan tâm thật lòng, đặc biệt nếu lời nói cụ thể và không mang tính ép buộc."}
 if(card==="persuade"){d.respect=5;d.trust=2;d.curiosity=2;note="Lý lẽ rõ ràng làm nàng đánh giá cao năng lực đối thoại."}
 if(card==="gift"){d.affection=5;d.respect=1;note="Nàng vui vì được nhớ tới, nhưng phản ứng còn phụ thuộc vào ý nghĩa của món quà."}
 if(card==="pressure"){d.respect=5;d.trust=-4;d.affection=-2;note="Uy quyền tạo sức nặng nhưng có thể khiến nàng giữ khoảng cách."}
 if(card==="free"){d.curiosity=6;d.affection=2;note="Hành động khó đoán khiến nàng tò mò và muốn hiểu ý định của bệ hạ."}
 if(/xin lỗi|thật lòng|tin nàng|tin tưởng/.test(lower)){d.trust+=4;note+=" Sự thành thật làm tăng độ tin cậy."}
 if(/cảm ơn|quan tâm|nghỉ|mệt|ăn|ngủ/.test(lower)){d.affection+=3;}
 if(/mệnh lệnh|im đi|phải làm|cấm/.test(lower)){d.trust-=3;d.respect+=2;}
 return {d,note};
}

function renderAnalysis(result,card,text){
 const c=CARDS.find(x=>x.id===card);
 const rows=Object.entries(result.d).filter(([,v])=>v).map(([k,v])=>{
  const labels={affection:"Thiện cảm",trust:"Tin tưởng",respect:"Tôn trọng",intimacy:"Thân mật",curiosity:"Tò mò"};
  return `<div class="delta"><span>${labels[k]}</span><b class="${v>0?"plus":"minus"}">${v>0?"+":""}${v}</b></div>`;
 }).join("");
 analysis.classList.remove("empty");
 analysis.innerHTML=`<div class="result-title">${c.icon} ${c.name}</div><div><b>Ý định:</b> ${intentFor(card,text)}</div><div style="margin-top:10px"><b>Hiệu ứng</b>${rows}</div><div class="analysis-note">${result.note}</div>`;
}

function intentFor(card,text){
 if(card==="care") return "Quan tâm / chăm sóc";
 if(card==="gift") return "Trao giá trị / tạo thiện cảm";
 if(card==="pressure") return "Thể hiện quyền lực";
 if(card==="persuade") return "Tác động bằng lý lẽ";
 return text.length>45?"Hành động có chủ đích":"Thăm dò / tùy cơ";
}

document.querySelector("#actionForm").onsubmit=e=>{
 e.preventDefault();
 const input=document.querySelector("#actionInput");
 const text=input.value.trim();
 if(!text||!state.selected)return;
 const card=state.selected;
 addMessage("player","Bệ hạ",text);
 const result=analyze(text,card);
 Object.entries(result.d).forEach(([k,v])=>state.stats[k]=Math.max(0,Math.min(100,state.stats[k]+v)));
 if(state.stats.trust>=45&&!state.tags.includes("Tin tưởng tăng"))state.tags.push("Tin tưởng tăng");
 if(state.stats.affection>=50&&!state.tags.includes("Thiện cảm tăng"))state.tags.push("Thiện cảm tăng");
 const npcReply = result.d.trust<0
  ? "Mộ Dung Yên im lặng một thoáng, ánh mắt trở nên thận trọng hơn."
  : result.d.affection>=5
    ? "Mộ Dung Yên khẽ mỉm cười. Nàng không trả lời ngay, nhưng ánh mắt đã dịu đi."
    : "Mộ Dung Yên suy nghĩ một lúc rồi đáp lại, vẫn giữ vẻ bình tĩnh thường ngày.";
 addMessage("npc","Mộ Dung Yên",npcReply);
 renderAnalysis(result,card,text); renderStats();
 state.history.unshift({turn:state.turn,card:CARDS.find(x=>x.id===card).name,text});
 history.innerHTML=state.history.slice(0,8).map(h=>`<div class="history-item"><b>Lượt ${h.turn} · ${h.card}</b><br>${escapeHtml(h.text)}</div>`).join("");
 state.turn++; turnLabel.textContent=`Lượt ${state.turn}`;
 state.selected=null; selectedCard.textContent="Chưa chọn thẻ"; input.value=""; renderCards();
 localStorage.setItem("haucung_state",JSON.stringify(state));
};

document.querySelector("#resetBtn").onclick=()=>{
 localStorage.removeItem("haucung_state"); location.reload();
};

const saved=localStorage.getItem("haucung_state");
if(saved){try{Object.assign(state,JSON.parse(saved));}catch{}}
renderCards();renderStats();
addMessage("npc","Mộ Dung Yên","Bệ hạ muốn nói chuyện với thiếp về chuyện gì?");
