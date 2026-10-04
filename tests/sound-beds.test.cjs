const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const D=require('../data.js');
const B=require('../sound-beds.js');

test('all themes and levels have two unique pictured words for each sound count',()=>{
  for(const category of Object.keys(D.categories))for(const size of [2,3,4])for(let n=0;n<25;n++){
    const round=B.makeRound(category,size);
    assert.equal(round.cards.length,size*2);
    assert.equal(new Set(round.cards.map(w=>w.word)).size,round.cards.length);
    assert.equal(new Set(round.cards.map(w=>w.emoji)).size,round.cards.length);
    assert.deepEqual(round.counts,Array.from({length:size},(_,i)=>i+1));
    for(const count of round.counts)assert.equal(round.cards.filter(w=>w.count===count).length,2);
    assert.equal(round.mixed,category!=='all'&&round.cards.some(w=>w.category!==category));
  }
});

test('favorites outrank recent avoidance without changing caller data',()=>{
  const favorites=Object.freeze(['貓']),history=Object.freeze(['貓']);
  const before=JSON.stringify(D);
  for(let n=0;n<20;n++)assert.ok(B.makeRound('animals',2,history,favorites).cards.some(w=>w.word==='貓'));
  assert.equal(JSON.stringify(D),before);assert.deepEqual(history,['貓']);assert.deepEqual(favorites,['貓']);
});

test('sufficient themed alternatives avoid recently explored words and fallback is explicit',()=>{
  const history=['貓','狗'];
  for(let n=0;n<20;n++)assert.ok(B.makeRound('animals',2,history).cards.every(w=>!history.includes(w.word)));
  const unknown=B.makeRound('missing',42);
  assert.equal(unknown.cards.length,4);assert.equal(unknown.mixed,true);
  assert.ok(unknown.cards.every(w=>w.count<=2));
});

test('selecting a new card resets manual claps and selecting again preserves them for replay',()=>{
  const round=B.makeRound(),initial=Object.freeze({selected:null,placed:Object.freeze([]),claps:0,done:false});
  assert.equal(B.clap(initial),initial);
  let state=B.select(round,initial,0).state;
  state=B.clap(B.clap(state));assert.equal(state.claps,2);
  const replay=B.select(round,state,0);assert.equal(replay.event,'replay');assert.equal(replay.state,state);
  state=B.select(round,state,1).state;assert.equal(state.claps,0);assert.equal(state.selected,1);
  assert.equal(initial.selected,null);
});

test('wrong flower beds preserve selection and correct placements finish after every card',()=>{
  const round=B.makeRound('all',4);let state=B.initialState();
  for(let index=0;index<round.cards.length;index++){
    state=B.select(round,state,index).state;
    const wrong=round.counts.find(count=>count!==round.cards[index].count);
    assert.equal(B.place(round,state,wrong).event,'retry');assert.equal(B.place(round,state,wrong).state,state);
    // Manual clap guesses never silently move the card or determine correctness.
    state=B.clap(state);const result=B.place(round,state,round.cards[index].count);
    assert.equal(result.event,'placed');state=result.state;
    assert.equal(state.placed.length,index+1);assert.equal(state.done,index===round.cards.length-1);
    assert.equal(state.selected,null);assert.equal(state.claps,0);
  }
  assert.equal(B.select(round,state,0).event,'ignored');assert.equal(B.place(round,state,1).event,'ignored');
  assert.equal(B.hint(round,state),null);
});

test('hints choose one unplaced or selected card and never return the destination answer',()=>{
  const round=B.makeRound(),state=B.initialState();
  assert.deepEqual(B.hint(round,state),{index:0});
  const selected=B.select(round,state,2).state;assert.deepEqual(B.hint(round,selected),{index:2});
  const placed=B.place(round,B.select(round,state,0).state,round.cards[0].count).state;
  assert.deepEqual(B.hint(round,placed),{index:1});
  assert.deepEqual(state,B.initialState());
});

test('invalid actions leave state intact and manual claps remain bounded and resettable',()=>{
  const round=B.makeRound(),state=B.initialState();
  for(const index of [-1,999,0.5,null,NaN])assert.equal(B.select(round,state,index).state,state);
  assert.equal(B.place(round,state,1).state,state);
  let selected=B.select(round,state,0).state;
  assert.equal(B.place(round,selected,999).state,selected);
  for(let i=0;i<100;i++)selected=B.clap(selected);assert.equal(selected.claps,8);
  const reset=B.resetClaps(selected);assert.equal(reset.claps,0);assert.equal(reset.selected,0);assert.equal(selected.claps,8);
});

test('plain browser scripts provide the same grouping API',()=>{
  const context={window:{GardenData:D}};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../sound-beds.js'),'utf8'),context);
  assert.equal(context.window.GardenSoundBeds.makeRound('all',3).cards.length,6);
});
