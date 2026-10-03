const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../play.js');
test('train checks a complete arrangement and accepts neither a wrong order nor distractors',()=>{
  const parts=['ㄇ','ㄠ'];
  assert.deepEqual(P.checkTrain(parts,[]),{ready:false,correct:false});
  assert.deepEqual(P.checkTrain(parts,['ㄇ']),{ready:false,correct:false});
  assert.deepEqual(P.checkTrain(parts,['ㄠ','ㄇ']),{ready:true,correct:false});
  assert.deepEqual(P.checkTrain(parts,['ㄆ','ㄠ']),{ready:true,correct:false});
  assert.deepEqual(P.checkTrain(parts,['ㄇ','ㄠ']),{ready:true,correct:true});
});
test('a requested hint only points to one first unresolved position',()=>{
  assert.deepEqual(P.nextHint(['ㄏ','ㄨ','ㄚ'],[]),{position:0,symbol:'ㄏ'});
  assert.deepEqual(P.nextHint(['ㄏ','ㄨ','ㄚ'],['ㄏ']),{position:1,symbol:'ㄨ'});
  assert.deepEqual(P.nextHint(['ㄏ','ㄨ','ㄚ'],['ㄏ','ㄚ','ㄨ']),{position:1,symbol:'ㄨ'});
  assert.equal(P.nextHint(['ㄇ','ㄠ'],['ㄇ','ㄠ']),null);
});
test('garden rewards depend on participation and are available without a streak',()=>{
  assert.equal(P.earnedBadges({rounds:0,flowers:0}).length,0);
  assert.ok(P.earnedBadges({rounds:2,flowers:10,modes:{build:2}}).some(b=>b.id==='train'));
  assert.deepEqual(P.availableDecorations(0).map(d=>d.id),['tulip']);
  assert.equal(P.availableDecorations(10).length,8);
});
test('legacy progress migrates safely and untrusted stored values cannot become markup',()=>{
  const legacy=P.restoreProgress({flowers:15,rounds:3},['build'],['貓']);
  assert.equal(legacy.flowers,15);assert.equal(legacy.rounds,3);assert.deepEqual(legacy.modes,{});
  const bad=P.restoreProgress({flowers:-2,rounds:2,modes:{build:2,evil:500},recent:['貓','<img>'],journal:['貓','貓','<script>'],plots:['rainbow','tulip','<img>']},['build'],['貓']);
  assert.equal(bad.flowers,0);assert.deepEqual(bad.modes,{build:2});assert.deepEqual(bad.recent,['貓']);assert.deepEqual(bad.journal,['貓']);
  assert.deepEqual(bad.plots,['','tulip','','','','']);
});
test('vocabulary history stays bounded, de-duplicates, and invitations rotate with completed rounds',()=>{
  const p=P.emptyProgress();
  for(let i=0;i<40;i++)P.rememberWord(p,'字'+i);
  assert.equal(p.recent.length,30);assert.equal(p.journal.length,40);
  P.rememberWord(p,'字12');assert.equal(p.recent.at(-1),'字12');assert.equal(p.journal.length,40);
  assert.notEqual(P.nextInvitation(p).mode,P.nextInvitation({...p,rounds:1}).mode);
});
test('bingo requires a full row, with columns and diagonals only on a nine-card board',()=>{
  const board='ABCDEFGHI'.split('').map(symbol=>({symbol}));
  assert.equal(P.bingoLine(board,['A','B']),null);
  assert.deepEqual(P.bingoLine(board,['A','B','C']),[0,1,2]);
  assert.deepEqual(P.bingoLine(board,['A','D','G']),[0,3,6]);
  assert.deepEqual(P.bingoLine(board,['A','E','I']),[0,4,8]);
  assert.equal(P.bingoLine(board.slice(0,6),['A','D']),null);
  assert.deepEqual(P.bingoLine(board.slice(0,6),['D','E','F']),[3,4,5]);
});
test('favorite collections are bounded, reversible, and restored only from valid vocabulary',()=>{
  const p=P.emptyProgress();
  for(let i=0;i<50;i++)assert.equal(P.toggleFavorite(p,'詞'+i),true);
  assert.equal(P.toggleFavorite(p,'多一個'),false);assert.equal(p.favorites.length,50);
  assert.equal(P.toggleFavorite(p,'詞3'),true);assert.ok(!p.favorites.includes('詞3'));
  assert.equal(P.toggleFavorite(p,'多一個'),true);
  const restored=P.restoreProgress({favorites:['貓','貓','<img>','兔']},[],['貓','兔']);
  assert.deepEqual(restored.favorites,['貓','兔']);
});
