const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../garden.js');
const P=require('../play.js');
test('old six beds migrate to matching anchors without altering earned progress',()=>{
  const old={flowers:43,rounds:10,modes:{build:3},weather:'night',plots:['tree','bunny','rainbow','pond','butterfly','sunflower'],favorites:['貓'],gardenMemories:['animal','<script>']};
  const p=P.restoreProgress(old,['build'],['貓']);
  assert.deepEqual(p.garden,old.plots.map((kind,slot)=>({kind,slot})));
  assert.equal(p.flowers,43);assert.equal(p.rounds,10);assert.equal(p.weather,'night');assert.deepEqual(p.modes,{build:3});assert.deepEqual(p.favorites,['貓']);assert.deepEqual(p.gardenMemories,['animal']);
});
test('stored empty gardens stay empty; malformed, duplicate and locked objects are rejected',()=>{
  assert.deepEqual(G.restore({garden:[],plots:['tulip']},0),[]);
  assert.deepEqual(G.restore({garden:[{kind:'tulip',slot:0},{kind:'bunny',slot:0},{kind:'tree',slot:2},{kind:'<img>',slot:3},{kind:'bunny',slot:7},{kind:'bunny',slot:-1},{kind:'bunny',slot:8},{kind:'bunny',slot:'1'},null]},0),[{kind:'tulip',slot:0},{kind:'bunny',slot:7}]);
});
test('placing and moving never replace another friend and never mutate the original arrangement',()=>{
  const old=[{kind:'tulip',slot:0},{kind:'bunny',slot:1}];
  assert.equal(G.place(old,'bunny',0,0).reason,'occupied');
  assert.equal(G.place(old,'tree',2,0).reason,'locked');
  assert.equal(G.place(old,'bunny',2,0,7).reason,'missing');
  const moved=G.place(old,'bunny',7,0,1);
  assert.equal(moved.ok,true);assert.deepEqual(moved.items,[{kind:'tulip',slot:0},{kind:'bunny',slot:7}]);
  assert.deepEqual(old,[{kind:'tulip',slot:0},{kind:'bunny',slot:1}]);
  assert.equal(G.place(old,'bunny',0,0,1).reason,'occupied');
  assert.equal(G.place(old,'bunny',8,0).ok,false);
});
test('repeated unlocked objects require no flower currency; counts reflect the current scene',()=>{
  let items=[];
  for(let slot=0;slot<G.anchors.length;slot++){const r=G.place(items,slot%2?'bunny':'tulip',slot,0);assert.equal(r.ok,true);items=r.items;}
  assert.deepEqual(G.stats(items),{plants:4,animals:4,types:2});
  assert.deepEqual(G.stats(items.filter(p=>p.slot!==0)),{plants:3,animals:4,types:2});
  assert.deepEqual(P.availableDecorations(0).map(d=>d.id),['tulip','bunny']);
  P.decorations.forEach(d=>assert.equal(G.kinds[d.id].at,d.at));
});
test('participation memories persist independently of the current layout and ignore invalid storage',()=>{
  const items=[{kind:'tulip',slot:0},{kind:'bunny',slot:1},{kind:'sunflower',slot:2}];
  assert.deepEqual(G.milestones(items),['plant','animal','variety']);
  assert.deepEqual(G.milestones([],['plant','animal','variety','plant','bad']),['plant','animal','variety']);
  assert.deepEqual(G.milestones([],{}),[]);
  assert.deepEqual(G.milestones([{kind:'tulip',slot:0},{kind:'bunny',slot:1}],[],'bunny'),['animal']);
});
