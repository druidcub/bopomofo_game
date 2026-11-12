const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {create,QUEUE_LIMIT}=require('../tracker.js');
const root=path.join(__dirname,'..');
function harness(){
  const store=new Map(),sent=[];const env={online:true,fail:false,clock:1_700_000_000_000};
  const tracker=create({app:'bopomofo',storage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},fetch:async(url,init)=>{if(env.fail)throw new Error('offline');sent.push({url,body:JSON.parse(init.body),init});return {};},now:()=>env.clock,onLine:()=>env.online});
  return {tracker,store,sent,env};
}
const tick=()=>new Promise(r=>setTimeout(r,0));
test('nothing is recorded until a parent enables the upload',()=>{
  const {tracker}=harness();
  assert.equal(tracker.track('miss',{word:'貓'}),null);assert.equal(tracker.queue().length,0);
});
test('only https Apps Script URLs are accepted',()=>{
  const {tracker}=harness();
  tracker.configure({enabled:true,url:'javascript:alert(1)',token:'t'});assert.equal(tracker.settings().url,'');
  tracker.configure({url:'https://script.google.com/macros/s/AKfy/exec'});assert.match(tracker.settings().url,/^https:\/\/script\.google\.com/);
});
test('events carry learner, app and a local date, and are posted with no-cors',async()=>{
  const {tracker,sent,env}=harness();
  tracker.configure({enabled:true,url:'https://script.google.com/macros/s/AKfy/exec',token:'abc',learner:'小寶'});
  const ev=tracker.track('miss',{word:'貓',zhuyin:'ㄇㄠ',unit:'聽聽找朋友'});
  const d=new Date(env.clock);assert.equal(ev.date,`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  assert.equal(ev.learner,'小寶');assert.equal(ev.app,'bopomofo');
  await tick();assert.equal(sent.length,1);assert.equal(sent[0].body.token,'abc');assert.equal(sent[0].body.events[0].zhuyin,'ㄇㄠ');assert.equal(sent[0].init.mode,'no-cors');assert.equal(tracker.queue().length,0);
});
test('offline events wait, failed sends are retried, large queues are batched and capped',async()=>{
  const {tracker,store,sent,env}=harness();
  tracker.configure({enabled:true,url:'https://script.google.com/macros/s/AKfy/exec',token:'abc'});
  env.online=false;tracker.track('round_done',{mode:'listen'});await tick();
  assert.equal(sent.length,0);assert.equal(JSON.parse(store.get('bopomofo-tracker-v1:queue')).length,1);
  env.online=true;env.fail=true;await tracker.flush();assert.equal(tracker.queue().length,1);assert.ok(tracker.status().lastError);
  env.fail=false;await tracker.flush();assert.equal(tracker.queue().length,0);assert.equal(sent.length,1);
  env.online=false;for(let i=0;i<QUEUE_LIMIT+20;i++)tracker.track('miss',{word:'w'+i});
  assert.equal(tracker.queue().length,QUEUE_LIMIT);assert.equal(tracker.queue()[0].word,'w20');
  env.online=true;await tracker.flush();assert.equal(tracker.queue().length,0);assert.ok(sent.length>=1+QUEUE_LIMIT/50);
});
test('the game wires mistakes, round completion, the cache list and the settings form to the tracker',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(app,/function retry\(button, message\) \{ noteMiss\(\);/,'every wrong attempt passes through retry() → noteMiss()');
  assert.match(app,/progress\.rounds\+\+;[^\n]*\n\s*save\(\); trackRound\(flowers\);/,'round completion reports round_done');
  assert.match(app,/started: Date\.now\(\), misses: \[\]/,'each round records its start time and misses');
  const version=sw.match(/prefix\+'(\d+)'/)[1];
  assert.ok(sw.includes(`'./tracker.js?v=${version}'`),'tracker.js is precached with the current version');
  assert.ok(html.includes(`tracker.js?v=${version}`),'index.html loads tracker.js at the same version');
  assert.ok(html.indexOf('tracker.js?v=')<html.indexOf('app.js?v='),'tracker.js loads before app.js');
  for(const name of ['enabled','learner','url','token'])assert.ok(html.includes(`name="${name}"`),`settings form has ${name}`);
  assert.ok(/GardenTracker\.create\(\{app:'bopomofo'\}\)/.test(app));
});
