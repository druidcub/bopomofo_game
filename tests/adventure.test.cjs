const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data.js');

function withSeed(seed, run) {
  const original = Math.random;
  Math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  try { run(); } finally { Math.random = original; }
}

function checkAdventure(round, level, symbols) {
  assert.equal(round.length, 5);
  assert.deepEqual(new Set(round.map(q => q.mode)), new Set(['match', 'picture', 'syllables', 'listen', level === 'grow' ? 'repair' : 'build']));
  const targetWords = round.filter(q => q.word).map(q => q.word);
  assert.equal(targetWords.length, 4);
  assert.equal(new Set(targetWords).size, 4, 'word targets must differ even when all candidates were played before');
  for (const q of round) {
    if (q.mode === 'match') {
      assert.ok(symbols.includes(q.answer));
      assert.ok(q.options.includes(q.answer));
    } else if (q.mode === 'picture') {
      assert.equal(q.options.filter(w => w.word === q.answer).length, 1);
    } else if (q.mode === 'syllables') {
      assert.ok(q.options.includes(q.count));
    } else if (q.mode === 'listen' || q.mode === 'repair') {
      assert.ok(q.options.includes(q.answer));
    } else {
      assert.ok(q.parts.length >= 2 && q.parts.length <= (level === 'grow' ? 3 : 2));
      assert.ok(q.parts.every(part => q.options.includes(part)));
    }
  }
}

test('adventures never repeat a word when every word in a theme was played before', () => {
  const history = [...D.words, ...D.phrases].map(w => w.word);
  withSeed(76432, () => {
    for (const category of Object.keys(D.categories)) {
      const favorites = [...D.words, ...D.phrases].filter(w => category === 'all' || w.category === category).slice(0, 8).map(w => w.word);
      for (const level of ['easy', 'grow']) {
        for (const scope of ['starter', 'all', 'custom']) {
          for (const preferred of [[], favorites]) {
            for (let n = 0; n < 20; n++) {
              const custom = ['ㄅ', 'ㄆ', 'ㄇ'];
              checkAdventure(D.makeAdventure(scope, category, level, history, custom, preferred), level, D.symbolRange(scope, custom));
            }
          }
        }
      }
    }
  });
});

test('an eligible favorite remains prioritized but appears at only one adventure station', () => {
  const history = [...D.words, ...D.phrases].map(w => w.word);
  withSeed(9012, () => {
    for (const category of ['all', 'animals']) {
      for (const level of ['easy', 'grow']) {
        for (let n = 0; n < 100; n++) {
          const round = D.makeAdventure('starter', category, level, history, [], ['貓']);
          checkAdventure(round, level, D.starter);
          assert.equal(round.filter(q => q.word === '貓').length, 1, 'the favorite should be invited once, then excluded from later stations');
        }
      }
    }
  });
});
