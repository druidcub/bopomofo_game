(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GardenData;
  function makeRound(category='all',size=2,recent=[],preferred=[]){
    const limit=[2,3,4].includes(size)?size:2;
    const bank=[...D.words.map(w=>({...w,count:1,syllables:[w.zhuyin]})),...D.phrases];
    const history=new Set(recent),favorites=new Set(preferred),pictures=new Set(),cards=[];
    const rank=w=>(favorites.has(w.word)?1000:0)+(history.has(w.word)?0:10);
    const ordered=pool=>D.shuffle(pool).sort((a,b)=>rank(b)-rank(a));
    for(let count=1;count<=limit;count++){
      const all=bank.filter(w=>w.count===count),theme=all.filter(w=>category==='all'||w.category===category);
      let picked=0;
      for(const word of [...ordered(theme),...ordered(all.filter(w=>!theme.includes(w)))]){
        if(pictures.has(word.emoji))continue;
        cards.push(word);pictures.add(word.emoji);if(++picked===2)break;
      }
    }
    return {cards:D.shuffle(cards),counts:Array.from({length:limit},(_,i)=>i+1),mixed:category!=='all'&&cards.some(w=>w.category!==category)};
  }
  function initialState(){return {selected:null,placed:[],claps:0,done:false};}
  function select(round,state,index){
    if(!Number.isInteger(index)||!round.cards[index]||state.done||state.placed.includes(index))return {state,event:'ignored'};
    if(state.selected===index)return {state,event:'replay'};
    return {state:{...state,selected:index,claps:0},event:'selected'};
  }
  function clap(state){return state.selected===null||state.done?state:{...state,claps:Math.min(8,state.claps+1)};}
  function resetClaps(state){return {...state,claps:0};}
  function place(round,state,count){
    if(state.done||state.selected===null||!round.counts.includes(count))return {state,event:'ignored'};
    const card=round.cards[state.selected];
    if(!card||state.placed.includes(state.selected))return {state,event:'ignored'};
    if(card.count!==count)return {state,event:'retry'};
    const placed=[...state.placed,state.selected];
    return {state:{selected:null,claps:0,placed,done:placed.length===round.cards.length},event:'placed'};
  }
  function hint(round,state){
    if(state.done)return null;
    const index=state.selected===null?round.cards.findIndex((_,i)=>!state.placed.includes(i)):state.selected;
    return index<0?null:{index};
  }
  const api={makeRound,initialState,select,clap,resetClaps,place,hint};
  root.GardenSoundBeds=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
