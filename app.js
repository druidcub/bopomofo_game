'use strict';
const $ = s => document.querySelector(s);
const { words, phrases, categories, makeRound, makeAdventure } = GardenData;
const { checkTrain, nextHint, emptyProgress, restoreProgress, rememberWord, earnedBadges, availableDecorations, nextInvitation } = GardenPlay;
const modeIDs=['match','listen','build','picture','rhyme','memory','initial','syllables','repair','tone','adventure','bingo','pack','mail','odd','workshop','balance','soundMemory'];
const vocabulary=[...words,...phrases];
const playGroups={all:{name:'全部玩法',note:'想玩什麼就選什麼，也可以先看圖、先聽聲音。'},shapes:{name:'看字形',note:'從找相同符號開始，不需要先會讀注音。',ids:['match','memory','bingo']},sounds:{name:'看圖與聽音',note:'重聽整個生活詞，找圖片、比開頭，或拍拍聲音。',ids:['picture','rhyme','initial','syllables','odd','balance','soundMemory']},phonics:{name:'和大人拼音',note:'成人陪同認識聲音與符號；拼詞是進階活動，可以慢慢來。',ids:['listen','build','repair','tone','workshop']},tasks:{name:'聽音小任務',note:'送信、裝背包、走五站。可以重聽，不用趕時間。',ids:['adventure','pack','mail']}};
let playGroup='all';
const defaults = { scope: 'starter', customSymbols:'ㄅㄆㄇㄚㄧ', category: 'all', practice:'fresh', oddSound:'initial', buildLevel: 'easy', memoryPairs: 3, packSize:2, mailHouses:2, workshopSize:2, balanceSize:2, soundPairs:2, sound: true, voice: '', effects: true, music: false, track: 'garden', musicVolume: 18, effectsVolume: 40 };
let prefs = { ...defaults }, progress = emptyProgress(), storageOK = true;
try {
  const saved = JSON.parse(localStorage.getItem('garden-prefs') || '{}');
  for (const key of Object.keys(defaults)) if (typeof saved?.[key] === typeof defaults[key]) prefs[key] = saved[key];
  const recorded = JSON.parse(localStorage.getItem('garden-progress') || '{}');
  progress=restoreProgress(recorded,modeIDs,vocabulary.map(w=>w.word));
} catch { storageOK = false; }
if (!['starter', 'all','custom'].includes(prefs.scope)) prefs.scope = 'starter';
prefs.customSymbols=[...new Set([...prefs.customSymbols])].filter(s=>GardenData.symbols.includes(s)).join('');
if(prefs.customSymbols.length<3)prefs.customSymbols=defaults.customSymbols;
if (!Object.hasOwn(categories, prefs.category)) prefs.category = 'all';
if(!['fresh','favorite'].includes(prefs.practice))prefs.practice='fresh';
if(!['initial','rhyme'].includes(prefs.oddSound))prefs.oddSound='initial';
if (!['easy', 'grow'].includes(prefs.buildLevel)) prefs.buildLevel = 'easy';
if (![3,4,6].includes(prefs.memoryPairs)) prefs.memoryPairs=3;
if (![2,3].includes(prefs.packSize)) prefs.packSize=2;
if (![2,3].includes(prefs.mailHouses)) prefs.mailHouses=2;
for(const key of ['workshopSize','balanceSize','soundPairs'])if(![2,3,4].includes(prefs[key]))prefs[key]=2;
if (!Object.hasOwn(GardenSongs, prefs.track)) prefs.track = 'garden';
prefs.musicVolume = Math.max(0, Math.min(50, prefs.musicVolume));
prefs.effectsVolume = Math.max(0, Math.min(70, prefs.effectsVolume));
let game = null, voices = [], speechVersion = 0, speechTimer = null;
const gardenAudio = new GardenAudio();
gardenAudio.configure(prefs);
function save() {
  try { localStorage.setItem('garden-prefs', JSON.stringify(prefs)); localStorage.setItem('garden-progress', JSON.stringify(progress)); }
  catch { storageOK = false; }
}
async function effect(name) { if (prefs.effects && await gardenAudio.unlock()) gardenAudio.effect(name); }
function stopSpeech() {
  speechVersion++; clearTimeout(speechTimer);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  gardenAudio.duck(false);
}
function speak(text) {
  if (!prefs.sound) return;
  if (!('speechSynthesis' in window) || !voices.length) {
    const el = $('#audio-note'); if (el) el.textContent = '這台裝置沒有中文朗讀，請大人陪你念一念。'; return;
  }
  stopSpeech(); const version = speechVersion;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW'; utterance.rate = .78;
  utterance.voice = voices.find(v => v.voiceURI === prefs.voice) || voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices[0];
  const release = () => { if (version === speechVersion) { clearTimeout(speechTimer); gardenAudio.duck(false); } };
  gardenAudio.duck(true); utterance.onend = release;
  utterance.onerror = e => {
    release();
    if (!['canceled', 'interrupted'].includes(e.error)) { const el = $('#audio-note'); if (el) el.textContent = '聲音暫時無法播放，請大人陪你念題目。'; }
  };
  speechTimer = setTimeout(release, 20000); speechSynthesis.speak(utterance);
}
function updateVoices() {
  voices = ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter(v => /^zh|cmn/i.test(v.lang));
  $('#voice').replaceChildren();
  if (!voices.length) $('#voice').add(new Option('沒有中文語音：請大人讀題', ''));
  else {
    voices.forEach(v => $('#voice').add(new Option(v.name + ' · ' + v.lang, v.voiceURI)));
    $('#voice').value = voices.some(v => v.voiceURI === prefs.voice) ? prefs.voice : (voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices[0]).voiceURI;
  }
  if ($('#audio-note')) $('#audio-note').textContent = audioNote();
}
function audioNote() { return !prefs.sound ? '朗讀已關閉，請大人陪你念題目。' : voices.length ? '可以重聽，也可以跟著大人說一遍。' : '這台裝置沒有中文朗讀，請大人念題目。'; }
function visual(word){
  const colors={'紅':'#df6b63','黃':'#f2ce62','藍':'#73a5d4','綠':'#8ab277','黑':'#454b49','白':'#fff','紫':'#a18ac1','灰':'#a6aaa7','橘':'#e3a15a','粉':'#e3a5bc','棕':'#947657','金':'#c5a34d'};
  const illustration=Object.keys(wordArt).sort((a,b)=>b.length-a.length).find(key=>word.word.endsWith(key));
  return word.category==='colors'&&colors[word.word[0]]?`<span class="color-dot" style="--swatch:${colors[word.word[0]]}" aria-hidden="true"></span>`:wordArt[illustration]||word.emoji;
}
const modes = [
  { id: 'match', name: '找找注音', level: '認識字形', color: 'peach', art: '<i>ㄅ</i><i>ㄅ</i>', desc: '看一看，找出一樣的注音朋友。', title: '哪一個和我一樣？', sub: '看上面的符號，再點下面一樣的朋友。' },
  { id: 'listen', name: '聽聽找朋友', level: '聲音與符號', color: 'mint', art: '🐱<span class="sound-bubble">♫</span>', desc: '聽生活詞，找出開頭的注音。', title: '聽一聽，找開頭的注音', sub: '按喇叭聽詞語，再點一個注音朋友。' },
  { id: 'build', name: '注音小火車', level: '自己試試拼音', color: 'lilac', art: '<i>ㄇ</i><span>＋</span><i>ㄠ</i>', desc: '聽詞語，排好車廂，按出發試試！', title: '讓注音朋友坐上小火車', sub: '先聽詞語，再排車廂。排好了就按「出發」！' },
  { id: 'picture', name: '聲音尋寶', level: '聽詞找圖', color: 'sky', art: '🔍<span class="sound-bubble">🐰</span>', desc: '聽一聽，是哪一張圖片的聲音？', title: '喇叭說的是哪個朋友？', sub: '先按「聽一聽」，再點對應的圖片。' },
  { id: 'rhyme', name: '押韻好朋友', level: '發現相似聲音', color: 'butter', art: '🐱<span>♫</span>🍑', desc: '貓和桃，尾巴聲音好像喔！', title: '誰的尾巴聲音和我像？', sub: '聽目標和下面三個詞，找出押韻朋友。' },
  { id: 'memory', name: '注音翻翻卡', level: '字形配對', color: 'rose', art: '<i>？</i><i>ㄇ</i>', desc: '翻開小卡片，找出注音朋友。', title: '翻翻看，誰和誰是一對？', sub: '點兩張卡片，找出相同的符號。' },
  { id: 'initial', name: '同聲好朋友', level: '聽開頭聲音', color: 'mint', art: '🐱<span>♫</span>🐴', desc: '貓和馬，開頭都住著哪個聲音？', title: '誰的開頭聲音和我一樣？', sub: '先聽上面的詞，再聽選項，找同聲朋友。' },
  { id: 'syllables', name: '拍手小樂隊', level: '數數聲音', color: 'butter', art: '👏<span>♫</span>🍉', desc: '一個聲音拍一下，聽出詞語有幾拍。', title: '這個詞語有幾個聲音？', sub: '慢慢說，一個字拍一下，再選幾拍。' },
  { id: 'repair', name: '注音修理站', level: '找回缺少的符號', color: 'sky', art: '<i>ㄇ</i><span>🔧</span><i>？</i>', desc: '哪個注音不見了？幫它回到車廂。', title: '誰可以補上空空的車廂？', sub: '先聽詞語，再找一個注音補上空位。' },
  { id: 'tone', name: '聲調滑滑梯', level: '感覺聲音高低', color: 'peach', art: '🛝<span>♫</span>ˊ', desc: '聲音平平、往上，還是往下走？', title: '聲音走的是哪一條路？', sub: '聽詞語，和大人比手勢，再選聲音的路線。' },
  { id: 'adventure', name: '花園大冒險', level: '五站混合探索', color: 'lilac', art: '🐰<span>→</span>🏕️', desc: '小兔去旅行，每一站都有不同玩法！', title: '', sub: '' },
  { id: 'bingo', name: '注音花朵賓果', level: '集滿一排朋友', color: 'rose', art: '<i>ㄅ</i><span>✿</span><i>ㄇ</i>', desc: '找到小兔喊的符號，連成一排開花！', title: '找到朋友，讓一排花開！', sub: '看小兔的注音卡，找到相同符號。連成一排 3 個，就賓果！' },
  { id:'pack', name:'聲音小背包', level:'聽詞記順序', color:'butter', art:'🎒<span class="sound-bubble">♫</span>', desc:'聽小兔的清單，把圖片卡依序放進背包。', title:'小兔的背包先放誰？', sub:'聽小兔說完，依序放入圖片卡；放好才檢查。' },
  { id:'mail', name:'聲音郵差', level:'開頭聲音分類', color:'sky', art:'✉️<span>→</span>🏡', desc:'拿起圖片信，把它送到開頭一樣的家。', title:'幫小兔送圖片信', sub:'先點一封信，再點開頭聲音相同的家。可以聽聽每個家的朋友。' },
  { id:'odd', name:'誰的開頭不一樣', level:'比較三個聲音', color:'mint', art:'🐱<span>🐴</span>🐶', desc:'三位朋友，誰的開頭聲音不一樣？', title:'誰的開頭聲音不一樣？', sub:'兩個朋友的開頭一樣，找出另一個。每張卡片都能重聽。' },
  { id:'workshop', name:'詞語拼拼樂', level:'進階 · 和大人拼詞', color:'lilac', art:'🧩<span>＋</span>🧩', desc:'一塊積木一個聲音，排出整個生活詞。', title:'把詞語的聲音排起來', sub:'先聽整個詞，一個字一塊積木。和大人一起排好，再按「拼好了」。' },
  { id:'balance', name:'聲音小天平', level:'比較聲音的數量', color:'butter', art:'👏<span>⚖️</span>👏', desc:'一字拍一下，哪邊的聲音比較多？', title:'哪邊的詞語聲音比較多？', sub:'慢慢念，一個字拍一下。比較兩個詞，也可能一樣多喔！' }
  ,{ id:'soundMemory',name:'聽音翻翻卡',level:'記住聲音與圖片',color:'sky',art:'♫<span>↔</span>🐰',desc:'翻開聲音卡，找出它的圖片朋友。',title:'讓聲音和圖片變朋友',sub:'聽完整詞語，再找圖片。' }
];
function home() {
  stopSpeech(); game = null;
  const invitation={...nextInvitation(progress)}, badges=earnedBadges(progress);
  if(invitation.mode==='odd'&&prefs.oddSound==='rhyme')invitation.text='小兔想聽仔細：三個詞，誰和另外兩個不押韻？';
  const displayModes=modes.map(mode=>mode.id==='odd'&&prefs.oddSound==='rhyme'?{...mode,name:'誰的尾音不一樣',art:'🐱<span>🍑</span>🐶',level:'比較三個尾音',desc:'兩個朋友押韻，找出另一個。'}:mode);
  $('#app').innerHTML = `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> 給小小探險家的聲音遊樂場</div><h1>聽見聲音，<br>讓注音<span class="accent">開花。</span></h1><p>和小兔一起找一找、聽一聽、拼一拼。<br>每天一點點，發現注音的樂趣。</p><div class="hero-tags"><span>🌱 ${words.length} 個生活字</span><span>👏 ${phrases.length} 個詞語</span><span>🎲 ${modes.length} 種小遊戲</span></div></div><div class="hero-art">${art}<span class="art-tag">今天想認識哪個朋友？</span></div></section>
    <section class="garden-hub"><div class="invitation"><span>${invitation.emoji}</span><div><strong>小兔的邀請</strong><p>${invitation.text}</p></div><button id="invitation" class="primary">一起玩 →</button></div><div class="explore-links"><button id="my-garden">🌷 我的花園<span>布置自己的小天地</span></button><button id="album">📖 聲音圖鑑<span>${vocabulary.length} 個字詞，想聽哪一個？</span></button></div>${badges.length ? `<div class="badge-shelf" aria-label="我的探險徽章">${badges.map(b=>`<span title="${b.name}">${b.emoji} ${b.name}</span>`).join('')}</div>` : '<p class="hub-note">玩完一回合，就會有新朋友來花園。隨時都可以休息。</p>'}</section>
    <section class="play-section"><div class="section-title"><div><span class="eyebrow">LET’S PLAY</span><h2>今天想玩什麼？</h2></div><span class="collection">✿ 已種下 <b>${progress.flowers}</b> 朵小花</span></div>
    <div class="theme-picker" aria-label="生活詞主題">${Object.entries(categories).map(([id, name]) => `<button data-theme="${id}" aria-pressed="${prefs.category === id}">${name}${id === 'all' ? ' ' + vocabulary.length : ''}</button>`).join('')}</div>
    <p class="theme-note">主題用於聽詞、尋寶、拼音、修理站、聲調、拍手、背包、拼詞、小天平與聽音翻卡；押韻、同聲、郵差與開頭比較的朋友來自整座花園。</p>
    <div class="game-cards">${displayModes.map((m, i) => `<button class="game-card ${m.color}" data-mode="${m.id}"><span class="card-top"><span class="level">${String(i + 1).padStart(2,'0')} · ${m.level}</span><span>↗</span></span><span class="card-art ${['match','build','memory','repair','bingo'].includes(m.id) ? 'train-art' : ''} ${['rhyme','initial'].includes(m.id) ? 'rhyme-art' : ''}">${m.art}</span><strong>${m.name}</strong><span class="card-desc">${m.desc}</span><span class="card-bottom">${m.id === 'memory' ? Math.min(prefs.memoryPairs,GardenData.symbolRange(prefs.scope,[...prefs.customSymbols]).length)+' 對小卡' : m.id==='soundMemory'?prefs.soundPairs+' 對聲音與圖片':m.id==='adventure'?'5 個探險站':m.id==='bingo'?'集滿一排 3 個':m.id==='mail'?prefs.mailHouses+' 個家 · '+prefs.mailHouses*2+' 封信':'每回合 5 題'} <span>開始玩 →</span></span></button>`).join('')}</div></section>
    <section class="music-strip"><span>🎶</span><div><strong>讓小花園有一點音樂</strong><p id="home-music-status">${musicStatus()}</p></div><button id="home-music" class="quiet">${prefs.music ? '關閉音樂' : '播放背景音樂'} →</button></section>
    <section class="parent-strip"><span>🌼</span><div><strong>每個孩子都有自己的步調。</strong><p>不倒數、不扣分。答錯就再試試，玩完一回合可以休息一下。</p></div><button id="tips">看看親子玩法 →</button></section><p id="offline-note" class="offline-note" role="status">${GardenOffline.status()}</p>`;
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => start(b.dataset.mode));
  document.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { const position = window.scrollY; prefs.category = b.dataset.theme; save(); effect('tap'); home(); window.scrollTo(0, position); });
  const picker=document.createElement('div');picker.className='play-picker';picker.setAttribute('aria-label','選擇玩法類型');
  picker.innerHTML=Object.entries(playGroups).map(([id,group])=>`<button data-play-group="${id}" aria-pressed="${playGroup===id}">${group.name}</button>`).join('');
  $('.game-cards').before(picker);
  const groupNote=document.createElement('p');groupNote.id='play-group-note';groupNote.className='theme-note';groupNote.setAttribute('role','status');picker.after(groupNote);
  const applyGroup=()=>{
    const group=playGroups[playGroup];let count=0;
    document.querySelectorAll('[data-mode]').forEach(card=>{card.hidden=!!group.ids&&!group.ids.includes(card.dataset.mode);if(!card.hidden)count++;});
    document.querySelectorAll('[data-play-group]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.playGroup===playGroup)));
    groupNote.textContent=`${group.name} · ${count} 種玩法。${group.note}`;
  };
  picker.querySelectorAll('button').forEach(button=>button.onclick=()=>{playGroup=button.dataset.playGroup;effect('tap');applyGroup();});applyGroup();
  $('#invitation').onclick=()=>start(invitation.mode); $('#my-garden').onclick=()=>renderGarden(); $('#album').onclick=()=>renderAlbum();
  $('#home-music').onclick = toggleMusic; $('#tips').onclick = openSettings; GardenOffline.refresh();window.scrollTo(0, 0);
}
function start(mode, invited=null, options={}) {
  stopSpeech(); effect('tap');
  const preferred=invited||(prefs.practice==='favorite'?progress.favorites:[]);
  const generators={
    mail:()=>GardenChallenges.makeMailRound(progress.recent,preferred,prefs.mailHouses),
    odd:()=>GardenChallenges.makeOddRound(progress.recent,preferred,prefs.oddSound),
    pack:()=>GardenData.makePackRound(prefs.category,prefs.packSize,progress.recent,preferred),
    adventure:()=>makeAdventure(prefs.scope,prefs.category,prefs.buildLevel,progress.recent,[...prefs.customSymbols],preferred),
    workshop:()=>GardenExtensions.makeWorkshopRound(prefs.category,options.workshopSize||prefs.workshopSize,progress.recent,preferred),
    balance:()=>GardenExtensions.makeBalanceRound(prefs.category,prefs.balanceSize,progress.recent,preferred),
    soundMemory:()=>GardenSoundMemory.makeDeck(prefs.category,prefs.soundPairs,progress.recent,preferred)
  };
  const questions=generators[mode]?generators[mode]():makeRound(mode,prefs.scope,prefs.category,prefs.buildLevel,progress.recent,prefs.memoryPairs,[...prefs.customSymbols],preferred);
  game = { session:mode, mode:mode==='adventure'?questions[0].mode:mode, questions, index: 0, done: false, selected: [], used: [], matched: [], flipped: [], preview: false, locked: false, claps: 0, hints: 0 };
  if (mode === 'memory') { renderMemory(); window.scrollTo(0, 0); }
  else if(mode==='mail'){game.delivered=[];game.mailSelected='';renderMail();}
  else if(mode==='odd')renderOdd();
  else if(mode==='workshop')renderWorkshop();
  else if(mode==='balance'){game.balanceClaps={left:0,right:0};renderBalance();}
  else if(mode==='soundMemory'){game.soundState=GardenSoundMemory.initialState();window.scrollTo(0,0);renderSoundMemory();}
  else if(mode==='pack')renderPack();
  else if(mode==='bingo'){game.calls=GardenData.shuffle(questions.map(c=>c.symbol));game.roundDone=false;renderBingo();window.scrollTo(0,0);}
  else renderGame();
}
function heading(name, current, count) { return `<div class="game-heading"><button id="back" class="quiet">← 回到花園</button><span>${name}</span><span>${current}${typeof count==='number'?' / ':' '}${count}</span></div>`; }
function questionSpeech(q) {
  return `${q.word}。${q.word}。`;
}
function renderGame() {
  const q = game.questions[game.index], mode = game.mode, info = modes.find(m => m.id === mode);
  const isPictures = ['picture', 'rhyme', 'initial'].includes(mode);
  const target = mode === 'match' ? q.answer : mode === 'picture' ? '<span class="word-picture">🔊</span><span class="word-label">聲音藏在這裡</span>' : `<span class="word-picture" role="img" aria-label="${q.word}">${visual(q)}</span><span class="word-label">${q.word}</span>`;
  const options = q.options.map((option, i) => {
    if (isPictures) return `<div class="picture-option"><button class="choice picture-choice" data-index="${i}" aria-label="選擇 ${option.word}"><span class="option-emoji" aria-hidden="true">${visual(option)}</span><span class="option-word">${option.word}</span></button>${mode !== 'picture' ? `<button class="word-replay" data-listen="${i}" aria-label="聽 ${option.word}">♫ 聽一聽</button>` : ''}</div>`;
    if (mode === 'tone') return `<button class="choice tone-choice" data-index="${i}" aria-label="選擇 ${option.value} 聲 ${option.label}"><svg viewBox="0 0 100 75" aria-hidden="true"><path d="${option.path}"/></svg><strong>${option.value} 聲 ${option.mark === '一聲' ? '─' : option.mark}</strong><small>${option.label}</small></button>`;
    if (mode === 'syllables') return `<button class="choice clap-choice" data-index="${i}" aria-label="選擇 ${option} 拍"><span>${'👏'.repeat(option)}</span><strong>${option} 拍</strong></button>`;
    return `<button class="choice" data-index="${i}" aria-label="選擇 ${option}">${option}</button>`;
  }).join('');
  $('#app').innerHTML = `<section class="game-panel">${heading((game.session==='adventure'?'花園大冒險 · ':'')+info.name, game.index + 1, 5)}<div class="step-dots ${game.session==='adventure'?'adventure-path':''}" aria-label="第 ${game.index + 1} 題，共 5 題">${game.questions.map((item, i) => `<span class="${i < game.index ? 'finished' : i === game.index ? 'current' : ''}">${i < game.index ? '✿' : game.session==='adventure'?{match:'🔎',picture:'🗺️',syllables:'👏',listen:'👂',build:'🚂',repair:'🔧'}[item.mode]:i+1}</span>`).join('')}</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p>
    ${q.category ? `<div class="question-theme">${categories[q.category]}${prefs.category !== 'all' && prefs.category !== q.category && ['build','repair','syllables'].includes(mode) ? ' · 加入另一個主題的朋友' : ''}</div>` : ''}
    <div class="target ${mode === 'match' ? 'symbol-target' : ''}">${target}</div>
    ${mode === 'match' ? '' : `<button id="replay" class="replay">♫ ${mode === 'picture' ? '聽一聽神祕詞語' : '聽一聽「' + q.word + '」'}</button><p id="audio-note" class="audio-note">${audioNote()}</p>${mode === 'picture' ? `<details class="caregiver-prompt" ${!prefs.sound || !voices.length ? 'open' : ''}><summary>大人讀題／看看提示</summary><p>請讀出「<b>${q.word}</b>」，讓孩子找圖片。</p></details>` : ''}`}
    ${['build','repair'].includes(mode) ? `<p class="train-note">${mode === 'build' ? '點注音讓朋友上車；點已填車廂可以取下。' : '找到缺少的注音，讓詞語完整。'} 聲調已放好。</p><div class="train" aria-label="拼音位置">${q.parts.map((part, i) => mode === 'build' ? `<button class="carriage" data-slot="${i}" aria-label="第 ${i+1} 節車廂，空位">？</button>` : `<div class="carriage ${i === q.missing ? 'missing' : 'filled'}">${i === q.missing ? '？' : part}</div>`).join('')}<span class="tone">${q.tone || '一聲'}</span></div>` : ''}
    ${mode === 'syllables' ? '<div class="clap-tool"><button id="clap" class="replay">👏 拍一下</button><span id="clap-count" role="status">還沒拍手</span><button id="clap-reset" class="quiet">重新拍</button></div>' : ''}
    <div class="choices ${isPictures ? 'picture-choices' : ''} ${['tone','syllables'].includes(mode) ? 'four-choices' : ''}">${options}</div><div id="feedback" class="feedback" role="status" aria-live="polite">慢慢找，你可以的！</div><div class="game-actions">${mode === 'build' ? '<button id="undo" class="quiet">↶ 重新排一次</button><button id="hint" class="quiet">💡 幫我一小步</button><button id="depart" class="primary" disabled>🚂 出發，試試看！</button>' : ''}<button id="next" class="primary" hidden>${game.index === 4 ? '看看我的小花園 ✿' : '下一個朋友 →'}</button></div></section>`;
  $('#back').onclick = home;
  document.querySelectorAll('[data-index]').forEach(b => b.onclick = () => answer(Number(b.dataset.index), b));
  document.querySelectorAll('[data-listen]').forEach(b => b.onclick = () => speak(q.options[Number(b.dataset.listen)].word));
  if ($('#replay')) $('#replay').onclick = () => speak(questionSpeech(q));
  if (mode === 'build') {
    $('#undo').onclick = () => { game.selected = []; game.used = []; effect('tap'); updateTrain('再聽一次，重新安排朋友上車。'); };
    $('#depart').onclick = () => { const result = checkTrain(q.parts, game.selected); if (!result.ready) return; if (result.correct) solved(q); else retry($('#depart'), '聲音還沒接起來。重聽詞語，點車廂取下朋友再試試。'); };
    $('#hint').onclick = () => { const hint = nextHint(q.parts, game.selected); game.hints++; effect('tap'); $('#feedback').textContent = hint ? `小兔幫你一小步：第 ${hint.position+1} 節車廂試試「${hint.symbol}」。` : '朋友都坐好了，按出發試試看！'; };
    document.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { const i = Number(b.dataset.slot); if (game.done || i >= game.selected.length) return; game.selected.splice(i,1); game.used.splice(i,1); effect('tap'); updateTrain('朋友下車了，可以換個位置再試試。'); });
    updateTrain();
  }
  if ($('#clap')) {
    $('#clap').onclick = () => { if (game.done) return; game.claps++; effect('clap'); $('#clap-count').textContent = `我拍了 ${game.claps} 下`; };
    $('#clap-reset').onclick = () => { game.claps = 0; effect('tap'); $('#clap-count').textContent = '還沒拍手'; };
  }
  $('#next').onclick = next; window.scrollTo(0, 0);
}
function updateTrain(message) {
  const q = game.questions[game.index];
  document.querySelectorAll('[data-slot]').forEach((b,i) => { b.textContent = game.selected[i] || '？'; b.classList.toggle('filled', i < game.selected.length); b.setAttribute('aria-label', `第 ${i+1} 節車廂，${game.selected[i] || '空位'}${i < game.selected.length ? '，點選取下' : ''}`); b.disabled = game.done; });
  document.querySelectorAll('[data-index]').forEach(b => { const used = game.used.includes(Number(b.dataset.index)); b.disabled = game.done || used; b.classList.toggle('onboard', used); });
  $('#depart').disabled = game.done || game.selected.length !== q.parts.length;
  if (message) $('#feedback').textContent = message;
}
function answer(index, button) {
  if (game.done) return;
  const q = game.questions[game.index];
  if (game.mode === 'build') {
    if (game.used.includes(index) || game.selected.length >= q.parts.length) return;
    game.selected.push(q.options[index]); game.used.push(index); effect('place');
    updateTrain(game.selected.length === q.parts.length ? '車廂排好了！按「出發」聽聽看。' : '朋友上車了，再找下一個！'); return;
  } else {
    const selected = ['picture', 'rhyme', 'initial'].includes(game.mode) ? q.options[index].word : game.mode === 'tone' ? q.options[index].value : q.options[index];
    if (selected !== q.answer) { retry(button, game.mode === 'rhyme' ? '再聽一次，找尾巴聲音相像的朋友。' : game.mode === 'syllables' ? '慢慢說，一個字拍一下，再數看看。' : '還沒找到，再看一看、聽一聽。'); return; }
    button.classList.add('correct');
  }
  solved(q);
}
function solved(q) {
  game.done = true; effect('correct');
  rememberWord(progress,q.word); save();
  if(game.mode==='repair'){const slot=$('.carriage.missing');slot.textContent=q.answer;slot.classList.remove('missing');slot.classList.add('filled');}
  document.querySelectorAll('[data-index], [data-slot], #hint, #depart, #clap, #clap-reset').forEach(b => b.disabled = true);
  const message = ['build','repair'].includes(game.mode) ? `✿ 拼好了！${q.zhuyin}，${q.word}！` : game.mode === 'rhyme' ? `✿ ${q.word}和${q.answer}，尾巴都有「${q.rhyme}」！` : game.mode === 'initial' ? `✿ ${q.word}和${q.answer}，開頭都是「${q.initial}」！` : game.mode === 'syllables' ? `✿ ${q.word}，有 ${q.count} 個聲音，拍 ${q.count} 下！` : game.mode === 'tone' ? `✿ ${q.word}，${q.answer} 聲。${GardenData.tones[q.answer-1].label}！` : game.mode === 'picture' ? `✿ 找到了！這是「${q.word}」。` : '✿ 找到了！一朵小花為你開了。';
  $('#feedback').classList.add('success'); $('#feedback').textContent = message;
  $('#next').hidden = false; $('#next').focus({ preventScroll: true }); if ($('#undo')) $('#undo').hidden = true;
  if (game.mode === 'build') speak(q.word);
  if (['rhyme','initial'].includes(game.mode)) speak(`${q.word}。${q.answer}。`);
}
function retry(button, message) { effect('retry'); button.classList.remove('wiggle'); void button.offsetWidth; button.classList.add('wiggle'); $('#feedback').textContent = message; }
function next() {
  if (!game.done) return; stopSpeech();
  if (game.index === 4) complete(5);
  else { effect('tap'); game.index++; game.mode=game.questions[game.index].mode||game.session; game.done = false; game.selected = []; game.used = []; game.claps = 0; if(game.mode==='pack')renderPack();else if(game.mode==='odd')renderOdd();else if(game.mode==='workshop')renderWorkshop();else if(game.mode==='balance'){game.balanceClaps={left:0,right:0};renderBalance();}else renderGame(); }
}
function renderMail(){
  const round=game.questions, info=modes.find(m=>m.id==='mail');
  $('#app').innerHTML=`<section class="game-panel mail-panel">${heading(info.name,0,round.cards.length)}<div class="mail-banner" aria-hidden="true">🐰 ✉️</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p><p id="audio-note" class="audio-note">${audioNote()}</p><div class="mail-houses" style="--houses:${round.houses.length}" aria-label="聲音朋友的家">${round.houses.map((h,i)=>`<div class="mail-home"><button data-house="${i}" class="mail-house" aria-label="送到 ${h.symbol} 的家"><small>開頭的聲音</small><strong>${h.symbol}</strong><span class="house-stamps" aria-label="已送到 0 封">○ ○</span></button><button data-house-listen="${i}" class="word-replay" aria-label="聽 ${h.symbol} 家的例子 ${h.example.word}">♫ 像「${h.example.word}」</button></div>`).join('')}</div><p id="mail-selection" class="mail-selection" role="status">先選一封圖片信</p><div class="mail-cards">${round.cards.map((w,i)=>`<div><button data-mail="${i}" class="mail-card" aria-pressed="false" aria-label="拿起 ${w.word} 的信"><span aria-hidden="true">${visual(w)}</span><strong>${w.word}</strong><small>✉️ 待送達</small></button><button data-mail-listen="${i}" class="word-replay" aria-label="聽信上的 ${w.word}">♫ 聽一聽</button></div>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">不用急，選錯了還可以再試試。</div><div class="game-actions"><button id="mail-hint" class="quiet">💡 幫我送一封</button><button id="mail-finish" class="primary" hidden>送完了！看看小花園 ✿</button></div><p class="note">開頭的注音可能是聲母，也可能是ㄧ、ㄨ、ㄩ。請大人念完整詞語，陪孩子聽開頭。</p></section>`;
  $('#back').onclick=home;
  document.querySelectorAll('[data-mail]').forEach(b=>b.onclick=()=>{
    if(game.done)return;
    const w=round.cards[Number(b.dataset.mail)];if(game.delivered.includes(w.word))return;
    game.mailSelected=w.word;effect('tap');updateMail();speak(w.word);
    $('#feedback').classList.remove('success');$('#feedback').textContent=`拿好「${w.word}」的信了，聽聽看，要送到哪個家？`;
  });
  document.querySelectorAll('[data-mail-listen]').forEach(b=>b.onclick=()=>speak(round.cards[Number(b.dataset.mailListen)].word));
  document.querySelectorAll('[data-house-listen]').forEach(b=>b.onclick=()=>speak(round.houses[Number(b.dataset.houseListen)].example.word));
  document.querySelectorAll('[data-house]').forEach(b=>b.onclick=()=>{
    if(game.done||!game.mailSelected)return;
    const w=round.cards.find(w=>w.word===game.mailSelected),house=round.houses[Number(b.dataset.house)];
    if(w.initial!==house.symbol){retry(b,'再聽信上的詞和這個家的例子，開頭聲音有一樣嗎？');return;}
    game.delivered.push(w.word);game.mailSelected='';game.done=game.delivered.length===round.cards.length;
    rememberWord(progress,w.word);save();effect('correct');updateMail();
    $('#feedback').classList.add('success');$('#feedback').textContent=game.done?'✿ 每一封信都送到了！謝謝小郵差。':`✿ ${w.word}的信送到了！開頭是「${w.initial}」，再選一封吧。`;
    if(game.done)$('#mail-finish').focus({preventScroll:true});
  });
  $('#mail-hint').onclick=()=>{
    const hint=GardenChallenges.nextMailHint(round,game.delivered,game.mailSelected);if(!hint)return;
    game.hints++;effect('tap');$('#feedback').classList.remove('success');
    $('#feedback').textContent=`只幫這一封：「${hint.word}」開頭是「${hint.symbol}」。拿起它，找相同的家。`;
  };
  $('#mail-finish').onclick=()=>{if(game.done)complete(round.cards.length);};
  updateMail();window.scrollTo(0,0);
}
function updateMail(){
  const round=game.questions;
  $('.game-heading>span:last-child').textContent=`${game.delivered.length} / ${round.cards.length}`;
  document.querySelectorAll('[data-mail]').forEach(b=>{
    const w=round.cards[Number(b.dataset.mail)],delivered=game.delivered.includes(w.word);
    b.disabled=delivered;b.classList.toggle('delivered',delivered);b.setAttribute('aria-pressed',String(game.mailSelected===w.word));
    b.setAttribute('aria-label',`${w.word}的信，${delivered?'已送達':'點一下拿起'}`);b.querySelector('small').textContent=delivered?'✿ 已送達':'✉️ 待送達';
  });
  document.querySelectorAll('[data-house]').forEach(b=>{
    const h=round.houses[Number(b.dataset.house)],count=round.cards.filter(w=>w.initial===h.symbol&&game.delivered.includes(w.word)).length;
    b.disabled=game.done||!game.mailSelected;b.querySelector('.house-stamps').textContent='✿ '.repeat(count)+'○ '.repeat(2-count);
    b.querySelector('.house-stamps').setAttribute('aria-label',`已送到 ${count} 封`);
  });
  $('#mail-selection').textContent=game.done?'信袋空空，朋友們都收到了信！':game.mailSelected?`手上拿著：${game.mailSelected} ✉️ → 點上面的家`:'先選一封圖片信';
  $('#mail-hint').hidden=game.done;$('#mail-finish').hidden=!game.done;
}
function renderOdd(){
  const q=game.questions[game.index],info=modes.find(m=>m.id==='odd');
  const ending=q.comparison==='rhyme',part=ending?'尾巴聲音':'開頭',name=ending?'誰的尾音不一樣':info.name;
  const title=ending?'誰和另外兩個不押韻？':info.title,sub=ending?'兩個朋友的尾巴聲音相像，找出另一個。慢慢念，聲調不同也能押韻。':info.sub;
  $('#app').innerHTML=`<section class="game-panel odd-panel">${heading(name,game.index+1,5)}<div class="step-dots">${game.questions.map((_,i)=>`<span class="${i<game.index?'finished':i===game.index?'current':''}">${i<game.index?'✿':i+1}</span>`).join('')}</div><div class="odd-mascot" aria-hidden="true">🐰 🔎</div><h1 class="question-title">${title}</h1><p class="question-sub">${sub}</p><button id="odd-replay" class="replay">♫ 一起聽三個詞</button><p id="audio-note" class="audio-note">${audioNote()}</p><div class="choices picture-choices">${q.options.map((w,i)=>`<div class="picture-option"><button class="choice picture-choice" data-odd="${i}" aria-label="${w.word}的${part}不一樣"><span class="option-emoji" aria-hidden="true">${visual(w)}</span><span class="option-word">${w.word}</span></button><button data-odd-listen="${i}" class="word-replay" aria-label="聽 ${w.word}">♫ 聽一聽</button></div>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">先慢慢聽，再點一位${part}不同的朋友。</div><div class="game-actions"><button id="odd-hint" class="quiet">💡 先聽一個${part}</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一組朋友 →'}</button></div></section>`;
  $('#back').onclick=home;$('#next').onclick=next;
  $('#odd-replay').onclick=()=>speak(q.options.map(w=>w.word+'。').join(''));
  document.querySelectorAll('[data-odd-listen]').forEach(b=>b.onclick=()=>speak(q.options[Number(b.dataset.oddListen)].word));
  $('#odd-hint').onclick=()=>{effect('tap');game.hints++;const w=q.options[0];$('#feedback').textContent=`先聽「${w.word}」，它的${part}是「${ending?w.rhyme:w.initial}」。再聽其他兩個，誰和誰一樣？`;};
  document.querySelectorAll('[data-odd]').forEach(b=>b.onclick=()=>{
    if(game.done)return;const w=q.options[Number(b.dataset.odd)];
    if(w.word!==q.answer){retry(b,`再聽三個詞，找出${part}和另外兩個不一樣的朋友。`);return;}
    game.done=true;effect('correct');q.options.forEach(w=>rememberWord(progress,w.word));save();b.classList.add('correct');
    document.querySelectorAll('[data-odd],#odd-hint').forEach(b=>b.disabled=true);
    $('#feedback').classList.add('success');$('#feedback').textContent=`✿ ${q.options.filter(w=>w.word!==q.answer).map(w=>w.word).join('和')}的${part}都是「${q.commonSound}」；${q.answer}的${part}是「${q.oddSound}」，不一樣！`;
    $('#next').hidden=false;$('#next').focus({preventScroll:true});
  });
  window.scrollTo(0,0);
}
function packSpeech(q){return q.sequence.map((w,i)=>(i===0?'首先':i===q.sequence.length-1?'最後':'接著')+'，'+w.word+'。').join('');}
function renderPack(){
  const q=game.questions[game.index], info=modes.find(m=>m.id==='pack');
  $('#app').innerHTML=`<section class="game-panel pack-panel">${heading(info.name,game.index+1,5)}<div class="step-dots" aria-label="第 ${game.index+1} 題，共 5 題">${game.questions.map((_,i)=>`<span class="${i<game.index?'finished':i===game.index?'current':''}">${i<game.index?'✿':i+1}</span>`).join('')}</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p><div class="question-theme">${categories[q.category]} · ${q.sequence.length} 張圖片卡</div><div class="pack-mascot" aria-hidden="true">🐰 🎒</div><button id="pack-replay" class="replay">♫ 聽小兔的清單</button><p id="audio-note" class="audio-note">${audioNote()}</p><details class="caregiver-prompt" ${!prefs.sound||!voices.length?'open':''}><summary>大人讀題／看看順序</summary><p>請按順序讀：${q.sequence.map((w,i)=>`<b>${i+1}．${w.word}</b>`).join(' → ')}。</p></details><p class="train-note">點圖片卡放入背包；點已填位置可以取下。可以隨時重聽。</p><div class="pack-slots" aria-label="背包的圖片順序">${q.sequence.map((_,i)=>`<button data-pack-slot="${i}" aria-label="背包第 ${i+1} 個位置，空位"><small>${i+1}</small><span>？</span></button>`).join('')}</div><div class="pack-options">${q.options.map((w,i)=>`<div><button data-pack="${i}" class="pack-option" aria-label="放入 ${w.word}"><span aria-hidden="true">${visual(w)}</span><strong>${w.word}</strong></button><button data-pack-listen="${i}" class="word-replay" aria-label="聽圖片卡 ${w.word}">♫ 聽這張</button></div>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">先聽清單，再把朋友依序放好。</div><div class="game-actions"><button id="pack-reset" class="quiet">↶ 重新裝一次</button><button id="pack-hint" class="quiet">💡 幫我一小步</button><button id="pack-check" class="primary" disabled>🎒 裝好了，試試看！</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一個背包 →'}</button></div></section>`;
  $('#back').onclick=home;$('#next').onclick=next;
  $('#pack-replay').onclick=()=>speak(packSpeech(q));
  document.querySelectorAll('[data-pack-listen]').forEach(b=>b.onclick=()=>speak(q.options[Number(b.dataset.packListen)].word));
  document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{
    const index=Number(b.dataset.pack);if(game.done||game.used.includes(index)||game.selected.length>=q.sequence.length)return;
    game.selected.push(q.options[index].word);game.used.push(index);effect('place');updatePack('圖片卡放好了，可以繼續找下一張。');
  });
  document.querySelectorAll('[data-pack-slot]').forEach(b=>b.onclick=()=>{
    const index=Number(b.dataset.packSlot);if(game.done||index>=game.selected.length)return;
    game.selected.splice(index,1);game.used.splice(index,1);effect('tap');updatePack('圖片卡拿出來了，可以再換一張。');
  });
  $('#pack-reset').onclick=()=>{game.selected=[];game.used=[];effect('tap');updatePack('背包空好了，重聽清單再慢慢放。');};
  $('#pack-hint').onclick=()=>{
    const hint=nextHint(q.sequence.map(w=>w.word),game.selected);game.hints++;effect('tap');
    $('#feedback').textContent=hint?`小兔幫你一小步：第 ${hint.position+1} 個位置試試「${hint.symbol}」。`:'圖片卡都放好了，按「裝好了」試試看！';
  };
  $('#pack-check').onclick=()=>{
    const result=checkTrain(q.sequence.map(w=>w.word),game.selected);if(!result.ready)return;
    if(!result.correct){retry($('#pack-check'),'順序還沒接起來。重聽清單，點圖片卡取下再試試。');return;}
    game.done=true;effect('correct');q.sequence.forEach(w=>rememberWord(progress,w.word));save();
    document.querySelectorAll('[data-pack], [data-pack-slot], #pack-reset, #pack-hint, #pack-check').forEach(b=>b.disabled=true);
    $('#feedback').classList.add('success');$('#feedback').textContent='✿ 背包裝好了！'+q.sequence.map(w=>w.word+'（'+w.zhuyin+'）').join(' → ');
    $('#next').hidden=false;$('#next').focus({preventScroll:true});
  };
  updatePack();window.scrollTo(0,0);
}
function updatePack(message){
  const q=game.questions[game.index];
  document.querySelectorAll('[data-pack-slot]').forEach((b,i)=>{
    const w=q.options.find(w=>w.word===game.selected[i]);b.innerHTML=`<small>${i+1}</small><span>${w?visual(w):'？'}</span>`;
    b.classList.toggle('filled',!!w);b.setAttribute('aria-label',`背包第 ${i+1} 個位置，${w?w.word+'，點一下取下':'空位'}`);
  });
  document.querySelectorAll('[data-pack]').forEach(b=>{const used=game.used.includes(Number(b.dataset.pack));b.disabled=used||game.selected.length===q.sequence.length;b.classList.toggle('onboard',used);});
  $('#pack-check').disabled=game.selected.length!==q.sequence.length;
  if(message)$('#feedback').textContent=message;
}
function renderMemory(message = '翻開兩張卡片，找找相同的朋友。') {
  const info = modes.find(m => m.id === 'memory');
  const pairs=game.questions.length/2;
  $('#app').innerHTML = `<section class="game-panel">${heading(info.name, game.matched.length, pairs)}<h1 class="question-title memory-title">${info.title}</h1><p class="question-sub">${info.sub}</p><div class="memory-grid ${pairs>3?'large-memory':''}">${game.questions.map((card, i) => {
    const matched = game.matched.includes(card.symbol), visible = matched || game.flipped.includes(i) || game.preview;
    return `<button class="memory-card ${matched ? 'paired' : visible ? 'revealed' : ''}" data-card="${i}" aria-label="${visible ? '注音 ' + card.symbol : '翻開第 ' + (i + 1) + ' 張卡片'}" ${matched || game.preview ? 'disabled' : ''}><span>${visible ? card.symbol : '✿'}</span><small>${matched ? '找到一對了' : visible ? '注音朋友' : '翻翻看'}</small></button>`;
  }).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">${message}</div><div class="game-actions"><button id="memory-hint" class="quiet" ${game.locked || game.done ? 'hidden' : ''}>${game.preview ? '蓋回卡片，開始找' : '先看看所有朋友'}</button><button id="memory-reset" class="primary" ${game.locked ? '' : 'hidden'}>翻回來，再試一次 ↶</button><button id="memory-finish" class="primary" ${game.done ? '' : 'hidden'}>看看我的小花園 ✿</button></div></section>`;
  $('#back').onclick = home;
  document.querySelectorAll('[data-card]').forEach(b => b.onclick = () => flipCard(Number(b.dataset.card)));
  $('#memory-reset').onclick = () => { game.flipped = []; game.locked = false; effect('flip'); renderMemory(); $('.memory-card:not(:disabled)')?.focus({preventScroll:true}); };
  $('#memory-hint').onclick = () => { game.preview = !game.preview; game.flipped = []; effect('flip'); renderMemory(game.preview ? '看看每個朋友的位置，準備好了就蓋回卡片。' : undefined); $('#memory-hint').focus({preventScroll:true}); };
  $('#memory-finish').onclick = () => complete(pairs);
}
function renderBingo(message='看小兔的卡片，找到一樣的注音朋友。'){
  const info=modes.find(m=>m.id==='bingo'), caller=game.calls[game.index];
  const line=GardenPlay.bingoLine(game.questions,game.matched);
  $('#app').innerHTML=`<section class="game-panel">${heading(info.name,game.matched.length,game.questions.length)}<h1 class="question-title memory-title">${info.title}</h1><p class="question-sub">${info.sub}</p><div class="bingo-caller"><span aria-hidden="true">🐰</span><div><small>小兔的卡片</small><strong>${caller}</strong></div></div><div class="bingo-grid">${game.questions.map((card,i)=>`<button data-bingo="${i}" aria-label="賓果符號 ${card.symbol}${game.matched.includes(card.symbol)?'，已開花':''}" class="${game.matched.includes(card.symbol)?'bloomed':''} ${line?.includes(i)?'bingo-line':''}" ${game.roundDone||game.matched.includes(card.symbol)?'disabled':''}><span>${card.symbol}</span><small>${game.matched.includes(card.symbol)?'✿':'找找看'}</small></button>`).join('')}</div><div id="feedback" class="feedback ${line?'success':''}" role="status" aria-live="polite">${message}</div><div class="game-actions">${game.roundDone&&!line?'<button id="bingo-next" class="primary">下一位朋友 →</button>':''}${line?'<button id="bingo-finish" class="primary">賓果！看看小花園 ✿</button>':''}</div><p class="note">沒有倒數，可以慢慢找；符號較少時，賓果盤也會變小。</p></section>`;
  $('#back').onclick=home;
  document.querySelectorAll('[data-bingo]').forEach(b=>b.onclick=()=>{
    if(game.roundDone)return;
    const card=game.questions[Number(b.dataset.bingo)];
    if(card.symbol!==caller){retry(b,'再看小兔的卡片，找同一個注音朋友。');return;}
    game.matched.push(card.symbol);game.roundDone=true;effect('correct');
    const won=GardenPlay.bingoLine(game.questions,game.matched);game.done=!!won;
    renderBingo(won?'✿ 賓果！一排注音朋友一起開花了！':'✿ 這個朋友開花了！準備好再找下一位。');
    ($('#bingo-finish')||$('#bingo-next'))?.focus({preventScroll:true});
  });
  if($('#bingo-next'))$('#bingo-next').onclick=()=>{game.index++;game.roundDone=false;effect('tap');renderBingo();};
  if($('#bingo-finish'))$('#bingo-finish').onclick=()=>complete(game.matched.length);
}
function flipCard(index) {
  const card = game.questions[index];
  if (game.done || game.locked || game.preview || game.matched.includes(card.symbol) || game.flipped.includes(index)) return;
  game.flipped.push(index);
  if (game.flipped.length < 2) { effect('flip'); renderMemory('找到一個朋友，再翻一張看看。'); focusMemory(index); return; }
  const [a, b] = game.flipped.map(i => game.questions[i]);
  if (a.symbol === b.symbol) {
    game.matched.push(a.symbol); game.flipped = []; effect('correct'); game.done = game.matched.length === game.questions.length/2;
    renderMemory(game.done ? '✿ 所有朋友都找到啦！' : '✿ 找到一對！繼續找其他朋友。');
  } else { game.locked = true; effect('retry'); renderMemory('這兩個朋友不一樣，記住位置再試一次。'); }
  focusMemory(index);
}
function focusMemory(index) {
  const current = $(`[data-card="${index}"]`);
  const target = game.done ? $('#memory-finish') : game.locked ? $('#memory-reset') : current && !current.disabled ? current : $('.memory-card:not(:disabled)');
  target?.focus({ preventScroll: true });
}
function complete(flowers) {
  if(game.rewarded)return;
  game.rewarded=true;
  const before=earnedBadges(progress).map(b=>b.id), oldDecor=availableDecorations(progress.rounds).map(d=>d.id);
  progress.flowers += flowers; progress.rounds++; progress.modes[game.session]=(progress.modes[game.session]||0)+1;
  save(); effect('finish'); finish(flowers,earnedBadges(progress).filter(b=>!before.includes(b.id)),availableDecorations(progress.rounds).filter(d=>!oldDecor.includes(d.id)));
}
function finish(flowers,newBadges=[],newDecor=[]) {
  const mode = game.session;
  $('#app').innerHTML = `<section class="finish"><div class="eyebrow">每一次嘗試，都在長大</div><div class="finish-flowers">${Array.from({length:flowers},(_,i)=>i%2?'🌼':'🌷').join(' ')}</div><h1>小花園又開花了！</h1><p>${mode === 'memory' ? `你找到了 ${flowers} 對注音朋友。` : mode==='soundMemory'?`你幫 ${flowers} 個聲音找到了圖片朋友！`:mode==='bingo'?`賓果！你找到 ${flowers} 個注音朋友，連成一排了！`:mode==='adventure'?'小兔完成五站旅行，謝謝你一起探險！':mode==='pack'?'你依順序裝好了 5 個小背包，謝謝你幫小兔準備！':mode==='mail'?`你幫小兔送了 ${flowers} 封圖片信，朋友都收到啦！`:mode==='odd'?`你和小兔比較了 5 組聲音，發現${game.questions[0].comparison==='rhyme'?'尾巴聲音':'開頭'}的不同！`:'你和 5 個聲音朋友一起玩過了。'}<br>伸個懶腰，和大人說說你最喜歡哪一個吧。</p><div class="finish-count">✿ 這次種下 ${flowers} 朵小花 · 累積 ${progress.flowers} 朵</div>${newBadges.length?`<div class="new-rewards">${newBadges.map(b=>`<span>${b.emoji} 新徽章：${b.name}</span>`).join('')}</div>`:''}${newDecor.length?`<p class="new-friend">${newDecor.map(d=>d.emoji+' '+d.name).join('、')}來花園了，可以去布置！</p>`:''}<div class="finish-actions"><button class="primary" id="rest">回到花園，休息一下</button><button class="quiet" id="decorate">🌷 布置我的花園</button><button class="quiet" id="again">再玩一回合 →</button></div><p class="note">花朵與徽章記錄參與，不代表精熟程度。</p></section>`;
  $('#rest').onclick = home; $('#again').onclick = () => start(mode); $('#decorate').onclick=()=>renderGarden(); window.scrollTo(0, 0);
}
function renderGarden(selected='tulip', message='先選朋友，再點花圃，布置你的小花園。') {
  stopSpeech(); game=null;
  const unlocked=availableDecorations(progress.rounds), scene=GardenPlay.scenes.find(s=>s.id===progress.weather)||GardenPlay.scenes[0];
  $('#app').innerHTML=`<section class="garden-page">${heading('我的花園',progress.rounds,'回合')}<div class="eyebrow">A LITTLE GARDEN OF YOUR OWN</div><h1>朋友們，來我的花園玩！</h1><p>每玩完一回合，都有機會遇見新朋友。可以隨時來布置。</p><div class="garden-weather" role="group" aria-label="選擇花園天氣">${GardenPlay.scenes.map(s=>`<button data-weather="${s.id}" aria-pressed="${s.id===scene.id}" aria-label="花園天氣 ${s.name}">${s.emoji} ${s.name}</button>`).join('')}</div><div class="garden-scene ${scene.id}" role="group" aria-label="${scene.name}的花園"><span class="garden-sun" aria-hidden="true">${scene.emoji}</span><span class="garden-stars" aria-hidden="true">✦　✧　✦</span><div class="garden-plots">${progress.plots.map((id,i)=>{const d=GardenPlay.decorations.find(x=>x.id===id);return `<button data-plot="${i}" aria-label="第 ${i+1} 個花圃，${d?.name||'空位'}，放入所選朋友"><span aria-hidden="true">${d?.emoji||'＋'}</span><small>花圃 ${i+1}</small></button>`;}).join('')}</div><span class="garden-grass" aria-hidden="true">🌿　🌱　🌿　🌱　🌿</span></div><div class="garden-palette" aria-label="選擇花園朋友">${GardenPlay.decorations.map(d=>`<button data-decoration="${d.id}" aria-pressed="${selected===d.id}" ${d.at>progress.rounds?'disabled':''} aria-label="${d.name}${d.at>progress.rounds?'，玩過 '+d.at+' 回合後來訪':''}"><span>${d.emoji}</span><small>${d.name}</small>${d.at>progress.rounds?`<em>${d.at} 回合</em>`:''}</button>`).join('')}<button data-decoration="" aria-pressed="${selected===''}" aria-label="清空花圃"><span>🧹</span><small>留個空位</small></button></div><p id="garden-message" class="feedback" role="status">${message}</p><div class="badge-shelf">${earnedBadges(progress).map(b=>`<span>${b.emoji} ${b.name}</span>`).join('')||'<span>🌱 第一回合玩完，就會收到第一朵花徽章。</span>'}</div><button id="garden-play" class="primary">🐰 和小兔去探險</button><p class="note">花朵與徽章是參與的紀念，不設每日任務或連續登入要求。</p></section>`;
  $('#back').onclick=home; $('#garden-play').onclick=()=>start('adventure');
  document.querySelectorAll('[data-weather]').forEach(b=>b.onclick=()=>{const position=window.scrollY;progress.weather=b.dataset.weather;save();effect('tap');renderGarden(selected,GardenPlay.scenes.find(s=>s.id===progress.weather).prompt);window.scrollTo(0,position);$(`[data-weather="${progress.weather}"]`).focus({preventScroll:true});});
  document.querySelectorAll('[data-decoration]').forEach(b=>b.onclick=()=>{const position=window.scrollY,id=b.dataset.decoration;effect('tap');renderGarden(id);window.scrollTo(0,position);$(`[data-decoration="${id}"]`).focus({preventScroll:true});});
  document.querySelectorAll('[data-plot]').forEach(b=>b.onclick=()=>{if(selected && !unlocked.some(d=>d.id===selected))return;const position=window.scrollY,index=Number(b.dataset.plot);progress.plots[index]=selected;save();effect('blossom');renderGarden(selected,selected?'朋友住進花圃了，還想放在哪裡呢？':'留好空位，下次可以請新朋友來。');window.scrollTo(0,position);$(`[data-plot="${index}"]`).focus({preventScroll:true});});
  window.scrollTo(0,0);
}
function renderAlbum(page=0, selection=null, onlyRecent=false, onlyFavorites=false, query='', keepPosition=false) {
  const position=window.scrollY;
  stopSpeech(); game=null;
  const pool=GardenDiscovery.filterWords(vocabulary,{category:prefs.category,query,seenOnly:onlyRecent,favoritesOnly:onlyFavorites},progress);
  const pages=Math.max(1,Math.ceil(pool.length/12));page=Math.max(0,Math.min(pages-1,page));
  const visible=pool.slice(page*12,page*12+12), chosen=visible.find(w=>w.word===selection)||null;
  const story=chosen?`<div class="word-story"><span class="story-emoji" role="img" aria-label="${chosen.word}">${visual(chosen)}</span><div><h2 id="story-title" tabindex="-1">${chosen.word}</h2><div class="story-zhuyin">${chosen.zhuyin.split(' ').map(s=>`<span>${s}</span>`).join('')}</div><p>${categories[chosen.category]} · ${chosen.count||1} 個聲音</p><div class="story-actions"><button id="story-replay" class="replay">♫ 再聽「${chosen.word}」</button><button id="story-favorite" class="quiet" aria-pressed="${progress.favorites.includes(chosen.word)}">${progress.favorites.includes(chosen.word)?'♥ 喜歡的朋友':'♡ 我喜歡這個朋友'}</button><button id="story-play" class="quiet">🔍 和這個朋友玩尋寶</button>${chosen.count>1?'<button id="story-workshop" class="quiet">🧩 和大人一起拼這個詞</button>':''}</div></div></div>`:'<p class="album-invite">點一張卡片，或請小兔挑一位新朋友。</p>';
  const cards=visible.map((w,i)=>`<button data-word="${i}" aria-label="認識 ${w.word}" aria-pressed="${w===chosen}"><span>${visual(w)}</span><strong>${w.word}</strong><small>${categories[w.category]}${progress.favorites.includes(w.word)?' · ♥':''}</small></button>`).join('');
  const stats=GardenDiscovery.topicStats(vocabulary,progress);
  $('#app').innerHTML=`<section class="album-page">${heading('聲音圖鑑',pool.length,'個字詞')}<div class="eyebrow">LISTEN & DISCOVER</div><h1>今天想聽哪個朋友？</h1><p>這裡可以看圖、聽詞、看看注音，沒有題目，也不用答對。</p><form id="album-search" class="album-search"><label for="word-search">找詞語或注音</label><div><input id="word-search" type="search" maxlength="64" placeholder="例如：西瓜、ㄒㄧ" autocomplete="off"><button class="primary" type="submit">找朋友</button></div><button id="search-clear" type="button" class="quiet" ${query?'':'hidden'}>清除搜尋</button></form><div class="album-filters"><label for="album-theme">主題</label><select id="album-theme">${Object.entries(categories).map(([id,name])=>`<option value="${id}" ${prefs.category===id?'selected':''}>${name}</option>`).join('')}</select><button id="album-recent" class="quiet" aria-pressed="${onlyRecent}">${onlyRecent?'顯示全部朋友':'看我玩過的詞'}</button><button id="album-favorites" class="quiet" aria-pressed="${onlyFavorites}">${onlyFavorites?'顯示全部朋友':'♥ 我喜歡的詞 '+progress.favorites.length}</button><button id="album-surprise" class="replay" ${pool.length?'':'disabled'}>🎲 小兔幫我挑一個</button></div>${story}<p id="audio-note" class="audio-note">${audioNote()}</p><p id="album-note" class="note" role="status">小兔優先挑目前範圍裡還沒玩過的詞。點愛心可以收藏，帶去下一回合。</p><div class="album-grid">${cards||'<p>還沒找到朋友。試試清除搜尋，或換一個主題吧。</p>'}</div><div class="album-pages"><button id="album-prev" class="quiet" ${page===0?'disabled':''}>← 上一頁</button><span>${page+1} / ${pages}</span><button id="album-next" class="quiet" ${page===pages-1?'disabled':''}>下一頁 →</button></div><details class="album-passport"><summary>🧭 我的探險足跡 · ${progress.journal.length} 位朋友</summary><p>記下玩遊戲時遇過的詞，不是測驗成績。點一個主題，看看還有哪些朋友。</p><div>${stats.map(s=>`<button data-album-topic="${s.category}"><strong>${categories[s.category]}</strong><span>遇過 ${s.seen} / ${s.total}</span></button>`).join('')}</div></details></section>`;
  $('#word-search').value=query;
  $('#back').onclick=home;
  $('#album-search').onsubmit=e=>{e.preventDefault();renderAlbum(0,null,onlyRecent,onlyFavorites,$('#word-search').value.trim(),true);$('#word-search').focus({preventScroll:true});};
  $('#search-clear').onclick=()=>{renderAlbum(0,null,onlyRecent,onlyFavorites,'',true);$('#word-search').focus({preventScroll:true});};
  $('#album-theme').onchange=e=>{prefs.category=e.target.value;save();renderAlbum(0,null,onlyRecent,onlyFavorites,query,true);$('#album-theme').focus({preventScroll:true});};
  $('#album-recent').onclick=()=>{renderAlbum(0,null,!onlyRecent,false,query,true);$('#album-recent').focus({preventScroll:true});};
  $('#album-favorites').onclick=()=>{renderAlbum(0,null,false,!onlyFavorites,query,true);$('#album-favorites').focus({preventScroll:true});};
  $('#album-prev').onclick=()=>{renderAlbum(page-1,null,onlyRecent,onlyFavorites,query,true);$('.album-grid').scrollIntoView({block:'start'});$('[data-word]')?.focus({preventScroll:true});};
  $('#album-next').onclick=()=>{renderAlbum(page+1,null,onlyRecent,onlyFavorites,query,true);$('.album-grid').scrollIntoView({block:'start'});$('[data-word]')?.focus({preventScroll:true});};
  function showWord(w){renderAlbum(Math.floor(pool.indexOf(w)/12),w.word,onlyRecent,onlyFavorites,query,true);$('#story-title').focus({preventScroll:true});$('.word-story').scrollIntoView({block:'nearest'});speak(w.word);}
  $('#album-surprise').onclick=()=>{const w=GardenDiscovery.chooseSurprise(pool,progress.journal);if(w){effect('tap');showWord(w);}};
  document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{effect('tap');showWord(visible[Number(b.dataset.word)]);});
  document.querySelectorAll('[data-album-topic]').forEach(b=>b.onclick=()=>{prefs.category=b.dataset.albumTopic;save();effect('tap');renderAlbum();$('#album-theme').focus({preventScroll:true});});
  if($('#story-replay'))$('#story-replay').onclick=()=>speak(chosen.word);
  if($('#story-play'))$('#story-play').onclick=()=>start('picture',[chosen.word]);
  if($('#story-workshop'))$('#story-workshop').onclick=()=>start('workshop',[chosen.word],{workshopSize:chosen.count});
  if($('#story-favorite'))$('#story-favorite').onclick=()=>{
    if(!GardenPlay.toggleFavorite(progress,chosen.word)){$('#album-note').textContent='可以收藏 50 個朋友；先取消一個，再邀請新朋友。';return;}
    save();effect('tap');renderAlbum(page,chosen.word,onlyRecent,onlyFavorites,query,true);($('#story-favorite')||$('#album-favorites')).focus({preventScroll:true});
  };
  window.scrollTo(0,keepPosition?position:0);
}

