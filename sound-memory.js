(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GardenData;
  function makeDeck(category='all',size=2,recent=[],preferred=[],wordSize=3){
    const count=[2,3,4].includes(size)?size:2,history=new Set(recent),favorites=new Set(preferred);
    const maxCount=[2,3,4].includes(wordSize)?wordSize:3;
    const bank=[...D.words,...D.phrases.filter(w=>w.count<=maxCount)];
    const theme=bank.filter(w=>category==='all'||w.category===category);
    const score=w=>(favorites.has(w.word)?1000:0)+(history.has(w.word)?0:10);
    const order=pool=>D.shuffle(pool).sort((a,b)=>score(b)-score(a));
    const chosen=[],pictures=new Set();
    for(const w of [...order(theme),...order(bank.filter(w=>!theme.includes(w)))]){
      if(pictures.has(w.emoji))continue;
      chosen.push(w);pictures.add(w.emoji);if(chosen.length===count)break;
    }
    return D.shuffle(chosen.flatMap(target=>['picture','audio'].map(kind=>({id:kind+':'+target.word,kind,target}))));
  }
  function initialState(){return {flipped:[],matched:[],locked:false,done:false};}
  function flip(deck,state,index){
    const card=deck[index];
    if(!card||state.done||state.matched.includes(card.target.word))return {state,event:'ignored'};
    if(state.flipped.includes(index))return {state,event:'replay'};
    if(state.locked)return {state,event:'ignored'};
    const flipped=[...state.flipped,index];
    if(flipped.length===1)return {state:{...state,flipped},event:'listen'};
    const first=deck[flipped[0]];
    if(first.kind!==card.kind&&first.target.word===card.target.word){
      const matched=[...state.matched,card.target.word];
      return {state:{flipped:[],matched,locked:false,done:matched.length===deck.length/2},event:'match'};
    }
    return {state:{...state,flipped,locked:true},event:'retry'};
  }
  function closeOpen(state){return {...state,flipped:[],locked:false};}
  function hint(deck,state){
    if(state.done)return null;
    if(state.flipped.length){const index=state.flipped.find(i=>deck[i].kind==='audio')??state.flipped[0];return {index,action:'replay'};}
    const index=deck.findIndex(card=>card.kind==='audio'&&!state.matched.includes(card.target.word));
    return index<0?null:{index,action:'flip'};
  }
  const memory={makeDeck,initialState,flip,closeOpen,hint};
  root.GardenSoundMemory=memory;if(typeof module!=='undefined'&&module.exports)module.exports=memory;
})(typeof window!=='undefined'?window:globalThis);
