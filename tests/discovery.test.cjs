const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const D = require('../data.js');
const G = require('../discovery.js');
const bank = [...D.words,...D.phrases];

test('album search accepts words and phonetic substrings while ignoring spaces and tones',()=>{
  const watermelon=bank.find(word=>word.word==='西瓜');
  assert.ok(watermelon);
  for(const query of [' 西瓜 ','ㄒㄧㄍㄨㄚ',' ㄒㄧ　ㄍㄨㄚ ','ㄒㄧˊ ㄍㄨㄚˇ','ㄒㄧ\tㄍㄨㄚˋ˙']) {
    assert.ok(G.filterWords(bank,{query}).includes(watermelon),query);
  }
  const cats=G.filterWords(bank,{query:'貓'});
  assert.ok(cats.length>1);
  assert.ok(cats.every(word=>word.word.includes('貓')));
  assert.deepEqual(G.filterWords(bank,{query:'  \n\t '}),bank);
  assert.deepEqual(G.filterWords(bank,{query:'不存在的注音朋友'}),[]);
});

test('search uses Unicode normalization and treats markup and regex syntax as literal text',()=>{
  const unicode=[{word:'é',zhuyin:'ㄝ',category:'things'}];
  assert.deepEqual(G.filterWords(unicode,{query:'e\u0301'}),unicode);
  for(const query of ['<img src=x onerror=alert(1)>','.*','[','\\','(ㄅ|ㄆ)']) {
    assert.deepEqual(G.filterWords(bank,{query}),[]);
  }
  const literal=[{word:'[',zhuyin:'',category:'things'}];
  assert.deepEqual(G.filterWords(literal,{query:'['}),literal);
});

test('category, seen and favorite filters intersect without reordering the bank',()=>{
  const progress={journal:['貓','魚','花','未知','貓'],favorites:['貓','花','米']};
  assert.deepEqual(G.filterWords(bank,{seenOnly:true,favoritesOnly:true},progress).map(w=>w.word),['貓','花']);
  assert.deepEqual(G.filterWords(bank,{category:'animals',seenOnly:true,favoritesOnly:true},progress).map(w=>w.word),['貓']);
  const animals=G.filterWords(bank,{category:'animals'});
  assert.deepEqual(animals,bank.filter(w=>w.category==='animals'));
  assert.deepEqual(G.filterWords(bank,{category:'unknown'}),bank);
  assert.deepEqual(G.filterWords(bank,{category:'toString'}),bank);
  assert.deepEqual(G.filterWords(bank,{seenOnly:true},{}),[]);
  assert.deepEqual(G.filterWords(bank,{favoritesOnly:true},null),[]);
});

test('surprise picks unseen filtered entries first and can revisit when all are seen',()=>{
  const pool=bank.slice(0,4), journal=[pool[0].word,pool[2].word];
  assert.equal(G.chooseSurprise(pool,journal,()=>0),pool[1]);
  assert.equal(G.chooseSurprise(pool,journal,()=>0.99),pool[3]);
  assert.equal(G.chooseSurprise(pool,pool.map(w=>w.word),()=>0.5),pool[2]);
  assert.equal(G.chooseSurprise(pool,[],()=>1),pool[3]);
  assert.equal(G.chooseSurprise(pool,[],()=>-0.2),pool[0]);
  assert.equal(G.chooseSurprise(pool,[],()=>NaN),pool[0]);
  assert.equal(G.chooseSurprise([]),null);
  const foods=G.filterWords(bank,{category:'food'});
  assert.equal(G.chooseSurprise(foods,[],()=>0.5).category,'food');
});

test('topic discovery counts valid unique words once, in the existing theme order',()=>{
  const progress={journal:['貓','貓','魚','花','不存在','西瓜']};
  const stats=G.topicStats(bank,progress);
  assert.deepEqual(stats.map(row=>row.category),Object.keys(D.categories).filter(c=>c!=='all'));
  assert.equal(stats.find(row=>row.category==='animals').seen,2);
  assert.equal(stats.find(row=>row.category==='nature').seen,1);
  assert.equal(stats.find(row=>row.category==='food').seen,1);
  assert.equal(stats.reduce((sum,row)=>sum+row.total,0),bank.length);
  assert.equal(stats.reduce((sum,row)=>sum+row.seen,0),4);
  const duplicated=G.topicStats([bank[0],bank[0]],{journal:[bank[0].word,bank[0].word]});
  assert.deepEqual(duplicated.find(row=>row.category===bank[0].category),{category:bank[0].category,total:1,seen:1});
  assert.ok(G.topicStats([]).every(row=>row.total===0 && row.seen===0));
});

test('discovery helpers preserve frozen vocabulary, filters and progress',()=>{
  const pool=Object.freeze(bank.slice(0,10));
  const progress=Object.freeze({journal:Object.freeze(['貓','魚']),favorites:Object.freeze(['貓'])});
  const filters=Object.freeze({category:'animals',query:'',seenOnly:true});
  const before=JSON.stringify({pool,progress,filters});
  G.filterWords(pool,filters,progress);
  G.chooseSurprise(pool,progress.journal,()=>0);
  G.topicStats(pool,progress);
  assert.equal(JSON.stringify({pool,progress,filters}),before);
  assert.deepEqual(G.filterWords([],{}),[]);
  assert.deepEqual(G.filterWords(null),[]);
});

test('browser script exposes discovery helpers with only GardenData available',()=>{
  const context={window:{GardenData:D}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../discovery.js'),'utf8'),context);
  assert.equal(typeof context.window.GardenDiscovery.filterWords,'function');
  assert.equal(context.window.GardenDiscovery.chooseSurprise(bank,[],()=>0),bank[0]);
});
