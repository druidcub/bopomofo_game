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
  assert.deepEqual(P.availableDecorations(0).map(d=>d.id),['tulip','bunny','daisy','lily','duck','bench','basket']);
  P.decorations.forEach(d=>assert.equal(G.kinds[d.id].at,d.at));
});
test('participation memories persist independently of the current layout and ignore invalid storage',()=>{
  const items=[{kind:'tulip',slot:0},{kind:'bunny',slot:1},{kind:'sunflower',slot:2}];
  assert.deepEqual(G.milestones(items),['plant','animal','variety']);
  assert.deepEqual(G.milestones([],['plant','animal','variety','plant','bad']),['plant','animal','variety']);
  assert.deepEqual(G.milestones([],{}),[]);
  assert.deepEqual(G.milestones([{kind:'tulip',slot:0},{kind:'bunny',slot:1}],[],'bunny'),['animal']);
});
test('pond water and bank positions support suitable friends without affecting the original garden',()=>{
  assert.equal(G.place([],'lily',1,0,null,'pond').ok,true);
  assert.equal(G.place([],'lily',0,0,null,'pond').reason,'area');
  assert.equal(G.place([],'lily',1,0,null,'meadow').reason,'area');
  assert.equal(G.place([],'tulip',0,0,null,'pond').ok,true);
  assert.equal(G.place([],'tulip',1,0,null,'pond').reason,'area');
  assert.equal(G.place([],'duck',1,0,null,'pond').ok,true);
  assert.equal(G.place([],'basket',0,0,null,'picnic').ok,true);
  assert.equal(G.place([],'basket',0,0,null,'pond').reason,'area');
  const p=P.restoreProgress({rounds:4,garden:[{kind:'tulip',slot:0}],gardenArea:'pond',gardenZones:{pond:[{kind:'lily',slot:1},{kind:'fish',slot:6},{kind:'tent',slot:0}],picnic:[{kind:'basket',slot:2}]}},[],[]);
  assert.deepEqual(p.garden,[{kind:'tulip',slot:0}]);assert.deepEqual(p.gardenZones.pond,[{kind:'lily',slot:1},{kind:'fish',slot:6}]);assert.deepEqual(p.gardenZones.picnic,[{kind:'basket',slot:2}]);assert.equal(p.gardenArea,'pond');
});
test('drag snapping rejects off-scene drops, occupied slots, locked objects and unsuitable regions',()=>{
  assert.equal(G.nearestSlot([],'duck',50,64,0,'pond'),1);
  assert.equal(G.nearestSlot([],'duck',-1,64,0,'pond'),null);
  assert.equal(G.nearestSlot([],'duck',50,101,0,'pond'),null);
  assert.equal(G.nearestSlot([],'fish',50,64,0,'pond'),null);
  assert.equal(G.nearestSlot([],'lily',22,64,0,'meadow'),null);
  assert.notEqual(G.nearestSlot([{kind:'duck',slot:1}],'duck',50,64,0,'pond'),1);
  assert.equal(G.nearestSlot([{kind:'duck',slot:1}],'duck',50,64,0,'pond',1),1);
  assert.equal(G.nearestSlot([],'bunny',50,0,0),null);
});
test('album snapshots remain independent of later edits, never overwrite a full album and restore safely',()=>{
  const original=[{kind:'duck',slot:1}];let album=G.takePhoto([],original,'pond','night',1000).album;original[0].slot=4;
  assert.deepEqual(album[0].items,[{kind:'duck',slot:1}]);assert.equal(album[0].weather,'night');
  for(let i=1;i<12;i++)album=G.takePhoto(album,[],'picnic','sunny',1000+i).album;
  assert.equal(G.takePhoto(album,[],'meadow','sunny',2000).reason,'full');assert.equal(album.length,12);
  assert.equal(G.takePhoto([],[],'unknown','sunny',1000).ok,false);
  const restored=G.restoreAlbum([{...album[0],items:[{kind:'duck',slot:1},{kind:'fish',slot:6},{kind:'<script>',slot:0}]},{...album[0],area:'evil'},{...album[0],at:'1000'}],0);
  assert.equal(restored.length,1);assert.deepEqual(restored[0].items,[{kind:'duck',slot:1}]);
  assert.ok(G.picture(restored[0]).startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));assert.ok(!G.picture(restored[0]).includes('<script'));
  const p=P.restoreProgress({gardenAlbum:album,gardenMemories:['photo','pondvisit'],gardenArea:'evil'},[],[]);assert.equal(p.gardenAlbum.length,12);assert.equal(p.gardenArea,'meadow');assert.deepEqual(p.gardenMemories,['photo','pondvisit']);
});
