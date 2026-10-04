'use strict';
const scopeURL=new URL(self.registration.scope);
const prefix='bopomofo:'+scopeURL.pathname+':';
const cacheName=prefix+'23';
const files=['./','./index.html','./style.css?v=23','./data.js?v=23','./play.js?v=23','./challenges.js?v=23','./discovery.js?v=23','./audio.js?v=23','./art.js?v=23','./sound-beds.js?v=23','./sound-beds-ui.js?v=23','./sound-memory.js?v=23','./sound-memory-ui.js?v=23','./app.js?v=23','./extensions.js?v=23','./extensions-ui.js?v=23','./offline.js?v=23','./manifest.webmanifest','./icon.svg','./RESEARCH.md'];
const paths=new Set(files.map(file=>new URL(file,scopeURL).pathname));

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(files.map(file=>new URL(file,scopeURL).href))));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(prefix)&&key!==cacheName).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==scopeURL.origin||!paths.has(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName);
    const cached=await cache.match(request);
    const navigation=request.mode==='navigate';
    // Versioned assets use their exact query string as the cache key.
    if(!navigation&&cached)return cached;
    try{
      const response=await fetch(request);
      if(!response.ok)throw new Error('Unavailable asset');
      // Preserve assets fetched by a newer page while its worker is waiting.
      event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
      return response;
    }catch{
      if(cached)return cached;
      if(navigation){const fallback=await cache.match(new URL('./index.html',scopeURL).href);if(fallback)return fallback;}
      return new Response('遊戲尚未保存，請連線後重新開啟。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
