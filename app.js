'use strict';
const $ = s => document.querySelector(s);
const { words, categories, makeRound } = GardenData;
const defaults = { scope: 'starter', category: 'all', buildLevel: 'easy', sound: true, voice: '', effects: true, music: false, track: 'garden', musicVolume: 18, effectsVolume: 40 };
let prefs = { ...defaults }, progress = { flowers: 0, rounds: 0 }, storageOK = true;
try {
  const saved = JSON.parse(localStorage.getItem('garden-prefs') || '{}');
  for (const key of Object.keys(defaults)) if (typeof saved?.[key] === typeof defaults[key]) prefs[key] = saved[key];
  const recorded = JSON.parse(localStorage.getItem('garden-progress') || '{}');
  for (const key of ['flowers', 'rounds']) if (Number.isSafeInteger(recorded?.[key]) && recorded[key] >= 0) progress[key] = recorded[key];
} catch { storageOK = false; }
if (!['starter', 'all'].includes(prefs.scope)) prefs.scope = 'starter';
if (!Object.hasOwn(categories, prefs.category)) prefs.category = 'all';
if (!['easy', 'grow'].includes(prefs.buildLevel)) prefs.buildLevel = 'easy';
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
const modes = [
  { id: 'match', name: '找找注音', level: '認識字形', color: 'peach', art: '<i>ㄅ</i><i>ㄅ</i>', desc: '看一看，找出一樣的注音朋友。', title: '哪一個和我一樣？', sub: '看上面的符號，再點下面一樣的朋友。' },
  { id: 'listen', name: '聽聽找朋友', level: '聲音與符號', color: 'mint', art: '🐱<span class="sound-bubble">♫</span>', desc: '聽生活詞，找出開頭的注音。', title: '聽一聽，找開頭的注音', sub: '按喇叭聽詞語，再點一個注音朋友。' },
  { id: 'build', name: '注音小火車', level: '引導式拼音', color: 'lilac', art: '<i>ㄇ</i><span>＋</span><i>ㄠ</i>', desc: '照著提示，讓注音朋友依序上車。', title: '讓注音朋友坐上小火車', sub: '照著提示，依序點選下面的注音。' },
  { id: 'picture', name: '聲音尋寶', level: '聽詞找圖', color: 'sky', art: '🔍<span class="sound-bubble">🐰</span>', desc: '聽一聽，是哪一張圖片的聲音？', title: '喇叭說的是哪個朋友？', sub: '先按「聽一聽」，再點對應的圖片。' },
  { id: 'rhyme', name: '押韻好朋友', level: '發現相似聲音', color: 'butter', art: '🐱<span>♫</span>🍑', desc: '貓和桃，尾巴聲音好像喔！', title: '誰的尾巴聲音和我像？', sub: '聽目標和下面三個詞，找出押韻朋友。' },
  { id: 'memory', name: '注音翻翻卡', level: '字形配對', color: 'rose', art: '<i>？</i><i>ㄇ</i>', desc: '翻開小卡片，找出三對注音朋友。', title: '翻翻看，誰和誰是一對？', sub: '點兩張卡片，找出相同的符號。' }
];
function home() {
  stopSpeech(); game = null;
  $('#app').innerHTML = `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> 給小小探險家的聲音遊樂場</div><h1>聽見聲音，<br>讓注音<span class="accent">開花。</span></h1><p>和小兔一起找一找、聽一聽、拼一拼。<br>每天一點點，發現注音的樂趣。</p><div class="hero-tags"><span>🌱 60 個生活字</span><span>🎲 6 種小遊戲</span><span>🎵 輕柔音樂陪伴</span></div></div><div class="hero-art">${art}<span class="art-tag">今天想認識哪個朋友？</span></div></section>
    <section class="play-section"><div class="section-title"><div><span class="eyebrow">LET’S PLAY</span><h2>今天想玩什麼？</h2></div><span class="collection">✿ 已種下 <b>${progress.flowers}</b> 朵小花</span></div>
    <div class="theme-picker" aria-label="生活詞主題">${Object.entries(categories).map(([id, name]) => `<button data-theme="${id}" aria-pressed="${prefs.category === id}">${name}${id === 'all' ? ' 60' : ''}</button>`).join('')}</div>
    <p class="theme-note">主題用於聽詞、尋寶與拼音；押韻朋友來自整座花園。符號遊戲可在家長設定切換範圍。</p>
    <div class="game-cards">${modes.map((m, i) => `<button class="game-card ${m.color}" data-mode="${m.id}"><span class="card-top"><span class="level">0${i + 1} · ${m.level}</span><span>↗</span></span><span class="card-art ${['match','build','memory'].includes(m.id) ? 'train-art' : ''} ${m.id === 'rhyme' ? 'rhyme-art' : ''}">${m.art}</span><strong>${m.name}</strong><span class="card-desc">${m.desc}</span><span class="card-bottom">${m.id === 'memory' ? '3 對小卡' : '每回合 5 題'} <span>開始玩 →</span></span></button>`).join('')}</div></section>
    <section class="music-strip"><span>🎶</span><div><strong>讓小花園有一點音樂</strong><p id="home-music-status">${musicStatus()}</p></div><button id="home-music" class="quiet">${prefs.music ? '關閉音樂' : '播放背景音樂'} →</button></section>
    <section class="parent-strip"><span>🌼</span><div><strong>每個孩子都有自己的步調。</strong><p>不倒數、不扣分。答錯就再試試，玩完一回合可以休息一下。</p></div><button id="tips">看看親子玩法 →</button></section>`;
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => start(b.dataset.mode));
  document.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { const position = window.scrollY; prefs.category = b.dataset.theme; save(); effect('tap'); home(); window.scrollTo(0, position); });
  $('#home-music').onclick = toggleMusic; $('#tips').onclick = openSettings; window.scrollTo(0, 0);
}
function start(mode) {
  stopSpeech(); effect('tap');
  game = { mode, questions: makeRound(mode, prefs.scope, prefs.category, prefs.buildLevel), index: 0, done: false, selected: [], used: [], matched: [], flipped: [], preview: false, locked: false };
  if (mode === 'memory') { renderMemory(); window.scrollTo(0, 0); } else renderGame();
}
function heading(name, current, count) { return `<div class="game-heading"><button id="back" class="quiet">← 回到花園</button><span>${name}</span><span>${current} / ${count}</span></div>`; }
function questionSpeech(q) {
  if (game.mode === 'picture') return `${q.word}。${q.word}。找找${q.word}的圖片。`;
  if (game.mode === 'rhyme') return `${q.word}。${q.word}。誰的尾巴聲音和${q.word}像？`;
  if (game.mode === 'listen') return `聽一聽。${q.word}。${q.word}。找出${q.word}開頭的注音。`;
  return `${q.word}。一起拼出${q.word}。`;
}
function renderGame() {
  const q = game.questions[game.index], mode = game.mode, info = modes.find(m => m.id === mode);
  const isPictures = mode === 'picture' || mode === 'rhyme';
  const target = mode === 'match' ? q.answer : mode === 'picture' ? '<span class="word-picture">🔊</span><span class="word-label">聲音藏在這裡</span>' : `<span class="word-picture" role="img" aria-label="${q.word}">${q.emoji}</span><span class="word-label">${q.word}</span>`;
  const options = q.options.map((option, i) => isPictures ? `<div class="picture-option"><button class="choice picture-choice" data-index="${i}" aria-label="選擇 ${option.word}"><span class="option-emoji" aria-hidden="true">${option.emoji}</span><span class="option-word">${option.word}</span></button>${mode === 'rhyme' ? `<button class="word-replay" data-listen="${i}" aria-label="聽 ${option.word}">♫ 聽一聽</button>` : ''}</div>` : `<button class="choice" data-index="${i}" aria-label="選擇 ${option}">${option}</button>`).join('');
  $('#app').innerHTML = `<section class="game-panel">${heading(info.name, game.index + 1, 5)}<div class="step-dots" aria-label="第 ${game.index + 1} 題，共 5 題">${game.questions.map((_, i) => `<span class="${i < game.index ? 'finished' : i === game.index ? 'current' : ''}">${i < game.index ? '✿' : i + 1}</span>`).join('')}</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p>
    ${q.category ? `<div class="question-theme">${categories[q.category]}${prefs.category !== 'all' && prefs.category !== q.category && mode === 'build' ? ' · 加入另一個主題的朋友' : ''}</div>` : ''}
    <div class="target ${mode === 'match' ? 'symbol-target' : ''}">${target}</div>
    ${mode === 'match' ? '' : `<button id="replay" class="replay">♫ ${mode === 'picture' ? '聽一聽神祕詞語' : '聽一聽「' + q.word + '」'}</button><p id="audio-note" class="audio-note">${audioNote()}</p>${mode === 'picture' ? `<details class="caregiver-prompt" ${!prefs.sound || !voices.length ? 'open' : ''}><summary>大人讀題／看看提示</summary><p>請讀出「<b>${q.word}</b>」，讓孩子找圖片。</p></details>` : ''}`}
    ${mode === 'build' ? `<div class="train-hint">拼音小提示：<b>${q.zhuyin}</b><span>聲調已經幫你放好了</span></div><div class="train" aria-label="拼音位置">${q.parts.map((_, i) => `<div class="carriage" id="slot-${i}">？</div>`).join('')}<span class="tone">${q.tone || '一聲'}</span></div>` : ''}
    <div class="choices ${isPictures ? 'picture-choices' : ''}">${options}</div><div id="feedback" class="feedback" role="status" aria-live="polite">慢慢找，你可以的！</div><div class="game-actions">${mode === 'build' ? '<button id="undo" class="quiet">↶ 重新排一次</button>' : ''}<button id="next" class="primary" hidden>${game.index === 4 ? '看看我的小花園 ✿' : '下一個朋友 →'}</button></div></section>`;
  $('#back').onclick = home;
  document.querySelectorAll('[data-index]').forEach(b => b.onclick = () => answer(Number(b.dataset.index), b));
  document.querySelectorAll('[data-listen]').forEach(b => b.onclick = () => speak(q.options[Number(b.dataset.listen)].word));
  if ($('#replay')) $('#replay').onclick = () => speak(questionSpeech(q));
  if ($('#undo')) $('#undo').onclick = () => { game.selected = []; game.used = []; effect('tap'); renderGame(); };
  $('#next').onclick = next; window.scrollTo(0, 0);
}
function answer(index, button) {
  if (game.done) return;
  const q = game.questions[game.index];
  if (game.mode === 'build') {
    if (game.used.includes(index)) return;
    const position = game.selected.length;
    if (q.options[index] !== q.parts[position]) { retry(button, `這節車廂等的是 ${q.parts[position]}，再找找看。`); return; }
    game.selected.push(q.options[index]); game.used.push(index); button.disabled = true; button.classList.add('correct'); $('#slot-' + position).textContent = q.options[index];
    if (game.selected.length < q.parts.length) { effect('place'); $('#feedback').textContent = '朋友上車了，再找下一個！'; return; }
  } else {
    const selected = ['picture', 'rhyme'].includes(game.mode) ? q.options[index].word : q.options[index];
    if (selected !== q.answer) { retry(button, game.mode === 'rhyme' ? '再聽一次，找尾巴聲音相像的朋友。' : '還沒找到，再看一看、聽一聽。'); return; }
    button.classList.add('correct');
  }
  game.done = true; effect('correct');
  document.querySelectorAll('[data-index]').forEach(b => b.disabled = true);
  const message = game.mode === 'build' ? `✿ 拼好了！${q.zhuyin}，${q.word}！` : game.mode === 'rhyme' ? `✿ ${q.word}和${q.answer}，尾巴都有「${q.rhyme}」！` : game.mode === 'picture' ? `✿ 找到了！這是「${q.word}」。` : '✿ 找到了！一朵小花為你開了。';
  $('#feedback').classList.add('success'); $('#feedback').textContent = message;
  $('#next').hidden = false; $('#next').focus({ preventScroll: true }); if ($('#undo')) $('#undo').hidden = true;
  if (game.mode === 'build') speak(q.word);
  if (game.mode === 'rhyme') speak(`${q.word}。${q.answer}。`);
}
function retry(button, message) { effect('retry'); button.classList.remove('wiggle'); void button.offsetWidth; button.classList.add('wiggle'); $('#feedback').textContent = message; }
function next() {
  if (!game.done) return; stopSpeech();
  if (game.index === 4) complete(5);
  else { effect('tap'); game.index++; game.done = false; game.selected = []; game.used = []; renderGame(); }
}
function renderMemory(message = '翻開兩張卡片，找找相同的朋友。') {
  const info = modes.find(m => m.id === 'memory');
  $('#app').innerHTML = `<section class="game-panel">${heading(info.name, game.matched.length, 3)}<h1 class="question-title memory-title">${info.title}</h1><p class="question-sub">${info.sub}</p><div class="memory-grid">${game.questions.map((card, i) => {
    const matched = game.matched.includes(card.symbol), visible = matched || game.flipped.includes(i) || game.preview;
    return `<button class="memory-card ${matched ? 'paired' : visible ? 'revealed' : ''}" data-card="${i}" aria-label="${visible ? '注音 ' + card.symbol : '翻開第 ' + (i + 1) + ' 張卡片'}" ${matched || game.preview ? 'disabled' : ''}><span>${visible ? card.symbol : '✿'}</span><small>${matched ? '找到一對了' : visible ? '注音朋友' : '翻翻看'}</small></button>`;
  }).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">${message}</div><div class="game-actions"><button id="memory-hint" class="quiet" ${game.locked || game.done ? 'hidden' : ''}>${game.preview ? '蓋回卡片，開始找' : '先看看所有朋友'}</button><button id="memory-reset" class="primary" ${game.locked ? '' : 'hidden'}>翻回來，再試一次 ↶</button><button id="memory-finish" class="primary" ${game.done ? '' : 'hidden'}>看看我的小花園 ✿</button></div></section>`;
  $('#back').onclick = home;
  document.querySelectorAll('[data-card]').forEach(b => b.onclick = () => flipCard(Number(b.dataset.card)));
  $('#memory-reset').onclick = () => { game.flipped = []; game.locked = false; effect('flip'); renderMemory(); };
  $('#memory-hint').onclick = () => { game.preview = !game.preview; game.flipped = []; effect('flip'); renderMemory(game.preview ? '看看每個朋友的位置，準備好了就蓋回卡片。' : undefined); };
  $('#memory-finish').onclick = () => complete(3);
}
function flipCard(index) {
  const card = game.questions[index];
  if (game.done || game.locked || game.preview || game.matched.includes(card.symbol) || game.flipped.includes(index)) return;
  game.flipped.push(index);
  if (game.flipped.length < 2) { effect('flip'); renderMemory('找到一個朋友，再翻一張看看。'); focusMemory(index); return; }
  const [a, b] = game.flipped.map(i => game.questions[i]);
  if (a.symbol === b.symbol) {
    game.matched.push(a.symbol); game.flipped = []; effect('correct'); game.done = game.matched.length === 3;
    renderMemory(game.done ? '✿ 三對朋友都找到啦！' : '✿ 找到一對！繼續找其他朋友。');
  } else { game.locked = true; effect('retry'); renderMemory('這兩個朋友不一樣，記住位置再試一次。'); }
  focusMemory(index);
}
function focusMemory(index) {
  const current = $(`[data-card="${index}"]`);
  const target = game.done ? $('#memory-finish') : game.locked ? $('#memory-reset') : current && !current.disabled ? current : $('.memory-card:not(:disabled)');
  target?.focus({ preventScroll: true });
}
function complete(flowers) { progress.flowers += flowers; progress.rounds++; save(); effect('finish'); finish(flowers); }
function finish(flowers) {
  const mode = game.mode;
  $('#app').innerHTML = `<section class="finish"><div class="eyebrow">每一次嘗試，都在長大</div><div class="finish-flowers">${flowers === 3 ? '🌷 🌼 🌷' : '🌷 🌼 🌷 🌼 🌷'}</div><h1>小花園又開花了！</h1><p>${mode === 'memory' ? '你找到了 3 對注音朋友。' : '你和 5 個聲音朋友一起玩過了。'}<br>伸個懶腰，和大人說說你最喜歡哪一個吧。</p><div class="finish-count">✿ 這次種下 ${flowers} 朵小花 · 累積 ${progress.flowers} 朵</div><div class="finish-actions"><button class="primary" id="rest">回到花園，休息一下</button><button class="quiet" id="again">再玩一回合 →</button></div><p class="note">花朵記錄參與，不代表精熟程度。</p></section>`;
  $('#rest').onclick = home; $('#again').onclick = () => start(mode); window.scrollTo(0, 0);
}
function musicStatus() {
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) return '這個瀏覽器無法播放音效與配樂，遊戲仍可操作。';
  if (!prefs.music) return '三首原創輕柔配樂，點一下才會開始播放。';
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
  for (const id of ['scope', 'buildLevel', 'track', 'musicVolume', 'effectsVolume']) $('#' + id).value = prefs[id];
  $('#musicVolume-value').textContent = prefs.musicVolume + '%'; $('#effectsVolume-value').textContent = prefs.effectsVolume + '%';
  updateVoices(); soundLabels(); $('#storage-note').textContent = storageOK ? '設定與花朵只保存在這台裝置，不上傳資料。' : '瀏覽器無法保存紀錄，仍可正常玩遊戲。'; $('#settings').showModal();
}
$('#brand').onclick = e => { e.preventDefault(); home(); }; $('#parent').onclick = openSettings; $('#close-settings').onclick = () => $('#settings').close();
for (const id of ['scope', 'buildLevel', 'track']) $('#' + id).onchange = e => { prefs[id] = e.target.value; gardenAudio.configure(prefs); save(); };
for (const id of ['musicVolume', 'effectsVolume']) $('#' + id).oninput = e => { prefs[id] = Number(e.target.value); $('#' + id + '-value').textContent = prefs[id] + '%'; gardenAudio.configure(prefs); save(); };
$('#preview-effects').onclick = () => effect('correct');
$('#preview-music').onclick = async () => { prefs.music = true; gardenAudio.configure(prefs); save(); await gardenAudio.unlock(); soundLabels(); };
$('#voice').onchange = e => { prefs.voice = e.target.value; save(); };
$('#reset-progress').onclick = () => { if (!confirm('清除這台裝置累積的花朵紀錄？')) return; progress = { flowers: 0, rounds: 0 }; save(); $('#storage-note').textContent = '花朵紀錄已清除。'; if (!game) home(); };
$('#sound').onclick = () => { prefs.sound = !prefs.sound; stopSpeech(); save(); soundLabels(); if ($('#audio-note')) $('#audio-note').textContent = audioNote(); if ($('.caregiver-prompt') && !prefs.sound) $('.caregiver-prompt').open = true; };
$('#effects').onclick = () => { prefs.effects = !prefs.effects; gardenAudio.configure(prefs); save(); soundLabels(); if (prefs.effects) effect('tap'); };
$('#music').onclick = toggleMusic; gardenAudio.onState = soundLabels;
document.addEventListener('click', e => { if (e.target.closest('button, a')) gardenAudio.unlock(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); gardenAudio.visibility(document.hidden); });
window.addEventListener('pagehide', () => { stopSpeech(); gardenAudio.stopMusic(); }); window.addEventListener('pageshow', () => gardenAudio.syncMusic());
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', updateVoices);
updateVoices(); soundLabels(); home();
