(function(root){
  'use strict';
  function open({progress,save,speak,effect,home,start,storageOK,heading},initial=null){
    const G=root.GardenLayout,app=document.querySelector('#app'),find=s=>app.querySelector(s);
    let selected=G.kinds[initial]?.at<=progress.rounds?initial:null,category=G.kinds[selected]?.category||'plants',moving=null,active=null,viewing=false,undo=null;
    progress.garden=G.restore(progress,progress.rounds);
    progress.gardenMemories=G.milestones([],progress.gardenMemories||[]);
    const memoryNames={plant:'親手種下一朵花',animal:'邀請第一位動物朋友',variety:'三種朋友一起住'};
    app.innerHTML=`<section class="garden-page garden-studio">${heading('我的花園',progress.rounds,'回合')}<div class="garden-title"><div><h1>我的小天地</h1><p>選個朋友，點草地，讓花園熱鬧起來。</p></div><button id="garden-view" class="quiet" aria-pressed="false">✦ 欣賞花園</button></div><div class="garden-weather" role="group" aria-label="選擇花園天氣">${root.GardenPlay.scenes.map(s=>`<button data-weather="${s.id}" aria-pressed="${s.id===progress.weather}">${s.emoji} ${s.name}</button>`).join('')}</div><div class="garden-scene garden-canvas ${progress.weather}" role="group" aria-label="我的插畫花園">${G.landscape()}<span class="garden-sun" aria-hidden="true"></span><span class="garden-stars" aria-hidden="true">✦　✧　✦</span><div id="garden-objects"></div><div id="garden-spots"></div><span id="garden-bubble" class="garden-bubble" role="status" hidden></span><span class="garden-sign" aria-hidden="true">我的花園</span></div><div id="garden-summary" class="garden-summary"></div><p id="garden-message" class="garden-instruction" role="status"></p><div id="garden-controls"><div class="garden-tools"><button id="garden-cancel" class="quiet" hidden>放回工具箱</button><button id="garden-undo" class="quiet" disabled>↶ 復原</button><div id="garden-object-actions" hidden><button id="garden-move" class="quiet">搬家</button><button id="garden-remove" class="quiet">收回工具箱</button><button id="garden-listen" class="quiet">♫ 聽名字</button></div></div><div class="garden-category" role="group" aria-label="朋友種類">${[['plants','花草'],['animals','動物'],['decor','裝飾']].map(([id,name])=>`<button data-category="${id}" aria-pressed="${id===category}">${name}</button>`).join('')}</div><div id="garden-palette" class="garden-palette" aria-label="選擇花園朋友"></div><p class="garden-tool-note">朋友解鎖後可以一直放，花朵不用花掉。</p></div><div id="garden-memories" class="badge-shelf" aria-label="我的布置紀念"></div><p id="garden-storage" class="note"></p><button id="garden-play" class="primary">🐰 和小兔去探險</button></section>`;
    const canvas=find('.garden-canvas');
    function showWorkspace(){if(window.matchMedia('(max-width:600px)').matches)window.scrollTo(0,Math.max(0,canvas.getBoundingClientRect().top+window.scrollY-12));}
    function announce(text){find('#garden-message').textContent=text;}
    function syncStatus(){
      const s=G.stats(progress.garden);
      find('#garden-summary').textContent=`你種了 ${s.plants} 株花草，邀請 ${s.animals} 位動物朋友${s.types>=3?'，大家一起住！':'。'}`;
      find('#garden-memories').innerHTML=progress.gardenMemories.map(id=>`<span>✿ ${memoryNames[id]}</span>`).join('');
      find('#garden-storage').textContent=storageOK()?'布置會自動保存在這台裝置，下次回來朋友還在。':'這個瀏覽器暫時無法保存；離開或重新整理後，布置可能不會留下。';
    }
    function drawObjects(animated=null){
      const container=find('#garden-objects');
      // Keep unchanged objects in the DOM, so a new flower does not restart the whole scene.
      container.querySelectorAll('[data-object]').forEach(b=>{const p=progress.garden.find(p=>p.slot===Number(b.dataset.object));if(!p||p.kind!==b.dataset.kind)b.remove();});
      for(const p of progress.garden){
        let b=container.querySelector(`[data-object="${p.slot}"]`);
        if(!b){b=document.createElement('button');b.type='button';b.dataset.object=p.slot;b.dataset.kind=p.kind;b.innerHTML=`<span class="garden-object-shadow"></span><span class="garden-object-art">${G.sprite(p.kind)}</span>`;container.append(b);}
        const a=G.anchors[p.slot];b.style.left=a.x+'%';b.style.top=a.y+'%';b.style.zIndex=Math.round(a.y/3);b.className=`garden-object kind-${p.kind}${active===p.slot?' chosen':''}${moving===p.slot?' moving':''}${animated===p.slot?' arrived':''}`;
        b.setAttribute('aria-label',G.kinds[p.kind].name+'，點一下認識或搬家');b.setAttribute('aria-pressed',String(active===p.slot));
      }
      syncStatus();
    }
    function drawSpots(){
      find('#garden-spots').innerHTML=selected&&!viewing?G.anchors.map((a,i)=>progress.garden.some(p=>p.slot===i&&p.slot!==moving)?'':`<button class="garden-spot" data-slot="${i}" style="left:${a.x}%;top:${a.y}%" aria-label="${moving===null?'放下':'搬來'}${G.kinds[selected].name}，位置 ${i+1}"><span class="garden-ghost">${G.sprite(selected)}</span><span class="spot-plus" aria-hidden="true">＋</span></button>`).join(''):'';
      find('#garden-cancel').hidden=!selected;find('#garden-object-actions').hidden=active===null||selected!==null;find('#garden-undo').disabled=!undo;
    }
    function drawPalette(){
      find('#garden-palette').innerHTML=Object.entries(G.kinds).filter(([,d])=>d.category===category).map(([id,d])=>`<button data-decoration="${id}" aria-pressed="${selected===id}" ${d.at>progress.rounds?'disabled':''} aria-label="${d.name}${d.at>progress.rounds?'，玩過 '+d.at+' 回合後來訪':''}">${G.sprite(id)}<strong>${d.name}</strong>${d.at>progress.rounds?`<small>${d.at} 回合來訪</small>`:'<small>可以放進花園</small>'}</button>`).join('');
      app.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
    }
    function clearSelection(){selected=null;moving=null;active=null;drawObjects();drawSpots();drawPalette();find('#garden-bubble').hidden=true;}
    function remember(){undo={garden:progress.garden.map(p=>({...p})),memories:[...progress.gardenMemories]};}
    function commit(animated){
      const old=[...progress.gardenMemories];progress.gardenMemories=G.milestones(progress.garden,old,progress.garden.find(p=>p.slot===animated)?.kind);save();drawObjects(animated);drawSpots();
      const added=progress.gardenMemories.filter(id=>!old.includes(id));return added.length?' ✿ '+added.map(id=>memoryNames[id]).join('、')+'！':'';
    }
    find('#back').onclick=home;find('#garden-play').onclick=()=>start('adventure');
    find('.garden-studio').addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.weather){progress.weather=b.dataset.weather;save();canvas.classList.remove('sunny','sunset','night');canvas.classList.add(progress.weather);find('.garden-sun').textContent=root.GardenPlay.scenes.find(s=>s.id===progress.weather).emoji;app.querySelectorAll('[data-weather]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));effect('tap');return;}
      if(b.dataset.category){category=b.dataset.category;clearSelection();announce('選個'+({plants:'花草',animals:'動物朋友',decor:'裝飾'}[category])+'，再點草地上的亮點。');return;}
      if(b.dataset.decoration){selected=b.dataset.decoration;moving=null;active=null;drawObjects();drawPalette();drawSpots();announce(progress.garden.length===G.anchors.length?'花園住滿朋友了！先放回工具箱，再點一位朋友收回，留出新位置。':'拿著：'+G.kinds[selected].name+'。點一個草地亮點，請它住進來。');find(`[data-decoration="${selected}"]`).focus({preventScroll:true});showWorkspace();effect('tap');return;}
      if(b.dataset.slot!==undefined&&selected){
        const slot=Number(b.dataset.slot),kind=selected,result=G.place(progress.garden,kind,slot,progress.rounds,moving);
        if(!result.ok){announce('這裡已經有朋友，選另一個亮點吧。');return;}
        const wasMoving=moving!==null;remember();progress.garden=result.items;selected=null;moving=null;active=null;find('#garden-bubble').hidden=true;drawPalette();const reward=commit(slot);effect('blossom');announce(G.kinds[kind].name+(wasMoving?'搬到新家了！':'住進你的花園了！')+reward);find(`[data-object="${slot}"]`).focus({preventScroll:true});return;
      }
      if(b.dataset.object!==undefined){
        if(selected){announce('這裡有朋友了，請點草地上的亮點。');return;}
        active=Number(b.dataset.object);const kind=b.dataset.kind;drawObjects();drawSpots();find('#garden-bubble').hidden=false;find('#garden-bubble').textContent=G.kinds[kind].name+' · '+G.kinds[kind].zhuyin;speak(G.kinds[kind].name);b.classList.remove('greeting');void b.offsetWidth;b.classList.add('greeting');announce(viewing?'你好，'+G.kinds[kind].name+'！':G.kinds[kind].name+'想跟你打招呼！可以聽名字、搬家或收回。');return;
      }
    });
    find('#garden-cancel').onclick=()=>{clearSelection();announce('朋友放回工具箱了。想放誰，再選一次就好。');};
    find('#garden-move').onclick=()=>{const p=progress.garden.find(p=>p.slot===active);if(!p)return;selected=p.kind;moving=p.slot;category=G.kinds[p.kind].category;find('#garden-bubble').hidden=true;drawObjects();drawSpots();drawPalette();announce('帶著'+G.kinds[p.kind].name+'，點亮點搬到新家。');showWorkspace();};
    find('#garden-remove').onclick=()=>{if(active===null)return;remember();progress.garden=progress.garden.filter(p=>p.slot!==active);clearSelection();save();syncStatus();drawSpots();announce('朋友回工具箱休息了，隨時可以請它回來。');};
    find('#garden-listen').onclick=()=>{const p=progress.garden.find(p=>p.slot===active);if(p)speak(G.kinds[p.kind].name);};
    find('#garden-undo').onclick=()=>{if(!undo)return;progress.garden=undo.garden;progress.gardenMemories=undo.memories;undo=null;clearSelection();save();announce('恢復成剛剛的花園了。');syncStatus();};
    find('#garden-view').onclick=()=>{viewing=!viewing;clearSelection();find('#garden-controls').hidden=viewing;find('#garden-view').textContent=viewing?'✎ 繼續布置':'✦ 欣賞花園';find('#garden-view').setAttribute('aria-pressed',String(viewing));canvas.classList.toggle('admiring',viewing);announce(viewing?'這是你親手布置的小天地！點朋友，跟它打聲招呼。':'選個朋友，點草地，繼續布置吧。');};
    find('.garden-sun').textContent=root.GardenPlay.scenes.find(s=>s.id===progress.weather).emoji;drawObjects();drawSpots();drawPalette();announce(selected?'拿著：'+G.kinds[selected].name+'。點一個草地亮點，請它住進來。':'先選朋友，再點草地上的亮點。點花園裡的朋友也可以搬家。');window.scrollTo(0,0);if(selected)showWorkspace();
  }
  root.GardenScene={open};
})(window);
