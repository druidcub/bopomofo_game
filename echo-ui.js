'use strict';
function renderEcho(){
  const q=game.questions[game.index],count=q.sequence.length,missing=game.session==='rollcall';
  $('#app').innerHTML=`<section class="game-panel echo-panel">${heading(missing?'聲音點點名':'聲音捉迷藏',game.index+1,5)}<div class="step-dots" aria-label="第 ${game.index+1} 題，共 5 題">${game.questions.map((_,i)=>`<span class="${i<game.index?'finished':i===game.index?'current':''}">${i<game.index?'✿':i+1}</span>`).join('')}</div><h1 class="question-title">${missing?'誰還沒被叫到？':'誰偷偷來了兩次？'}</h1><p class="question-sub">聽 ${count} 個詞語，${missing?'找出還沒被叫到的朋友。':'找出重複出現的朋友。'}</p><div class="echo-mascot" aria-hidden="true">🐰 🔎</div><button id="echo-replay" class="replay">♫ 聽整串聲音</button><p id="audio-note" class="audio-note">${audioNote()}</p>${q.mixed?'<p class="note">加入其他主題的朋友，讓圖片更容易分辨。</p>':''}<div class="echo-trail" aria-label="依序聽聲音">${q.sequence.map((_,i)=>`<button data-echo-position="${i}" class="echo-step" aria-label="聽第 ${i+1} 個聲音"><small>第 ${i+1} 個</small><span aria-hidden="true">♫</span><strong>聽這個</strong></button>`).join('')}</div><details class="caregiver-prompt" ${!prefs.sound||!voices.length?'open':''}><summary>大人讀題／看看順序</summary><p>請依序慢慢讀：${q.sequence.map(w=>w.word).join(' → ')}。${missing?'問孩子哪個朋友還沒被叫到。':'問孩子哪個詞聽到了兩次。'}</p></details><div class="echo-options">${q.options.map((w,i)=>`<div><button data-echo-answer="${i}" class="choice" aria-label="選擇 ${w.word}"><span aria-hidden="true">${visual(w)}</span><strong>${w.word}</strong></button><button data-echo-listen="${i}" class="word-replay" aria-label="聽圖片 ${w.word}">♫ 聽圖片</button></div>`).join('')}</div><div id="feedback" class="feedback" role="status" aria-live="polite">可以重聽整串，也可以一個一個慢慢聽。不用趕時間。</div><div class="game-actions"><button id="echo-hint" class="quiet">💡 陪我慢慢聽</button><button id="next" class="primary" hidden>${game.index===4?'看看我的小花園 ✿':'下一串聲音 →'}</button></div></section>`;
  $('#back').onclick=home;$('#next').onclick=next;
  const replay=()=>speak(q.sequence.map(w=>w.word).join('。')+'。');
  $('#echo-replay').onclick=replay;
  document.querySelectorAll('[data-echo-position]').forEach(b=>b.onclick=()=>{speak(q.sequence[Number(b.dataset.echoPosition)].word);document.querySelectorAll('[data-echo-position]').forEach(el=>el.classList.toggle('listening',el===b));});
  document.querySelectorAll('[data-echo-listen]').forEach(b=>b.onclick=()=>speak(q.options[Number(b.dataset.echoListen)].word));
  $('#echo-hint').onclick=()=>{if(game.done)return;game.hints++;effect('tap');$('#feedback').textContent=missing?'和大人一個一個念；聽過的朋友用手指指一指，找還沒聽到名字的朋友。':'和大人一個一個念；聽到同一個朋友，再比兩根手指。也可以按上方的聲音格重聽。';replay();};
  document.querySelectorAll('[data-echo-answer]').forEach(b=>b.onclick=()=>{
    const result=GardenEcho.check(q,Number(b.dataset.echoAnswer),game.done);if(result==='ignored')return;
    if(result==='retry'){retry(b,missing?'這位朋友有被叫到喔！再聽一次，找還沒被叫到的朋友。':'這個朋友沒有來兩次。再聽整串或逐個聲音，找出重複的朋友。');return;}
    game.done=true;rememberWord(progress,q.answer);save();effect('correct');b.classList.add('correct');
    document.querySelectorAll('[data-echo-answer],#echo-hint').forEach(el=>el.disabled=true);
    document.querySelectorAll('[data-echo-position]').forEach((el,i)=>{const w=q.sequence[i];el.innerHTML=`<small>第 ${i+1} 個</small><span aria-hidden="true">${visual(w)}</span><strong>${w.word}</strong>`;el.setAttribute('aria-label',`重聽第 ${i+1} 個聲音：${w.word}`);el.classList.toggle('echo-found',missing||w.word===q.answer);});
    $('#feedback').classList.add('success');$('#feedback').textContent=missing?`✿ 「${q.answer}」還沒被叫到！這次聽到的是${q.sequence.map(w=>w.word).join('、')}。`:`✿ 找到了！「${q.answer}」來了兩次。亮起來的兩格就是它！`;$('#next').hidden=false;$('#next').focus({preventScroll:true});
  });
  window.scrollTo(0,0);
}
