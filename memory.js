const HAU_MEMORY_KEY="haucung_memory_v1";

function loadPersistentMemory(){
  try { return JSON.parse(localStorage.getItem(HAU_MEMORY_KEY)||"{}"); }
  catch { return {}; }
}
function savePersistentMemory(memory){
  localStorage.setItem(HAU_MEMORY_KEY, JSON.stringify(memory));
}
function getCharacterMemory(characterId){
  const all=loadPersistentMemory();
  if(!all[characterId]) all[characterId]={important:[],recent:[]};
  return all[characterId];
}
function addCharacterMemories(characterId, updates, turn){
  if(!Array.isArray(updates)||!updates.length) return;
  const all=loadPersistentMemory();
  const m=all[characterId]||{important:[],recent:[]};
  updates.forEach(x=>{
    if(!x?.text) return;
    const item={text:String(x.text).trim(),importance:Math.max(1,Math.min(10,Number(x.importance)||5)),turn};
    m.recent.push(item);
    if(item.importance>=7) m.important.push(item);
  });
  m.recent=m.recent.slice(-20);
  m.important=m.important.slice(-30);
  all[characterId]=m;
  savePersistentMemory(all);
}
function memoryForAI(characterId){
  const m=getCharacterMemory(characterId);
  return {important:m.important.slice(-12),recent:m.recent.slice(-8)};
}
