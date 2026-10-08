(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GardenData;
  function makeRound(category='all',length=3,recent=[],preferred=[]){
    const size=length===4?4:3,history=new Set(recent),favorites=new Set(preferred),used=new Set();
    const bank=[...D.words.map(w=>({...w,count:1})),...D.phrases].filter(w=>w.count<=3);
    const theme=bank.filter(w=>category==='all'||w.category===category);
    const rank=w=>(favorites.has(w.word)?100:0)+(history.has(w.word)?0:10);
    const ranked=pool=>D.shuffle(pool).sort((a,b)=>rank(b)-rank(a));
    return Array.from({length:5},()=>{
      const target=ranked(theme.filter(w=>!used.has(w.word)))[0]||ranked(bank.filter(w=>!used.has(w.word)))[0];
      used.add(target.word);history.add(target.word);
      const pictures=new Set([target.emoji]),others=[];
      for(const w of [...ranked(theme),...ranked(bank)]){
        if(w.word===target.word||pictures.has(w.emoji))continue;
        pictures.add(w.emoji);others.push(w);if(others.length===2)break;
      }
      const sequence=D.shuffle([target,target,...others.slice(0,size-2)]);
      return {sequence,options:D.shuffle([target,...others]),answer:target.word,mixed:category!=='all'&&[target,...others].some(w=>w.category!==category)};
    });
  }
  function check(q,index,done=false){
    if(done||!Number.isInteger(index)||!q.options[index])return 'ignored';
    return q.options[index].word===q.answer?'correct':'retry';
  }
  const api={makeRound,check};root.GardenEcho=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
