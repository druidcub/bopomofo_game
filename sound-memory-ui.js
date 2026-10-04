'use strict';
function renderSoundMemory(message='聲音卡會說整個詞，圖片卡是它的朋友。先翻一張吧。',focusIndex=null){
  const previousPrompt=$('.sound-memory-panel .caregiver-prompt');
  if(previousPrompt)game.soundReadPrompt=previousPrompt.open;
  const deck=game.questions,state=game.soundState,position=window.scrollY;
  const info=modes.find(m=>m.id==='soundMemory');
  const open=card=>game.preview||state.matched.includes(card.target.word)||state.flipped.includes(deck.indexOf(card));
  const visibleAudio=deck.filter(card=>card.kind==='audio'&&open(card));
  $('#app').innerHTML=`<section class="game-panel sound-memory-panel">${heading(info.name,state.matched.length,deck.length/2)}<h1 class="question-title">讓聲音和圖片變朋友</h1><p class="question-sub">一張聲音卡、一張圖片卡。聽完整詞語，記住朋友的位置。</p><p id="audio-note" class="audio-note">${audioNote()}</p><div class="sound-memory-controls"><button id="sound-memory-preview" class="quiet" ${state.done?'disabled':''}>${game.preview?'看好了，蓋起來':'👀 先看看圖片'}</button><button id="sound-memory-hint" class="quiet" ${state.done||game.preview?'disabled':''}>💡 幫我聽一張</button></div><p class="memory-preview-note">${game.preview?'先認識圖片，聲音卡仍要點一下聽。準備好再蓋起來配對。':'可以重聽已翻開的卡片，不用趕時間。'}</p><div class="sound-memory-grid">${deck.map((card,i)=>{
    const shown=open(card),matched=state.matched.includes(card.target.word),blocked=state.locked&&!state.flipped.includes(i)&&!matched;
    const label=shown?(card.kind==='picture'?`圖片 ${card.target.word}`:'聲音卡，點一下聽整個詞'):'蓋著的卡片';
    return `<button data-sound-card="${i}" class="sound-memory-card ${shown?'revealed':''} ${matched?'matched':''}" aria-label="第 ${i+1} 張，${label}${matched?'，已配對，可重聽':''}" aria-pressed="${shown}" ${blocked?'disabled':''}><small>${i+1}</small><span aria-hidden="true">${shown?(card.kind==='picture'?visual(card.target):'♫'):'？'}</span><strong>${shown?(card.kind==='picture'?card.target.word:'聽整個詞'):'翻翻看'}</strong>${matched?'<em>✿ 配好了 · 可重聽</em>':shown?`<em>${card.kind==='audio'?'聲音卡':'圖片卡'}</em>`:''}</button>`;
  }).join('')}</div><details class="caregiver-prompt" ${game.soundReadPrompt||!prefs.sound||!voices.length?'open':''}><summary>大人陪讀目前翻開的聲音卡</summary><p>${visibleAudio.length?visibleAudio.map(card=>`第 ${deck.indexOf(card)+1} 張聲音卡：<b>${card.target.word}</b>`).join('；'):'先翻開一張聲音卡，大人讀題才會出現。'}</p></details><div id="feedback" class="feedback ${state.done?'success':''}" role="status" aria-live="polite">${message}</div><div class="game-actions"><button id="sound-memory-reset" class="quiet" ${state.locked?'':'hidden'}>記住了，把這兩張蓋回</button><button id="sound-memory-finish" class="primary" ${state.done?'':'hidden'}>看看我的小花園 ✿</button></div></section>`;
  $('#back').onclick=home;$('#sound-memory-finish').onclick=()=>complete(deck.length/2);
  document.querySelectorAll('[data-sound-card]').forEach(b=>b.onclick=()=>turnSoundMemory(Number(b.dataset.soundCard)));
  $('#sound-memory-reset').onclick=()=>{game.soundState=GardenSoundMemory.closeOpen(state);effect('flip');renderSoundMemory('位置記住了，再找一張聲音卡聽聽看。');$('.sound-memory-card:not(:disabled)')?.focus({preventScroll:true});};
  $('#sound-memory-preview').onclick=()=>{game.preview=!game.preview;game.soundState=GardenSoundMemory.closeOpen(state);effect('flip');renderSoundMemory(game.preview?'先看圖說詞，聲音卡可以點一下重聽。':'圖片蓋好了，慢慢找一對朋友。');$('#sound-memory-preview').focus({preventScroll:true});};
  $('#sound-memory-hint').onclick=()=>{
    const hint=GardenSoundMemory.hint(deck,state);if(!hint)return;game.hints++;
    if(hint.action==='flip')turnSoundMemory(hint.index);
    else{speak(deck[hint.index].target.word);$('#feedback').textContent='小兔重讀一個詞。再聽另一張卡，看看它們是不是朋友。';}
  };
  window.scrollTo(0,position);
  const focus=state.done?$('#sound-memory-finish'):state.locked?$('#sound-memory-reset'):focusIndex!==null?$(`[data-sound-card="${focusIndex}"]`):null;
  if(focus&&!focus.disabled)focus.focus({preventScroll:true});
}
function turnSoundMemory(index){
  const card=game.questions[index];if(!card)return;
  if(game.soundState.matched.includes(card.target.word)){speak(card.target.word);return;}
  if(game.preview){speak(card.target.word);$('#feedback').textContent='先認識朋友，準備好就按「看好了，蓋起來」。';return;}
  const result=GardenSoundMemory.flip(game.questions,game.soundState,index);
  if(result.event==='ignored')return;
  game.soundState=result.state;
  if(card.kind==='audio'||result.event==='match')speak(card.target.word);
  if(result.event==='replay')return;
  let message='翻好一張，再找另一種卡片。聲音和圖片才是一對喔。';
  if(result.event==='match'){
    rememberWord(progress,card.target.word);save();effect('correct');
    message=result.state.done?'✿ 每個聲音都找到圖片了！':`✿ ${card.target.word}的聲音和圖片配好了！`;
  }else if(result.event==='retry'){effect('retry');message='這兩張還不是一對。可以再聽，記住位置後自己蓋回。';}
  else effect('flip');
  renderSoundMemory(message,index);
}
