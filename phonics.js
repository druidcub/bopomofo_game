(function(root){
  'use strict';
  const D=typeof module!=='undefined'?require('./data.js'):root.GardenData;
  const consonants='ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ';
  const medials='ㄧㄨㄩ';
  const examples=[
    ['ㄧㄚ','鴨','🦆',''],['ㄧㄛ','唷','👋',''],['ㄧㄝ','葉','🍃','ˋ'],['ㄧㄞ','崖','⛰️','ˊ'],
    ['ㄧㄠ','腰','🧍',''],['ㄧㄡ','油','🫙','ˊ'],['ㄧㄢ','煙','💨',''],['ㄧㄣ','音','♫',''],['ㄧㄤ','羊','🐑','ˊ'],['ㄧㄥ','鷹','🦅',''],
    ['ㄨㄚ','蛙','🐸',''],['ㄨㄛ','窩','🪺',''],['ㄨㄞ','歪','↗',''],['ㄨㄟ','圍','🧣','ˊ'],['ㄨㄢ','碗','🥣','ˇ'],['ㄨㄣ','蚊','🦟','ˊ'],['ㄨㄤ','王','👑','ˊ'],['ㄨㄥ','翁','👴',''],
    ['ㄩㄝ','月','🌙','ˋ'],['ㄩㄢ','圓','🔵','ˊ'],['ㄩㄣ','雲','☁️','ˊ'],['ㄩㄥ','用','🖍️','ˋ']
  ].map(([rime,word,emoji,tone])=>({rime,word,emoji,tone,zhuyin:rime+tone}));
  const beginner=new Set(['ㄧㄚ','ㄧㄝ','ㄧㄠ','ㄧㄡ','ㄧㄢ','ㄧㄤ','ㄨㄚ','ㄨㄛ','ㄨㄞ','ㄨㄢ','ㄩㄝ','ㄩㄢ']);
  function row(symbol){return consonants.includes(symbol)?0:medials.includes(symbol)?1:2;}
  function empty(count){return {selected:Array(count).fill(''),used:Array(count).fill(null),activeSlot:0};}
  function take(state,index){
    if(!Number.isInteger(index)||index<0||index>=state.selected.length)return state;
    const selected=[...state.selected],used=[...state.used];selected[index]='';used[index]=null;
    return {selected,used,activeSlot:index};
  }
  function put(state,options,index){
    const slot=state.activeSlot;
    if(!Number.isInteger(index)||index<0||index>=options.length||state.used.includes(index)||!Number.isInteger(slot)||slot<0||slot>=state.selected.length||state.selected[slot])return state;
    const selected=[...state.selected],used=[...state.used];selected[slot]=options[index];used[slot]=index;
    return {selected,used,activeSlot:selected.findIndex(s=>!s)};
  }
  function cells(parts,fixed=''){
    return parts.map((part,index)=>({index,row:row(part[0]),span:part.length,part}));
  }
  // A syllable is one vertical unit; tones never become a fourth symbol below it.
  function reading(syllable){
    const symbols=[...syllable.replace(/[ˊˇˋ˙]/g,'')].filter(s=>D.symbols.includes(s));
    const tone=(syllable.match(/[ˊˇˋ˙]/)||[''])[0];
    return `<span class="zhuyin-reading ${tone==='˙'?'neutral':''}" aria-label="${symbols.join('')+tone}"><span class="zhuyin-glyphs" aria-hidden="true">${symbols.map(s=>`<span>${s}</span>`).join('')}</span>${tone?`<span class="zhuyin-mark" aria-hidden="true">${tone}</span>`:''}</span>`;
  }
  function board(q,repair=false){
    const slots=cells(q.parts),fixed=q.fixed||'';
    const full=fixed+q.parts.join(''),positions=[...full].map(row);
    const middle=(Math.min(...positions)+Math.max(...positions)+1)/2;
    const grouped=full.split('').some(s=>medials.includes(s))&&[...full].some(s=>row(s)===2);
    return `<div class="phonetic-board" aria-label="直式注音，由上到下；聲調在右側"><div class="phonetic-guide" aria-hidden="true"><span>上</span><span>中</span><span>下</span></div><div class="phonetic-stack" style="--tone-row:${middle}">${grouped?'<span class="rime-frame" aria-hidden="true"></span>':''}${fixed?`<span class="phonetic-fixed" style="grid-row:1">${fixed}</span>`:''}${slots.map(s=>repair?`<div class="phonetic-cell ${s.index===q.missing?'missing':'filled'}" style="grid-row:${s.row+1}/span ${s.span}">${s.index===q.missing?'？':s.part}</div>`:`<button class="phonetic-cell" data-slot="${s.index}" style="grid-row:${s.row+1}/span ${s.span}" aria-label="第 ${s.index+1} 個注音位置，空位">？</button>`).join('')}${q.tone?`<span class="phonetic-tone ${q.tone==='˙'?'neutral':''}" aria-label="聲調 ${q.tone}">${q.tone}</span>`:''}</div></div>`;
  }
  function makeRound(level='basic',recent=[]){
    const apply=level==='apply';
    let pool=apply?D.words.filter(w=>w.parts.length===3&&consonants.includes(w.parts[0])&&examples.some(e=>e.rime===w.parts.slice(1).join(''))).map(w=>({...w,rime:w.parts.slice(1).join(''),fixed:w.parts[0]})):examples.filter(e=>level==='all'||beginner.has(e.rime));
    const ordered=D.shuffle(pool).sort((a,b)=>Number(recent.includes(a.word))-Number(recent.includes(b.word)));
    const seen=new Set(),chosen=ordered.filter(w=>!seen.has(w.rime)&&seen.add(w.rime)).slice(0,5);
    return chosen.map(w=>{
      const parts=apply?[w.rime]:[...w.rime];
      const distractors=apply?D.shuffle(examples.filter(e=>e.rime!==w.rime)).slice(0,2).map(e=>e.rime):D.shuffle([...new Set(examples.map(e=>e.rime[1]))].filter(s=>!parts.includes(s))).slice(0,2);
      return {...w,parts,options:D.shuffle([...parts,...distractors]),mode:'fusion',apply};
    });
  }
  const api={examples,beginner,row,empty,take,put,cells,reading,board,makeRound};
  root.GardenPhonics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
