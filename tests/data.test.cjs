const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data.js');
test('37 symbols and 60 unique, categorised words have valid phonetic forms', () => {
  assert.equal(D.symbols.length, 37); assert.equal(new Set(D.symbols).size, 37);
  assert.equal(D.words.length, 60); assert.equal(new Set(D.words.map(w => w.word)).size, 60);
  D.words.forEach(w => {
    assert.ok(D.categories[w.category]); w.parts.forEach(p => assert.ok(D.symbols.includes(p)));
    assert.equal(w.initial, w.parts[0]); assert.equal(w.zhuyin, w.parts.join('') + (w.tone || ''));
    assert.ok([undefined, 'ˊ', 'ˇ', 'ˋ'].includes(w.tone));
  });
  assert.equal(D.words.find(w => w.word === '花').zhuyin, 'ㄏㄨㄚ');
  assert.equal(D.words.find(w => w.word === '床').zhuyin, 'ㄔㄨㄤˊ');
  assert.equal(D.words.find(w => w.word === '四').zhuyin, 'ㄙˋ');
});
test('all themes and levels produce five unique solvable questions', () => {
  for (let n = 0; n < 30; n++) for (const category of Object.keys(D.categories)) for (const mode of ['match', 'listen', 'build', 'picture', 'rhyme']) for (const level of ['easy', 'grow']) {
    const round = D.makeRound(mode, 'starter', category, level);
    assert.equal(round.length, 5, mode + '/' + category);
    assert.equal(new Set(round.map(q => q.word || q.answer)).size, 5);
    for (const q of round) {
      if (mode === 'build') {
        assert.ok(q.parts.length >= 2 && q.parts.length <= (level === 'easy' ? 2 : 3));
        assert.deepEqual([...q.options].sort(), [...q.parts].sort());
      } else if (['picture', 'rhyme'].includes(mode)) {
        assert.equal(q.options.length, 3); assert.equal(new Set(q.options.map(w => w.word)).size, 3);
        assert.equal(q.options.filter(w => w.word === q.answer).length, 1);
        if (mode === 'rhyme') {
          assert.ok(q.rhyme); assert.equal(q.options.filter(w => w.rhyme === q.rhyme).length, 1);
          assert.ok(q.options.every(w => w.word !== q.word));
        } else assert.ok(category === 'all' || q.options.every(w => w.category === category));
      } else {
        assert.equal(q.options.length, 3); assert.equal(new Set(q.options).size, 3); assert.ok(q.options.includes(q.answer));
        if (mode === 'match') q.options.forEach(s => assert.ok(D.starter.includes(s)));
        if (mode === 'listen') assert.ok(category === 'all' || q.category === category);
      }
    }
  }
});
test('memory boards have three distinct pairs and stable card IDs', () => {
  for (const scope of ['starter', 'all']) for (let n = 0; n < 100; n++) {
    const cards = D.makeRound('memory', scope); assert.equal(cards.length, 6); assert.equal(new Set(cards.map(c => c.id)).size, 6);
    const symbols = [...new Set(cards.map(c => c.symbol))]; assert.equal(symbols.length, 3);
    symbols.forEach(s => { assert.equal(cards.filter(c => c.symbol === s).length, 2); assert.ok((scope === 'all' ? D.symbols : D.starter).includes(s)); });
  }
});
test('medial vowels remain part of the rhyme, and tones do not change rhyme groups', () => {
  const get = word => D.words.find(w => w.word === word).rhyme;
  assert.equal(get('貓'), get('桃')); assert.equal(get('手'), get('口'));
  assert.notEqual(get('貓'), get('鳥')); assert.notEqual(get('馬'), get('鴨'));
  assert.equal(get('花'), get('瓜'));
});
