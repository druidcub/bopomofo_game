const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../phonics.js'),D=require('../data.js'),Play=require('../play.js');
test('22 combined finals are unique medial-final pairs with a usable example reading',()=>{
  assert.equal(P.examples.length,22);assert.equal(new Set(P.examples.map(e=>e.rime)).size,22);
  for(const e of P.examples){assert.equal(e.rime.length,2);assert.equal(P.row(e.rime[0]),1);assert.equal(P.row(e.rime[1]),2);assert.equal(e.zhuyin.replace(/[ˊˇˋ]/g,''),e.rime);}
  assert.equal(P.examples.find(e=>e.word==='崖').zhuyin,'ㄧㄞˊ');
});
test('all three stages give five different finals and solvable options; an applied final stays one tile',()=>{
  for(const level of ['basic','all','apply'])for(let n=0;n<40;n++){
    const round=P.makeRound(level);assert.equal(round.length,5);assert.equal(new Set(round.map(q=>q.rime)).size,5);
    for(const q of round){
      assert.equal(new Set(q.options).size,q.options.length);q.parts.forEach(p=>assert.equal(q.options.filter(s=>s===p).length,1));
      if(level==='basic')assert.ok(P.beginner.has(q.rime));
      if(level==='apply'){assert.equal(q.parts.length,1);assert.equal(q.fixed+q.parts[0],q.zhuyin.replace(/[ˊˇˋ]/g,''));assert.ok(q.options.every(s=>s.length===2));}
      else assert.equal(q.parts.length,2);
    }
    const recent=round.map(q=>q.word);assert.ok(P.makeRound(level,recent).every(q=>!recent.includes(q.word)));
  }
});
test('vertical placement leaves absent positions empty, and keeps the combined final together',()=>{
  assert.deepEqual(P.cells(['ㄇ','ㄠ']).map(c=>[c.row,c.span]),[[0,1],[2,1]]);
  assert.deepEqual(P.cells(['ㄒ','ㄧ','ㄚ']).map(c=>[c.row,c.span]),[[0,1],[1,1],[2,1]]);
  assert.deepEqual(P.cells(['ㄧㄚ'],'ㄒ').map(c=>[c.row,c.span]),[[1,2]]);
  assert.ok(!P.reading('ㄨㄚ').includes('zhuyin-mark'));
  assert.ok(P.reading('˙ㄇㄚ').includes('neutral'));
  const q={parts:['ㄧㄚ'],fixed:'ㄒ',tone:'ˊ'};const board=P.board(q);
  assert.ok(board.includes('phonetic-fixed'));assert.ok(board.includes('rime-frame'));assert.ok(board.includes('span 2'));assert.ok(board.includes('phonetic-tone'));
  assert.ok(!board.includes('ㄧㄚ')); // Empty answer position must not publish its answer.
});
test('removing a vertical symbol preserves every other position and supports filling any empty slot',()=>{
  const options=['ㄒ','ㄧ','ㄚ'];let state=P.empty(3);
  for(let i=0;i<3;i++)state=P.put(state,options,i);
  const previous=state;state=P.take(state,1);
  assert.deepEqual(state.selected,['ㄒ','','ㄚ']);assert.deepEqual(previous.selected,['ㄒ','ㄧ','ㄚ']);
  assert.deepEqual(P.put(state,options,1).selected,['ㄒ','ㄧ','ㄚ']);
  state=P.take(P.empty(3),2);state=P.put(state,options,2);
  assert.deepEqual(state.selected,['','','ㄚ']);assert.equal(state.activeSlot,0);
  assert.equal(P.put(state,options,2),state);assert.equal(P.take(state,99),state);
});
test('retired counting modes never appear in invitations or adventures',()=>{
  for(let rounds=0;rounds<50;rounds++)assert.ok(!['syllables','balance','soundBeds'].includes(Play.nextInvitation({rounds}).mode));
  for(let n=0;n<25;n++){const modes=D.makeAdventure().map(q=>q.mode);assert.ok(!modes.includes('syllables'));assert.ok(modes.includes('tone'));}
});
test('vocabulary has no size-only small prefixes but keeps independently meaningful terms',()=>{
  const allowed=new Set(['小黃瓜','小番茄','小提琴']);
  assert.ok(D.phrases.filter(w=>w.word.startsWith('小')).every(w=>allowed.has(w.word)));
  for(const word of ['小烏龜','小小烏龜','小小火車'])assert.ok(!D.phrases.some(w=>w.word===word));
  for(const word of allowed)assert.ok(D.phrases.some(w=>w.word===word));
});
