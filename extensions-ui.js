'use strict';
function extensionHeading(info){
  return `${heading(info.name,game.index+1,5)}<div class="step-dots" aria-label="第 ${game.index+1} 題，共 5 題">${game.questions.map((_,i)=>`<span class="${i<game.index?'finished':i===game.index?'current':''}">${i<game.index?'✿':i+1}</span>`).join('')}</div><h1 class="question-title">${info.title}</h1><p class="question-sub">${info.sub}</p>`;
}
function renderWorkshop(){
  const q=game.questions[game.index],info=modes.find(m=>m.id==='workshop');
  $('#app').innerHTML=`<section class="game-panel workshop-panel">${extensionHeading(info)}<div class="question-theme">${categories[q.category]} · ${q.count} 塊聲音積木${prefs.category!=='all'&&prefs.category!==q.category?' · 加入另一個主題的朋友':''}</div><div class="target"><span class="word-picture" role="img" aria-label="${q.word}">${visual(q)}</span><span class="word-label">${q.word}</span></div><button id="workshop-replay" class="replay">♫ 聽整個詞「${q.word}」</button><p id="audio-note" class="audio-note">${audioNote()}</p><p class="train-note">積木上是完整的一個字音，聲調也放在上面。點已填的位置可以取下。</p><div class="word-slots" style="--blocks:${q.count}" aria-label="詞語聲音的順序">${q.syllables.map((_,i)=>`<button data-word-slot="${i}" aria-label="第 ${i+1} 塊積木，空位"><small>${i+1}</small><strong>？</strong></button>`).join('')}</div><div class="word-blocks">${q.options.map((s,i)=>`<button data-block="${i}" aria-label="聲音積木 ${s}，第 ${i+1} 張"><strong>${s}</strong><small>聲音積木</small></button>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">先聽詞語，和大人一起找第一個聲音。</div><div class="game-actions"><button id="workshop-reset" class="quiet">↶ 重新排一次</button><button id="workshop-hint" class="quiet">💡 幫我一塊積木</button><button id="workshop-check" class="primary" disabled>🧩 拼好了，試試看！</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一個詞語 →'}</button></div></section>`;
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
    $('#feedback').classList.add('success');$('#feedback').textContent=`✿ 拼好了！${q.word}：${q.syllables.join(' → ')}。`;
    $('#next').hidden=false;$('#next').focus({preventScroll:true});speak(q.word);
  };
  updateWorkshop();window.scrollTo(0,0);
}
function updateWorkshop(message){
  const q=game.questions[game.index];
  document.querySelectorAll('[data-word-slot]').forEach((b,i)=>{
    b.querySelector('strong').textContent=game.selected[i]||'？';b.classList.toggle('filled',i<game.selected.length);
    b.setAttribute('aria-label',`第 ${i+1} 塊積木，${game.selected[i]||'空位'}${i<game.selected.length?'，點一下取下':''}`);
  });
  document.querySelectorAll('[data-block]').forEach(b=>{const used=game.used.includes(Number(b.dataset.block));b.disabled=used||game.selected.length===q.count;b.classList.toggle('onboard',used);});
  $('#workshop-check').disabled=game.selected.length!==q.count;
  if(message)$('#feedback').textContent=message;
}
function renderBalance(){
  const q=game.questions[game.index],info=modes.find(m=>m.id==='balance');
  const names={left:'左邊比較多',equal:'一樣多',right:'右邊比較多'},icons={left:'←',equal:'＝',right:'→'};
  $('#app').innerHTML=`<section class="game-panel balance-panel">${extensionHeading(info)}<div class="balance-mascot" aria-hidden="true">🐰 ⚖️</div><button id="balance-replay" class="replay">♫ 聽左邊，再聽右邊</button><p id="audio-note" class="audio-note">${audioNote()}</p><div class="balance-words">${['left','right'].map(side=>{const w=q[side];return `<div class="balance-word"><small>${side==='left'?'左邊':'右邊'} · ${categories[w.category]}</small><div class="balance-picture" role="img" aria-label="${w.word}">${visual(w)}</div><strong>${w.word}</strong><button data-balance-listen="${side}" class="word-replay" aria-label="聽${side==='left'?'左邊':'右邊'}的${w.word}">♫ 聽這邊</button><div class="balance-claps"><button data-balance-clap="${side}" class="replay" aria-label="${side==='left'?'左邊':'右邊'}拍一下">👏 拍一下</button><span data-clap-count="${side}" role="status">還沒拍手</span><button data-balance-reset="${side}" class="quiet" aria-label="${side==='left'?'左邊':'右邊'}重新拍">↶ 重拍</button></div><p data-count-answer="${side}" class="count-answer" hidden></p></div>`;}).join('')}</div><div class="balance-choices">${['left','equal','right'].map(side=>`<button data-balance="${side}" class="choice" aria-label="${names[side]}"><span>${icons[side]}</span><strong>${names[side]}</strong></button>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">比較的是字音數量，不是誰念得快。可以慢慢重聽。</div><div class="game-actions"><button id="balance-hint" class="quiet">💡 先陪我數左邊</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一組詞語 →'}</button></div></section>`;
  $('#back').onclick=home;$('#next').onclick=next;
  $('#balance-replay').onclick=()=>speak(`左邊，${q.left.word}。右邊，${q.right.word}。`);
  document.querySelectorAll('[data-balance-listen]').forEach(b=>b.onclick=()=>speak(q[b.dataset.balanceListen].word));
  document.querySelectorAll('[data-balance-clap]').forEach(b=>b.onclick=()=>{
    if(game.done)return;const side=b.dataset.balanceClap;game.balanceClaps[side]++;effect('clap');$(`[data-clap-count="${side}"]`).textContent=`我拍了 ${game.balanceClaps[side]} 下`;
  });
  document.querySelectorAll('[data-balance-reset]').forEach(b=>b.onclick=()=>{const side=b.dataset.balanceReset;game.balanceClaps[side]=0;effect('tap');$(`[data-clap-count="${side}"]`).textContent='還沒拍手';});
  $('#balance-hint').onclick=()=>{game.hints++;effect('tap');$('#feedback').textContent=`先數左邊：「${q.left.word}」有 ${q.left.count} 個聲音。再和大人一起數右邊吧。`;};
  document.querySelectorAll('[data-balance]').forEach(b=>b.onclick=()=>{
    if(game.done)return;
    if(b.dataset.balance!==q.answer){retry(b,'再慢慢念兩個詞，一個字拍一下，可能一樣多，也可能有一邊比較多。');return;}
    game.done=true;effect('correct');rememberWord(progress,q.left.word);rememberWord(progress,q.right.word);save();b.classList.add('correct');
    document.querySelectorAll('[data-balance],[data-balance-clap],[data-balance-reset],#balance-hint').forEach(b=>b.disabled=true);
    for(const side of ['left','right']){const el=$(`[data-count-answer="${side}"]`);el.hidden=false;el.textContent=`${'● '.repeat(q[side].count)} ${q[side].count} 個聲音`;}
    $('#feedback').classList.add('success');$('#feedback').textContent=`✿ ${q.left.word}有 ${q.left.count} 個聲音，${q.right.word}有 ${q.right.count} 個聲音，${names[q.answer]}！`;
    $('#next').hidden=false;$('#next').focus({preventScroll:true});
  });
  window.scrollTo(0,0);
}
