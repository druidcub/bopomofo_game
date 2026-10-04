(function(root){
  'use strict';
  function checkTrain(parts, selected) {
    if(selected.length!==parts.length)return {ready:false,correct:false};
    return {ready:true,correct:parts.every((s,i)=>selected[i]===s)};
  }
  function nextHint(parts, selected) {
    const position=parts.findIndex((s,i)=>selected[i]!==s);
    return position<0?null:{position,symbol:parts[position]};
  }
  function bingoLine(board,marked){
    const lines=[];
    for(let start=0;start<board.length;start+=3)lines.push([start,start+1,start+2]);
    if(board.length===9)lines.push([0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]);
    return lines.find(line=>line.every(i=>marked.includes(board[i].symbol)))||null;
  }
  const badges=[
    {id:'first',emoji:'🌱',name:'第一朵花',rule:p=>p.rounds>=1},
    {id:'explorer',emoji:'🧭',name:'花園探險家',rule:p=>Object.keys(p.modes||{}).length>=4},
    {id:'train',emoji:'🚂',name:'小小列車長',rule:p=>(p.modes?.build||0)>=2},
    {id:'listener',emoji:'👂',name:'聲音收藏家',rule:p=>(p.modes?.syllables||0)+(p.modes?.rhyme||0)+(p.modes?.initial||0)>=3},
    {id:'blooms',emoji:'🌼',name:'花園好朋友',rule:p=>p.flowers>=30},
    {id:'all',emoji:'🌈',name:'彩虹探險家',rule:p=>Object.keys(p.modes||{}).length>=8}
  ];
  const decorations=[
    {id:'tulip',emoji:'🌷',name:'小花',at:0}, {id:'sunflower',emoji:'🌻',name:'向日葵',at:1},
    {id:'mushroom',emoji:'🍄',name:'小蘑菇',at:2}, {id:'butterfly',emoji:'🦋',name:'蝴蝶',at:3},
    {id:'bunny',emoji:'🐰',name:'小兔',at:4}, {id:'tree',emoji:'🌳',name:'大樹',at:5},
    {id:'pond',emoji:'🐸',name:'青蛙',at:7}, {id:'rainbow',emoji:'🌈',name:'彩虹',at:10}
  ];
  const scenes=[
    {id:'sunny',name:'晴天',emoji:'☀️',prompt:'晴天的花園，哪個朋友想曬太陽？指一指、說一說。'},
    {id:'sunset',name:'夕陽',emoji:'🌅',prompt:'夕陽慢慢來了，和花園朋友說聲晚安吧。'},
    {id:'night',name:'星夜',emoji:'🌙',prompt:'星星陪著花園，和大人一起說說誰住在這裡。'}
  ];
  function earnedBadges(progress){return badges.filter(b=>b.rule(progress));}
  function availableDecorations(rounds){return decorations.filter(d=>d.at<=rounds);}
  function emptyProgress(){return {flowers:0,rounds:0,modes:{},recent:[],journal:[],favorites:[],weather:'sunny',plots:['tulip','','tulip','','tulip','']};}
  function restoreProgress(recorded, validModes, vocabulary){
    const p=emptyProgress(), allowed=new Set(vocabulary);
    for(const key of ['flowers','rounds'])if(Number.isSafeInteger(recorded?.[key])&&recorded[key]>=0)p[key]=recorded[key];
    for(const mode of validModes)if(Number.isSafeInteger(recorded?.modes?.[mode])&&recorded.modes[mode]>0)p.modes[mode]=recorded.modes[mode];
    if(Array.isArray(recorded?.recent))p.recent=recorded.recent.filter(w=>allowed.has(w)).slice(-30);
    if(Array.isArray(recorded?.journal))p.journal=[...new Set(recorded.journal.filter(w=>allowed.has(w)))].slice(-vocabulary.length);
    if(Array.isArray(recorded?.favorites))p.favorites=[...new Set(recorded.favorites.filter(w=>allowed.has(w)))].slice(0,50);
    if(scenes.some(scene=>scene.id===recorded?.weather))p.weather=recorded.weather;
    if(Array.isArray(recorded?.plots))p.plots=Array.from({length:6},(_,i)=>availableDecorations(p.rounds).some(d=>d.id===recorded.plots[i])?recorded.plots[i]:'');
    return p;
  }
  function rememberWord(progress, word){
    if(!word)return;
    progress.recent=[...progress.recent.filter(w=>w!==word),word].slice(-30);
    progress.journal=[...new Set([...progress.journal,word])];
  }
  function toggleFavorite(progress,word){
    if(progress.favorites.includes(word)){progress.favorites=progress.favorites.filter(w=>w!==word);return true;}
    if(progress.favorites.length>=50)return false;
    progress.favorites.push(word);return true;
  }
  function nextInvitation(progress){
    const invitations=[
      {mode:'picture',emoji:'🔍',text:'小兔想認識新朋友：聽聲音，找圖片。'},
      {mode:'syllables',emoji:'👏',text:'小兔想組小樂隊：說詞語，一起拍手。'},
      {mode:'build',emoji:'🚂',text:'小兔要去旅行：讓注音朋友坐上火車。'},
      {mode:'initial',emoji:'🐱',text:'小兔要交朋友：找出開頭一樣的聲音。'},
      {mode:'memory',emoji:'🃏',text:'小兔想捉迷藏：翻卡片，找到注音朋友。'},
      {mode:'rhyme',emoji:'♫',text:'小兔想唱歌：找找押韻的聲音朋友。'},
      {mode:'pack',emoji:'🎒',text:'小兔要出門：聽清單，依序裝好小背包。'},
      {mode:'mail',emoji:'✉️',text:'小兔想送信：把圖片信送到開頭一樣的家。'},
      {mode:'odd',emoji:'🔎',text:'小兔想聽仔細：三個詞，誰的開頭不一樣？'},
      {mode:'balance',emoji:'⚖️',text:'小兔想比一比：兩個詞的聲音有一樣多嗎？'},
      {mode:'soundMemory',emoji:'🃏',text:'小兔想找朋友：翻聲音卡，配它的圖片。'}
    ];
    return invitations[progress.rounds%invitations.length];
  }
  const play={checkTrain,nextHint,bingoLine,badges,decorations,scenes,earnedBadges,availableDecorations,emptyProgress,restoreProgress,rememberWord,toggleFavorite,nextInvitation};
  root.GardenPlay=play;if(typeof module!=='undefined')module.exports=play;
})(typeof window!=='undefined'?window:globalThis);
