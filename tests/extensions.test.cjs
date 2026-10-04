const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const D=require('../data.js');
const E=require('../extensions.js');
const P=require('../play.js');
test('word workshops have enough copies of repeated syllables and two genuine distractors',()=>{
  for(let n=0;n<20;n++)for(const category of Object.keys(D.categories))for(const size of [2,3,4]){
    const round=E.makeWorkshopRound(category,size);
    assert.equal(round.length,5);assert.equal(new Set(round.map(q=>q.word)).size,5);
    round.forEach(q=>{
      assert.ok(q.count>=2&&q.count<=size);assert.equal(q.options.length,q.count+2);
      for(const syllable of new Set(q.syllables))assert.equal(q.options.filter(s=>s===syllable).length,q.syllables.filter(s=>s===syllable).length);
      assert.equal(q.options.filter(s=>!q.syllables.includes(s)).length,2);
      assert.equal(new Set(q.options.filter(s=>!q.syllables.includes(s))).size,2);
    });
  }
});
test('repeated sound blocks can be removed and replayed without treating identical copies as wrong',()=>{
  const q=E.makeWorkshopRound('all',4,[],['小小火車'])[0];
  assert.equal(q.word,'小小火車');assert.equal(q.options.filter(s=>s==='ㄒㄧㄠˇ').length,2);
  assert.deepEqual(P.checkTrain(q.syllables,q.syllables),{ready:true,correct:true});
  assert.deepEqual(P.nextHint(q.syllables,['ㄒㄧㄠˇ']),{position:1,symbol:'ㄒㄧㄠˇ'});
  assert.deepEqual(P.checkTrain(q.syllables,['ㄒㄧㄠˇ','ㄏㄨㄛˇ','ㄒㄧㄠˇ','ㄔㄜ']),{ready:true,correct:false});
});
test('workshops honor available themes, recent targets and eligible favorites',()=>{
  for(let n=0;n<20;n++){
    const recent=E.makeWorkshopRound().map(q=>q.word);
    assert.ok(E.makeWorkshopRound('all',2,recent).every(q=>!recent.includes(q.word)));
    assert.equal(E.makeWorkshopRound('all',2,['西瓜'],['西瓜'])[0].word,'西瓜');
    assert.ok(E.makeWorkshopRound('animals',3).every(q=>q.category==='animals'));
    assert.ok(E.makeWorkshopRound('numbers',2).every(q=>q.count===2));
  }
});
test('sound balance rounds always contain left, right and equal comparisons with different pictures',()=>{
  for(let n=0;n<12;n++)for(const category of Object.keys(D.categories))for(const size of [2,3,4]){
    const round=E.makeBalanceRound(category,size);
    assert.equal(round.length,5);
    assert.deepEqual(round.map(q=>q.answer).sort(),['equal','left','left','right','right']);
    round.forEach(q=>{
      assert.notEqual(q.left.word,q.right.word);assert.notEqual(q.left.emoji,q.right.emoji);
      assert.ok(q.left.count>=1&&q.left.count<=size);assert.ok(q.right.count>=1&&q.right.count<=size);
      assert.equal(q.answer,E.compareCounts(q.left.count,q.right.count));
      assert.equal(q.left.syllables.length,q.left.count);assert.equal(q.right.syllables.length,q.right.count);
      assert.equal(q.left.category,category==='all'?q.left.category:category);
      assert.equal(q.right.category,category==='all'?q.right.category:category);
    });
  }
});
test('comparison preferences prioritize familiar favorites and fresh alternatives without changing source data',()=>{
  const before=JSON.stringify([D.words,D.phrases]),recent=['貓'],favorites=['貓'];
  const favorite=E.makeBalanceRound('all',2,recent,favorites)[0];assert.ok(favorite.left.word==='貓'||favorite.right.word==='貓');
  const round=E.makeBalanceRound('animals',2);
  const history=[...new Set(round.flatMap(q=>[q.left.word,q.right.word]))];
  assert.ok(E.makeBalanceRound('animals',2,history).every(q=>!history.includes(q.left.word)&&!history.includes(q.right.word)));
  assert.equal(JSON.stringify([D.words,D.phrases]),before);assert.deepEqual(recent,['貓']);assert.deepEqual(favorites,['貓']);
});
test('invalid length and theme values still return a full playable session',()=>{
  for(const size of [0,99,'4',null]){
    assert.ok(E.makeWorkshopRound('bad',size).every(q=>q.count===2));
    assert.ok(E.makeBalanceRound('bad',size).every(q=>q.left.count<=2&&q.right.count<=2));
  }
});
test('extension helpers work as a plain offline browser script',()=>{
  const context={GardenData:D};vm.runInNewContext(fs.readFileSync(require.resolve('../extensions.js'),'utf8'),context);
  assert.equal(context.GardenExtensions.makeWorkshopRound().length,5);
  assert.equal(context.GardenExtensions.makeBalanceRound().length,5);
});
