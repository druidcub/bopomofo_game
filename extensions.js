(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.GardenData;
  const vocabulary=()=>[...D.words.map(w=>({...w,count:1,syllables:[w.zhuyin]})),...D.phrases];
  function rank(word,history,favorites,used=new Set()){
    return (used.has(word.word)?-10000:0)+(favorites.has(word.word)?1000:0)+(history.has(word.word)?0:10);
  }
  function pickWords(pool,recent,preferred,count){
    const history=new Set(recent),favorites=new Set(preferred);
    return D.shuffle(pool).sort((a,b)=>rank(b,history,favorites)-rank(a,history,favorites)).slice(0,count);
  }
  function lengthLimit(size){return [2,3,4].includes(size)?size:2;}
  function makeWorkshopRound(category='all',size=2,recent=[],preferred=[]){
    const limit=lengthLimit(size),allowed=D.phrases.filter(w=>w.count<=limit);
    let pool=allowed.filter(w=>category==='all'||w.category===category);
    if(pool.length<5)pool=[...pool,...D.shuffle(allowed.filter(w=>!pool.includes(w))).slice(0,5-pool.length)];
    const syllables=[...new Set(vocabulary().flatMap(w=>w.syllables))];
    return pickWords(pool,recent,preferred,5).map(w=>{
      const available=syllables.filter(s=>!w.syllables.includes(s));
      const related=available.filter(s=>w.syllables.some(part=>part[0]===s[0]));
      const extras=[...D.shuffle(related),...D.shuffle(available.filter(s=>!related.includes(s)))].slice(0,2);
      return {...w,options:D.shuffle([...w.syllables,...extras])};
    });
  }
  function compareCounts(left,right){return left>right?'left':left<right?'right':'equal';}
  function makeBalanceRound(category='all',size=2,recent=[],preferred=[]){
    const limit=lengthLimit(size),history=new Set(recent),favorites=new Set(preferred),used=new Set();
    const bank=vocabulary().filter(w=>w.count<=limit);
    let pool=bank.filter(w=>category==='all'||w.category===category);
    const relations=D.shuffle(['left','left','equal','right','right']);
    return relations.map(relation=>{
      let pairs=[];
      function candidates(source){
        const ordered=D.shuffle(source).sort((a,b)=>rank(b,history,favorites,used)-rank(a,history,favorites,used));
        const rightByLength=new Map(Array.from({length:limit},(_,i)=>[i+1,ordered.filter(right=>compareCounts(i+1,right.count)===relation)]));
        return source.flatMap(left=>{
          const right=rightByLength.get(left.count).find(right=>right.word!==left.word&&right.emoji!==left.emoji);
          return right?[{left,right}]:[];
        });
      }
      pairs=candidates(pool);
      if(!pairs.length)pairs=candidates(bank);
      const pair=D.shuffle(pairs).sort((a,b)=>
        rank(b.left,history,favorites,used)+rank(b.right,history,favorites,used)-rank(a.left,history,favorites,used)-rank(a.right,history,favorites,used)
      )[0];
      used.add(pair.left.word);used.add(pair.right.word);
      return {...pair,answer:relation};
    });
  }
  const extensions={makeWorkshopRound,makeBalanceRound,compareCounts};
  root.GardenExtensions=extensions;if(typeof module!=='undefined'&&module.exports)module.exports=extensions;
})(typeof window!=='undefined'?window:globalThis);
