(function(root){
  'use strict';
  let ready=false,failed=false,registration=null,reloadRequested=false;
  const supported='serviceWorker' in navigator&&['https:','http:'].includes(location.protocol);
  function status(){
    if(!supported)return '線上遊玩；這個瀏覽器沒有離線保存功能。';
    if(failed)return '離線保存暫時未完成，連線時仍可以玩。';
    if(ready)return navigator.onLine?'遊戲已保存，下次沒有網路也可以來花園。':'現在沒有網路，已保存的遊戲仍可以玩。';
    return '第一次連線時保存遊戲，準備好後就能離線玩。';
  }
  function refresh(){
    const note=document.querySelector('#offline-note');if(note)note.textContent=status();
    const parentNote=document.querySelector('#offline-settings');if(parentNote)parentNote.textContent=status()+' 中文朗讀可能仍需網路，請大人陪讀。';
    const update=document.querySelector('#offline-update');if(update)update.hidden=!registration?.waiting;
  }
  async function init(){
    if(!supported){refresh();return;}
    try{
      registration=await navigator.serviceWorker.register('./sw.js');
      const watch=worker=>worker?.addEventListener('statechange',refresh);
      watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));
      await navigator.serviceWorker.ready;ready=true;refresh();
    }catch{failed=true;refresh();}
  }
  function update(){
    if(!registration?.waiting)return;
    reloadRequested=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
  }
  if(supported)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadRequested)location.reload();else refresh();});
  root.GardenOffline={status,refresh,update};
  root.addEventListener('online',refresh);root.addEventListener('offline',refresh);root.addEventListener('load',init);
})(window);
