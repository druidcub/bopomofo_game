const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const scope='https://test.example/bopomofo_game/';
function worker(){
  const events=new Map(),stores=new Map();
  const state={online:true,skips:0,claims:0,requests:0,added:[]};
  const key=request=>typeof request==='string'?request:request.url;
  const caches={
    async open(name){
      if(!stores.has(name))stores.set(name,new Map());
      const data=stores.get(name);
      return {
        async addAll(urls){state.added=urls;urls.forEach(url=>data.set(url,new Response('saved:'+url)));},
        async match(request){return data.get(key(request))?.clone();},
        async put(request,response){data.set(key(request),response);}
      };
    },
    async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);}
  };
  const self={registration:{scope},clients:{async claim(){state.claims++;}},skipWaiting(){state.skips++;},addEventListener(name,handler){events.set(name,handler);}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),{self,caches,URL,Response,fetch:async request=>{state.requests++;if(!state.online)throw new Error('offline');return new Response('network:'+key(request));}});
  async function install(){const pending=[];events.get('install')({waitUntil:p=>pending.push(p)});await Promise.all(pending);}
  async function request(url,mode='cors',method='GET'){
    const pending=[];let response;
    events.get('fetch')({request:{url,mode,method},waitUntil:p=>pending.push(p),respondWith:p=>response=p});
    if(!response)return null;
    const result=await response;await Promise.all(pending);return result;
  }
  return {state,events,stores,install,request};
}
test('offline installation saves all HTML assets under the GitHub Pages project scope',async()=>{
  const w=worker();await w.install();
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const assets=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]).filter(url=>!url.startsWith('http'));
  assets.forEach(asset=>assert.ok(w.state.added.includes(new URL(asset,scope).href),'not cached: '+asset));
  assert.ok(w.state.added.every(url=>url.startsWith(scope)));assert.equal(w.state.skips,0);
});
test('cached scripts and navigation work when the network fails',async()=>{
  const w=worker();await w.install();w.state.online=false;
  const script=w.state.added.find(url=>url.includes('/app.js?'));
  assert.equal(await (await w.request(script)).text(),'saved:'+script);
  assert.equal(w.state.requests,0);
  const response=await w.request(scope+'?from=home','navigate');
  assert.equal(response.status,200);assert.equal(await response.text(),'saved:'+scope+'index.html');
});
test('assets from a newer page are cached during the waiting-worker period',async()=>{
  const w=worker();await w.install();const next=scope+'app.js?v=next';
  assert.equal(await (await w.request(next)).text(),'network:'+next);
  w.state.online=false;
  assert.equal(await (await w.request(next)).text(),'network:'+next);
  assert.equal(w.state.requests,1);
});
test('other projects and non-GET requests are untouched; activation only removes this scope old caches',async()=>{
  const w=worker();await w.install();const current=[...w.stores.keys()][0];
  const old='bopomofo:/bopomofo_game/:old',other='bopomofo:/another_game/:old';
  w.stores.set(old,new Map());w.stores.set(other,new Map());
  assert.equal(await w.request('https://test.example/another_game/','navigate'),null);
  assert.equal(await w.request(scope+'app.js','cors','POST'),null);
  const pending=[];w.events.get('activate')({waitUntil:p=>pending.push(p)});await Promise.all(pending);
  assert.ok(w.stores.has(current));assert.ok(w.stores.has(other));assert.ok(!w.stores.has(old));assert.equal(w.state.claims,1);
  w.events.get('message')({data:{type:'ACTIVATE_UPDATE'}});assert.equal(w.state.skips,1);
});
test('offline support never reloads an active game unless an update was requested',async()=>{
  const listeners=new Map(),workerListeners=new Map();let reloads=0,messages=0;
  const location={protocol:'https:',reload(){reloads++;}};
  const registration={waiting:{postMessage(){messages++;}},addEventListener(){}};
  const navigator={onLine:true,serviceWorker:{async register(){return registration;},ready:Promise.resolve(),addEventListener(name,fn){workerListeners.set(name,fn);}}};
  const window={addEventListener(name,fn){listeners.set(name,fn);}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../offline.js'),'utf8'),{window,location,navigator,document:{querySelector(){return null;}}});
  await listeners.get('load')();assert.match(window.GardenOffline.status(),/已保存/);
  workerListeners.get('controllerchange')();assert.equal(reloads,0);
  window.GardenOffline.update();assert.equal(messages,1);workerListeners.get('controllerchange')();assert.equal(reloads,1);
});
