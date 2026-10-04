const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const D = require('../data.js');
const C = require('../challenges.js');

test('mail rounds have two distinct pictures per house and a separate matching example',()=>{
  for(let n=0;n<100;n++) for(const size of [2,3]) {
    const round=C.makeMailRound([],[],size);
    assert.equal(round.houses.length,size);
    assert.equal(round.cards.length,size*2);
    assert.equal(new Set(round.houses.map(h=>h.symbol)).size,size);
    assert.equal(new Set(round.cards.map(w=>w.word)).size,size*2);
    assert.equal(new Set(round.cards.map(w=>w.emoji)).size,size*2);
    round.houses.forEach(house=>{
      const matching=round.cards.filter(w=>w.initial===house.symbol);
      assert.equal(matching.length,2);
      assert.equal(house.example.initial,house.symbol);
      assert.ok(!round.cards.some(w=>w.word===house.example.word));
      assert.ok(D.words.includes(house.example));
    });
    assert.ok(round.cards.every(w=>D.words.includes(w)));
  }
  assert.equal(C.makeMailRound([],[],99).houses.length,2);
});

test('mail rounds prefer unseen delivery words and include valid favorites',()=>{
  for(let n=0;n<30;n++) {
    const previous=C.makeMailRound([],[],3);
    const history=previous.cards.map(w=>w.word);
    const next=C.makeMailRound(history,[],3);
    assert.ok(next.cards.every(w=>!history.includes(w.word)));
    const favorite=C.makeMailRound(history,['貓'],2);
    assert.ok(favorite.cards.some(w=>w.word==='貓'));
    const twoFavorites=C.makeMailRound([],['貓','馬'],2);
    assert.ok(twoFavorites.cards.some(w=>w.word==='貓'));
    assert.ok(twoFavorites.cards.some(w=>w.word==='馬'));
  }
});

test('odd-one-out rounds have exactly one different first sound, distinct pictures and unique answers',()=>{
  for(let n=0;n<100;n++) {
    const round=C.makeOddRound();
    assert.equal(round.length,5);
    assert.equal(new Set(round.map(q=>q.answer)).size,5);
    round.forEach(q=>{
      assert.equal(q.options.length,3);
      assert.equal(new Set(q.options.map(w=>w.word)).size,3);
      assert.equal(new Set(q.options.map(w=>w.emoji)).size,3);
      assert.equal(q.options.filter(w=>w.initial===q.commonInitial).length,2);
      assert.equal(q.options.filter(w=>w.initial===q.oddInitial).length,1);
      const answer=q.options.find(w=>w.word===q.answer);
      assert.equal(answer.initial,q.oddInitial);
      assert.notEqual(q.commonInitial,q.oddInitial);
      assert.equal(q.word,answer.word);
      assert.equal(q.zhuyin,answer.zhuyin);
      assert.equal(q.category,answer.category);
    });
  }
});

test('odd-one-out answers avoid recent words and bring back favorited words',()=>{
  for(let n=0;n<30;n++) {
    const recent=C.makeOddRound().map(q=>q.answer);
    assert.ok(C.makeOddRound(recent).every(q=>!recent.includes(q.answer)));
    assert.equal(C.makeOddRound(['貓'],['貓'])[0].answer,'貓');
    const favoriteRound=C.makeOddRound([],['貓','魚','肉']);
    assert.ok(['貓','魚','肉'].every(word=>favoriteRound.some(q=>q.answer===word)));
  }
});

test('mail hints reveal only one undelivered destination and handle completion safely',()=>{
  const round=C.makeMailRound([],[],3);
  const selected=round.cards[3];
  assert.deepEqual(C.nextMailHint(round,[],selected.word),{word:selected.word,symbol:selected.initial});
  assert.deepEqual(C.nextMailHint(round,[selected.word],selected.word),{
    word:round.cards[0].word,symbol:round.cards[0].initial
  });
  assert.equal(C.nextMailHint(round,new Set(round.cards.map(w=>w.word))),null);
  assert.equal(C.nextMailHint(null),null);
  assert.equal(C.nextMailHint({cards:[]}),null);
});

test('new challenges keep the data bank and caller history untouched',()=>{
  const snapshot=JSON.stringify(D.words);
  const recent=Object.freeze(['貓','魚','兔']);
  const favorites=Object.freeze(['貓','馬']);
  C.makeMailRound(recent,favorites,3);
  C.makeOddRound(recent,favorites);
  assert.equal(JSON.stringify(D.words),snapshot);
  assert.deepEqual(recent,['貓','魚','兔']);
  assert.deepEqual(favorites,['貓','馬']);
});

test('browser script exposes the same challenge API without CommonJS',()=>{
  const context={window:{GardenData:D}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../challenges.js'),'utf8'),context);
  assert.equal(typeof context.window.GardenChallenges.makeMailRound,'function');
  assert.equal(context.window.GardenChallenges.makeOddRound().length,5);
});