function musicStatus() {
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) return '這個瀏覽器無法播放音效與配樂，遊戲仍可操作。';
  if (!prefs.music) return `${Object.keys(GardenSongs).length} 首原創輕柔配樂，點一下才會開始播放。`;
  return gardenAudio.context?.state === 'running' ? `正在播放：${GardenSongs[prefs.track].name} · 朗讀時自動放輕音量` : `已選擇：${GardenSongs[prefs.track].name} · 點一下播放以啟動聲音`;
}
function soundLabels() {
  for (const [id, value, on, off] of [['sound', prefs.sound, '朗讀開', '朗讀關'], ['effects', prefs.effects, '音效開', '音效關'], ['music', prefs.music, '音樂開', '音樂關']]) {
    $('#' + id).textContent = (id === 'sound' ? '♫ ' : id === 'effects' ? '✦ ' : '♪ ') + (value ? on : off); $('#' + id).setAttribute('aria-pressed', String(value));
  }
  if ($('#music-status')) $('#music-status').textContent = musicStatus();
  if ($('#home-music-status')) $('#home-music-status').textContent = musicStatus();
  if ($('#home-music')) $('#home-music').textContent = (prefs.music ? '關閉音樂' : '播放背景音樂') + ' →';
}
async function toggleMusic() {
  prefs.music = !prefs.music; gardenAudio.configure(prefs); save(); soundLabels();
  if (prefs.music && !await gardenAudio.unlock()) { const el = $('#music-status') || $('#home-music-status'); if (el) el.textContent = '聲音未能啟動，請再點一次音樂開關。'; }
}
function openSettings() {
  for (const id of ['scope', 'practice', 'oddSound', 'buildLevel', 'memoryPairs', 'packSize', 'mailHouses', 'workshopSize', 'balanceSize', 'soundPairs', 'track', 'musicVolume', 'effectsVolume']) $('#' + id).value = prefs[id];
  $('#musicVolume-value').textContent = prefs.musicVolume + '%'; $('#effectsVolume-value').textContent = prefs.effectsVolume + '%';
  renderSymbolPicker();
  $('#favorites-note').textContent=`圖鑑收藏了 ${progress.favorites.length} 個朋友。收藏可重複練習；主題或玩法可用的詞不足時，會加入其他朋友。設定用於下一回合。`;
  $('#progress-note').textContent=`已玩 ${progress.rounds} 回合，接觸 ${progress.journal.length} 個詞語；使用提示也會記錄參與，並非學習成績。`;
  $('#recent-words').textContent=progress.recent.length?'最近一起玩過：'+progress.recent.slice(-12).join('、'):'還沒有詞語紀錄，先陪孩子玩一回合吧。';
  updateVoices(); soundLabels(); GardenOffline.refresh();$('#storage-note').textContent = storageOK ? '設定、花朵與花園只保存在這台裝置，不上傳資料。' : '瀏覽器無法保存紀錄，仍可正常玩遊戲。'; $('#settings').showModal();
}
function renderSymbolPicker(message='至少選 3 個；用於找找注音、翻翻卡、賓果與冒險的字形站。'){
  $('#symbol-picker').innerHTML=GardenData.symbols.map(s=>`<button data-symbol="${s}" aria-label="注音範圍 ${s}" aria-pressed="${prefs.customSymbols.includes(s)}">${s}</button>`).join('');
  $('#symbol-note').textContent=message;
  document.querySelectorAll('[data-symbol]').forEach(b=>b.onclick=()=>{
    const symbol=b.dataset.symbol,has=prefs.customSymbols.includes(symbol);
    if(has&&prefs.customSymbols.length===3){$('#symbol-note').textContent='保留至少 3 個朋友，才能一起配對、找找看。';return;}
    prefs.customSymbols=has?prefs.customSymbols.replace(symbol,''):prefs.customSymbols+symbol;
    prefs.scope='custom';$('#scope').value='custom';save();effect('tap');renderSymbolPicker(`選了 ${prefs.customSymbols.length} 個朋友：${[...prefs.customSymbols].join(' ')}`);
  });
}
$('#brand').onclick = e => { e.preventDefault(); home(); }; $('#parent').onclick = openSettings; $('#close-settings').onclick = () => $('#settings').close();
$('#settings').addEventListener('close',()=>{if($('.game-cards')){const position=window.scrollY;home();window.scrollTo(0,position);$('#parent').focus({preventScroll:true});}});
for (const id of ['scope', 'practice', 'oddSound', 'buildLevel', 'track']) $('#' + id).onchange = e => { prefs[id] = e.target.value; gardenAudio.configure(prefs); save(); };
$('#memoryPairs').onchange=e=>{prefs.memoryPairs=Number(e.target.value);save();};
$('#packSize').onchange=e=>{prefs.packSize=Number(e.target.value);save();};
$('#mailHouses').onchange=e=>{prefs.mailHouses=Number(e.target.value);save();};
for(const id of ['workshopSize','balanceSize','soundPairs'])$('#'+id).onchange=e=>{prefs[id]=Number(e.target.value);save();};
for (const id of ['musicVolume', 'effectsVolume']) $('#' + id).oninput = e => { prefs[id] = Number(e.target.value); $('#' + id + '-value').textContent = prefs[id] + '%'; gardenAudio.configure(prefs); save(); };
$('#preview-effects').onclick = () => effect('correct');
$('#offline-update').onclick=()=>GardenOffline.update();
$('#preview-music').onclick = async () => { prefs.music = true; gardenAudio.configure(prefs); save(); await gardenAudio.unlock(); soundLabels(); };
$('#voice').onchange = e => { prefs.voice = e.target.value; save(); };
$('#reset-progress').onclick = () => { if (!confirm('清除這台裝置的花朵、花園、徽章、收藏與詞語紀錄？')) return; progress = emptyProgress(); save(); $('#storage-note').textContent = '花園與紀錄已清除。'; $('#progress-note').textContent='已玩 0 回合，接觸 0 個詞語。'; $('#recent-words').textContent=''; $('#favorites-note').textContent='收藏已清空，會出整座花園的朋友。'; if (!game) home(); };
$('#sound').onclick = () => { prefs.sound = !prefs.sound; stopSpeech(); save(); soundLabels(); if ($('#audio-note')) $('#audio-note').textContent = audioNote(); if ($('.caregiver-prompt') && !prefs.sound) $('.caregiver-prompt').open = true; };
$('#effects').onclick = () => { prefs.effects = !prefs.effects; gardenAudio.configure(prefs); save(); soundLabels(); if (prefs.effects) effect('tap'); };
$('#music').onclick = toggleMusic; gardenAudio.onState = soundLabels;
document.addEventListener('click', e => { if (e.target.closest('button, a')) gardenAudio.unlock(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); gardenAudio.visibility(document.hidden); });
window.addEventListener('pagehide', () => { stopSpeech(); gardenAudio.stopMusic(); }); window.addEventListener('pageshow', () => gardenAudio.syncMusic());
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', updateVoices);
updateVoices(); soundLabels(); home();
