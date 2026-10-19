'use strict';
function extensionHeading(info){
  return `${heading(info.name,game.index+1,5)}<div class="step-dots" aria-label="第 ${game.index+1} 題，共 5 題">${game.questions.map((_,i)=>`<span class="${i<game.index?'finished':i===game.index?'current':''}">${i<game.index?'✿':i+1}</span>`).join('')}</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p>`;
}
function renderWorkshop(){
  const q=game.questions[game.index],info=modes.find(m=>m.id==='workshop');
  $('#app').innerHTML=`<section class="game-panel workshop-panel">${extensionHeading(info)}<div class="question-theme">${categories[q.category]} · ${q.count} 塊聲音積木${prefs.category!=='all'&&prefs.category!==q.category?' · 加入另一個主題的朋友':''}</div><div class="target"><span class="word-picture" role="img" aria-label="${q.word}">${visual(q)}</span><span class="word-label">${q.word}</span></div><button id="workshop-replay" class="replay">♫ 聽整個詞「${q.word}」</button><p id="audio-note" class="audio-note">${audioNote()}</p><p class="train-note">每塊積木是一個字音；注音直排，聲調放側邊。點已填的位置可以取下。</p><div class="word-slots" style="--blocks:${q.count}" aria-label="詞語聲音的順序">${q.syllables.map((_,i)=>`<button data-word-slot="${i}" aria-label="第 ${i+1} 塊積木，空位"><small>${i+1}</small><strong>？</strong></button>`).join('')}</div><div class="word-blocks">${q.options.map((s,i)=>`<button data-block="${i}" aria-label="聲音積木 ${s}，第 ${i+1} 張"><strong>${GardenPhonics.reading(s)}</strong><small>聲音積木</small></button>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">先聽詞語，和大人一起找第一個聲音。</div><div class="game-actions"><button id="workshop-reset" class="quiet">↶ 重新排一次</button><button id="workshop-hint" class="quiet">💡 幫我一塊積木</button><button id="workshop-check" class="primary" disabled>🧩 拼好了，試試看！</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一個詞語 →'}</button></div></section>`;
  $('#back').onclick=home;$('#next').onclick=next;$('#workshop-replay').onclick=()=>speak(q.word);
  document.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>{
    const index=Number(b.dataset.block);if(game.done||game.used.includes(index)||game.selected.length===q.count)return;
    game.selected.push(q.options[index]);game.used.push(index);effect('place');updateWorkshop(game.selected.length===q.count?'積木排好了，按「拼好了」試試看！':'放好一塊，再聽聽下一個聲音。');
  });
  document.querySelectorAll('[data-word-slot]').forEach(b=>b.onclick=()=>{
    const index=Number(b.dataset.wordSlot);if(game.done||index>=game.selected.length)return;
    game.selected.splice(index,1);game.used.splice(index,1);effect('tap');updateWorkshop('積木拿起來了，可以換個位置。');
  });
  $('#workshop-reset').onclick=()=>{game.selected=[];game.used=[];effect('tap');updateWorkshop('重新聽整個詞，再慢慢排好。');};
  $('#workshop-hint').onclick=()=>{
    const hint=nextHint(q.syllables,game.selected);game.hints++;effect('tap');
    $('#feedback').textContent=hint?`只幫一塊：第 ${hint.position+1} 個聲音試試「${hint.symbol}」。`:'積木都排好了，按「拼好了」試試看！';
  };
  $('#workshop-check').onclick=()=>{
    const result=checkTrain(q.syllables,game.selected);if(!result.ready)return;
    if(!result.correct){retry($('#workshop-check'),'聲音還沒接起來。重聽整個詞，點積木取下再排一次。');return;}
    game.done=true;rememberWord(progress,q.word);save();effect('correct');
    document.querySelectorAll('[data-block],[data-word-slot],#workshop-reset,#workshop-hint,#workshop-check').forEach(b=>b.disabled=true);
    $('#feedback').classList.add('success');$('#feedback').textContent=`✿ 拼好了！一起讀「${q.word}」。`;
    $('#next').hidden=false;$('#next').focus({preventScroll:true});speak(q.word);
  };
  updateWorkshop();window.scrollTo(0,0);
}
function updateWorkshop(message){
  const q=game.questions[game.index];
  document.querySelectorAll('[data-word-slot]').forEach((b,i)=>{
    b.querySelector('strong').innerHTML=game.selected[i]?GardenPhonics.reading(game.selected[i]):'？';b.classList.toggle('filled',i<game.selected.length);
    b.setAttribute('aria-label',`第 ${i+1} 塊積木，${game.selected[i]||'空位'}${i<game.selected.length?'，點一下取下':''}`);
  });
  document.querySelectorAll('[data-block]').forEach(b=>{const used=game.used.includes(Number(b.dataset.block));b.disabled=used||game.selected.length===q.count;b.classList.toggle('onboard',used);});
  $('#workshop-check').disabled=game.selected.length!==q.count;
  if(message)$('#feedback').textContent=message;
}
