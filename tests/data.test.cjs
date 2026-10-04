const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data.js');
test('37 symbols and 190 unique, categorised words have valid phonetic forms', () => {
  assert.equal(D.symbols.length, 37); assert.equal(new Set(D.symbols).size, 37);
  assert.equal(D.words.length, 190); assert.equal(new Set(D.words.map(w => w.word)).size, 190);
  D.words.forEach(w => {
    assert.ok(D.categories[w.category]); w.parts.forEach(p => assert.ok(D.symbols.includes(p)));
    assert.equal(w.initial, w.parts[0]); assert.equal(w.zhuyin, w.parts.join('') + (w.tone || ''));
    assert.ok([undefined, 'ˊ', 'ˇ', 'ˋ'].includes(w.tone));
  });
  assert.equal(D.words.find(w => w.word === '花').zhuyin, 'ㄏㄨㄚ');
  assert.equal(D.words.find(w => w.word === '床').zhuyin, 'ㄔㄨㄤˊ');
  assert.equal(D.words.find(w => w.word === '四').zhuyin, 'ㄙˋ');
  assert.equal(D.words.find(w => w.word === '龜').zhuyin, 'ㄍㄨㄟ');
});
test('all themes and levels produce five unique solvable questions', () => {
  for (let n = 0; n < 15; n++) for (const category of Object.keys(D.categories)) for (const mode of ['match', 'listen', 'build', 'picture', 'rhyme', 'initial', 'repair', 'syllables', 'tone']) for (const level of ['easy', 'grow']) {
    const round = D.makeRound(mode, 'starter', category, level);
    assert.equal(round.length, 5, mode + '/' + category);
    assert.equal(new Set(round.map(q => q.word || q.answer)).size, 5);
    for (const q of round) {
      if (mode === 'build') {
        assert.ok(q.parts.length >= 2 && q.parts.length <= (level === 'easy' ? 2 : 3));
        assert.equal(q.options.length, q.parts.length + 2);
        assert.equal(new Set(q.options).size, q.options.length);
        assert.ok(q.parts.every(s=>q.options.includes(s)));
      } else if (mode === 'syllables') {
        assert.deepEqual(q.options, [1,2,3,4]); assert.equal(q.answer,q.syllables.length);
      } else if (mode === 'tone') {
        assert.equal(q.options.length,4); assert.equal(new Set(q.options.map(t=>t.value)).size,4);
        assert.ok(q.options.some(t=>t.value===q.answer));
      } else if (['picture', 'rhyme', 'initial'].includes(mode)) {
        assert.equal(q.options.length, 3); assert.equal(new Set(q.options.map(w => w.word)).size, 3);
        assert.equal(q.options.filter(w => w.word === q.answer).length, 1);
        if (['rhyme','initial'].includes(mode)) {
          const key=mode==='rhyme'?'rhyme':'initial';
          assert.ok(q[key]); assert.equal(q.options.filter(w => w[key] === q[key]).length, 1);
          assert.ok(q.options.every(w => w.word !== q.word));
        } else {
          assert.ok(category === 'all' || q.options.every(w => w.category === category));
          assert.ok(q.options.filter(w=>w.word!==q.answer).every(w=>w.emoji!==q.emoji));
          assert.equal(new Set(q.options.map(w=>w.emoji)).size,3);
        }
      } else {
        assert.equal(q.options.length, 3); assert.equal(new Set(q.options).size, 3); assert.ok(q.options.includes(q.answer));
        if (mode === 'match') q.options.forEach(s => assert.ok(D.starter.includes(s)));
        if (mode === 'listen') assert.ok(category === 'all' || q.category === category);
        if (mode === 'repair') assert.equal(q.parts[q.missing],q.answer);
      }
    }
  }
});
test('442 phrase entries have unique names and one valid pronunciation per syllable', () => {
  assert.equal(D.phrases.length,442); assert.equal(new Set(D.phrases.map(p=>p.word)).size,442);
  D.phrases.forEach(p=>{
    assert.equal([...p.word].length,p.count); assert.ok(p.count>=2 && p.count<=4);
    p.syllables.forEach(s=>assert.match(s,/^[ㄅ-ㄩ]+[ˊˇˋ]?$/));
    assert.ok(D.categories[p.category]);
  });
  const r=D.makeRound('syllables'); assert.deepEqual([...new Set(r.map(q=>q.count))].sort(),[1,2,3,4]);
  assert.equal(D.phrases.find(p=>p.word==='烏龜').zhuyin,'ㄨ ㄍㄨㄟ');
  assert.equal(D.phrases.find(p=>p.word==='螃蟹').zhuyin,'ㄆㄤˊ ㄒㄧㄝˋ');
  assert.equal(D.phrases.find(p=>p.word==='鸚鵡').zhuyin,'ㄧㄥ ㄨˇ');
  assert.equal(D.phrases.find(p=>p.word==='披薩').zhuyin,'ㄆㄧ ㄙㄚˋ');
  for(const [word,zhuyin] of [['菠菜','ㄅㄛ ㄘㄞˋ'],['豆腐','ㄉㄡˋ ㄈㄨˇ'],['鞦韆','ㄑㄧㄡ ㄑㄧㄢ'],['盪鞦韆','ㄉㄤˋ ㄑㄧㄡ ㄑㄧㄢ']])assert.equal(D.phrases.find(p=>p.word===word).zhuyin,zhuyin,word);
  for(const [word,zhuyin] of [['浣熊','ㄨㄢˇ ㄒㄩㄥˊ'],['駱駝','ㄌㄨㄛˋ ㄊㄨㄛˊ'],['蝙蝠','ㄅㄧㄢ ㄈㄨˊ'],['吐司','ㄊㄨˇ ㄙ'],['咖哩飯','ㄎㄚ ㄌㄧˇ ㄈㄢˋ'],['酪梨','ㄌㄨㄛˋ ㄌㄧˊ'],['乳酪','ㄖㄨˇ ㄌㄨㄛˋ'],['夕陽','ㄒㄧˋ ㄧㄤˊ']]) {
    assert.equal(D.phrases.find(p=>p.word===word).zhuyin,zhuyin,word);
  }
  for(const [word,zhuyin] of [['眉毛','ㄇㄟˊ ㄇㄠˊ'],['眼睛','ㄧㄢˇ ㄐㄧㄥ'],['耳朵','ㄦˇ ㄉㄨㄛˇ'],['肩膀','ㄐㄧㄢ ㄅㄤˇ'],['掃帚','ㄙㄠˋ ㄓㄡˇ'],['溜冰','ㄌㄧㄡ ㄅㄧㄥ'],['蟋蟀','ㄒㄧ ㄕㄨㄞˋ'],['蚯蚓','ㄑㄧㄡ ㄧㄣˇ'],['便當','ㄅㄧㄢˋ ㄉㄤ'],['玫瑰','ㄇㄟˊ ㄍㄨㄟ']])assert.equal(D.phrases.find(p=>p.word===word).zhuyin,zhuyin,word);
});
test('vocabulary syllables follow symbol order and reuse known character readings consistently',()=>{
  const readings=new Map(D.words.map(w=>[w.word,w.zhuyin]));
  for(const word of [...D.words,...D.phrases]){
    const syllables=word.syllables||[word.zhuyin];
    syllables.forEach((s,i)=>{
      assert.match(s,/^[ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ]?[ㄧㄨㄩ]?[ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ]?[ˊˇˋ]?$/,word.word);
      assert.ok(!/^[ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒ][ˊˇˋ]?$/.test(s),word.word);
      if(readings.has(word.word[i]))assert.equal(s,readings.get(word.word[i]),word.word);
    });
  }
});
test('bingo boards contain 3, 6 or 9 distinct available symbols',()=>{
  for(const [scope,custom,count] of [['starter',[],6],['all',[],9],['custom',['ㄅ','ㄇ','ㄚ'],3]])for(let i=0;i<30;i++){
    const board=D.makeRound('bingo',scope,'all','easy',[],3,custom);
    assert.equal(board.length,count);assert.equal(new Set(board.map(c=>c.symbol)).size,count);
    assert.ok(board.every(c=>D.symbolRange(scope,custom).includes(c.symbol)));
  }
});
test('recently played vocabulary is avoided when enough alternatives exist', () => {
  const previous=D.makeRound('build').map(q=>q.word);
  for(let n=0;n<20;n++) assert.ok(D.makeRound('build','starter','all','easy',previous).every(q=>!previous.includes(q.word)));
});
test('balanced syllable rounds avoid recent words within every length group',()=>{
  let recent=[];
  for(let n=0;n<25;n++){
    const round=D.makeRound('syllables','starter','all','easy',recent);
    assert.ok(round.every(q=>!recent.includes(q.word)));
    assert.deepEqual([...new Set(round.map(q=>q.count))].sort(),[1,2,3,4]);
    recent=[...recent,...round.map(q=>q.word)].slice(-30);
  }
});
test('favorite practice revisits selected words and still produces complete valid rounds',()=>{
  for(let n=0;n<20;n++){
    const r=D.makeRound('listen','starter','all','easy',['貓'],3,[],['貓']);
    assert.equal(r[0].word,'貓');assert.equal(r.length,5);
    const build=D.makeRound('build','starter','all','easy',[],3,[],['貓','狗','兔','馬','魚']);
    assert.ok(['貓','狗','兔','馬'].every(w=>build.some(q=>q.word===w)));
    const adventure=D.makeAdventure('starter','all','easy',[],[],['貓','狗','兔']);
    assert.equal(new Set(adventure.filter(q=>q.word).map(q=>q.word)).size,4);
  }
});
test('memory boards have 3, 4 or 6 distinct pairs and stable card IDs', () => {
  for (const scope of ['starter', 'all']) for (const pairs of [3,4,6]) for (let n = 0; n < 40; n++) {
    const cards = D.makeRound('memory', scope,'all','easy',[],pairs); assert.equal(cards.length, pairs*2); assert.equal(new Set(cards.map(c => c.id)).size, pairs*2);
    const symbols = [...new Set(cards.map(c => c.symbol))]; assert.equal(symbols.length, pairs);
    symbols.forEach(s => { assert.equal(cards.filter(c => c.symbol === s).length, 2); assert.ok((scope === 'all' ? D.symbols : D.starter).includes(s)); });
  }
});
test('adventures contain five distinct stations with the chosen theme and difficulty',()=>{
  for(const level of ['easy','grow'])for(let i=0;i<40;i++){
    const r=D.makeAdventure('all','animals',level);
    assert.equal(r.length,5);assert.equal(new Set(r.map(q=>q.mode)).size,5);
    assert.ok(r.some(q=>q.mode===(level==='grow'?'repair':'build')));
    assert.equal(new Set(r.filter(q=>q.word).map(q=>q.word)).size,4);
  }
});
test('small custom symbol groups keep five playable questions and cap memory pair counts',()=>{
  for(const custom of [['ㄅ','ㄆ','ㄇ'],['ㄅ','ㄇ','ㄚ','ㄧ']])for(let i=0;i<30;i++){
    const r=D.makeRound('match','custom','all','easy',[],3,custom);
    assert.equal(r.length,5);r.forEach(q=>{assert.ok(custom.includes(q.answer));assert.equal(new Set(q.options).size,3);assert.ok(q.options.every(s=>custom.includes(s)));});
    assert.ok(r.every((q,j)=>j===0||q.answer!==r[j-1].answer));
    const cards=D.makeRound('memory','custom','all','easy',[],6,custom);assert.equal(cards.length,custom.length*2);
  }
  assert.deepEqual(D.symbolRange('custom',['wrong','ㄅ']),D.starter);
  assert.deepEqual(D.symbolRange('custom',['ㄅ','ㄅ','ㄇ','ㄚ']),['ㄅ','ㄇ','ㄚ']);
});
test('medial vowels remain part of the rhyme, and tones do not change rhyme groups', () => {
  const get = word => D.words.find(w => w.word === word).rhyme;
  assert.equal(get('貓'), get('桃')); assert.equal(get('手'), get('口'));
  assert.notEqual(get('貓'), get('鳥')); assert.notEqual(get('馬'), get('鴨'));
  assert.equal(get('花'), get('瓜'));
});
test('backpack lists have distinct pictures, same-theme distractors and exactly one correct order',()=>{
  for(const category of Object.keys(D.categories))for(const size of [2,3])for(let i=0;i<30;i++){
    const round=D.makePackRound(category,size);
    assert.equal(round.length,5);
    for(const q of round){
      assert.equal(q.sequence.length,size);assert.equal(q.options.length,size+2);
      assert.equal(new Set(q.options.map(w=>w.word)).size,size+2);
      assert.equal(new Set(q.options.map(w=>w.emoji)).size,size+2);
      assert.ok(q.sequence.every(w=>q.options.some(o=>o.word===w.word)));
      assert.ok(q.options.every(w=>w.category===q.category));
      assert.ok(category==='all'||q.category===category);
    }
  }
});
test('backpack targets avoid recent words when enough pictures exist and honor favorites',()=>{
  for(let i=0;i<30;i++){
    const first=D.makePackRound('animals',3),recent=first.flatMap(q=>q.sequence.map(w=>w.word));
    assert.ok(D.makePackRound('animals',3,recent).every(q=>q.sequence.every(w=>!recent.includes(w.word))));
    const favorite=D.makePackRound('animals',2,['貓'],['貓']);
    assert.equal(favorite[0].sequence[0].word,'貓');
    assert.ok(D.makePackRound('all',2,['貓'],['貓']).every(q=>q.category==='animals'&&q.sequence[0].word==='貓'));
  }
  assert.equal(D.makePackRound('not-a-theme',100)[0].sequence.length,2);
});
