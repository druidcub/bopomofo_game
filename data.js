(function(root){
const symbols = [...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ'];
const starter = [...'ㄅㄆㄇㄈㄚㄧㄨㄩ'];
const words = [
 {word:'貓',emoji:'🐱',initial:'ㄇ',parts:['ㄇ','ㄠ'],zhuyin:'ㄇㄠ',say:'貓咪'},
 {word:'兔',emoji:'🐰',initial:'ㄊ',parts:['ㄊ','ㄨ'],tone:'ˋ',zhuyin:'ㄊㄨˋ',say:'兔子'},
 {word:'狗',emoji:'🐶',initial:'ㄍ',parts:['ㄍ','ㄡ'],tone:'ˇ',zhuyin:'ㄍㄡˇ',say:'小狗'},
 {word:'花',emoji:'🌷',initial:'ㄏ',parts:['ㄏ','ㄨ','ㄚ'],zhuyin:'ㄏㄨㄚ',say:'花朵'},
 {word:'馬',emoji:'🐴',initial:'ㄇ',parts:['ㄇ','ㄚ'],tone:'ˇ',zhuyin:'ㄇㄚˇ',say:'小馬'},
 {word:'魚',emoji:'🐟',initial:'ㄩ',parts:['ㄩ'],tone:'ˊ',zhuyin:'ㄩˊ',say:'小魚'},
 {word:'米',emoji:'🍚',initial:'ㄇ',parts:['ㄇ','ㄧ'],tone:'ˇ',zhuyin:'ㄇㄧˇ',say:'白米'},
 {word:'梨',emoji:'🍐',initial:'ㄌ',parts:['ㄌ','ㄧ'],tone:'ˊ',zhuyin:'ㄌㄧˊ',say:'梨子'},
 {word:'鹿',emoji:'🦌',initial:'ㄌ',parts:['ㄌ','ㄨ'],tone:'ˋ',zhuyin:'ㄌㄨˋ',say:'小鹿'},
 {word:'八',emoji:'8️⃣',initial:'ㄅ',parts:['ㄅ','ㄚ'],zhuyin:'ㄅㄚ',say:'八'},
 {word:'坡',emoji:'⛰️',initial:'ㄆ',parts:['ㄆ','ㄛ'],zhuyin:'ㄆㄛ',say:'山坡'},
 {word:'風',emoji:'🍃',initial:'ㄈ',parts:['ㄈ','ㄥ'],zhuyin:'ㄈㄥ',say:'風'}
];
function shuffle(items, rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function choices(answer,pool,count=3){return shuffle([answer,...shuffle([...new Set(pool)].filter(s=>s!==answer)).slice(0,count-1)]);}
function makeRound(mode,scope='starter'){
 if(mode==='match')return shuffle(scope==='all'?symbols:starter).slice(0,5).map(s=>({answer:s,options:choices(s,scope==='all'?symbols:starter)}));
 const pool=shuffle(mode==='build'?words.filter(w=>w.parts.length===2):words).slice(0,5);
 return pool.map(w=>mode==='listen'?{...w,answer:w.initial,options:choices(w.initial,words.map(x=>x.initial))}:{...w,options:shuffle(w.parts)});
}
const data={symbols,starter,words,shuffle,choices,makeRound};root.GardenData=data;if(typeof module!=='undefined')module.exports=data;
})(typeof window!=='undefined'?window:globalThis);
