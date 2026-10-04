'use strict';
function renderSoundBeds(message='先挑一張圖片，聽詞語、一字拍一下，再點花圃。',focusIndex=null){
  const round=game.questions,state=game.bedState,position=window.scrollY,selected=round.cards[state.selected];
  $('#app').innerHTML=`<section class="game-panel sound-beds-panel">${heading('聲音花圃',state.placed.length,round.cards.length)}<h1 class="question-title">把聲音種進小花圃</h1><p class="question-sub">一個字拍一下，拍數一樣的詞住在同一個花圃。</p>${round.mixed?'<p class="question-theme">這個主題部分詞長較少，加入其他主題的朋友。</p>':''}<p id="audio-note" class="audio-note">${audioNote()}</p><div class="sound-beds-selection"><strong id="bed-selection-name">${selected?`我選了「${selected.word}」`:(state.done?'每個聲音朋友都開花了！':'先從下方挑一張圖片')}</strong><div class="bed-claps"><button id="bed-replay" class="replay" ${selected?'':'disabled'}>♫ 再聽這個詞</button><button id="bed-clap" class="replay" ${!selected||state.claps>=8?'disabled':''}>👏 拍一下</button><span id="bed-clap-count" role="status">${state.claps?`我拍了 ${state.claps} 下`:'還沒拍手'}</span><button id="bed-reset-claps" class="quiet" ${selected?'':'disabled'}>↶ 重新拍</button></div></div><div class="sound-beds" aria-label="依聲音數量分類的花圃">${round.counts.map(count=>`<div class="sound-bed"><button data-bed="${count}" class="bed-destination" aria-label="種進 ${count} 拍的花圃" ${selected?'':'disabled'}><span aria-hidden="true">${'🌱'.repeat(count)}</span><strong>${count} 拍花圃</strong><small>${'● '.repeat(count)}一字拍一下</small></button><div class="bed-planted">${state.placed.filter(i=>round.cards[i].count===count).map(i=>`<button data-bed-listen="${i}" class="bed-flower" aria-label="重聽已種好的${round.cards[i].word}"><span aria-hidden="true">${visual(round.cards[i])}</span><strong>${round.cards[i].word}</strong><small>✿ 再聽一次</small></button>`).join('')||'<span class="bed-empty">等朋友來開花</span>'}</div></div>`).join('')}</div><p class="bed-card-note">點圖片就會讀整個詞。可以換一張，也可以重聽。</p><div class="bed-cards">${round.cards.map((w,i)=>`<button data-bed-card="${i}" class="bed-card ${state.placed.includes(i)?'planted':''}" aria-label="${state.placed.includes(i)?'已種好':'選擇'} ${w.word}" aria-pressed="${i===state.selected}" ${state.placed.includes(i)?'disabled':''}><span aria-hidden="true">${visual(w)}</span><strong>${w.word}</strong><small>${state.placed.includes(i)?'✿ 已種好':'♫ 聽一聽'}</small></button>`).join('')}</div><div id="feedback" class="feedback ${state.done?'success':''}" role="status" aria-live="polite">${message}</div><div class="game-actions"><button id="bed-hint" class="quiet" ${state.done?'disabled':''}>💡 陪我慢慢聽一張</button><button id="bed-finish" class="primary" ${state.done?'':'hidden'}>看看我的小花園 ✿</button></div><p class="note">拍手按鈕記自己的嘗試，不會代替孩子算答案。可以請大人慢慢讀詞語。</p></section>`;
  $('#back').onclick=home;$('#bed-finish').onclick=()=>complete(round.cards.length);
  const choose=index=>{
    const result=GardenSoundBeds.select(round,game.bedState,index);if(result.event==='ignored')return;
    game.bedState=result.state;speak(round.cards[index].word);
    if(result.event==='replay')return;
    effect('tap');renderSoundBeds(`慢慢念「${round.cards[index].word}」，一個字拍一下，再選花圃。`,index);
    if(window.matchMedia('(max-width:600px)').matches){
      $('#bed-replay').focus({preventScroll:true});
      $('.sound-beds-selection').scrollIntoView({block:'start',behavior:'auto'});
    }
  };
  document.querySelectorAll('[data-bed-card]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.bedCard)));
  document.querySelectorAll('[data-bed-listen]').forEach(b=>b.onclick=()=>speak(round.cards[Number(b.dataset.bedListen)].word));
  $('#bed-replay').onclick=()=>speak(selected.word);
  $('#bed-clap').onclick=()=>{game.bedState=GardenSoundBeds.clap(game.bedState);effect('clap');$('#bed-clap-count').textContent=`我拍了 ${game.bedState.claps} 下`;$('#bed-clap').disabled=game.bedState.claps>=8;};
  $('#bed-reset-claps').onclick=()=>{game.bedState=GardenSoundBeds.resetClaps(game.bedState);effect('tap');$('#bed-clap-count').textContent='還沒拍手';$('#bed-clap').disabled=false;};
  $('#bed-hint').onclick=()=>{const hint=GardenSoundBeds.hint(round,game.bedState);if(hint){game.hints++;choose(hint.index);$('#feedback').textContent=`先聽「${round.cards[hint.index].word}」，和大人一個字拍一下。準備好，再點花圃。`;}};
  document.querySelectorAll('[data-bed]').forEach(b=>b.onclick=()=>{
    const before=game.bedState,index=before.selected,count=Number(b.dataset.bed);
    const result=GardenSoundBeds.place(round,before,count);if(result.event==='ignored')return;
    if(result.event==='retry'){
      retry(b,'這個詞還沒找到合適的花圃。可以重聽、重新拍，再試一次。');
      $('#bed-selection-name').textContent=`「${round.cards[index].word}」還沒找到花圃，再慢慢聽、拍一拍。`;
      return;
    }
    game.bedState=result.state;rememberWord(progress,round.cards[index].word);save();effect('blossom');speak(round.cards[index].word);
    renderSoundBeds(result.state.done?'✿ 所有聲音朋友都在花圃開花了！':`✿ ${round.cards[index].word}有 ${count} 個聲音，種進 ${count} 拍花圃了。`);
    (result.state.done?$('#bed-finish'):$('.bed-card:not(:disabled)'))?.focus({preventScroll:true});
    if(window.matchMedia('(max-width:600px)').matches)(result.state.done?$('#bed-finish'):$('.bed-card:not(:disabled)'))?.scrollIntoView({block:'nearest',behavior:'auto'});
  });
  window.scrollTo(0,position);
  if(focusIndex!==null)$(`[data-bed-card="${focusIndex}"]`)?.focus({preventScroll:true});
}
