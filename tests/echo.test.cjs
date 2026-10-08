const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../echo.js');
const D=require('../data.js');
test('every theme has five distinct echo targets, one duplicated sound and distinguishable choices',()=>{
  for(const category of Object.keys(D.categories))for(const length of [3,4])for(let run=0;run<12;run++){
    const round=E.makeRound(category,length);
    assert.equal(round.length,5);assert.equal(new Set(round.map(q=>q.answer)).size,5);
    for(const q of round){
      assert.equal(q.sequence.length,length);assert.equal(q.options.length,3);
      assert.equal(new Set(q.options.map(w=>w.emoji)).size,3);
      assert.equal(new Set(q.options.map(w=>w.word)).size,3);
      assert.equal(q.sequence.filter(w=>w.word===q.answer).length,2);
      assert.equal(new Set(q.sequence.map(w=>w.word)).size,length-1);
      assert.ok(q.sequence.every(w=>q.options.some(o=>o.word===w.word)));
      assert.ok(category==='all'||q.sequence.find(w=>w.word===q.answer).category===category);
      assert.equal(q.mixed,category!=='all'&&q.options.some(w=>w.category!==category));
      q.options.forEach(w=>assert.ok(w.count<=3));
      q.options.forEach((w,i)=>assert.equal(E.check(q,i),w.word===q.answer?'correct':'retry'));
    }
  }
});
test('echo targets avoid recent words, honor a favorite once and do not mutate history',()=>{
  const recent=E.makeRound('animals').map(q=>q.answer),copy=[...recent];
  for(let i=0;i<15;i++){
    assert.ok(E.makeRound('animals',3,recent).every(q=>!recent.includes(q.answer)));
    const favored=E.makeRound('animals',4,['貓'],['貓']);
    assert.equal(favored[0].answer,'貓');assert.equal(favored.filter(q=>q.answer==='貓').length,1);
  }
  assert.deepEqual(recent,copy);
});
test('invalid settings recover and solved or invalid selections never award again',()=>{
  const q=E.makeRound('unknown',90)[0];assert.equal(q.sequence.length,3);
  for(const i of [-1,NaN,1.4,'0',3])assert.equal(E.check(q,i),'ignored');
  for(let i=0;i<3;i++)assert.equal(E.check(q,i,true),'ignored');
});
test('duplicate positions vary between neighboring sounds and separated sounds',()=>{
  const patterns=new Set();
  for(let run=0;run<80;run++)for(const q of E.makeRound('all',4))patterns.add(q.sequence.map((w,i)=>w.word===q.answer?i:null).filter(i=>i!==null).join(','));
  assert.equal(patterns.size,6);
});
test('garden and daily-life additions carry complete pronunciations',()=>{
  const samples={'野餐墊':'ㄧㄝˇ ㄘㄢ ㄉㄧㄢˋ','睡蓮':'ㄕㄨㄟˋ ㄌㄧㄢˊ','蘆葦':'ㄌㄨˊ ㄨㄟˇ','雛菊':'ㄔㄨˊ ㄐㄩˊ','餵小鴨':'ㄨㄟˋ ㄒㄧㄠˇ ㄧㄚ','種小花':'ㄓㄨㄥˋ ㄒㄧㄠˇ ㄏㄨㄚ','剝香蕉':'ㄅㄛ ㄒㄧㄤ ㄐㄧㄠ','水果沙拉':'ㄕㄨㄟˇ ㄍㄨㄛˇ ㄕㄚ ㄌㄚ'};
  for(const [word,zhuyin] of Object.entries(samples))assert.equal(D.phrases.find(w=>w.word===word).zhuyin,zhuyin);
  assert.equal(D.words.length+D.phrases.length,828);
});
