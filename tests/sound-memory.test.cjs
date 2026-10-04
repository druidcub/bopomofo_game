const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const D=require('../data.js');
const M=require('../sound-memory.js');

test('every theme and size has one picture and one audio card per distinct pictured word',()=>{
  for(const category of Object.keys(D.categories))for(const size of [2,3,4])for(let n=0;n<20;n++){
    const deck=M.makeDeck(category,size);
    assert.equal(deck.length,size*2);
    assert.equal(new Set(deck.map(c=>c.id)).size,deck.length);
    const targets=deck.filter(c=>c.kind==='picture').map(c=>c.target);
    assert.equal(new Set(targets.map(w=>w.word)).size,size);
    assert.equal(new Set(targets.map(w=>w.emoji)).size,size);
    for(const w of targets){assert.equal(deck.filter(c=>c.target.word===w.word&&c.kind==='audio').length,1);assert.ok(!w.count||w.count<=3);}
    const themePictures=new Set([...D.words,...D.phrases.filter(w=>w.count<=3)].filter(w=>w.category===category).map(w=>w.emoji));
    if(category!=='all'&&themePictures.size>=size)assert.ok(targets.every(w=>w.category===category));
  }
});

test('recent avoidance and favorites preserve a complete deck without changing caller data',()=>{
  const recent=Object.freeze(['貓','狗','魚','兔']),favorites=Object.freeze(['貓']);
  const snapshot=JSON.stringify(D);
  for(let n=0;n<30;n++){
    assert.ok(M.makeDeck('animals',4,recent,[]).every(c=>!recent.includes(c.target.word)));
    assert.ok(M.makeDeck('animals',4,recent,favorites).some(c=>c.target.word==='貓'));
  }
  assert.equal(JSON.stringify(D),snapshot);assert.deepEqual(recent,['貓','狗','魚','兔']);
  assert.equal(M.makeDeck('unknown',99).length,4);
});

test('wrong pairs remain open for replay until the child closes them',()=>{
  const deck=M.makeDeck('all',3),audio=deck.findIndex(c=>c.kind==='audio');
  const wrong=deck.findIndex(c=>c.kind==='picture'&&c.target.word!==deck[audio].target.word);
  let result=M.flip(deck,M.initialState(),audio);
  assert.equal(result.event,'listen');
  result=M.flip(deck,result.state,wrong);assert.equal(result.event,'retry');assert.equal(result.state.locked,true);
  assert.deepEqual(result.state.flipped,[audio,wrong]);
  assert.equal(M.flip(deck,result.state,audio).event,'replay');
  const blocked=deck.findIndex((c,i)=>i!==audio&&i!==wrong);
  assert.equal(M.flip(deck,result.state,blocked).event,'ignored');
  const reset=M.closeOpen(result.state);assert.deepEqual(reset.flipped,[]);assert.equal(reset.locked,false);assert.deepEqual(reset.matched,[]);
});

test('only complementary card kinds match and complete exactly once after every pair',()=>{
  const deck=M.makeDeck('food',4);let state=M.initialState();
  const snapshot=JSON.stringify(deck);
  for(const card of deck.filter(c=>c.kind==='picture')){
    const picture=deck.indexOf(card),audio=deck.findIndex(c=>c.kind==='audio'&&c.target.word===card.target.word);
    state=M.flip(deck,state,picture).state;
    assert.equal(M.flip(deck,state,picture).event,'replay');
    const matched=M.flip(deck,state,audio);assert.equal(matched.event,'match');state=matched.state;
    assert.equal(M.flip(deck,state,picture).event,'ignored');
  }
  assert.equal(state.done,true);assert.equal(state.matched.length,4);assert.equal(M.hint(deck,state),null);
  assert.equal(M.flip(deck,state,0).event,'ignored');assert.equal(JSON.stringify(deck),snapshot);
  const sameKind=[{kind:'audio',target:{word:'貓'}},{kind:'audio',target:{word:'貓'}}];
  assert.equal(M.flip(sameKind,M.flip(sameKind,M.initialState(),0).state,1).event,'retry');
});

test('hints select only one audio card or replay an open word without revealing a pair',()=>{
  const deck=M.makeDeck(),initial=M.initialState(),hint=M.hint(deck,initial);
  assert.equal(hint.action,'flip');assert.equal(deck[hint.index].kind,'audio');assert.deepEqual(Object.keys(hint).sort(),['action','index']);
  const open=M.flip(deck,initial,hint.index).state;assert.deepEqual(M.hint(deck,open),{action:'replay',index:hint.index});
  const picture=deck.findIndex(c=>c.kind==='picture');const pictureOpen=M.flip(deck,initial,picture).state;
  assert.deepEqual(M.hint(deck,pictureOpen),{action:'replay',index:picture});
});

test('state transitions preserve frozen input and reject invalid card positions',()=>{
  const deck=Object.freeze(M.makeDeck());const state=Object.freeze({...M.initialState(),flipped:Object.freeze([]),matched:Object.freeze([])});
  const before=JSON.stringify({deck,state});M.flip(deck,state,0);M.closeOpen(state);M.hint(deck,state);
  assert.equal(JSON.stringify({deck,state}),before);
  assert.equal(M.flip(deck,state,-1).event,'ignored');assert.equal(M.flip(deck,state,999).event,'ignored');
});

test('plain browser scripts expose the same sound memory API',()=>{
  const context={window:{GardenData:D}};vm.runInNewContext(fs.readFileSync(require.resolve('../sound-memory.js'),'utf8'),context);
  assert.equal(context.window.GardenSoundMemory.makeDeck().length,4);assert.equal(context.window.GardenSoundMemory.initialState().done,false);
});
